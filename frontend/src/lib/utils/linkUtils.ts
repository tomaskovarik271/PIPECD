import React from 'react';
import { LinkIcon } from '@chakra-ui/icons';

export interface LinkDisplayDetails {
  isUrl: boolean;
  displayText: string;
  fullUrl?: string;
  isKnownService?: boolean;
  icon?: React.ElementType;
}

export const getLinkDisplayDetails = (str: string | null | undefined): LinkDisplayDetails => {
  if (!str) return { isUrl: false, displayText: '-' };

  try {
    const url = new URL(str);
    if (!(url.protocol === 'http:' || url.protocol === 'https:')) {
      return { isUrl: false, displayText: str };
    }

    // Google Services
    if (url.hostname.includes('docs.google.com')) {
      if (url.pathname.includes('/spreadsheets/')) {
        return { 
          isUrl: true, 
          displayText: 'Google Sheet', 
          fullUrl: str, 
          isKnownService: true, 
          icon: LinkIcon 
        };
      }
      if (url.pathname.includes('/document/')) {
        return { 
          isUrl: true, 
          displayText: 'Google Doc', 
          fullUrl: str, 
          isKnownService: true, 
          icon: LinkIcon 
        };
      }
      if (url.pathname.includes('/presentation/') || url.pathname.includes('/drawings/')) {
        return { 
          isUrl: true, 
          displayText: 'Google Slides/Drawing', 
          fullUrl: str, 
          isKnownService: true, 
          icon: LinkIcon 
        };
      }
    }
    
    // Add other services as needed (Slack, GitHub, etc.)

    return { 
      isUrl: true, 
      displayText: str, 
      fullUrl: str, 
      isKnownService: false 
    };
  } catch (_) {
    return { isUrl: false, displayText: str };
  }
};

export const isUrl = (str: string): boolean => {
  try {
    new URL(str);
    return str.startsWith('http://') || str.startsWith('https://');
  } catch (_) {
    return false;
  }
}; 