-- sql/rpc/get_merchant_kpi.sql
-- 部署：在 Supabase SQL Editor 中執行此檔案

CREATE OR REPLACE FUNCTION get_merchant_kpi(p_tenant_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  v_total_appointments bigint;
  v_revenue_today numeric;
  v_revenue_month numeric;
  v_revenue_last_month numeric;
  v_active_staff bigint;
  v_upcoming jsonb;
  v_daily_trend jsonb;
  v_top_services jsonb;
  v_top_staff jsonb;
BEGIN
  -- 1) 總預約數
  SELECT count(*)
  INTO v_total_appointments
  FROM kb_appointments
  WHERE tenant_id = p_tenant_id;

  -- 2) 今日營收（completed）
  SELECT coalesce(sum(total_amount), 0)
  INTO v_revenue_today
  FROM kb_appointments
  WHERE tenant_id = p_tenant_id
    AND status = 'completed'
    AND date_trunc('day', start_time) = date_trunc('day', now());

  -- 3) 本月營收
  SELECT coalesce(sum(total_amount), 0)
  INTO v_revenue_month
  FROM kb_appointments
  WHERE tenant_id = p_tenant_id
    AND status = 'completed'
    AND date_trunc('month', start_time) = date_trunc('month', now());

  -- 4) 上月營收（用於成長率計算）
  SELECT coalesce(sum(total_amount), 0)
  INTO v_revenue_last_month
  FROM kb_appointments
  WHERE tenant_id = p_tenant_id
    AND status = 'completed'
    AND date_trunc('month', start_time) = date_trunc('month', now() - interval '1 month');

  -- 5) 活躍員工數
  SELECT count(DISTINCT auth_user_id)
  INTO v_active_staff
  FROM kb_user_roles
  WHERE tenant_id = p_tenant_id
    AND role IN ('staff', 'supervisor')
    AND status = 'active';

  -- 6) 近期即將到來的預約（未來 7 天，最多 10 筆）
  SELECT coalesce(jsonb_agg(row_to_json(t)::jsonb), '[]'::jsonb)
  INTO v_upcoming
  FROM (
    SELECT id, customer_name, service_name, staff_name,
           start_time, end_time, total_amount, status
    FROM kb_appointments
    WHERE tenant_id = p_tenant_id
      AND start_time >= now()
      AND start_time < now() + interval '7 days'
    ORDER BY start_time ASC
    LIMIT 10
  ) t;

  -- 7) 近 7 天每日營收趨勢
  SELECT coalesce(jsonb_agg(row_to_json(t)::jsonb ORDER BY t.day), '[]'::jsonb)
  INTO v_daily_trend
  FROM (
    SELECT date_trunc('day', start_time)::date AS day,
           count(*) AS count,
           coalesce(sum(total_amount) FILTER (WHERE status = 'completed'), 0) AS revenue
    FROM kb_appointments
    WHERE tenant_id = p_tenant_id
      AND start_time >= (now() - interval '6 days')::date
      AND start_time < (now() + interval '1 day')::date
    GROUP BY date_trunc('day', start_time)::date
  ) t;

  -- 8) Top 5 服務（依預約次數）
  SELECT coalesce(jsonb_agg(row_to_json(t)::jsonb), '[]'::jsonb)
  INTO v_top_services
  FROM (
    SELECT service_name AS name,
           count(*) AS count,
           coalesce(sum(total_amount) FILTER (WHERE status = 'completed'), 0) AS revenue
    FROM kb_appointments
    WHERE tenant_id = p_tenant_id
      AND service_name IS NOT NULL
    GROUP BY service_name
    ORDER BY count DESC
    LIMIT 5
  ) t;

  -- 9) Top 5 員工（依完成預約數）
  SELECT coalesce(jsonb_agg(row_to_json(t)::jsonb), '[]'::jsonb)
  INTO v_top_staff
  FROM (
    SELECT staff_name AS name,
           count(*) AS count,
           coalesce(sum(total_amount) FILTER (WHERE status = 'completed'), 0) AS revenue
    FROM kb_appointments
    WHERE tenant_id = p_tenant_id
      AND staff_name IS NOT NULL
      AND status = 'completed'
    GROUP BY staff_name
    ORDER BY count DESC
    LIMIT 5
  ) t;

  -- 組合結果
  result := jsonb_build_object(
    'total_appointments', v_total_appointments,
    'revenue_today', v_revenue_today,
    'revenue_month', v_revenue_month,
    'revenue_last_month', v_revenue_last_month,
    'active_staff', v_active_staff,
    'upcoming_appointments', v_upcoming,
    'daily_trend', v_daily_trend,
    'top_services', v_top_services,
    'top_staff', v_top_staff
  );

  RETURN result;
END;
$$;

-- Grant execute to authenticated and service_role
GRANT EXECUTE ON FUNCTION get_merchant_kpi(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_merchant_kpi(uuid) TO service_role;
