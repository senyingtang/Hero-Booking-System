-- sql/rpc/update_appointment.sql
-- 部署：在 Supabase SQL Editor 中執行

CREATE OR REPLACE FUNCTION update_appointment(
  p_id uuid,
  p_status varchar DEFAULT NULL,
  p_internal_note text DEFAULT NULL,
  p_customer_note text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result jsonb;
BEGIN
  UPDATE kb_appointments
  SET
    status = COALESCE(p_status, status),
    internal_note = COALESCE(p_internal_note, internal_note),
    customer_note = COALESCE(p_customer_note, customer_note),
    updated_at = now()
  WHERE id = p_id
  RETURNING jsonb_build_object(
    'id', id,
    'status', status,
    'internal_note', internal_note,
    'updated_at', updated_at
  ) INTO v_result;

  IF v_result IS NULL THEN
    RAISE EXCEPTION 'Appointment not found: %', p_id;
  END IF;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION update_appointment(uuid, varchar, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION update_appointment(uuid, varchar, text, text) TO service_role;
