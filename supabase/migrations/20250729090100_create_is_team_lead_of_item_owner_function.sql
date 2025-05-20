CREATE OR REPLACE FUNCTION public.is_team_lead_of_item_owner(viewer_user_id UUID, item_owner_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.teams t
        JOIN public.team_members tm ON t.id = tm.team_id
        WHERE t.team_lead_user_id = viewer_user_id
          AND tm.user_id = item_owner_user_id
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION public.is_team_lead_of_item_owner(UUID, UUID) 
IS 'Checks if the viewer_user_id is a team lead of any team that item_owner_user_id is a member of.'; 