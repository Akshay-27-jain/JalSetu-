-- V1__init.sql: Initial Database Schema for Smart Water Management

CREATE TABLE apartments (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    total_households INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE households (
    id BIGSERIAL PRIMARY KEY,
    apartment_id BIGINT NOT NULL REFERENCES apartments(id) ON DELETE CASCADE,
    flat_number VARCHAR(50) NOT NULL,
    area_sqft DOUBLE PRECISION,
    occupancy_count INT,
    has_meter BOOLEAN DEFAULT TRUE,
    invite_code VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_apartment_flat UNIQUE (apartment_id, flat_number)
);

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('MAIN_ADMIN', 'COMMUNITY_ADMIN', 'RESIDENT')),
    apartment_id BIGINT REFERENCES apartments(id) ON DELETE SET NULL,
    household_id BIGINT REFERENCES households(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tariff_plans (
    id BIGSERIAL PRIMARY KEY,
    apartment_id BIGINT NOT NULL REFERENCES apartments(id) ON DELETE CASCADE,
    base_rate_per_kl DOUBLE PRECISION NOT NULL,
    base_tier_limit_kl DOUBLE PRECISION NOT NULL,
    higher_rate_per_kl DOUBLE PRECISION NOT NULL,
    effective_from DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE billing_cycles (
    id BIGSERIAL PRIMARY KEY,
    apartment_id BIGINT NOT NULL REFERENCES apartments(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('OPEN', 'FINALIZED', 'ARCHIVED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE water_usage_logs (
    id BIGSERIAL PRIMARY KEY,
    household_id BIGINT NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    reading_date DATE NOT NULL,
    meter_reading_kl DOUBLE PRECISION NOT NULL,
    consumption_kl DOUBLE PRECISION NOT NULL,
    source VARCHAR(50) NOT NULL CHECK (source IN ('MANUAL', 'CSV')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_household_date UNIQUE (household_id, reading_date)
);

CREATE TABLE bulk_purchases (
    id BIGSERIAL PRIMARY KEY,
    apartment_id BIGINT NOT NULL REFERENCES apartments(id) ON DELETE CASCADE,
    cycle_id BIGINT REFERENCES billing_cycles(id) ON DELETE SET NULL,
    source_type VARCHAR(50) NOT NULL CHECK (source_type IN ('TANKER', 'MUNICIPAL')),
    volume_kl DOUBLE PRECISION NOT NULL,
    unit_cost DOUBLE PRECISION NOT NULL,
    total_cost DOUBLE PRECISION NOT NULL,
    purchased_at DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE invoices (
    id BIGSERIAL PRIMARY KEY,
    household_id BIGINT NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    cycle_id BIGINT NOT NULL REFERENCES billing_cycles(id) ON DELETE CASCADE,
    base_charge DOUBLE PRECISION NOT NULL,
    shared_charge DOUBLE PRECISION NOT NULL,
    adjustments DOUBLE PRECISION DEFAULT 0.0,
    total_amount DOUBLE PRECISION NOT NULL,
    pdf_path VARCHAR(500),
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_household_cycle UNIQUE (household_id, cycle_id)
);

CREATE TABLE alerts (
    id BIGSERIAL PRIMARY KEY,
    household_id BIGINT NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('OVERUSE', 'ANOMALY', 'BILL_READY')),
    message TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE
);

-- Indexes for frequent lookups and foreign keys
CREATE INDEX idx_households_apartment_id ON households(apartment_id);
CREATE INDEX idx_users_apartment_id ON users(apartment_id);
CREATE INDEX idx_users_household_id ON users(household_id);
CREATE INDEX idx_tariff_plans_apartment_id ON tariff_plans(apartment_id);
CREATE INDEX idx_billing_cycles_apartment_id ON billing_cycles(apartment_id);
CREATE INDEX idx_water_usage_logs_household_id ON water_usage_logs(household_id);
CREATE INDEX idx_water_usage_logs_reading_date ON water_usage_logs(reading_date);
CREATE INDEX idx_bulk_purchases_apartment_id ON bulk_purchases(apartment_id);
CREATE INDEX idx_bulk_purchases_cycle_id ON bulk_purchases(cycle_id);
CREATE INDEX idx_invoices_household_id ON invoices(household_id);
CREATE INDEX idx_invoices_cycle_id ON invoices(cycle_id);
CREATE INDEX idx_alerts_household_id ON alerts(household_id);
