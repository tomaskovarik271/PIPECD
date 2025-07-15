# Pipedrive to PipeCD Migration: Technical Implementation Plan

*Detailed Technical Roadmap - January 30, 2025*

## 🎯 **TECHNICAL OVERVIEW**

Based on analysis of the actual Pipedrive data dump, this document outlines the technical implementation plan for migrating **102,838 records** across **9 data entities** to PipeCD.

### **Data Volume Analysis**
```
Total Records: 102,838
├── Organizations: 8,664 records (362KB)
├── Deals: 1,163 records (313KB)  
├── Deal Flow History: 9,272 records (473KB)
├── Deal Labels: 83,418 records (1.2MB) ⚠️ MASSIVE
├── Users: 164 records (4.1KB)
├── Pipelines: 5 records
├── Stages: 23 records
├── Regions: 37 records
└── Code Lists: 92 records
```

## 🏗️ **REQUIRED DEVELOPMENT WORK**

### **Phase 1: New Feature Development (3 weeks)**

#### **1.1 Deal Tagging System**
**Requirement**: Handle 83,418 deal labels from Pipedrive

```sql
-- New database tables
CREATE TABLE deal_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  color VARCHAR(7) DEFAULT '#3182ce',
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE TABLE deal_tag_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES deal_tags(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP DEFAULT NOW(),
  assigned_by UUID REFERENCES auth.users(id),
  UNIQUE(deal_id, tag_id)
);

-- RLS policies
ALTER TABLE deal_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_tag_assignments ENABLE ROW LEVEL SECURITY;
```

**GraphQL Schema**:
```graphql
type DealTag {
  id: ID!
  name: String!
  color: String!
  dealCount: Int!
  createdAt: DateTime!
}

type Deal {
  # ... existing fields
  tags: [DealTag!]!
}

input CreateDealTagInput {
  name: String!
  color: String
}

type Mutation {
  createDealTag(input: CreateDealTagInput!): DealTag!
  assignTagToDeal(dealId: ID!, tagId: ID!): Deal!
  removeTagFromDeal(dealId: ID!, tagId: ID!): Deal!
}
```

**Frontend Components**:
- `DealTagsPanel.tsx` - Tag management interface
- `TagSelector.tsx` - Tag selection component
- `CreateTagModal.tsx` - New tag creation

#### **1.2 Regional Management System**
**Requirement**: Handle 37 regions and 164 users

```sql
-- Add region to users table
ALTER TABLE auth.users ADD COLUMN region VARCHAR(100);

-- Create regions lookup table
CREATE TABLE regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(10) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert regions from Pipedrive data
INSERT INTO regions (name, code) VALUES
  ('Europe', 'EU'),
  ('MENA', 'MENA'),
  ('North America', 'NA'),
  -- ... other regions from region.csv
```

**GraphQL Schema**:
```graphql
type Region {
  id: ID!
  name: String!
  code: String!
  userCount: Int!
}

type User {
  # ... existing fields
  region: String
}

type Query {
  regions: [Region!]!
  usersByRegion(region: String!): [User!]!
}
```

#### **1.3 People Extraction System**
**Requirement**: Extract people from deal.person_name field

```sql
-- Create migration-specific people extraction
CREATE TABLE pipedrive_people_extraction (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  extracted_name VARCHAR(255),
  organization_name VARCHAR(255),
  deal_count INTEGER DEFAULT 0,
  created_person_id UUID REFERENCES people(id),
  extraction_confidence FLOAT DEFAULT 0.0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Extraction Logic**:
```javascript
// People extraction algorithm
function extractPeopleFromDeals(deals) {
  const peopleMap = new Map();
  
  deals.forEach(deal => {
    if (deal.person_name && deal.person_name.trim()) {
      const key = `${deal.person_name}:${deal.org_name}`;
      
      if (!peopleMap.has(key)) {
        peopleMap.set(key, {
          name: deal.person_name,
          organization: deal.org_name,
          dealCount: 0,
          deals: []
        });
      }
      
      peopleMap.get(key).dealCount++;
      peopleMap.get(key).deals.push(deal.id);
    }
  });
  
  return Array.from(peopleMap.values());
}
```

### **Phase 2: Migration Infrastructure (1 week)**

#### **2.1 Migration Database Schema**
```sql
-- Migration tracking tables
CREATE TABLE migration_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_name VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  total_records INTEGER NOT NULL,
  processed_records INTEGER DEFAULT 0,
  failed_records INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending',
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  error_log TEXT
);

CREATE TABLE migration_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipedrive_id VARCHAR(100) NOT NULL,
  pipedrive_entity VARCHAR(100) NOT NULL,
  pipecd_id UUID NOT NULL,
  pipecd_entity VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(pipedrive_id, pipedrive_entity)
);
```

#### **2.2 Migration Scripts Architecture**
```javascript
// Migration framework structure
class MigrationFramework {
  constructor() {
    this.batches = [];
    this.mappings = new Map();
    this.validators = new Map();
    this.transformers = new Map();
  }
  
  async migrate(entityType, data, options = {}) {
    const batch = await this.createBatch(entityType, data.length);
    
    try {
      // Transform data
      const transformed = await this.transform(entityType, data);
      
      // Validate data
      const validated = await this.validate(entityType, transformed);
      
      // Insert with mapping
      const results = await this.insertWithMapping(entityType, validated);
      
      await this.completeBatch(batch.id, results);
      
      return results;
    } catch (error) {
      await this.failBatch(batch.id, error);
      throw error;
    }
  }
}
```

## 📊 **DETAILED MIGRATION MAPPING**

### **3.1 Organizations Migration**
**Source**: `organization.csv` (8,664 records)

```javascript
// Organization transformation
const transformOrganization = (pipedrive) => ({
  id: generateUUID(),
  name: pipedrive.name,
  assigned_user_id: lookupUserId(pipedrive.owner_name),
  external_reference_id: `PD_ORG_${pipedrive.id}`,
  created_at: new Date(),
  updated_at: new Date()
});

// Validation rules
const validateOrganization = (org) => {
  if (!org.name || org.name.trim().length === 0) {
    throw new Error('Organization name is required');
  }
  if (org.name.length > 255) {
    throw new Error('Organization name too long');
  }
  return true;
};
```

### **3.2 Users Migration**
**Source**: `user.csv` (164 records)

```javascript
// User transformation with role assignment
const transformUser = (pipedrive) => {
  const roleMapping = {
    'OH Archived companies': 'read_only',
    'BusDev Prague': 'read_only',
    // Active deal owners get member role
    default: 'member'
  };
  
  // Senior team members get admin role
  const adminUsers = [
    'Carlos Meza', 'Goran Buvac', 'Sebastian Knab', 
    'Tobias Heger', 'Rudolf', 'Petr Janousek'
  ];
  
  const role = adminUsers.includes(pipedrive.name) ? 'admin' : 
               roleMapping[pipedrive.name] || roleMapping.default;
  
  return {
    id: generateUUID(),
    email: generateEmail(pipedrive.name),
    full_name: pipedrive.name,
    role: role,
    region: extractRegion(pipedrive.name),
    external_reference_id: `PD_USER_${pipedrive.id}`,
    created_at: new Date()
  };
};
```

### **3.3 Deals Migration**
**Source**: `deal.csv` (1,163 records)

```javascript
// Deal transformation with WFM integration
const transformDeal = (pipedrive) => {
  // Stage mapping from Pipedrive to PipeCD
  const stageMapping = {
    338: 'qualified_lead',      // Qualified lead
    340: 'opportunity_scoping', // Opportunity Scoping  
    356: 'proposal_development',// Proposal development
    341: 'proposal_sent',       // Proposal Sent
    342: 'contract_negotiation' // Contract Negotiation
  };
  
  return {
    id: generateUUID(),
    title: pipedrive.title,
    amount: parseFloat(pipedrive.value) || 0,
    currency: normalizeCurrency(pipedrive.currency),
    organization_id: lookupOrganizationId(pipedrive.org_id),
    assigned_user_id: lookupUserId(pipedrive.owner_name),
    wfm_step_id: lookupWfmStepId(stageMapping[pipedrive.stage_id]),
    status: pipedrive.status, // won, lost, open
    probability: parseFloat(pipedrive.probability) || 0,
    expected_close_date: parseDate(pipedrive.expected_close_date),
    external_reference_id: `PD_DEAL_${pipedrive.id}`,
    created_at: parseDate(pipedrive.add_time),
    updated_at: parseDate(pipedrive.update_time)
  };
};
```

### **3.4 Deal History Migration**
**Source**: `deal_flow.csv` (9,272 records)

```javascript
// Deal history transformation
const transformDealHistory = (pipedrive) => {
  const fieldMapping = {
    'stage_id': 'wfm_step_id',
    'value': 'amount',
    'owner_name': 'assigned_user_id',
    'currency': 'currency',
    'title': 'title',
    'expected_close_date': 'expected_close_date'
  };
  
  return {
    id: generateUUID(),
    deal_id: lookupDealId(pipedrive.deal_id),
    field_name: fieldMapping[pipedrive.field_key] || pipedrive.field_key,
    old_value: pipedrive.old_value,
    new_value: pipedrive.new_value,
    changed_by_user_id: lookupUserId(pipedrive.user_name),
    changed_at: parseDate(pipedrive.timestamp),
    external_reference_id: `PD_HISTORY_${pipedrive.id}`
  };
};
```

## 🔧 **MIGRATION EXECUTION PLAN**

### **Week 1-3: Development Phase**
```bash
# Day 1-5: Tagging System
- Database schema creation
- GraphQL API development  
- Frontend components
- Unit tests

# Day 6-10: Regional Management
- Database schema updates
- User region assignment
- Regional filtering UI
- Integration tests

# Day 11-15: People Extraction
- Extraction algorithm development
- Duplicate detection logic
- People creation workflow
- Validation framework
```

### **Week 4: Migration Infrastructure**
```bash
# Day 16-20: Migration Framework
- Migration tracking system
- Data transformation pipeline
- Validation framework
- Error handling and rollback
- Testing environment setup
```

### **Week 5-6: Data Migration Execution**
```bash
# Day 21-25: Core Data Migration
- Users migration (164 records)
- Organizations migration (8,664 records)  
- Deals migration (1,163 records)
- Custom fields migration
- Validation and testing

# Day 26-30: Historical Data & Optimization
- Deal history migration (9,272 records)
- Deal labels migration (83,418 records)
- Performance optimization
- Final validation
- Go-live preparation
```

## 🧪 **TESTING STRATEGY**

### **Unit Tests**
```javascript
// Example test suite
describe('Pipedrive Migration', () => {
  describe('Organization Transformation', () => {
    it('should transform organization correctly', () => {
      const pipedrive = { id: 1, name: 'Test Org', owner_name: 'John Doe' };
      const result = transformOrganization(pipedrive);
      
      expect(result.name).toBe('Test Org');
      expect(result.external_reference_id).toBe('PD_ORG_1');
    });
  });
  
  describe('Deal Transformation', () => {
    it('should handle currency normalization', () => {
      const pipedrive = { currency: 'CZK', value: '1000000' };
      const result = transformDeal(pipedrive);
      
      expect(result.currency).toBe('CZK');
      expect(result.amount).toBe(1000000);
    });
  });
});
```

### **Integration Tests**
```javascript
// End-to-end migration test
describe('Migration Integration', () => {
  it('should migrate complete deal with relationships', async () => {
    // Setup test data
    const organization = await migrateOrganization(testOrgData);
    const user = await migrateUser(testUserData);
    const deal = await migrateDeal(testDealData);
    
    // Verify relationships
    expect(deal.organization_id).toBe(organization.id);
    expect(deal.assigned_user_id).toBe(user.id);
    
    // Verify in Kanban
    const kanbanDeals = await getKanbanDeals();
    expect(kanbanDeals).toContainEqual(deal);
  });
});
```

## 📋 **VALIDATION FRAMEWORK**

### **Data Integrity Checks**
```javascript
// Validation rules
const validationRules = {
  organizations: [
    { field: 'name', required: true, maxLength: 255 },
    { field: 'assigned_user_id', required: true, type: 'uuid' }
  ],
  
  deals: [
    { field: 'title', required: true, maxLength: 255 },
    { field: 'amount', required: true, type: 'number', min: 0 },
    { field: 'currency', required: true, enum: ['EUR', 'CZK', 'CHF', 'USD'] },
    { field: 'organization_id', required: true, type: 'uuid' }
  ]
};

// Validation executor
const validateData = async (entityType, data) => {
  const rules = validationRules[entityType];
  const errors = [];
  
  for (const item of data) {
    for (const rule of rules) {
      const error = validateField(item, rule);
      if (error) errors.push(error);
    }
  }
  
  if (errors.length > 0) {
    throw new ValidationError(errors);
  }
  
  return true;
};
```

## 🚀 **DEPLOYMENT STRATEGY**

### **Pre-Migration Checklist**
- [ ] Backup current PipeCD database
- [ ] Deploy new features to staging
- [ ] Test migration on staging environment
- [ ] Prepare rollback procedures
- [ ] Schedule maintenance window
- [ ] Notify all users

### **Migration Day Execution**
```bash
# Hour 0: System Preparation
- Enable maintenance mode
- Create database backup
- Deploy migration infrastructure

# Hour 1-2: Core Data Migration
- Migrate users (164 records)
- Migrate organizations (8,664 records)
- Validate core data integrity

# Hour 3-4: Deals Migration
- Migrate deals (1,163 records)
- Migrate custom fields
- Validate deal relationships

# Hour 5-6: Historical Data
- Migrate deal history (9,272 records)
- Migrate deal labels (83,418 records)
- Final validation

# Hour 7: Go-Live
- Disable maintenance mode
- Monitor system performance
- User acceptance testing
```

## 📊 **SUCCESS METRICS**

### **Migration Success Criteria**
- **Data Integrity**: 100% of critical data migrated successfully
- **Relationship Integrity**: All foreign key relationships maintained
- **Performance**: Kanban loads in <2 seconds with migrated data
- **User Access**: All users can log in and access their data
- **Feature Parity**: All core Pipedrive features available in PipeCD

### **Post-Migration Validation**
```sql
-- Validation queries
SELECT 
  'Organizations' as entity,
  COUNT(*) as migrated_count,
  8664 as expected_count
FROM organizations 
WHERE external_reference_id LIKE 'PD_ORG_%'

UNION ALL

SELECT 
  'Deals' as entity,
  COUNT(*) as migrated_count,
  1163 as expected_count
FROM deals 
WHERE external_reference_id LIKE 'PD_DEAL_%';
```

---

**Document Prepared By**: AI Development Team  
**Date**: January 30, 2025  
**Status**: Technical Implementation Ready  
**Dependencies**: Business approval of required features 