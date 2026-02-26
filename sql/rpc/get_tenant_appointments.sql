-- sql/rpc/get_tenant_appointments.sql
-- 部署：在 Supabase SQL Editor 中執行

CREATE OR REPLACE FUNCTION get_tenant_appointments(
  p_tenant_id uuid,
  p_status varchar DEFAULT 'all',
  p_date_from date DEFAULT current_date - 30,
  p_date_to date DEFAULT current_date + 30
)
RETURNS TABLE (
  id uuid,
  booking_code varchar,
  customer_name varchar,
  customer_email varchar,
  customer_phone varchar,
  service_name varchar,
  staff_name varchar,
  start_time timestamptz,
  end_time timestamptz,
  total_amount numeric,
  status varchar,
  internal_note text,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.booking_code,
    a.customer_name,
    a.customer_email,
    a.customer_phone,
    a.service_name,
    a.staff_name,
    a.start_time,
    a.end_time,
    a.total_amount,
    a.status,
    a.internal_note,
    a.created_at
  FROM kb_appointments a
  WHERE a.tenant_id = p_tenant_id
    AND (p_status = 'all' OR a.status = p_status)
    AND a.start_time::date BETWEEN p_date_from AND p_date_to
  ORDER BY a.start_time DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_tenant_appointments(uuid, varchar, date, date) TO authenticated;
GRANT EXECUTE ON FUNCTION get_tenant_appointments(uuid, varchar, date, date) TO service_role;
