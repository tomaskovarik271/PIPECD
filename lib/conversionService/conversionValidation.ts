import { createClient } from '@supabase/supabase-js';
import { Database } from '../database.types';

export interface ConversionValidationInput {
  sourceType: 'lead' | 'deal';
  sourceId: string;
  targetType: 'deal' | 'lead';
  userId: string;
  supabase: ReturnType<typeof createClient<Database>>;
  accessToken: string;
}

export interface ConversionValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sourceEntity?: any;
  canProceed: boolean;
}

/**
 * Validate conversion business rules and permissions
 */
export async function validateConversion(
  input: ConversionValidationInput
): Promise<ConversionValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  let sourceEntity: any = null;

  try {
    // 1. Validate source entity exists and user has access
    if (input.sourceType === 'lead') {
      const { data: lead, error } = await input.supabase
        .from('leads')
        .select('*')
        .eq('id', input.sourceId)
        .single();

      if (error || !lead) {
        errors.push('Lead not found or access denied');
        return { isValid: false, errors, warnings, canProceed: false };
      }

      sourceEntity = lead;

      // Check if lead is already converted
      if (lead.converted_at && lead.converted_to_deal_id) {
        errors.push(`Lead is already converted to deal ${lead.converted_to_deal_id}`);
      }

      // Check user permissions
      const canUpdateLead = lead.user_id === input.userId || lead.assigned_to_user_id === input.userId;
      if (!canUpdateLead) {
        errors.push('Insufficient permissions to convert this lead');
      }

      // Business rule validations for lead → deal
      if (input.targetType === 'deal') {
        // Check if lead is qualified (optional warning)
        if (lead.lead_score < 50) {
          warnings.push('Lead score is below 50 - consider qualification before conversion');
        }

        // Check if lead has contact information
        if (!lead.contact_name && !lead.contact_email) {
          warnings.push('Lead has no contact information - deal may lack proper relationships');
        }

        // Check if lead has estimated value
        if (!lead.estimated_value || lead.estimated_value <= 0) {
          warnings.push('Lead has no estimated value - deal amount will be set to 0');
        }
      }

    } else if (input.sourceType === 'deal') {
      const { data: deal, error } = await input.supabase
        .from('deals')
        .select('*')
        .eq('id', input.sourceId)
        .single();

      if (error || !deal) {
        errors.push('Deal not found or access denied');
        return { isValid: false, errors, warnings, canProceed: false };
      }

      sourceEntity = deal;

      // Check if deal is already converted
      if (deal.converted_to_lead_id) {
        errors.push(`Deal is already converted to lead ${deal.converted_to_lead_id}`);
      }

      // Check user permissions
      const canUpdateDeal = deal.user_id === input.userId || deal.assigned_to_user_id === input.userId;
      if (!canUpdateDeal) {
        errors.push('Insufficient permissions to convert this deal');
      }

      // Business rule validations for deal → lead
      if (input.targetType === 'lead') {
        // Check if deal is in a state that makes sense for conversion
        const { data: wfmProject } = await input.supabase
          .from('wfm_projects')
          .select(`
            *,
            currentStep:wfm_workflow_steps(*)
          `)
          .eq('id', deal.wfm_project_id)
          .single();

        if (wfmProject?.currentStep) {
          const stepMetadata = wfmProject.currentStep.metadata as any;
          if (stepMetadata?.outcome_type === 'WON') {
            errors.push('Cannot convert a won deal back to lead');
          }
          
          if (stepMetadata?.deal_probability >= 0.9) {
            warnings.push('Deal has high probability (90%+) - confirm conversion is appropriate');
          }
        }

        // Check if deal has been recently created (might indicate premature conversion)
        const dealAge = new Date().getTime() - new Date(deal.created_at).getTime();
        const daysSinceCreation = dealAge / (1000 * 60 * 60 * 24);
        
        if (daysSinceCreation < 7) {
          warnings.push('Deal is less than 7 days old - consider if conversion is premature');
        }
      }
    }

    // 2. Validate conversion type compatibility
    if (input.sourceType === input.targetType) {
      errors.push('Cannot convert entity to the same type');
    }

    // 3. Check for circular conversions
    if (input.sourceType === 'lead' && input.targetType === 'deal') {
      // Check if this lead was previously converted from a deal
      if (sourceEntity.original_deal_id) {
        warnings.push('This lead was previously converted from a deal - creating circular conversion');
      }
    }

    if (input.sourceType === 'deal' && input.targetType === 'lead') {
      // Check if this deal was converted from a lead that might be converted again
      const { data: originalLead } = await input.supabase
        .from('leads')
        .select('id, name')
        .eq('converted_to_deal_id', input.sourceId)
        .single();

      if (originalLead) {
        warnings.push(`This deal was converted from lead "${originalLead.name}" - creating circular conversion`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      sourceEntity,
      canProceed: errors.length === 0
    };

  } catch (error) {
    console.error('Conversion validation error:', error);
    return {
      isValid: false,
      errors: ['Validation failed due to system error'],
      warnings,
      canProceed: false
    };
  }
} 