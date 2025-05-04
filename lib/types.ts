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

// Add other shared types here as needed, e.g., from GraphQL schema if not auto-generated elsewhere.
// For now, keep Person, Organization, Deal definitions separate or assume they come from GraphQL types. 