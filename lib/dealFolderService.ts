import { googleDriveService, DriveFolder, CreateDealFolderInput, DriveFolderStructure } from './googleDriveService';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface DealFolderConfig {
  dealId: string;
  dealName: string;
  clientName?: string;
  accessToken: string;
}

export interface DealFolderInfo {
  exists: boolean;
  dealFolder?: DriveFolder;
  subfolders?: {
    proposals?: DriveFolder;
    contracts?: DriveFolder;
    legal?: DriveFolder;
    presentations?: DriveFolder;
    correspondence?: DriveFolder;
    financial?: DriveFolder;
    technical?: DriveFolder;
    other?: DriveFolder;
  };
}

class DealFolderService {
  /**
   * Get the configured parent folder ID from app settings
   */
  async getParentFolderId(): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('setting_value')
        .eq('setting_key', 'google_drive.pipecd_deals_folder_id')
        .single();

      if (error || !data) {
        console.log('No parent folder configured in app settings');
        return null;
      }

      return data.setting_value;
    } catch (error) {
      console.error('Error fetching parent folder ID:', error);
      return null;
    }
  }

  /**
   * Get auto-creation setting
   */
  async getAutoCreateSetting(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('setting_value')
        .eq('setting_key', 'google_drive.auto_create_deal_folders')
        .single();

      if (error || !data) {
        return true; // Default to true
      }

      return data.setting_value === true;
    } catch (error) {
      console.error('Error fetching auto-create setting:', error);
      return true; // Default to true
    }
  }

  /**
   * Generate folder name for a deal
   */
  generateDealFolderName(config: DealFolderConfig): string {
    const clientPart = config.clientName ? `${config.clientName} - ` : '';
    return `${clientPart}${config.dealName} (ID: ${config.dealId})`;
  }

  /**
   * Check if deal folder already exists by searching for it
   */
  async checkDealFolderExists(config: DealFolderConfig): Promise<DriveFolder | null> {
    try {
      const folderName = this.generateDealFolderName(config);
      
      // Search for the folder by name
      const searchResults = await googleDriveService.searchFiles(
        config.accessToken,
        folderName
      );

      // Find the folder (not file) with exact name match
      const dealFolder = searchResults.find(file => 
        file.mimeType === 'application/vnd.google-apps.folder' &&
        file.name === folderName
      );

      return dealFolder as DriveFolder || null;
    } catch (error) {
      console.error('Error checking if deal folder exists:', error);
      return null;
    }
  }

  /**
   * Get deal folder info - checks existence and returns structure
   */
  async getDealFolderInfo(config: DealFolderConfig): Promise<DealFolderInfo> {
    try {
      const existingFolder = await this.checkDealFolderExists(config);
      
      if (!existingFolder) {
        return { exists: false };
      }

      // Get subfolders
      const subfolderFiles = await googleDriveService.listFiles(
        config.accessToken,
        existingFolder.id
      );

      const subfolders = {
        proposals: subfolderFiles.find(f => f.name === 'Proposals' && f.mimeType === 'application/vnd.google-apps.folder') as DriveFolder,
        contracts: subfolderFiles.find(f => f.name === 'Contracts' && f.mimeType === 'application/vnd.google-apps.folder') as DriveFolder,
        legal: subfolderFiles.find(f => f.name === 'Legal' && f.mimeType === 'application/vnd.google-apps.folder') as DriveFolder,
        presentations: subfolderFiles.find(f => f.name === 'Presentations' && f.mimeType === 'application/vnd.google-apps.folder') as DriveFolder,
        correspondence: subfolderFiles.find(f => f.name === 'Correspondence' && f.mimeType === 'application/vnd.google-apps.folder') as DriveFolder,
        financial: subfolderFiles.find(f => f.name === 'Financial' && f.mimeType === 'application/vnd.google-apps.folder') as DriveFolder,
        technical: subfolderFiles.find(f => f.name === 'Technical' && f.mimeType === 'application/vnd.google-apps.folder') as DriveFolder,
        other: subfolderFiles.find(f => f.name === 'Other' && f.mimeType === 'application/vnd.google-apps.folder') as DriveFolder,
      };

      return {
        exists: true,
        dealFolder: existingFolder,
        subfolders
      };
    } catch (error) {
      console.error('Error getting deal folder info:', error);
      return { exists: false };
    }
  }

  /**
   * Auto-create deal folder if it doesn't exist
   */
  async ensureDealFolder(config: DealFolderConfig): Promise<DealFolderInfo> {
    // Check if auto-creation is enabled
    const autoCreate = await this.getAutoCreateSetting();
    if (!autoCreate) {
      console.log('Auto-creation is disabled in settings');
      return await this.getDealFolderInfo(config);
    }

    // Check if folder already exists
    const folderInfo = await this.getDealFolderInfo(config);
    if (folderInfo.exists) {
      console.log('Deal folder already exists:', folderInfo.dealFolder?.name);
      return folderInfo;
    }

    try {
      // Get parent folder ID from settings
      const parentFolderId = await this.getParentFolderId();
      if (!parentFolderId) {
        console.warn('No parent folder configured - cannot auto-create deal folder');
        return { exists: false };
      }

      console.log(`Creating deal folder for deal ${config.dealId} in parent folder ${parentFolderId}`);

      // Create the deal folder
      const createInput: CreateDealFolderInput = {
        dealId: config.dealId,
        dealName: this.generateDealFolderName(config),
        parentFolderId,
        templateStructure: true, // Create subfolders
      };

      const folderStructure = await googleDriveService.createDealFolder(
        config.accessToken,
        createInput
      );

      // Store folder info in database
      await this.storeDealFolderInfo(config.dealId, folderStructure);

      // Return the updated folder info
      return {
        exists: true,
        dealFolder: folderStructure.dealFolder,
        subfolders: {
          proposals: folderStructure.subfolders.proposals,
          contracts: folderStructure.subfolders.contracts,
          legal: folderStructure.subfolders.legal,
          presentations: folderStructure.subfolders.presentations,
          correspondence: folderStructure.subfolders.correspondence,
          financial: undefined, // These might not be in the original structure
          technical: undefined,
          other: undefined,
        }
      };
    } catch (error) {
      console.error('Error auto-creating deal folder:', error);
      return { exists: false };
    }
  }

  /**
   * Store deal folder information in database
   */
  private async storeDealFolderInfo(dealId: string, folderStructure: DriveFolderStructure): Promise<void> {
    try {
      // Store main deal folder
      const { error: mainFolderError } = await supabase
        .from('deal_drive_folders')
        .upsert({
          deal_id: dealId,
          folder_id: folderStructure.dealFolder.id,
          folder_name: folderStructure.dealFolder.name,
          folder_url: folderStructure.dealFolder.webViewLink,
          parent_folder_id: await this.getParentFolderId(),
          is_main_folder: true,
          subfolder_type: null,
        }, {
          onConflict: 'deal_id,folder_id',
          ignoreDuplicates: false,
        });

      if (mainFolderError) {
        console.error('Error storing main deal folder:', mainFolderError);
      }

      // Store subfolders
      const subfolders = [
        { key: 'proposals', folder: folderStructure.subfolders.proposals },
        { key: 'contracts', folder: folderStructure.subfolders.contracts },
        { key: 'legal', folder: folderStructure.subfolders.legal },
        { key: 'presentations', folder: folderStructure.subfolders.presentations },
        { key: 'correspondence', folder: folderStructure.subfolders.correspondence },
      ];

      for (const { key, folder } of subfolders) {
        if (folder) {
          const { error: subfolderError } = await supabase
            .from('deal_drive_folders')
            .upsert({
              deal_id: dealId,
              folder_id: folder.id,
              folder_name: folder.name,
              folder_url: folder.webViewLink,
              parent_folder_id: folderStructure.dealFolder.id,
              is_main_folder: false,
              subfolder_type: key,
            }, {
              onConflict: 'deal_id,folder_id',
              ignoreDuplicates: false,
            });

          if (subfolderError) {
            console.error(`Error storing ${key} subfolder:`, subfolderError);
          }
        }
      }
    } catch (error) {
      console.error('Error storing deal folder info in database:', error);
    }
  }

  /**
   * Get the appropriate subfolder for a document category
   */
  getSubfolderForCategory(folderInfo: DealFolderInfo, category: string): DriveFolder | null {
    if (!folderInfo.exists || !folderInfo.subfolders) {
      return null;
    }

    const categoryMap: { [key: string]: keyof typeof folderInfo.subfolders } = {
      'PROPOSALS': 'proposals',
      'CONTRACTS': 'contracts', 
      'LEGAL': 'legal',
      'PRESENTATIONS': 'presentations',
      'CORRESPONDENCE': 'correspondence',
      'FINANCIAL': 'financial',
      'TECHNICAL': 'technical',
      'OTHER': 'other',
    };

    const subfolderKey = categoryMap[category.toUpperCase()];
    return subfolderKey ? folderInfo.subfolders[subfolderKey] || null : null;
  }
}

export const dealFolderService = new DealFolderService(); 