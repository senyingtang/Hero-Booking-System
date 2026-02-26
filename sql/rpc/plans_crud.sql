-- sql/rpc/plans_crud.sql
-- 方案管理 CRUD RPC

-- ── 建表 ──
CREATE TABLE IF NOT EXISTS kb_plans (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code          varchar(50) UNIQUE NOT NULL,
  name          varchar(100) NOT NULL,
  price         numeric NOT NULL DEFAULT 0,
  period        varchar(20) NOT NULL DEFAULT 'monthly',  -- monthly / yearly
  max_staff     int NOT NULL DEFAULT 1,
  features      jsonb DEFAULT '[]'::jsonb,
  status        varchar(20) NOT NULL DEFAULT 'active',   -- active / inactive
  sort_order    int NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- ── 1) 查詢所有方案 ──
CREATE OR REPLACE FUNCTION get_plans()
RETURNS SETOF kb_plans
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM kb_plans
  WHERE status != 'deleted'
  ORDER BY sort_order ASC, price ASC;
$$;

-- ── 2) 新增/更新方案 ──
CREATE OR REPLACE FUNCTION upsert_plan(
  p_id          uuid DEFAULT NULL,
  p_code        varchar DEFAULT NULL,
  p_name        varchar DEFAULT NULL,
  p_price       numeric DEFAULT 0,
  p_period      varchar DEFAULT 'monthly',
  p_max_staff   int DEFAULT 1,
  p_features    jsonb DEFAULT '[]'::jsonb,
  p_status      varchar DEFAULT 'active',
  p_sort_order  int DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result jsonb;
BEGIN
  IF p_id IS NOT NULL THEN
    -- Update
    UPDATE kb_plans SET
      code       = COALESCE(p_code, code),
      name       = COALESCE(p_name, name),
      price      = COALESCE(p_price, price),
      period     = COALESCE(p_period, period),
      max_staff  = COALESCE(p_max_staff, max_staff),
      features   = COALESCE(p_features, features),
      status     = COALESCE(p_status, status),
      sort_order = COALESCE(p_sort_order, sort_order),
      updated_at = now()
    WHERE id = p_id
    RETURNING jsonb_build_object('id', id, 'code', code, 'name', name) INTO v_result;
  ELSE
    -- Insert
    INSERT INTO kb_plans (code, name, price, period, max_staff, features, status, sort_order)
    VALUES (p_code, p_name, p_price, p_period, p_max_staff, p_features, p_status, p_sort_order)
    RETURNING jsonb_build_object('id', id, 'code', code, 'name', name) INTO v_result;
  END IF;

  RETURN v_result;
END;
$$;

-- ── 3) 刪除方案（soft delete） ──
CREATE OR REPLACE FUNCTION delete_plan(p_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE kb_plans SET status = 'deleted', updated_at = now() WHERE id = p_id;
  RETURN jsonb_build_object('ok', true);
END;
$$;

-- Grants
GRANT EXECUTE ON FUNCTION get_plans() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION upsert_plan(uuid,varchar,varchar,numeric,varchar,int,jsonb,varchar,int) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION delete_plan(uuid) TO authenticated, service_role;
