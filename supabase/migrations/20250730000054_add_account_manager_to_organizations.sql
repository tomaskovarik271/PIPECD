-- Migration: Add Account Manager to Organizations
-- Phase 1: Foundation for Account Management System
-- This migration adds account manager assignment to organizations with proper permissions

BEGIN;

-- Add account_manager_id column to organizations table
ALTER TABLE organizations 
ADD COLUMN account_manager_id UUID REFERENCES user_profiles(user_id) ON DELETE SET NULL;

-- Create index for performance on account manager queries
CREATE INDEX idx_organizations_account_manager ON organizations(account_manager_id);

-- Add new permissions for account management
INSERT INTO permissions (resource, action, description) VALUES 
('organization', 'assign_account_manager', 'Can assign account managers to organizations'),
('organization', 'manage_own_accounts', 'Can manage organizations where user is the account manager'),
('organization', 'view_account_portfolio', 'Can view account portfolio and statistics');

-- Grant account management permissions to appropriate roles
-- Admins can assign account managers
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'admin' AND p.resource = 'organization' AND p.action = 'assign_account_manager';

-- Members can manage their own assigned accounts
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'member' AND p.resource = 'organization' AND p.action = 'manage_own_accounts';

-- Members can view their account portfolio
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'member' AND p.resource = 'organization' AND p.action = 'view_account_portfolio';

-- Admins also get portfolio view permission
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'admin' AND p.resource = 'organization' AND p.action = 'view_account_portfolio';

-- Update RLS policy for organizations to include account manager access
-- Drop existing policy if it exists and recreate with account manager support
DROP POLICY IF EXISTS "Users can view organizations they have access to" ON organizations;

CREATE POLICY "Users can view organizations they have access to" ON organizations
FOR SELECT
USING (
  -- Admin users can see all organizations
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name = 'admin'
  )
  OR
  -- Users can see organizations they created
  user_id = auth.uid()
  OR
  -- Account managers can see organizations they manage
  account_manager_id = auth.uid()
  OR
  -- Users can see organizations where they have deals
  EXISTS (
    SELECT 1 FROM deals d
    WHERE d.organization_id = organizations.id 
    AND (d.user_id = auth.uid() OR d.assigned_to_user_id = auth.uid())
  )
);

-- Update organization update policy to include account manager permissions
DROP POLICY IF EXISTS "Users can update organizations with proper permissions" ON organizations;

CREATE POLICY "Users can update organizations with proper permissions" ON organizations
FOR UPDATE
USING (
  -- Admin users can update all organizations
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name = 'admin'
  )
  OR
  -- Users with update_any permission can update all organizations
  get_user_permissions(auth.uid())::jsonb ? 'organization:update_any'
  OR
  -- Users can update organizations they created
  (user_id = auth.uid() AND get_user_permissions(auth.uid())::jsonb ? 'organization:update_own')
  OR
  -- Account managers can update organizations they manage
  (account_manager_id = auth.uid() AND get_user_permissions(auth.uid())::jsonb ? 'organization:manage_own_accounts')
);

-- Add comment to document the new column
COMMENT ON COLUMN organizations.account_manager_id IS 'User who manages this organization as an account manager';

COMMIT; 