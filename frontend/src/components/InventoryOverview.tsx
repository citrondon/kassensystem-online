import { useState, useEffect, useCallback } from "react";
import { Product, Category } from "../types";
import { getProducts, getCategories, deleteProduct } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import ProductImage from "./ProductImage";
import ProductFormModal from "./ProductFormModal";
import {
  AlertTriangle,
  RefreshCw,
  Plus,
  Pencil,
  Trash2,
  Package,
} from "lucide-react";
import { getCategoryMeta } from "../utils/categoryStyles";

export default function InventoryOverview() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [filterCategory, setFilterCategory] = useState<number | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const { user } = useAuth();
  const isManager = user?.role === "manager";

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [productData, catData] = await Promise.all([
        getProducts(),
        getCategories(),
      ]);
      setProducts(productData);
      setCategories(catData);
    } catch {
      setError("Inventar konnte nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSaved = () => {
    setShowForm(false);
    setEditingProduct(null);
    load();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProduct(deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Loeschen fehlgeschlagen.");
      setDeleteTarget(null);
    }
  };

  const isLowStock = (p: Product) =>
    p.stock > 0 && p.stock <= p.low_stock_threshold;

  const filtered = products.filter((p) => {
    if (showLowStockOnly && !isLowStock(p) && p.stock !== 0) return false;
    if (filterCategory !== null && p.category_id !== filterCategory) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Package className="mb-3 h-10 w-10 animate-bounce text-slate-300" />
        <p className="text-sm font-medium text-slate-400">Lade Inventar...</p>
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-red-600 font-medium">{error}</p>
        <button
          onClick={load}
          className="mt-3 btn-primary"
        >
          Erneut versuchen
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Inventar</h1>
        {isManager && (
          <button
            onClick={() => {
              setEditingProduct(null);
              setShowForm(true);
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Neues Produkt
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 border border-red-200">
          {error}
        </div>
      )}

      <div className="panel">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-4">
          <button
            onClick={() => setShowLowStockOnly((v) => !v)}
            className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
              showLowStockOnly
                ? "bg-amber-100 text-amber-700 border border-amber-200"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <AlertTriangle className="h-4 w-4" />
            Niedriger Bestand
          </button>

          <div className="relative">
            <select
              value={filterCategory ?? ""}
              onChange={(e) =>
                setFilterCategory(e.target.value ? Number(e.target.value) : null)
              }
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <option value="">Alle Kategorien</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={load}
            className="ml-auto flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
            Aktualisieren
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3">Bild</th>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Barcode</th>
                <th className="px-5 py-3">Kategorie</th>
                <th className="px-5 py-3 text-right">Preis</th>
                <th className="px-5 py-3 text-right">Lagerbestand</th>
                <th className="px-5 py-3 text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-400">
                    Keine Produkte gefunden.
                  </td>
                </tr>
              ) : (
                filtered.map((product) => (
                  <tr key={product.id} className="transition hover:bg-slate-50/50">
                    <td className="px-5 py-3">
                      <ProductImage product={product} size="sm" />
                    </td>
                    <td className="px-5 py-3 font-semibold text-slate-800">
                      {product.name}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-500">
                      {product.barcode || "-"}
                    </td>
                    <td className="px-5 py-3">
                      {product.category_name ? (
                        (() => {
                          const meta = getCategoryMeta(product.category_name);
                          return (
                            <span
                              className="badge"
                              style={{
                                background: meta.bg,
                                color: meta.color,
                                border: `1px solid ${meta.border}`,
                              }}
                              title={`${meta.emoji} ${product.category_name}`}
                            >
                              <span className="mr-1">{meta.emoji}</span>
                              {product.category_name}
                            </span>
                          );
                        })()
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right font-medium text-slate-800">
                      {Number(product.price).toFixed(2)} €
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span
                        className={`font-bold ${
                          product.stock === 0
                            ? "text-red-600"
                            : isLowStock(product)
                              ? "text-amber-600"
                              : "text-emerald-600"
                        }`}
                      >
                        {product.stock}
                      </span>
                      {isLowStock(product) && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
                          !
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {isManager ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingProduct(product);
                              setShowForm(true);
                            }}
                            className="flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Bearbeiten
                          </button>
                          <button
                            onClick={() => setDeleteTarget(product)}
                            className="flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Loeschen
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Nur lesen</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <ProductFormModal
          product={editingProduct}
          categories={categories}
          onClose={() => {
            setShowForm(false);
            setEditingProduct(null);
          }}
          onSaved={handleSaved}
        />
      )}

      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-center text-lg font-bold text-slate-800">Produkt loeschen?</h3>
            <p className="mt-2 text-center text-sm text-slate-600">
              Möchten Sie "{deleteTarget.name}" wirklich loeschen? Diese Aktion kann
              nicht rueckgaengig gemacht werden, solange keine Bestellungen vorliegen.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={handleDelete}
                className="flex-1 rounded-xl bg-red-600 py-2.5 font-semibold text-white transition hover:bg-red-700"
              >
                Loeschen
              </button>
              <button
                onClick={() => setDeleteTarget(null)}
                className="rounded-xl border border-slate-300 px-4 py-2.5 font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
