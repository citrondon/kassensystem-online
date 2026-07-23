import { Request, Response } from "express";
import pool from "../utils/pool.js";

export interface ProductRow {
  id: number;
  name: string;
  barcode: string | null;
  price: string;
  cost_price: string;
  stock: number;
  category_id: number | null;
  category_name: string | null;
  image_url: string | null;
  low_stock_threshold: number;
}

const SELECT_WITH_CATEGORY = `
  SELECT p.id, p.name, p.barcode, p.price, p.cost_price, p.stock,
         p.category_id, c.name AS category_name,
         p.image_url, p.low_stock_threshold
  FROM products p
  LEFT JOIN categories c ON p.category_id = c.id
`;

function safeErrorMessage(error: unknown, fallback: string): string {
  const msg = error instanceof Error ? error.message : String(error);
  if (msg.includes("unique constraint") || msg.includes("duplicate key")) {
    return "Ein Produkt mit diesem Namen oder Barcode existiert bereits.";
  }
  if (msg.includes("foreign key constraint")) {
    return "Referenz auf eine Kategorie oder Bestellung fehlgeschlagen.";
  }
  if (msg.includes("check constraint")) {
    return "Ungueltige Werte: Preis, Bestand oder Menge duerfen nicht negativ sein.";
  }
  return fallback;
}

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  const searchTerm = (req.query.searchTerm as string | undefined)?.trim();
  const categoryId = req.query.categoryId as string | undefined;

  try {
    let query = SELECT_WITH_CATEGORY;
    const params: (string | number)[] = [];
    const conditions: string[] = [];

    if (searchTerm) {
      params.push(`%${searchTerm}%`);
      conditions.push(`(p.name ILIKE $${params.length} OR p.barcode ILIKE $${params.length})`);
    }

    if (categoryId) {
      params.push(Number(categoryId));
      conditions.push(`p.category_id = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += ` ORDER BY p.name ASC`;

    const result = await pool.query<ProductRow>(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ success: false, error: "Fehler beim Abrufen der Produkte." });
  }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  const { name, barcode, price, costPrice, stock, categoryId, lowStockThreshold } = req.body;

  try {
    const result = await pool.query<ProductRow>(
      `INSERT INTO products (name, barcode, price, cost_price, stock, category_id, low_stock_threshold)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        name,
        barcode || null,
        price,
        costPrice ?? 0,
        stock ?? 0,
        categoryId ?? null,
        lowStockThreshold ?? 10,
      ]
    );

    const newId = result.rows[0].id;
    const full = await pool.query<ProductRow>(
      `${SELECT_WITH_CATEGORY} WHERE p.id = $1`,
      [newId]
    );
    res.status(201).json(full.rows[0]);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(400).json({ success: false, error: safeErrorMessage(error, "Fehler beim Erstellen des Produkts.") });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  const { name, barcode, price, costPrice, stock, categoryId, lowStockThreshold, imageUrl } = req.body;

  try {
    const result = await pool.query(
      `UPDATE products
       SET name = $1, barcode = $2, price = $3, cost_price = $4, stock = $5,
           category_id = $6, low_stock_threshold = $7, image_url = $8
       WHERE id = $9`,
      [
        name,
        barcode || null,
        price,
        costPrice ?? 0,
        stock ?? 0,
        categoryId ?? null,
        lowStockThreshold ?? 10,
        imageUrl ?? null,
        id,
      ]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ success: false, error: "Produkt nicht gefunden." });
      return;
    }

    const full = await pool.query<ProductRow>(
      `${SELECT_WITH_CATEGORY} WHERE p.id = $1`,
      [id]
    );
    res.json(full.rows[0]);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(400).json({ success: false, error: safeErrorMessage(error, "Fehler beim Aktualisieren des Produkts.") });
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);

  try {
    const result = await pool.query(
      `DELETE FROM products WHERE id = $1`,
      [id]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ success: false, error: "Produkt nicht gefunden." });
      return;
    }

    res.json({ success: true, message: "Produkt geloescht." });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(400).json({ success: false, error: safeErrorMessage(error, "Fehler beim Loeschen des Produkts.") });
  }
};

export const uploadProductImage = async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);

  if (!req.file) {
    res.status(400).json({ success: false, error: "Keine Datei hochgeladen." });
    return;
  }

  const imageUrl = `/uploads/${req.file.filename}`;

  try {
    const result = await pool.query(
      `UPDATE products SET image_url = $1 WHERE id = $2 RETURNING id`,
      [imageUrl, id]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ success: false, error: "Produkt nicht gefunden." });
      return;
    }

    const full = await pool.query<ProductRow>(
      `${SELECT_WITH_CATEGORY} WHERE p.id = $1`,
      [id]
    );
    res.json(full.rows[0]);
  } catch (error) {
    console.error("Error saving product image:", error);
    res.status(400).json({ success: false, error: safeErrorMessage(error, "Fehler beim Speichern des Bilds.") });
  }
};
