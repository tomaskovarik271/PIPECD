BEGIN;

CREATE OR REPLACE FUNCTION public.reassign_deal(
    p_deal_id UUID,
    p_new_assignee_id UUID, -- Can be NULL to unassign
    p_current_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
-- Set a secure search_path: Prevents search path hijacking attacks
SET search_path = public, extensions
AS $$
DECLARE
    v_deal_creator_id UUID;
    v_current_assigned_to_user_id UUID;
    v_can_update_own BOOLEAN;
    v_can_assign_any BOOLEAN;
BEGIN
    -- Check if the current user has global assign_any permission
    SELECT public.check_permission(p_current_user_id, 'assign_any', 'deal') INTO v_can_assign_any;

    IF v_can_assign_any THEN
        -- User with 'assign_any' can update assignment directly
        UPDATE public.deals
        SET assigned_to_user_id = p_new_assignee_id,
            updated_at = timezone('utc', now())
        WHERE id = p_deal_id;
        RETURN;
    END IF;

    -- For users without 'assign_any', check 'update_own' and ownership/assignment
    SELECT public.check_permission(p_current_user_id, 'update_own', 'deal') INTO v_can_update_own;

    IF NOT v_can_update_own THEN
        RAISE EXCEPTION 'User % does not have permission to update own deals.', p_current_user_id USING ERRCODE = '42501'; -- RLS error code for Forbidden
    END IF;

    -- Get current deal details
    SELECT user_id, assigned_to_user_id
    INTO v_deal_creator_id, v_current_assigned_to_user_id
    FROM public.deals
    WHERE id = p_deal_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Deal % not found.', p_deal_id USING ERRCODE = 'P0002'; -- No data found
    END IF;

    -- Check if the current user is the creator or the current assignee
    IF p_current_user_id != v_deal_creator_id AND p_current_user_id != v_current_assigned_to_user_id THEN
        RAISE EXCEPTION 'User % is not the creator or current assignee of deal %.', p_current_user_id, p_deal_id USING ERRCODE = '42501';
    END IF;

    -- If all checks pass, perform the update
    UPDATE public.deals
    SET assigned_to_user_id = p_new_assignee_id,
        updated_at = timezone('utc', now()) 
        -- Other fields are not modified by this specific function
    WHERE id = p_deal_id;

EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in reassign_deal function: %', SQLERRM;
        RAISE; -- Re-raise the original exception
END;
$$;

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION public.reassign_deal(UUID, UUID, UUID) TO authenticated;

COMMENT ON FUNCTION public.reassign_deal(UUID, UUID, UUID) IS
'Allows a user to reassign a deal. If the user has ''assign_any'' for deals, they can reassign any deal.
Otherwise, they must have ''update_own'' for deals and be either the creator or the current assignee of the specific deal.
This function runs with SECURITY DEFINER to bypass RLS for the direct UPDATE statement after checks pass, allowing reassignment even if the user loses visibility post-update.';

COMMIT; 