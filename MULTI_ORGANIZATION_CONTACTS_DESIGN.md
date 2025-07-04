# Multi-Organization Contacts Design & Implementation

**Project**: PipeCD Organization-Person Relationship Enhancement  
**Version**: 1.0  
**Status**: Design Phase  
**Created**: January 26, 2025  

## 1. Executive Summary

This document outlines the gradual implementation of multi-organization contact relationships in PipeCD, moving from the current simple `people.organization_id` foreign key to a sophisticated system supporting multiple organizational affiliations per person with role context.

### 1.1 Current Limitations
- **Single Organization Constraint**: People can only belong to one organization
- **No Role Context**: No organizational chart, reporting relationships, or authority levels
- **Missing History**: No tracking of organization/role changes over time
- **Limited Business Intelligence**: Cannot map decision-makers, influencers, or buying committees

### 1.2 Strategic Goals
1. **Enable Complex B2B Scenarios**: Support people with multiple organizational roles
2. **Improve Deal Strategy**: Understand stakeholder relationships and influence
3. **Maintain System Maturity**: Gradual enhancement without overwhelming complexity
4. **Calendar Integration Ready**: Align with calendar-focused CRM vision

## 2. Current System Analysis

### 2.1 Database Schema Review

**Current People Table:**
```sql
-- From: 20250502193555_enhance_contact_model.sql
CREATE TABLE people (
  id UUID PRIMARY KEY,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  user_id UUID REFERENCES auth.users(id),
  first_name TEXT,
  last_name TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  notes TEXT,
  organization_id UUID REFERENCES organizations(id), -- SINGLE ORG LIMITATION
  custom_field_values JSONB
);
```

**Current Organization Schema:**
```sql
-- From: 20250501193538_initial_schema.sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  address TEXT,
  notes TEXT,
  account_manager_id UUID -- Added later
);
```

### 2.2 Frontend Components Analysis

**Affected Components:**
1. **PersonDetailPage.tsx** - Shows organization information, needs multi-org display
2. **CreateDealModal.tsx** - Person selection with organization context
3. **EditPersonForm.tsx** - Organization dropdown selection
4. **DealOrganizationContactsPanel.tsx** - Shows contacts from organization
5. **Organization.people GraphQL resolver** - Returns people by organization

**Current Person-Organization Display Pattern:**
```tsx
// From PersonDetailPage.tsx - Currently shows single organization
{currentPerson.organization && (
  <Text>{currentPerson.organization.name}</Text>
)}

// From CreateDealModal.tsx - Smart sorting by organization
const peopleOptions = people.map(person => {
  let label = personName;
  if (person.organization?.name) {
    label = `${personName} (${person.organization.name})`;
  }
});
```

### 2.3 GraphQL API Analysis

**Current Schema:**
```graphql
# From generated/graphql.ts
type Person {
  id: ID!
  first_name: String
  last_name: String
  email: String
  phone: String
  organization_id: ID        # Single organization reference
  organization: Organization # Resolved organization object
}
```

## 3. Phase 1 Implementation: Foundation

### 3.1 Person History Infrastructure

**Problem**: No audit trail for person changes when they move companies or change roles.

**Solution**: Create `person_history` table following exact patterns from `deal_history` and `lead_history`.

**Database Migration: `20250730000078_create_person_history_tracking.sql`**
```sql
-- Phase 1: Person History Tracking
CREATE TABLE public.person_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID, -- Allow null after person deletion
  user_id UUID REFERENCES auth.users(id),
  event_type TEXT NOT NULL, -- PERSON_CREATED, PERSON_UPDATED, PERSON_DELETED
  field_name TEXT, -- Which field changed
  old_value JSONB, -- Previous value
  new_value JSONB, -- New value  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger function for automatic tracking
CREATE OR REPLACE FUNCTION track_person_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle INSERT (create event)
  IF TG_OP = 'INSERT' THEN
    INSERT INTO person_history (person_id, user_id, event_type, new_value)
    VALUES (NEW.id, NEW.user_id, 'PERSON_CREATED', to_jsonb(NEW));
    RETURN NEW;
  END IF;
  
  -- Handle UPDATE (field change events)
  IF TG_OP = 'UPDATE' THEN
    -- Track organization changes specifically
    IF OLD.organization_id IS DISTINCT FROM NEW.organization_id THEN
      INSERT INTO person_history (person_id, user_id, event_type, field_name, old_value, new_value)
      VALUES (NEW.id, NEW.user_id, 'PERSON_UPDATED', 'organization_id', 
              to_jsonb(OLD.organization_id), to_jsonb(NEW.organization_id));
    END IF;
    
    -- Track other important fields
    IF OLD.email IS DISTINCT FROM NEW.email THEN
      INSERT INTO person_history (person_id, user_id, event_type, field_name, old_value, new_value)
      VALUES (NEW.id, NEW.user_id, 'PERSON_UPDATED', 'email',
              to_jsonb(OLD.email), to_jsonb(NEW.email));
    END IF;
    
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER track_person_changes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON people
  FOR EACH ROW EXECUTE FUNCTION track_person_changes();
```

### 3.2 Multi-Organization Relationships Table

**Migration: `20250730000079_create_multi_organization_contacts.sql`**
```sql
-- Phase 1: Multi-Organization Support
CREATE TABLE public.person_organization_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Role Information
  role_title TEXT NOT NULL, -- CFO, Board Member, Consultant
  department TEXT, -- Finance, Engineering, Sales
  
  -- Primary Organization Flag
  is_primary BOOLEAN DEFAULT FALSE, -- Only one primary org per person
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'former')),
  start_date DATE,
  end_date DATE,
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_user_id UUID REFERENCES auth.users(id),
  
  -- Constraints
  UNIQUE(person_id, organization_id, role_title), -- Prevent duplicate roles
  CONSTRAINT valid_date_range CHECK (end_date IS NULL OR end_date >= start_date)
);

-- Indexes for performance
CREATE INDEX idx_person_org_roles_person ON person_organization_roles(person_id);
CREATE INDEX idx_person_org_roles_org ON person_organization_roles(organization_id);
CREATE INDEX idx_person_org_roles_primary ON person_organization_roles(is_primary);
CREATE INDEX idx_person_org_roles_active ON person_organization_roles(status) WHERE status = 'active';

-- Primary organization constraint (only one primary per person)
CREATE UNIQUE INDEX idx_person_primary_org 
ON person_organization_roles(person_id) 
WHERE is_primary = true;

-- RLS Policies
ALTER TABLE person_organization_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage person org roles for their entities" 
ON person_organization_roles FOR ALL
USING (
  -- User owns the person
  EXISTS (SELECT 1 FROM people p WHERE p.id = person_id AND p.user_id = auth.uid())
  OR
  -- User owns the organization  
  EXISTS (SELECT 1 FROM organizations o WHERE o.id = organization_id AND o.user_id = auth.uid())
  OR
  -- User created this role
  created_by_user_id = auth.uid()
);
```

### 3.3 Migration Strategy for Existing Data

**Data Migration: `20250730000080_migrate_existing_org_relationships.sql`**
```sql
-- Migrate existing people.organization_id to new system
INSERT INTO person_organization_roles (
  person_id, 
  organization_id, 
  role_title, 
  is_primary, 
  status,
  created_by_user_id,
  created_at
)
SELECT 
  p.id as person_id,
  p.organization_id,
  'Contact' as role_title, -- Default role
  true as is_primary, -- Mark as primary
  'active' as status,
  p.user_id as created_by_user_id,
  p.created_at
FROM people p 
WHERE p.organization_id IS NOT NULL;

-- Keep organization_id for backward compatibility (Phase 1)
-- Will be deprecated in Phase 2
```

## 4. Frontend Implementation Plan

### 4.1 PersonDetailPage Enhancements

**Component: `PersonDetailPage.tsx`**
```tsx
// Phase 1 Enhancement: Multi-Organization Display
const PersonOrganizationsSection = ({ person }: { person: Person }) => {
  const { data: orgRoles } = useQuery(GET_PERSON_ORG_ROLES, {
    variables: { personId: person.id }
  });

  return (
    <Box>
      <Heading size="md" mb={4}>Organizations</Heading>
      <VStack spacing={3} align="stretch">
        {orgRoles?.personOrganizationRoles?.map((role: PersonOrgRole) => (
          <HStack key={role.id} justifyContent="space-between">
            <VStack align="start" spacing={0}>
              <HStack>
                <Link as={RouterLink} to={`/organizations/${role.organization.id}`}>
                  {role.organization.name}
                </Link>
                {role.is_primary && (
                  <Badge colorScheme="blue" size="sm">Primary</Badge>
                )}
              </HStack>
              <Text fontSize="sm" color="gray.600">
                {role.role_title}
                {role.department && ` • ${role.department}`}
              </Text>
            </VStack>
            <Text fontSize="xs" color="gray.500">
              {role.status === 'active' ? 'Current' : 'Former'}
            </Text>
          </HStack>
        ))}
      </VStack>
    </Box>
  );
};
```

### 4.2 CreateDealModal Enhancements

**Smart Person Selection with Multi-Org Context:**
```tsx
// Enhanced person options with role context
const peopleOptions = useMemo(() => {
  return people.map(person => {
    const primaryRole = person.organizationRoles?.find(role => role.is_primary);
    const roleContext = primaryRole 
      ? `${primaryRole.role_title} at ${primaryRole.organization.name}`
      : 'No organization';
    
    return {
      value: person.id,
      label: `${person.first_name} ${person.last_name} (${roleContext})`,
      organizationId: primaryRole?.organization_id,
      roleTitle: primaryRole?.role_title
    };
  })
  .sort((a, b) => {
    // Prioritize people from selected organization
    if (a.organizationId === organizationId && b.organizationId !== organizationId) return -1;
    if (a.organizationId !== organizationId && b.organizationId === organizationId) return 1;
    return a.label.localeCompare(b.label);
  });
}, [people, organizationId]);
```

### 4.3 EditPersonForm Multi-Organization Support

**Add Organization Roles Management:**
```tsx
const PersonOrganizationRolesEditor = ({ person }: { person: Person }) => {
  const [roles, setRoles] = useState(person.organizationRoles || []);
  
  const addRole = () => {
    setRoles([...roles, {
      organization_id: '',
      role_title: '',
      department: '',
      is_primary: roles.length === 0, // First role is primary
      status: 'active'
    }]);
  };

  return (
    <VStack spacing={4}>
      <HStack justifyContent="space-between" width="100%">
        <Heading size="sm">Organization Roles</Heading>
        <Button size="sm" onClick={addRole}>Add Role</Button>
      </HStack>
      
      {roles.map((role, index) => (
        <OrganizationRoleEditor 
          key={index}
          role={role}
          isPrimary={role.is_primary}
          onUpdate={(updatedRole) => updateRole(index, updatedRole)}
          onRemove={() => removeRole(index)}
        />
      ))}
    </VStack>
  );
};
```

## 5. GraphQL Schema Updates

### 5.1 New Types

```graphql
# Add to person.graphql
type PersonOrganizationRole {
  id: ID!
  person_id: ID!
  organization_id: ID!
  role_title: String!
  department: String
  is_primary: Boolean!
  status: String!
  start_date: Date
  end_date: Date
  notes: String
  created_at: DateTime!
  updated_at: DateTime!
  
  # Relationships
  person: Person!
  organization: Organization!
}

type Person {
  # ... existing fields
  
  # New multi-organization support
  organizationRoles: [PersonOrganizationRole!]!
  primaryOrganization: Organization
  primaryRole: PersonOrganizationRole
  
  # Deprecated but maintained for backward compatibility
  organization_id: ID
  organization: Organization
}

input PersonOrganizationRoleInput {
  organization_id: ID!
  role_title: String!
  department: String
  is_primary: Boolean
  status: String
  start_date: Date
  end_date: Date
  notes: String
}

input PersonUpdateInput {
  # ... existing fields
  organizationRoles: [PersonOrganizationRoleInput!]
}
```

### 5.2 Resolver Updates

**Person Resolver Enhancement:**
```typescript
// netlify/functions/graphql/resolvers/person.ts
export const Person: PersonResolvers<GraphQLContext> = {
  // New resolvers
  organizationRoles: async (parent, _args, context) => {
    const { data } = await supabase
      .from('person_organization_roles')
      .select(`
        *,
        organization:organizations(*)
      `)
      .eq('person_id', parent.id)
      .eq('status', 'active')
      .order('is_primary', { ascending: false });
    
    return data || [];
  },
  
  primaryOrganization: async (parent, _args, context) => {
    const { data } = await supabase
      .from('person_organization_roles')
      .select('organization:organizations(*)')
      .eq('person_id', parent.id)
      .eq('is_primary', true)
      .eq('status', 'active')
      .single();
    
    return data?.organization || null;
  },
  
  // Backward compatibility
  organization: async (parent, _args, context) => {
    // Phase 1: Use existing organization_id
    if (parent.organization_id) {
      const { data } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', parent.organization_id)
        .single();
      return data;
    }
    
    // Fallback to primary organization from roles
    const { data } = await supabase
      .from('person_organization_roles')
      .select('organization:organizations(*)')
      .eq('person_id', parent.id)
      .eq('is_primary', true)
      .eq('status', 'active')
      .single();
    
    return data?.organization || null;
  }
};
```

## 6. User Journey Examples

### 6.1 Sarah's Multi-Organization Journey

**Scenario**: Sarah Johnson is CFO at ACME Corp but also serves on TechStart Inc's board.

**Current System Problems:**
- ❌ Can only associate Sarah with one organization
- ❌ No context about her roles or authority levels
- ❌ When she changes companies, lose history
- ❌ Cannot map her influence across multiple deals

**Phase 1 Solution:**
1. **Create Multi-Org Roles**:
   - Primary: CFO at ACME Corp (is_primary: true)
   - Secondary: Board Member at TechStart Inc (is_primary: false)

2. **Deal Context Enhancement**:
   - ACME Corp deal shows "Sarah Johnson (CFO at ACME Corp)" - decision maker
   - TechStart Inc deal shows "Sarah Johnson (Board Member at TechStart Inc)" - influencer

3. **History Tracking**:
   - Track when Sarah moves from Manager → CFO at ACME Corp
   - Track when she joins TechStart board
   - Maintain full audit trail of organizational changes

### 6.2 Deal Creation with Enhanced Context

**Before (Current System)**:
```
Person: Sarah Johnson (ACME Corp)
Organization: ACME Corp
```

**After (Phase 1)**:
```
Person: Sarah Johnson (CFO at ACME Corp • Board Member at TechStart Inc)
Primary Organization: ACME Corp  
Role Context: CFO (decision maker, budget authority)
```

**UI Benefits**:
- Smart person sorting prioritizes people from selected organization
- Role context helps understand stakeholder importance
- History provides insight into relationship evolution

## 7. Implementation Timeline

### 7.1 Phase 1: Foundation (Week 1-2)
- ✅ Database migrations (person_history, person_organization_roles)
- ✅ GraphQL schema updates with backward compatibility
- ✅ Basic multi-organization display in PersonDetailPage
- ✅ Enhanced person selection in CreateDealModal

### 7.2 Phase 1.5: Enhanced UX (Week 3)
- Enhanced EditPersonForm with role management
- Improved organization contacts panels
- Person history viewer in admin section
- Migration of existing data

### 7.3 Phase 2: Business Intelligence (Week 4-6)
- Role-based authority indicators
- Stakeholder influence scoring
- Enhanced deal participant analysis
- Calendar integration with role context

## 8. Backward Compatibility Strategy

### 8.1 Database Compatibility
- Keep `people.organization_id` during Phase 1
- Populate both old and new systems during transition
- Gradual migration of UI components
- Deprecation warnings in GraphQL schema

### 8.2 Frontend Compatibility
```tsx
// Support both old and new patterns
const getPersonOrganization = (person: Person) => {
  // New system (preferred)
  if (person.primaryOrganization) {
    return person.primaryOrganization;
  }
  
  // Fallback to old system
  if (person.organization) {
    return person.organization;
  }
  
  return null;
};
```

## 9. Success Metrics

### 9.1 Technical Metrics
- ✅ Zero breaking changes to existing functionality
- ✅ All existing tests pass
- ✅ No performance regression in person/organization queries
- ✅ Successful data migration of existing relationships

### 9.2 Business Value Metrics
- 📈 Enhanced deal context with role information
- 📈 Better stakeholder identification in complex organizations
- 📈 Improved CRM data quality with relationship history
- 📈 Foundation for advanced features (influence scoring, buying committees)

## 10. Implementation Progress

### Phase 1: Database Foundation ✅
- [x] **Migration 1**: Person history tracking (`20250730000078_create_person_history_tracking.sql`)
- [x] **Migration 2**: Multi-organization contacts (`20250730000079_create_multi_organization_contacts.sql`) 
- [x] **Migration 3**: Data migration (`20250730000080_migrate_existing_org_relationships.sql`)
- [x] **Database Testing**: All migrations executed successfully, 2 relationships migrated

### Phase 1: GraphQL Schema & Resolvers ✅
- [x] **Schema Updates**: Enhanced `person.graphql` with PersonOrganizationRole and PersonHistory types
- [x] **Resolver Implementation**: Complete PersonOrganizationRole resolvers with CRUD operations
- [x] **GraphQL Integration**: Updated main GraphQL configuration with new resolvers

### Phase 1: Frontend Implementation ✅
- [x] **PersonDetailPage**: Multi-organization display with role cards (PersonOrganizationRoles component)
- [x] **GraphQL Query Updates**: Enhanced person queries with organizationRoles, primaryOrganization support
- [x] **Component Integration**: New Organizations tab in PersonDetailPage with badge count
- [x] **Build Testing**: Frontend compiles successfully with no TypeScript errors
- [ ] **CreateDealModal**: Enhanced person selection with organization context
- [ ] **EditPersonForm**: Organization role management interface

## 11. Next Steps

1. **Test GraphQL Schema** - Verify schema compilation and new resolvers
2. **Enhance PersonDetailPage** - Multi-organization display
3. **Update CreateDealModal** - Enhanced person selection  
4. **Create EditPersonForm** - Organization role management
5. **Frontend Testing** - Ensure no regressions

---

**Document Version**: 1.1  
**Status**: Phase 1 Backend Complete - Ready for Frontend Implementation  
**Last Updated**: January 26, 2025  
**Next Review**: February 2, 2025 