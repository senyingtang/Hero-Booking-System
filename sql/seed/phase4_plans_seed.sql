-- sql/seed/phase4_plans_seed.sql
-- Phase 4 預設方案 seed

INSERT INTO kb_plans (code, name, price, period, max_staff, features, status, sort_order) VALUES
  ('free', '免費方案', 0, 'monthly', 1,
   '["基礎預約管理", "單一員工", "Email 通知"]'::jsonb,
   'active', 1),

  ('pro', '專業方案', 799, 'monthly', 5,
   '["進階預約管理", "最多 5 位員工", "SMS + Email 通知", "數據報表", "自訂品牌"]'::jsonb,
   'active', 2),

  ('enterprise', '企業方案', 1999, 'monthly', 9999,
   '["完整預約管理", "無限員工", "全通路通知", "進階報表", "自訂品牌", "API 存取", "專屬客服"]'::jsonb,
   'active', 3)

ON CONFLICT (code) DO UPDATE SET
  name       = EXCLUDED.name,
  price      = EXCLUDED.price,
  period     = EXCLUDED.period,
  max_staff  = EXCLUDED.max_staff,
  features   = EXCLUDED.features,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();
