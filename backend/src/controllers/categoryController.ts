import { Request, Response } from "express";
import pool from "../utils/pool.js";

export interface CategoryRow {
  id: number;
  name: string;
}

export const getCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query<CategoryRow>(
      `SELECT id, name FROM categories ORDER BY name ASC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ success: false, error: "Fehler beim Abrufen der Kategorien." });
  }
};
