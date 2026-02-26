-- sql/rpc/services_crud.sql
-- 服務項目 CRUD RPC

-- 1) 查詢 tenant 的所有服務
CREATE OR REPLACE FUNCTION get_services(p_tenant_id uuid)
RETURNS SETOF kb_services
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM kb_services
  WHERE tenant_id = p_tenant_id
  ORDER BY sort_order ASC, name ASC;
$$;

-- 2) 新增/更新服務
CREATE OR REPLACE FUNCTION upsert_service(
  p_id uuid DEFAULT NULL,
  p_tenant_id uuid DEFAULT NULL,
  p_name varchar DEFAULT NULL,
  p_description text DEFAULT NULL,
  p_duration_minutes int DEFAULT 60,
  p_price numeric DEFAULT 0,
  p_status varchar DEFAULT 'active',
  p_sort_order int DEFAULT 0
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
    UPDATE kb_services SET
      name = COALESCE(p_name, name),
      description = COALESCE(p_description, description),
      duration_minutes = COALESCE(p_duration_minutes, duration_minutes),
      price = COALESCE(p_price, price),
      status = COALESCE(p_status, status),
      sort_order = COALESCE(p_sort_order, sort_order),
      updated_at = now()
    WHERE id = p_id
    RETURNING jsonb_build_object('id', id, 'name', name) INTO v_result;
  ELSE
    -- Insert
    INSERT INTO kb_services (tenant_id, name, description, duration_minutes, price, status, sort_order)
    VALUES (p_tenant_id, p_name, p_description, p_duration_minutes, p_price, p_status, p_sort_order)
    RETURNING jsonb_build_object('id', id, 'name', name) INTO v_result;
  END IF;

  RETURN v_result;
END;
$$;

-- 3) 刪除服務（soft delete）
CREATE OR REPLACE FUNCTION delete_service(p_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE kb_services SET status = 'deleted', updated_at = now() WHERE id = p_id;
  RETURN jsonb_build_object('ok', true);
END;
$$;

-- Grants
GRANT EXECUTE ON FUNCTION get_services(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION upsert_service(uuid,uuid,varchar,text,int,numeric,varchar,int) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION delete_service(uuid) TO authenticated, service_role;
