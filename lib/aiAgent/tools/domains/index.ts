/**
 * Domain Modules Index
 * 
 * Exports all domain modules and registry for Phase 3 architecture
 */

// Domain Registry
export { DomainRegistry } from './DomainRegistry';
export type { DomainModule } from './DomainRegistry';

// Individual Domain Modules
export { DealsModule } from './DealsModule';
export { OrganizationsModule } from './OrganizationsModule';
export { ContactsModule } from './ContactsModule';
// ActivitiesModule removed - using Google Calendar integration instead
export { PipelineModule } from './PipelineModule'; 