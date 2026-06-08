-- L3 module: learning objectives & outcomes (模块简介 = summary, already exists)

ALTER TABLE modules
  ADD COLUMN IF NOT EXISTS learning_objectives TEXT,
  ADD COLUMN IF NOT EXISTS learning_outcomes TEXT;

COMMENT ON COLUMN modules.summary IS '模块简介 — Module overview on storefront';
COMMENT ON COLUMN modules.learning_objectives IS '学习目标 — Learning objectives (one per line or semicolon-separated)';
COMMENT ON COLUMN modules.learning_outcomes IS '学习收获 — What you will gain (one per line or semicolon-separated)';
