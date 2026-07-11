-- Migration: Add payment and discount columns to existing orders table
-- Run this against an existing database that was created before these fields existed.

ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
    ADD COLUMN IF NOT EXISTS payment_method  VARCHAR(50) NOT NULL DEFAULT 'cash',
    ADD COLUMN IF NOT EXISTS amount_tendered DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (amount_tendered >= 0),
    ADD COLUMN IF NOT EXISTS change_amount   DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (change_amount >= 0),
    ADD COLUMN IF NOT EXISTS status          VARCHAR(50) NOT NULL DEFAULT 'completed';
