-- sql/seed/phase3_demo_data.sql
-- Phase 3 測試資料 seed（需先有 tenant_id）
-- 用法：將下面的 UUID 替換為你的實際 tenant_id 和 merchant_id

DO $$
DECLARE
  v_tenant_id uuid := '00000000-0000-0000-0000-000000000001'; -- 替換
  v_merchant_id uuid := '00000000-0000-0000-0000-000000000002'; -- 替換
BEGIN

  -- ── 服務項目 ──
  INSERT INTO kb_services (tenant_id, name, description, duration_minutes, price, status, sort_order) VALUES
    (v_tenant_id, '經典剪髮', '專業剪髮造型，含洗髮吹整', 60, 600, 'active', 1),
    (v_tenant_id, '染髮造型', '全頭染髮，含護色處理', 120, 2800, 'active', 2),
    (v_tenant_id, '護髮療程', '深層修護，適合受損髮質', 90, 1500, 'active', 3),
    (v_tenant_id, '頭皮養護', '頭皮檢測 + 養護療程', 75, 1200, 'active', 4),
    (v_tenant_id, '燙髮', '冷燙/熱燙，含造型', 150, 3500, 'active', 5),
    (v_tenant_id, '頭部按摩', '放鬆紓壓，15 分鐘', 15, 300, 'active', 6),
    (v_tenant_id, '兒童剪髮', '12 歲以下兒童', 30, 350, 'active', 7)
  ON CONFLICT DO NOTHING;

  -- ── 預約資料 ──
  INSERT INTO kb_appointments (tenant_id, booking_code, customer_name, customer_email, customer_phone, service_name, staff_name, start_time, end_time, total_amount, status, internal_note) VALUES
    (v_tenant_id, 'HB2024001', '王小明', 'wang@example.com', '0912345678', '經典剪髮', 'Amy', now() + interval '1 hour', now() + interval '2 hours', 600, 'confirmed', 'VIP 客戶'),
    (v_tenant_id, 'HB2024002', '李小花', 'lee@example.com', '0923456789', '染髮造型', 'Bob', now() + interval '3 hours', now() + interval '5 hours', 2800, 'pending', NULL),
    (v_tenant_id, 'HB2024003', '張大偉', 'chang@example.com', '0934567890', '護髮療程', 'Cindy', now() + interval '1 day', now() + interval '1 day 1.5 hours', 1500, 'confirmed', NULL),
    (v_tenant_id, 'HB2024004', '陳美美', 'chen@example.com', '0945678901', '燙髮', 'Amy', now() + interval '2 days', now() + interval '2 days 2.5 hours', 3500, 'pending', NULL),
    (v_tenant_id, 'HB2024005', '林志豪', 'lin@example.com', '0956789012', '經典剪髮', 'David', now() - interval '1 day', now() - interval '23 hours', 600, 'completed', NULL),
    (v_tenant_id, 'HB2024006', '黃小芬', 'huang@example.com', '0967890123', '頭皮養護', 'Eva', now() - interval '2 days', now() - interval '2 days' + interval '75 minutes', 1200, 'completed', NULL),
    (v_tenant_id, 'HB2024007', '趙先生', 'zhao@example.com', '0978901234', '染髮造型', 'Bob', now() - interval '3 days', now() - interval '3 days' + interval '2 hours', 2800, 'cancelled', '客戶臨時取消'),
    (v_tenant_id, 'HB2024008', '吳小姐', 'wu@example.com', '0989012345', '頭部按摩', 'Cindy', now() + interval '4 days', now() + interval '4 days 15 minutes', 300, 'confirmed', NULL)
  ON CONFLICT DO NOTHING;

  -- ── 金流設定（測試用） ──
  INSERT INTO kb_merchant_payment_settings (merchant_id, ecpay_merchant_id, bank_transfer_enabled, bank_account_info) VALUES
    (v_merchant_id, '3002607', true, '台北富邦 012 帳號 12345678901234')
  ON CONFLICT (merchant_id) DO NOTHING;

END $$;
