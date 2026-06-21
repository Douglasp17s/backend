-- Drop unused tables that are not referenced in the backend services
-- These models were defined in the schema but never used in controllers or services

-- Drop LineTerminal table (pivot table for Terminal-BusLine relationship)
DROP TABLE IF EXISTS "line_terminals" CASCADE;

-- Drop Terminal table (no corresponding controller/service)
DROP TABLE IF EXISTS "terminals" CASCADE;

-- Drop AIPrediction table (no corresponding service implementation)
DROP TABLE IF EXISTS "ai_predictions" CASCADE;

-- Drop TrafficCondition table (no corresponding controller/service)
DROP TABLE IF EXISTS "traffic_conditions" CASCADE;

-- Drop UsageMetric table (no corresponding controller/service)
DROP TABLE IF EXISTS "usage_metrics" CASCADE;

-- Drop AppSetting table (no corresponding controller/service)
DROP TABLE IF EXISTS "app_settings" CASCADE;
