/**
 * Enhanced AI Agent Types
 * Shared TypeScript interfaces for enhanced AI response components
 */

export interface DetectedEntity {
  type: 'deal' | 'contact' | 'organization' | 'activity';
  id: string;
  name?: string;
  amount?: number;
  organizationName?: string;
  contactName?: string;
  metadata?: Record<string, unknown>;
}

export interface ActionableData {
  type: 'dealId' | 'contactId' | 'organizationId' | 'amount' | 'email' | 'phone';
  value: string | number;
  label?: string;
  copyable: boolean;
}

export interface SuggestedAction {
  id: string;
  label: string;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  action: 'navigate' | 'copy' | 'create' | 'edit' | 'view' | 'call';
  target?: string;
  payload?: Record<string, unknown>;
  disabled?: boolean;
  tooltip?: string;
}

export interface EnhancedResponseData {
  entities: DetectedEntity[];
  actionableData: ActionableData[];
  suggestedActions: SuggestedAction[];
  hasEnhancements: boolean;
}

export interface ThoughtData {
  type?: string;
  rawData?: unknown;
  metadata?: {
    rawData?: unknown;
    toolName?: string;
  };
}

export interface ResponseEnhancementProps {
  content: string;
  thoughts?: ThoughtData[];
  onAction?: (action: SuggestedAction) => void;
  className?: string;
}

export interface ActionButtonProps {
  action: SuggestedAction;
  onClick?: (action: SuggestedAction) => void;
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export interface CopyButtonProps {
  value: string | number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'outline' | 'solid';
  showLabel?: boolean;
}

export interface EntityCardProps {
  entity: DetectedEntity;
  actions?: SuggestedAction[];
  onAction?: (action: SuggestedAction) => void;
  compact?: boolean;
} 