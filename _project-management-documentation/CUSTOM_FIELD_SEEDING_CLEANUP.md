# Custom Field & Currency System Seeding Cleanup - Migration Strategy

## Problem Analysis

PipeCD had **seeding chaos** across multiple migrations:

### **The Migration Chain Mess:**
1. ✅ `20250730000001` - Created 3 custom fields (person_position, organization_industry, deal_domain)
2. ✅ `20250730000014` - Added 8 lead custom fields  
3. ✅ `20250730000018` - Added person_linkedin custom field
4. ✅ `20250730000045` - **MASSIVE CURRENCY SEEDING** (42 currencies + 15 exchange rates)
5. ✅ `20250730000084` - Added deal_team_members custom field
6. ❌ `20250730000082` - **DELETED** person_position with data cleanup

**Total Impact:** 13 custom fields + 57 currency records, scattered across 80+ migration sequence

---

## Solution: Clean Slate + Seed File Strategy

### **Phase 1: Cleanup Migrations** ✅
**Migration 1:** `20250730000089_cleanup_custom_field_definitions.sql`
**Migration 2:** `20250730000090_cleanup_currency_seeding.sql`

**Actions:**
- Removes ALL 12 remaining custom field definitions from migrations
- Removes ALL 42 currencies and 15 exchange rates from migrations
- Performs comprehensive data cleanup from all entity tables
- Preserves data integrity during transition
- Detailed logging for transparency

**Fields Cleaned:**
- **Organization:** `organization_industry`
- **Person:** `person_linkedin_profile`, `person_linkedin` (duplicate) 
- **Deal:** `deal_domain`, `deal_team_members`
- **Lead:** `lead_industry`, `lead_company_size`, `lead_budget_range`, `lead_decision_timeline`, `lead_temperature`, `lead_pain_points`, `lead_contact_role`, `lead_priority`

**NOTE:** LinkedIn field name mismatch discovered and fixed:
- Migration created: `person_linkedin_profile` (correct)
- Cleanup initially targeted: `person_linkedin` (incorrect)
- Fixed to handle both field names and prevent duplicates

**NOTE:** Deal Team Members field type corrected:
- Migration created: `USER_MULTISELECT` (correct)
- Seed file incorrectly used: `TEXT` (wrong type)
- Fixed to use proper `USER_MULTISELECT` for user selection

### **Phase 2: Modular Seed Files Implementation** ✅
**Directory:** `supabase/seeds/` with organized files:
- `01_business_rules.sql` - Business rules automation (5 rules)
- `02_custom_fields.sql` - Custom field definitions (12 fields)
- `03_currencies.sql` - Currency system (42 currencies + 15 exchange rates)

**Benefits:**
- 12 custom field definitions across 4 entity types
- 42 world currencies with proper symbols and decimal places
- 15 sample exchange rates (USD base pairs)
- Proper conflict handling with `ON CONFLICT DO NOTHING`
- Organized by functionality with clear naming
- Modular architecture for easy maintenance
- Runs automatically with every `supabase db reset --local`

---

## Benefits of New Architecture

### ✅ **Single Source of Truth**
- All custom fields defined in one place (`supabase/seed.sql`)
- No more hunting across 80+ migrations

### ✅ **Easy Modification** 
- Change dropdown options → edit seed file
- Add new custom field → edit seed file
- No new migrations required for data changes

### ✅ **Clean Rollbacks**
- Migrations only contain schema changes
- Seed data doesn't affect migration rollbacks
- Database structure vs data cleanly separated

### ✅ **Consistent Development**
- Every `db reset` creates identical environment
- Automatic seeding with `config.toml` configuration
- Developers get consistent starting state

### ✅ **Better Maintainability**
- Schema evolution separate from data evolution
- Clear separation of concerns
- Future-proof architecture

---

## Migration Sequence

### **Before Cleanup:**
```
Migration 001 → Creates 3 custom fields
Migration 014 → Creates 8 custom fields  
Migration 018 → Creates 1 custom field
Migration 045 → Creates 42 currencies + 15 exchange rates
Migration 082 → DELETES 1 custom field (with complex cleanup)
Migration 084 → Creates 1 custom field
Total: Scattered across 6 migrations, 1 deletion, 57 currency records
```

### **After Cleanup:**
```
Migration 089              → Removes ALL seeded custom fields  
Migration 090              → Removes ALL seeded currencies/rates
seeds/01_business_rules.sql → Creates 5 business rules
seeds/02_custom_fields.sql  → Creates 12 custom fields consistently
seeds/03_currencies.sql     → Creates 42 currencies + 15 exchange rates
Total: Schema in migrations, data in organized seed files
```

---

## Implementation Status

- ✅ **Cleanup Migrations:** `20250730000089_cleanup_custom_field_definitions.sql` and `20250730000090_cleanup_currency_seeding.sql`
- ✅ **Modular Seed Files:** `01_business_rules.sql`, `02_custom_fields.sql`, and `03_currencies.sql`
- ✅ **Configuration Updated:** `supabase/config.toml` now uses `./seeds/*.sql` pattern
- ✅ **Old Seed File Removed:** Deleted monolithic `seed.sql` for clean architecture
- ✅ **Documentation:** This strategy document
- 🔄 **Ready for Testing:** `supabase db reset --local`

---

## Testing Instructions

1. **Run Migration + Seeding:**
   ```bash
   supabase db reset --local
   ```

2. **Verify Results:**
   - Check custom field definitions exist in database
   - Verify business rules also seeded correctly  
   - Confirm no migration conflicts
   - Test custom field functionality in frontend

3. **Expected Outcome:**
   - 12 custom field definitions active
   - 5 business rules active
   - Clean migration history
   - Identical functionality to before cleanup

---

## Next Steps: Full Migration Seeding Review

This custom field cleanup is **Phase 1** of broader migration seeding cleanup:

### **Remaining Seeding to Review:**
- **RBAC System:** 3 roles + 77+ permissions
- **Workflow System:** 11+ statuses, 2 workflows  
- **Currency System:** 42 currencies, 15 exchange rates
- **App Settings:** Google Drive integration settings

### **Strategy:**
1. ✅ **Custom Fields** (completed)
2. 🔄 **RBAC System** (essential, keep in migrations)
3. 🔄 **Workflow System** (move to seeds)
4. 🔄 **Currency System** (move to seeds) 
5. 🔄 **App Settings** (move to seeds)

The goal: **Schema in migrations, data in seeds** for a maintainable, scalable architecture. 

---

## Available Custom Field Types

PipeCD supports the following custom field types:

### **Core Types:**
- **TEXT** - Single-line text input
- **NUMBER** - Numeric input with validation
- **DATE** - Date picker
- **BOOLEAN** - True/false checkbox

### **Selection Types:**
- **DROPDOWN** - Single selection from predefined options
- **MULTI_SELECT** - Multiple selection from predefined options  
- **USER_MULTISELECT** - Multiple user selection (for team assignments)

### **Entity Types:**
- **DEAL** - Deal/opportunity records
- **PERSON** - Individual contact records
- **ORGANIZATION** - Company/account records  
- **LEAD** - Lead/prospect records

--- 