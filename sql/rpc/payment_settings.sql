-- sql/rpc/payment_settings.sql
-- 金流設定 RPC

-- 1) 查詢金流設定
CREATE OR REPLACE FUNCTION get_payment_settings(p_merchant_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result jsonb;
BEGIN
  SELECT row_to_json(ps)::jsonb INTO v_result
  FROM kb_merchant_payment_settings ps
  WHERE ps.merchant_id = p_merchant_id;

  RETURN COALESCE(v_result, '{}'::jsonb);
END;
$$;

-- 2) 更新金流設定
CREATE OR REPLACE FUNCTION update_payment_settings(
  p_merchant_id uuid,
  p_ecpay_merchant_id varchar DEFAULT NULL,
  p_ecpay_hash_key varchar DEFAULT NULL,
  p_ecpay_hash_iv varchar DEFAULT NULL,
  p_line_pay_channel_id varchar DEFAULT NULL,
  p_line_pay_channel_secret varchar DEFAULT NULL,
  p_bank_transfer_enabled boolean DEFAULT false,
  p_bank_account_info text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result jsonb;
BEGIN
  INSERT INTO kb_merchant_payment_settings (
    merchant_id, ecpay_merchant_id, ecpay_hash_key, ecpay_hash_iv,
    line_pay_channel_id, line_pay_channel_secret,
    bank_transfer_enabled, bank_account_info
  ) VALUES (
    p_merchant_id, p_ecpay_merchant_id, p_ecpay_hash_key, p_ecpay_hash_iv,
    p_line_pay_channel_id, p_line_pay_channel_secret,
    p_bank_transfer_enabled, p_bank_account_info
  )
  ON CONFLICT (merchant_id) DO UPDATE SET
    ecpay_merchant_id = COALESCE(EXCLUDED.ecpay_merchant_id, kb_merchant_payment_settings.ecpay_merchant_id),
    ecpay_hash_key = COALESCE(EXCLUDED.ecpay_hash_key, kb_merchant_payment_settings.ecpay_hash_key),
    ecpay_hash_iv = COALESCE(EXCLUDED.ecpay_hash_iv, kb_merchant_payment_settings.ecpay_hash_iv),
    line_pay_channel_id = COALESCE(EXCLUDED.line_pay_channel_id, kb_merchant_payment_settings.line_pay_channel_id),
    line_pay_channel_secret = COALESCE(EXCLUDED.line_pay_channel_secret, kb_merchant_payment_settings.line_pay_channel_secret),
    bank_transfer_enabled = EXCLUDED.bank_transfer_enabled,
    bank_account_info = COALESCE(EXCLUDED.bank_account_info, kb_merchant_payment_settings.bank_account_info),
    updated_at = now()
  RETURNING jsonb_build_object('merchant_id', merchant_id, 'updated_at', updated_at)
  INTO v_result;

  RETURN v_result;
END;
$$;

-- Grants
GRANT EXECUTE ON FUNCTION get_payment_settings(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION update_payment_settings(uuid,varchar,varchar,varchar,varchar,varchar,boolean,text) TO authenticated, service_role;
