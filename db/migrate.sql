-- Migration: Erweitere orders-Tabelle um Zahlungs- und Rabatt-Spalten
-- (idempotent – kann mehrfach ausgeführt werden)

ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS discount_amount  DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
    ADD COLUMN IF NOT EXISTS payment_method   VARCHAR(50)    NOT NULL DEFAULT 'cash',
    ADD COLUMN IF NOT EXISTS amount_tendered  DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (amount_tendered >= 0),
    ADD COLUMN IF NOT EXISTS change_amount    DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (change_amount >= 0),
    ADD COLUMN IF NOT EXISTS status           VARCHAR(50)    NOT NULL DEFAULT 'completed';

-- Migration: Kunden und Schulden (Auf Kredit verkaufen)
CREATE TABLE IF NOT EXISTS customers (
    id           SERIAL PRIMARY KEY,
    name         VARCHAR(255) NOT NULL,
    phone        VARCHAR(50),
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS debts (
    id            SERIAL PRIMARY KEY,
    customer_id   INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    order_id      INTEGER REFERENCES orders(id) ON DELETE SET NULL,
    amount        DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
    paid          BOOLEAN NOT NULL DEFAULT FALSE,
    paid_date     TIMESTAMP WITH TIME ZONE,
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_debts_customer_id ON debts(customer_id);
CREATE INDEX IF NOT EXISTS idx_debts_unpaid ON debts(paid) WHERE paid = FALSE;

-- Add customer_id to orders for credit purchases
ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL;

INSERT INTO pgmigrations (name) VALUES
    ('credit_customers_debts')
ON CONFLICT (name) DO NOTHING;
