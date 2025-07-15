import React from 'react';
import { HStack, Tag, TagCloseButton, Tooltip } from '@chakra-ui/react';
import { DealLabel } from '../../generated/graphql/graphql';

interface DealLabelsProps {
    labels: DealLabel[];
    maxVisible?: number;
    size?: 'sm' | 'md';
    isEditable?: boolean;
    onRemoveLabel?: (labelId: string) => void;
    showTooltip?: boolean;
}

export const DealLabels: React.FC<DealLabelsProps> = ({
    labels,
    maxVisible = 3,
    size = 'sm',
    isEditable = false,
    onRemoveLabel,
    showTooltip = true
}) => {
    if (!labels || labels.length === 0) {
        return null;
    }

    const visibleLabels = labels.slice(0, maxVisible);
    const hiddenCount = labels.length - maxVisible;
    
    const renderLabel = (label: DealLabel) => (
        <Tag
            key={label.id}
            size={size}
            bg={label.colorHex}
            color="white"
            borderRadius="full"
            fontWeight="medium"
            fontSize={size === 'sm' ? 'xs' : 'sm'}
            cursor={showTooltip ? 'help' : 'default'}
        >
            {label.labelText}
            {isEditable && onRemoveLabel && (
                <TagCloseButton 
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering parent click events
                        onRemoveLabel(label.id);
                    }}
                    color="white"
                    _hover={{ bg: 'whiteAlpha.300' }}
                    ml={1}
                />
            )}
        </Tag>
    );

    return (
        <HStack spacing={1} wrap="wrap">
            {visibleLabels.map(label => 
                showTooltip ? (
                    <Tooltip 
                        key={label.id}
                        label={`Label: ${label.labelText}`}
                        placement="top"
                        hasArrow
                    >
                        {renderLabel(label)}
                    </Tooltip>
                ) : (
                    renderLabel(label)
                )
            )}
            {hiddenCount > 0 && (
                <Tooltip 
                    label={`+${hiddenCount} more labels: ${labels.slice(maxVisible).map(l => l.labelText).join(', ')}`}
                    placement="top"
                    hasArrow
                >
                    <Tag 
                        size={size} 
                        variant="outline"
                        borderRadius="full"
                        cursor="help"
                        fontSize={size === 'sm' ? 'xs' : 'sm'}
                    >
                        +{hiddenCount}
                    </Tag>
                </Tooltip>
            )}
        </HStack>
    );
}; 