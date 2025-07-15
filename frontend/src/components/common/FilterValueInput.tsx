import React, { useState, useEffect, useMemo } from 'react';
import {
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Select,
  Checkbox,
  Switch,
  FormControl,
  FormLabel,
  HStack,
  VStack,
  Text,
  Spinner,
  Box,
  Tag,
  TagLabel,
  TagCloseButton,
  InputGroup,
  InputLeftAddon,
} from '@chakra-ui/react';
import { gqlClient } from '../../lib/graphqlClient';
import { useUserListStore } from '../../stores/useUserListStore';
import { useOrganizationsStore } from '../../stores/useOrganizationsStore';
import { usePeopleStore } from '../../stores/usePeopleStore';
import { useThemeColors } from '../../hooks/useThemeColors';
import type { FilterValueInputProps, FilterField, FilterOperator } from '../../types/filters';

// Currency options for currency fields
const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'JPY', label: 'JPY (¥)' },
  { value: 'CAD', label: 'CAD (C$)' },
  { value: 'AUD', label: 'AUD (A$)' },
  { value: 'CHF', label: 'CHF' },
  { value: 'CNY', label: 'CNY (¥)' },
];

// Date range presets
const DATE_RANGE_PRESETS = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'this_week', label: 'This Week' },
  { value: 'last_week', label: 'Last Week' },
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'this_quarter', label: 'This Quarter' },
  { value: 'last_quarter', label: 'Last Quarter' },
  { value: 'this_year', label: 'This Year' },
  { value: 'last_year', label: 'Last Year' },
  { value: 'custom', label: 'Custom Range' }
];

export const FilterValueInput: React.FC<FilterValueInputProps> = ({
  field,
  operator,
  value,
  onChange,
  isLoading = false
}) => {
  const colors = useThemeColors();
  const { users, fetchUsers } = useUserListStore();
  const { organizations, fetchOrganizations } = useOrganizationsStore();
  const { people, fetchPeople } = usePeopleStore();
  
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [dateRangePreset, setDateRangePreset] = useState<string>('custom');

  // Load data based on field type
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingOptions(true);
      try {
        switch (field.type) {
          case 'user':
            await fetchUsers();
            break;
          case 'organization':
            await fetchOrganizations();
            break;
          case 'person':
            await fetchPeople();
            break;
        }
      } catch (error) {
        console.error('Error loading filter options:', error);
      } finally {
        setIsLoadingOptions(false);
      }
    };

    loadData();
  }, [field.type, fetchUsers, fetchOrganizations, fetchPeople]);

  // Helper function to check if operator requires value input
  const requiresValue = useMemo(() => {
    return !['IS_NULL', 'IS_NOT_NULL'].includes(operator);
  }, [operator]);

  // Helper function to check if operator requires multiple values
  const requiresMultipleValues = useMemo(() => {
    return ['IN', 'NOT_IN', 'BETWEEN'].includes(operator);
  }, [operator]);

  // Format date for input
  const formatDateForInput = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().split('T')[0];
  };

  // Parse date from input
  const parseDateFromInput = (dateString: string): string => {
    return new Date(dateString).toISOString();
  };

  // Handle date range preset selection
  const handleDateRangePreset = (preset: string) => {
    setDateRangePreset(preset);
    
    if (preset === 'custom') {
      return;
    }

    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (preset) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        break;
      case 'yesterday':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59);
        break;
      case 'this_week':
        const weekStart = now.getDate() - now.getDay();
        startDate = new Date(now.getFullYear(), now.getMonth(), weekStart);
        endDate = new Date(now.getFullYear(), now.getMonth(), weekStart + 6, 23, 59, 59);
        break;
      case 'this_month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        break;
      default:
        return;
    }

    onChange([startDate.toISOString(), endDate.toISOString()]);
  };

  // Don't render input for operators that don't need values
  if (!requiresValue) {
    return (
      <Text fontSize="sm" color={colors.text.muted} fontStyle="italic">
        No value needed
      </Text>
    );
  }

  // Loading state
  if (isLoading || isLoadingOptions) {
    return (
      <HStack spacing={2}>
        <Spinner size="sm" color={colors.interactive.default} />
        <Text fontSize="sm" color={colors.text.muted}>Loading...</Text>
      </HStack>
    );
  }

  // Render different input types based on field type
  switch (field.type) {
    case 'text':
      if (requiresMultipleValues) {
        return (
          <VStack align="stretch" spacing={2}>
            {(value || []).map((val: string, index: number) => (
              <HStack key={index}>
                <Input
                  value={val}
                  onChange={(e) => {
                    const newValues = [...(value || [])];
                    newValues[index] = e.target.value;
                    onChange(newValues);
                  }}
                  placeholder={`Value ${index + 1}`}
                  size="sm"
                />
                <TagCloseButton
                  onClick={() => {
                    const newValues = (value || []).filter((_: any, i: number) => i !== index);
                    onChange(newValues);
                  }}
                />
              </HStack>
            ))}
            <Input
              placeholder="Add new value..."
              size="sm"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                  onChange([...(value || []), e.currentTarget.value.trim()]);
                  e.currentTarget.value = '';
                }
              }}
            />
          </VStack>
        );
      }
      return (
        <Input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter text..."
          size="sm"
        />
      );

    case 'number':
    case 'probability':
      if (operator === 'BETWEEN') {
        const values = value || [0, 0];
        return (
          <HStack>
            <NumberInput
              value={values[0]}
              onChange={(_, num) => onChange([num, values[1]])}
              size="sm"
              min={field.type === 'probability' ? 0 : undefined}
              max={field.type === 'probability' ? 100 : undefined}
            >
              <NumberInputField placeholder="Min" />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <Text>to</Text>
            <NumberInput
              value={values[1]}
              onChange={(_, num) => onChange([values[0], num])}
              size="sm"
              min={field.type === 'probability' ? 0 : undefined}
              max={field.type === 'probability' ? 100 : undefined}
            >
              <NumberInputField placeholder="Max" />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </HStack>
        );
      }
      return (
        <NumberInput
          value={value || 0}
          onChange={(_, num) => onChange(num)}
          size="sm"
          min={field.type === 'probability' ? 0 : undefined}
          max={field.type === 'probability' ? 100 : undefined}
        >
          <NumberInputField 
            placeholder={field.type === 'probability' ? "0-100%" : "Enter number..."} 
          />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
      );

    case 'currency':
      if (operator === 'BETWEEN') {
        const values = value || [{ amount: 0, currency: 'USD' }, { amount: 0, currency: 'USD' }];
        return (
          <VStack spacing={2}>
            <HStack>
              <InputGroup size="sm">
                <InputLeftAddon children={values[0]?.currency || 'USD'} />
                <NumberInput
                  value={values[0]?.amount || 0}
                  onChange={(_, num) => onChange([
                    { amount: num, currency: values[0]?.currency || 'USD' },
                    values[1]
                  ])}
                  size="sm"
                  min={0}
                >
                  <NumberInputField placeholder="Min amount" />
                </NumberInput>
              </InputGroup>
              <Text>to</Text>
              <InputGroup size="sm">
                <InputLeftAddon children={values[1]?.currency || 'USD'} />
                <NumberInput
                  value={values[1]?.amount || 0}
                  onChange={(_, num) => onChange([
                    values[0],
                    { amount: num, currency: values[1]?.currency || 'USD' }
                  ])}
                  size="sm"
                  min={0}
                >
                  <NumberInputField placeholder="Max amount" />
                </NumberInput>
              </InputGroup>
            </HStack>
            <Select
              value={values[0]?.currency || 'USD'}
              onChange={(e) => {
                const newCurrency = e.target.value;
                onChange([
                  { ...values[0], currency: newCurrency },
                  { ...values[1], currency: newCurrency }
                ]);
              }}
              size="sm"
            >
              {CURRENCY_OPTIONS.map(currency => (
                <option key={currency.value} value={currency.value}>
                  {currency.label}
                </option>
              ))}
            </Select>
          </VStack>
        );
      }
      return (
        <VStack spacing={2}>
          <InputGroup size="sm">
            <InputLeftAddon children={value?.currency || 'USD'} />
            <NumberInput
              value={value?.amount || 0}
              onChange={(_, num) => onChange({ 
                amount: num, 
                currency: value?.currency || 'USD' 
              })}
              size="sm"
              min={0}
            >
              <NumberInputField placeholder="Enter amount" />
            </NumberInput>
          </InputGroup>
          <Select
            value={value?.currency || 'USD'}
            onChange={(e) => onChange({ 
              ...value, 
              currency: e.target.value 
            })}
            size="sm"
          >
            {CURRENCY_OPTIONS.map(currency => (
              <option key={currency.value} value={currency.value}>
                {currency.label}
              </option>
            ))}
          </Select>
        </VStack>
      );

    case 'date':
      if (operator === 'BETWEEN') {
        const values = value || ['', ''];
        return (
          <HStack>
            <Input
              type="date"
              value={values[0] ? formatDateForInput(values[0]) : ''}
              onChange={(e) => onChange([
                parseDateFromInput(e.target.value),
                values[1]
              ])}
              size="sm"
            />
            <Text>to</Text>
            <Input
              type="date"
              value={values[1] ? formatDateForInput(values[1]) : ''}
              onChange={(e) => onChange([
                values[0],
                parseDateFromInput(e.target.value)
              ])}
              size="sm"
            />
          </HStack>
        );
      }
      return (
        <Input
          type="date"
          value={value ? formatDateForInput(value) : ''}
          onChange={(e) => onChange(parseDateFromInput(e.target.value))}
          size="sm"
        />
      );

    case 'dateRange':
      return (
        <VStack spacing={2}>
          <Select
            value={dateRangePreset}
            onChange={(e) => handleDateRangePreset(e.target.value)}
            size="sm"
          >
            {DATE_RANGE_PRESETS.map(preset => (
              <option key={preset.value} value={preset.value}>
                {preset.label}
              </option>
            ))}
          </Select>
          {dateRangePreset === 'custom' && (
            <HStack>
              <Input
                type="date"
                value={value?.[0] ? formatDateForInput(value[0]) : ''}
                onChange={(e) => onChange([
                  parseDateFromInput(e.target.value),
                  value?.[1] || ''
                ])}
                size="sm"
              />
              <Text>to</Text>
              <Input
                type="date"
                value={value?.[1] ? formatDateForInput(value[1]) : ''}
                onChange={(e) => onChange([
                  value?.[0] || '',
                  parseDateFromInput(e.target.value)
                ])}
                size="sm"
              />
            </HStack>
          )}
        </VStack>
      );

    case 'boolean':
      return (
        <Switch
          isChecked={value || false}
          onChange={(e) => onChange(e.target.checked)}
          size="sm"
        />
      );

    case 'dropdown':
    case 'stage':
    case 'status':
      if (requiresMultipleValues) {
        const selectedValues = value || [];
        return (
          <VStack align="stretch" spacing={2}>
            <Box>
              {selectedValues.map((val: string) => (
                <Tag key={val} size="sm" colorScheme="blue" mr={1} mb={1}>
                  <TagLabel>
                    {field.options?.find(opt => opt.value === val)?.label || val}
                  </TagLabel>
                  <TagCloseButton
                    onClick={() => {
                      onChange(selectedValues.filter((v: string) => v !== val));
                    }}
                  />
                </Tag>
              ))}
            </Box>
            <Select
              placeholder="Select option..."
              onChange={(e) => {
                if (e.target.value && !selectedValues.includes(e.target.value)) {
                  onChange([...selectedValues, e.target.value]);
                }
              }}
              size="sm"
            >
              {field.options?.map(option => (
                <option 
                  key={option.value} 
                  value={option.value}
                  disabled={selectedValues.includes(option.value)}
                >
                  {option.label}
                </option>
              ))}
            </Select>
          </VStack>
        );
      }
      return (
        <Select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Select option..."
          size="sm"
        >
          {field.options?.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      );

    case 'user':
      if (requiresMultipleValues) {
        const selectedIds = value || [];
        const selectedUsers = users.filter(user => selectedIds.includes(user.id));
        
        return (
          <VStack align="stretch" spacing={2}>
            <Box>
              {selectedUsers.map(user => (
                <Tag key={user.id} size="sm" colorScheme="blue" mr={1} mb={1}>
                  <TagLabel>{user.display_name || user.email}</TagLabel>
                  <TagCloseButton
                    onClick={() => {
                      onChange(selectedIds.filter((id: string) => id !== user.id));
                    }}
                  />
                </Tag>
              ))}
            </Box>
            <Select
              placeholder="Select users..."
              onChange={(e) => {
                if (e.target.value && !selectedIds.includes(e.target.value)) {
                  onChange([...selectedIds, e.target.value]);
                }
              }}
              size="sm"
            >
              {users.map(user => (
                <option 
                  key={user.id} 
                  value={user.id}
                  disabled={selectedIds.includes(user.id)}
                >
                  {user.display_name || user.email}
                </option>
              ))}
            </Select>
          </VStack>
        );
      }
      return (
        <Select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Select user..."
          size="sm"
        >
          {users.map(user => (
            <option key={user.id} value={user.id}>
              {user.display_name || user.email}
            </option>
          ))}
        </Select>
      );

    case 'organization':
      if (requiresMultipleValues) {
        const selectedIds = value || [];
        const selectedOrgs = organizations.filter(org => selectedIds.includes(org.id));
        
        return (
          <VStack align="stretch" spacing={2}>
            <Box>
              {selectedOrgs.map(org => (
                <Tag key={org.id} size="sm" colorScheme="green" mr={1} mb={1}>
                  <TagLabel>{org.name}</TagLabel>
                  <TagCloseButton
                    onClick={() => {
                      onChange(selectedIds.filter((id: string) => id !== org.id));
                    }}
                  />
                </Tag>
              ))}
            </Box>
            <Select
              placeholder="Select organizations..."
              onChange={(e) => {
                if (e.target.value && !selectedIds.includes(e.target.value)) {
                  onChange([...selectedIds, e.target.value]);
                }
              }}
              size="sm"
            >
              {organizations.map(org => (
                <option 
                  key={org.id} 
                  value={org.id}
                  disabled={selectedIds.includes(org.id)}
                >
                  {org.name}
                </option>
              ))}
            </Select>
          </VStack>
        );
      }
      return (
        <Select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Select organization..."
          size="sm"
        >
          {organizations.map(org => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </Select>
      );

    case 'person':
      if (requiresMultipleValues) {
        const selectedIds = value || [];
        const selectedPeople = people.filter(person => selectedIds.includes(person.id));
        
        return (
          <VStack align="stretch" spacing={2}>
            <Box>
              {selectedPeople.map(person => (
                <Tag key={person.id} size="sm" colorScheme="purple" mr={1} mb={1}>
                  <TagLabel>
                    {`${person.first_name || ''} ${person.last_name || ''}`.trim() || person.email}
                  </TagLabel>
                  <TagCloseButton
                    onClick={() => {
                      onChange(selectedIds.filter((id: string) => id !== person.id));
                    }}
                  />
                </Tag>
              ))}
            </Box>
            <Select
              placeholder="Select people..."
              onChange={(e) => {
                if (e.target.value && !selectedIds.includes(e.target.value)) {
                  onChange([...selectedIds, e.target.value]);
                }
              }}
              size="sm"
            >
              {people.map(person => (
                <option 
                  key={person.id} 
                  value={person.id}
                  disabled={selectedIds.includes(person.id)}
                >
                  {`${person.first_name || ''} ${person.last_name || ''}`.trim() || person.email}
                </option>
              ))}
            </Select>
          </VStack>
        );
      }
      return (
        <Select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Select person..."
          size="sm"
        >
          {people.map(person => (
            <option key={person.id} value={person.id}>
              {`${person.first_name || ''} ${person.last_name || ''}`.trim() || person.email}
            </option>
          ))}
        </Select>
      );

    default:
      return (
        <Input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter value..."
          size="sm"
        />
      );
  }
}; 