import React from 'react';
import { CalendarIcon, EmailIcon, WarningIcon, InfoIcon } from '@chakra-ui/icons';
import { FaClipboardList, FaPhone } from 'react-icons/fa';
import type { ActivityType as GQLActivityType } from '../../generated/graphql/graphql';

export const getActivityTypeIcon = (type?: GQLActivityType | null): React.ElementType => {
  switch (type) {
    case 'TASK': return FaClipboardList;
    case 'MEETING': return CalendarIcon;
    case 'CALL': return FaPhone;
    case 'EMAIL': return EmailIcon;
    case 'DEADLINE': return WarningIcon;
    default: return InfoIcon;
  }
};

export const getActivityTypeColor = (type: string): string => {
  switch (type?.toUpperCase()) {
    case 'TASK': return 'blue';
    case 'MEETING': return 'purple';
    case 'CALL': return 'green';
    case 'EMAIL': return 'orange';
    case 'DEADLINE': return 'red';
    default: return 'gray';
  }
}; 