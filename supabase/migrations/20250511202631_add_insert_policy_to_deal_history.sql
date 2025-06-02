CREATE POLICY "Allow users to insert history for accessible deals"
ON public.deal_history
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.deals d
    WHERE d.id = deal_history.deal_id
    -- This implicitly assumes that if a user is able to trigger an action
    -- on a deal (create/update/delete) that results in a history record,
    -- they have the necessary underlying permissions for that deal.
    -- The RLS on the 'deals' table itself would have already been checked
    -- for the primary C/U/D operation.
  )
);
