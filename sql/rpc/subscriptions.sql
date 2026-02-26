-- sql/rpc/subscriptions.sql
-- 租戶訂閱 + 支付紀錄

-- ── 建表：租戶訂閱 ──
CREATE TABLE IF NOT EXISTS kb_tenant_subscriptions (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             uuid NOT NULL,
  plan_id               uuid NOT NULL REFERENCES kb_plans(id),
  status                varchar(20) NOT NULL DEFAULT 'trial',  -- trial / active / expired / cancelled
  current_period_start  timestamptz NOT NULL DEFAULT now(),
  current_period_end    timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  trial_ends_at         timestamptz DEFAULT (now() + interval '14 days'),
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tenant_id)
);

-- ── 建表：支付紀錄 ──
CREATE TABLE IF NOT EXISTS kb_payments (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         uuid NOT NULL,
  merchant_trade_no varchar(50) UNIQUE NOT NULL,
  amount            numeric NOT NULL DEFAULT 0,
  payment_method    varchar(20) NOT NULL DEFAULT 'ecpay',  -- ecpay / bank / line_pay
  status            varchar(20) NOT NULL DEFAULT 'pending', -- pending / paid / failed
  ecpay_response    jsonb DEFAULT '{}'::jsonb,
  paid_at           timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- ── 1) 查詢租戶當前訂閱（含方案資料） ──
CREATE OR REPLACE FUNCTION get_tenant_subscription(p_tenant_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'subscription_id', s.id,
    'tenant_id', s.tenant_id,
    'plan_id', s.plan_id,
    'status', s.status,
    'current_period_start', s.current_period_start,
    'current_period_end', s.current_period_end,
    'trial_ends_at', s.trial_ends_at,
    'plan_code', p.code,
    'plan_name', p.name,
    'plan_price', p.price,
    'plan_period', p.period,
    'plan_max_staff', p.max_staff,
    'plan_features', p.features
  ) INTO v_result
  FROM kb_tenant_subscriptions s
  JOIN kb_plans p ON p.id = s.plan_id
  WHERE s.tenant_id = p_tenant_id;

  RETURN COALESCE(v_result, '{}'::jsonb);
END;
$$;

-- ── 2) 寫入/更新支付紀錄 ──
CREATE OR REPLACE FUNCTION upsert_payment(
  p_tenant_id         uuid,
  p_merchant_trade_no varchar,
  p_amount            numeric DEFAULT 0,
  p_payment_method    varchar DEFAULT 'ecpay',
  p_status            varchar DEFAULT 'pending',
  p_ecpay_response    jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result jsonb;
BEGIN
  INSERT INTO kb_payments (tenant_id, merchant_trade_no, amount, payment_method, status, ecpay_response, paid_at)
  VALUES (
    p_tenant_id, p_merchant_trade_no, p_amount, p_payment_method, p_status, p_ecpay_response,
    CASE WHEN p_status = 'paid' THEN now() ELSE NULL END
  )
  ON CONFLICT (merchant_trade_no) DO UPDATE SET
    status = EXCLUDED.status,
    ecpay_response = EXCLUDED.ecpay_response,
    paid_at = CASE WHEN EXCLUDED.status = 'paid' THEN now() ELSE kb_payments.paid_at END,
    updated_at = now()
  RETURNING jsonb_build_object('id', id, 'merchant_trade_no', merchant_trade_no, 'status', status)
  INTO v_result;

  RETURN v_result;
END;
$$;

-- Grants
GRANT EXECUTE ON FUNCTION get_tenant_subscription(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION upsert_payment(uuid,varchar,numeric,varchar,varchar,jsonb) TO authenticated, service_role;
