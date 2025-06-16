#!/usr/bin/env tsx

import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

// Store configurations for automatic generation
const storeConfigs = [
  {
    name: 'Deals',
    entityName: 'deal',
    entityNamePlural: 'deals',
    types: { entity: 'Deal', input: 'DealInput', updateInput: 'DealUpdateInput' },
    mutations: { create: 'createDeal', update: 'updateDeal', delete: 'deleteDeal' },
    hasCustomUpdate: true,
    customFields: true,
    workflow: true,
  },
  {
    name: 'People',
    entityName: 'person',
    entityNamePlural: 'people',
    types: { entity: 'Person', input: 'PersonInput' },
    mutations: { create: 'createPerson', update: 'updatePerson', delete: 'deletePerson' },
    customFields: true,
    organization: true,
    deals: true,
  },
  {
    name: 'Organizations',
    entityName: 'organization',
    entityNamePlural: 'organizations',
    types: { entity: 'Organization', input: 'OrganizationInput' },
    mutations: { create: 'createOrganization', update: 'updateOrganization', delete: 'deleteOrganization' },
    customFields: true,
  },
  {
    name: 'Leads',
    entityName: 'lead',
    entityNamePlural: 'leads',
    types: { entity: 'Lead', input: 'LeadInput', updateInput: 'LeadUpdateInput' },
    mutations: { create: 'createLead', update: 'updateLead', delete: 'deleteLead' },
    hasCustomUpdate: true,
    customFields: true,
    workflow: true,
  },
  {
    name: 'Activities',
    entityName: 'activity',
    entityNamePlural: 'activities',
    types: { entity: 'Activity', input: 'ActivityInput' },
    mutations: { create: 'createActivity', update: 'updateActivity', delete: 'deleteActivity' },
    assignable: true,
  },
];

// GraphQL field fragments for reuse
const commonFragments = {
  customFields: `
    customFieldValues {
      stringValue
      numberValue
      booleanValue
      dateValue
      selectedOptionValues
      definition {
        id
        fieldName
        fieldLabel
        fieldType
        isRequired
        dropdownOptions { value label }
      }
    }`,
  
  organization: `
    organization { 
      id 
      name 
    }`,
  
  user: `
    assignedToUser {
      id
      display_name
      email
      avatar_url
    }`,
  
  workflow: `
    currentWfmStep {
      id
      stepOrder
      isInitialStep
      isFinalStep
      metadata
      status {
        id
        name
        color
      }
    }
    currentWfmStatus {
      id
      name
      color
    }`,
};

// Function to generate basic CRUD fields for each entity
function getEntityFields(config: any): string {
  const fields = ['id', 'created_at', 'updated_at'];
  
  switch (config.entityName) {
    case 'deal':
      fields.push(
        'name', 'amount', 'currency', 'expected_close_date',
        'person_id', 'organization_id', 'project_id', 'user_id', 'assigned_to_user_id',
        'deal_specific_probability', 'weighted_amount', 'wfm_project_id'
      );
      break;
    case 'person':
      fields.push(
        'first_name', 'last_name', 'email', 'phone', 'notes', 'organization_id'
      );
      break;
    case 'organization':
      fields.push('name', 'industry', 'website', 'notes');
      break;
    case 'lead':
      fields.push(
        'contact_name', 'contact_email', 'contact_phone', 'company_name',
        'estimated_value', 'estimated_close_date', 'source', 'notes',
        'user_id', 'assigned_to_user_id', 'wfm_project_id'
      );
      break;
    case 'activity':
      fields.push(
        'type', 'subject', 'notes', 'due_date', 'is_done', 'is_system_activity',
        'user_id', 'assigned_to_user_id', 'deal_id', 'person_id', 'organization_id', 'lead_id'
      );
      break;
  }
  
  return fields.join('\n      ');
}

// Function to generate additional fragments based on config
function getAdditionalFragments(config: any): string {
  const fragments: string[] = [];
  
  if (config.customFields) fragments.push(commonFragments.customFields);
  if (config.organization) fragments.push(commonFragments.organization);
  if (config.assignable) fragments.push(commonFragments.user);
  if (config.workflow) fragments.push(commonFragments.workflow);
  
  // Special cases for related entities
  if (config.entityName === 'person' && config.deals) {
    fragments.push(`
      deals {
        id
        name
        amount
        expected_close_date
      }`);
  }
  
  return fragments.join('\n      ');
}

// Function to generate store file content
function generateStoreFile(config: any): string {
  const updateInputType = config.hasCustomUpdate ? config.types.updateInput : `Partial<${config.types.input}>`;
  
  return `import { gql } from 'graphql-request';
import { createCrudStore, commonExtractors } from './createCrudStore';
import type { 
  ${config.types.entity}, 
  ${config.types.input}${config.hasCustomUpdate ? `,\n  ${config.types.updateInput}` : ''}
} from '../generated/graphql/graphql';

// GraphQL Operations
const GET_${config.name.toUpperCase()}_QUERY = gql\`
  query Get${config.name} {
    ${config.entityNamePlural} {
      ${getEntityFields(config)}${getAdditionalFragments(config)}
    }
  }
\`;

const GET_${config.entityName.toUpperCase()}_BY_ID_QUERY = gql\`
  query Get${config.entityName.charAt(0).toUpperCase() + config.entityName.slice(1)}ById($id: ID!) {
    ${config.entityName}(id: $id) {
      ${getEntityFields(config)}${getAdditionalFragments(config)}
    }
  }
\`;

const CREATE_${config.entityName.toUpperCase()}_MUTATION = gql\`
  mutation Create${config.entityName.charAt(0).toUpperCase() + config.entityName.slice(1)}($input: ${config.types.input}!) {
    ${config.mutations.create}(input: $input) {
      ${getEntityFields(config)}${getAdditionalFragments(config)}
    }
  }
\`;

const UPDATE_${config.entityName.toUpperCase()}_MUTATION = gql\`
  mutation Update${config.entityName.charAt(0).toUpperCase() + config.entityName.slice(1)}($id: ID!, $input: ${config.hasCustomUpdate ? config.types.updateInput : config.types.input}!) {
    ${config.mutations.update}(id: $id, input: $input) {
      ${getEntityFields(config)}${getAdditionalFragments(config)}
    }
  }
\`;

const DELETE_${config.entityName.toUpperCase()}_MUTATION = gql\`
  mutation Delete${config.entityName.charAt(0).toUpperCase() + config.entityName.slice(1)}($id: ID!) {
    ${config.mutations.delete}(id: $id)
  }
\`;

// Create the ${config.name} store using the factory
export const use${config.name}Store = createCrudStore<${config.types.entity}, ${config.types.input}, ${updateInputType}>({
  entityName: '${config.entityName}',
  entityNamePlural: '${config.entityNamePlural}',
  
  queries: {
    getItems: GET_${config.name.toUpperCase()}_QUERY,
    getItemById: GET_${config.entityName.toUpperCase()}_BY_ID_QUERY,
  },
  
  mutations: {
    create: CREATE_${config.entityName.toUpperCase()}_MUTATION,
    update: UPDATE_${config.entityName.toUpperCase()}_MUTATION,
    delete: DELETE_${config.entityName.toUpperCase()}_MUTATION,
  },
  
  extractItems: commonExtractors.items('${config.entityNamePlural}'),
  extractSingleItem: commonExtractors.singleItem('${config.entityName}'),
  extractCreatedItem: commonExtractors.createdItem('${config.mutations.create}'),
  extractUpdatedItem: commonExtractors.updatedItem('${config.mutations.update}'),
  extractDeleteResult: commonExtractors.deleteResult('${config.mutations.delete}'),
});

// Export types for convenience
export type { ${config.types.entity}, ${config.types.input}${config.hasCustomUpdate ? `, ${config.types.updateInput}` : ''} };

// Store state type alias
export type ${config.name}StoreState = ReturnType<typeof use${config.name}Store>;`;
}

// Generate all store files
function generateAllStores() {
  console.log('🏭 Generating optimized CRUD stores...\n');
  
  let totalOriginalLines = 0;
  let totalGeneratedLines = 0;
  
  storeConfigs.forEach(config => {
    const fileName = `use${config.name}Store.generated.ts`;
    const filePath = join(process.cwd(), 'frontend/src/stores', fileName);
    
    // Count original lines
    const originalFile = join(process.cwd(), 'frontend/src/stores', `use${config.name}Store.ts`);
    try {
      const originalContent = readFileSync(originalFile, 'utf-8');
      const originalLines = originalContent.split('\n').length;
      totalOriginalLines += originalLines;
      
      // Generate new content
      const newContent = generateStoreFile(config);
      const generatedLines = newContent.split('\n').length;
      totalGeneratedLines += generatedLines;
      
      // Write generated file
      writeFileSync(filePath, newContent);
      
      const reduction = originalLines - generatedLines;
      const percentage = Math.round((reduction / originalLines) * 100);
      
      console.log(`✅ ${fileName}`);
      console.log(`   ${originalLines} → ${generatedLines} lines (${reduction} lines removed, ${percentage}% reduction)`);
      
    } catch (error) {
      console.log(`❌ Failed to process ${config.name}: ${error}`);
    }
  });
  
  const totalReduction = totalOriginalLines - totalGeneratedLines;
  const totalPercentage = Math.round((totalReduction / totalOriginalLines) * 100);
  
  console.log(`\n🎉 TOTAL RESULTS:`);
  console.log(`📊 Original: ${totalOriginalLines} lines`);
  console.log(`⚡ Generated: ${totalGeneratedLines} lines`);
  console.log(`🔥 Eliminated: ${totalReduction} lines (${totalPercentage}% reduction)`);
  console.log(`\n💾 All generated stores saved to frontend/src/stores/`);
}

// Run the generator
generateAllStores(); 