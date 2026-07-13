import { Request, Response } from "express";
import pool from "../utils/pool.js";

export interface CustomerRow {
  id: number;
  name: string;
  phone: string | null;
  created_at: string;
}

export const getCustomers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query<CustomerRow>(
      `SELECT * FROM customers ORDER BY name ASC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ success: false, error: "Fehler beim Abrufen der Kunden." });
  }
};

export const createCustomer = async (req: Request, res: Response): Promise<void> => {
  const { name, phone } = req.body;
  if (!name || typeof name !== "string" || !name.trim()) {
    res.status(400).json({ success: false, error: "Kundenname ist erforderlich." });
    return;
  }
  try {
    const result = await pool.query<CustomerRow>(
      `INSERT INTO customers (name, phone) VALUES ($1, $2) RETURNING *`,
      [name.trim(), phone?.trim() || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating customer:", error);
    res.status(500).json({ success: false, error: "Fehler beim Anlegen des Kunden." });
  }
};

export interface DebtRow {
  id: number;
  customer_id: number;
  customer_name: string;
  customer_phone: string | null;
  order_id: number | null;
  amount: string;
  paid: boolean;
  paid_date: string | null;
  created_at: string;
}

export const getDebts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query<DebtRow>(
      `SELECT d.*, c.name AS customer_name, c.phone AS customer_phone
       FROM debts d
       JOIN customers c ON c.id = d.customer_id
       ORDER BY d.paid ASC, d.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching debts:", error);
    res.status(500).json({ success: false, error: "Fehler beim Abrufen der Schulden." });
  }
};

export const markDebtPaid = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `UPDATE debts SET paid = TRUE, paid_date = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: "Schuld nicht gefunden." });
      return;
    }
    res.json({ success: true, message: "Schuld als bezahlt markiert." });
  } catch (error) {
    console.error("Error marking debt paid:", error);
    res.status(500).json({ success: false, error: "Fehler beim Aktualisieren." });
  }
};
