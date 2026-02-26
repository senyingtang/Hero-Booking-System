-- sql/rpc/staff_schedules.sql
-- 員工班表 RPC

-- 1) 查詢 tenant 班表
CREATE OR REPLACE FUNCTION get_staff_schedules(
  p_tenant_id uuid,
  p_date_from date DEFAULT current_date,
  p_date_to date DEFAULT current_date + 14
)
RETURNS TABLE (
  id uuid,
  staff_id uuid,
  staff_name varchar,
  date date,
  start_time time,
  end_time time,
  status varchar,
  note text
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ss.id, ss.staff_id, ur.display_name AS staff_name,
    ss.date, ss.start_time, ss.end_time,
    ss.status, ss.note
  FROM kb_staff_schedules ss
  LEFT JOIN kb_user_roles ur ON ss.staff_id = ur.id
  WHERE ss.tenant_id = p_tenant_id
    AND ss.date BETWEEN p_date_from AND p_date_to
  ORDER BY ss.date ASC, ss.start_time ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2) 新增/更新班表
CREATE OR REPLACE FUNCTION upsert_staff_schedule(
  p_id uuid DEFAULT NULL,
  p_tenant_id uuid DEFAULT NULL,
  p_staff_id uuid DEFAULT NULL,
  p_date date DEFAULT NULL,
  p_start_time time DEFAULT '09:00',
  p_end_time time DEFAULT '18:00',
  p_status varchar DEFAULT 'scheduled',
  p_note text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result jsonb;
BEGIN
  IF p_id IS NOT NULL THEN
    UPDATE kb_staff_schedules SET
      staff_id = COALESCE(p_staff_id, staff_id),
      date = COALESCE(p_date, date),
      start_time = COALESCE(p_start_time, start_time),
      end_time = COALESCE(p_end_time, end_time),
      status = COALESCE(p_status, status),
      note = COALESCE(p_note, note),
      updated_at = now()
    WHERE id = p_id
    RETURNING jsonb_build_object('id', id) INTO v_result;
  ELSE
    INSERT INTO kb_staff_schedules (tenant_id, staff_id, date, start_time, end_time, status, note)
    VALUES (p_tenant_id, p_staff_id, p_date, p_start_time, p_end_time, p_status, p_note)
    RETURNING jsonb_build_object('id', id) INTO v_result;
  END IF;

  RETURN v_result;
END;
$$;

-- Grants
GRANT EXECUTE ON FUNCTION get_staff_schedules(uuid, date, date) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION upsert_staff_schedule(uuid,uuid,uuid,date,time,time,varchar,text) TO authenticated, service_role;
