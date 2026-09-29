-- V5: Allow supplementary and incremental invoices when new water consumption is logged after invoice payment

DROP INDEX IF EXISTS uq_household_billing_month;
DROP INDEX IF EXISTS uq_household_month;
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS uq_household_month;
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS uq_household_billing_month;
