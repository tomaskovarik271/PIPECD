import { LinkIcon } from '@chakra-ui/icons'; // Assuming LinkIcon is used directly
import { IconType } from 'react-icons'; // Or use a more generic IconType if Chakra's icons are wrapped

export interface LinkDisplayDetails {
  isUrl: boolean;
  displayText: string;
  fullUrl?: string;
  isKnownService?: boolean;
  // Using IconType which is common for icon libraries, adjust if Chakra's Icon has a specific prop type
  icon?: IconType | React.ElementType;
}

export const getLinkDisplayDetails = (str: string | null | undefined): LinkDisplayDetails => {
  if (!str) return { isUrl: false, displayText: '-' };

  try {
    const url = new URL(str);
    if (!(url.protocol === 'http:' || url.protocol === 'https:')) {
      return { isUrl: false, displayText: str }; // Not a http/https URL
    }

    // Example: Google services
    if (url.hostname.includes('docs.google.com')) {
      if (url.pathname.includes('/spreadsheets/')) {
        return { isUrl: true, displayText: 'Google Sheet', fullUrl: str, isKnownService: true, icon: LinkIcon };
      }
      if (url.pathname.includes('/document/')) {
        return { isUrl: true, displayText: 'Google Doc', fullUrl: str, isKnownService: true, icon: LinkIcon };
      }
      if (url.pathname.includes('/presentation/') || url.pathname.includes('/drawings/')) {
        return { isUrl: true, displayText: 'Google Slides/Drawing', fullUrl: str, isKnownService: true, icon: LinkIcon };
      }
      // Add more Google services if needed
    }
    
    // Add other known services here, e.g., Dropbox, Figma, etc.
    // Example for a generic link, possibly to be truncated by UI
    const shortHostname = url.hostname.replace(/^www\./, '');
    const pathSegment = url.pathname.length > 1 ? (url.pathname.substring(0, 20) + (url.pathname.length > 20 ? '...': '')) : '';
    const smartDisplayText = `${shortHostname}${pathSegment}` || str;

    return { 
      isUrl: true, 
      // displayText: str, // Original: showed full URL
      displayText: smartDisplayText, // New: shows a shorter, more readable version
      fullUrl: str, 
      isKnownService: false 
    };

  } catch (_) {
    // If parsing URL fails, it's not a valid URL
    return { isUrl: false, displayText: str };
  }
}; 