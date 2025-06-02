export interface Pipeline {
  id: string;
  user_id: string;
  name: string;
  created_at: string; // Represent dates as strings for simplicity in transfer
  updated_at: string;
}

export interface Stage {
  id: string;
  user_id: string;
  pipeline_id: string;
  name: string;
  order: number; // Use 'order' as the property name, matches DB "order" column
  deal_probability?: number | null; // Optional and nullable, matches DB 'real NULL'
  created_at: string;
  updated_at: string;
}

// === Activity Types ===

export interface Activity {
  id: string; // UUID
  user_id: string; // UUID
  created_at: string; // ISO 8601 Date string
  updated_at: string; // ISO 8601 Date string
  type: string; // Consider using a specific string literal union type later if needed
  subject: string;
  due_date: string | null; // ISO 8601 Date string or null
  is_done: boolean;
  notes: string | null;
  deal_id: string | null; // UUID or null
  person_id: string | null; // UUID or null
  organization_id: string | null; // UUID or null
}

export interface CreateActivityInput {
  type: string;
  subject: string;
  due_date?: string | null;
  notes?: string | null;
  is_done?: boolean; // Allow setting initial state, defaults to false in DB
  // Links (at least one required by app logic/validation later)
  deal_id?: string | null;
  person_id?: string | null;
  organization_id?: string | null;
}

export interface UpdateActivityInput {
  type?: string;
  subject?: string;
  due_date?: string | null;
  notes?: string | null;
  is_done?: boolean;
  // Links (allow changing association)
  deal_id?: string | null;
  person_id?: string | null;
  organization_id?: string | null;
}

// Add other shared types here as needed, e.g., from GraphQL schema if not auto-generated elsewhere.
// For now, keep Person, Organization, Deal definitions separate or assume they come from GraphQL types. 