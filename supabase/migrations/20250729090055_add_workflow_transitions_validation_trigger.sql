-- Supabase migration to add validation trigger for workflow_transitions table
-- Version: 1
-- Timestamp: 20250521164210

BEGIN;

-- Function to validate that from_step_id and to_step_id belong to the same workflow_id
-- as the transition record itself.
CREATE OR REPLACE FUNCTION public.check_workflow_transition_steps()
RETURNS TRIGGER AS $$
DECLARE
    from_step_workflow_id UUID;
    to_step_workflow_id UUID;
BEGIN
    -- Get the workflow_id for the from_step_id
    SELECT ws.workflow_id INTO from_step_workflow_id
    FROM public.workflow_steps ws
    WHERE ws.id = NEW.from_step_id;

    -- Get the workflow_id for the to_step_id
    SELECT ws.workflow_id INTO to_step_workflow_id
    FROM public.workflow_steps ws
    WHERE ws.id = NEW.to_step_id;

    -- Check if both steps exist and belong to the transition's workflow_id
    IF NOT FOUND OR from_step_workflow_id IS NULL OR to_step_workflow_id IS NULL THEN
        RAISE EXCEPTION 'From_step_id or to_step_id not found in workflow_steps.';
    END IF;

    IF from_step_workflow_id != NEW.workflow_id OR to_step_workflow_id != NEW.workflow_id THEN
        RAISE EXCEPTION 'From_step_id and to_step_id must belong to the same workflow_id as the transition record (%).', NEW.workflow_id;
    END IF;

    IF NEW.from_step_id = NEW.to_step_id THEN
        RAISE EXCEPTION 'A transition cannot have the same from_step_id and to_step_id.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.check_workflow_transition_steps() IS 'Ensures that from_step and to_step in a workflow_transition belong to the transition record''s workflow and are not identical.';

-- Trigger to execute the validation function before insert or update
CREATE TRIGGER trigger_validate_workflow_transition_steps
BEFORE INSERT OR UPDATE ON public.workflow_transitions
FOR EACH ROW
EXECUTE FUNCTION public.check_workflow_transition_steps();

COMMIT; 