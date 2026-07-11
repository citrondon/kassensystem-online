import { useState, useEffect, useCallback } from "react";
import { Product, Category } from "../types";
import { getProducts, getCategories, deleteProduct } from "../services/api";
import ProductImage from "./ProductImage";
import ProductFormModal from "./ProductFormModal";
import {
  AlertTriangle,
  RefreshCw,
  Plus,
  Pencil,
  Trash2,
  Package,
  Search,
  Filter,
} from "lucide-react";

export default function InventoryOverview() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [filterCategory, setFilterCategory] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

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
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        (p.barcode && p.barcode.toLowerCase().includes(q))
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 animate-spin items-center justify-center rounded-full border-2 border-indigo-200 border-t-indigo-600"></div>
        <p className="text-slate-500">Lade Inventar...</p>
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-red-600">{error}</p>
        <button onClick={load} className="btn-primary mt-4">
          <RefreshCw size={18} /> Erneut versuchen
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventar</h1>
          <p className="text-slate-500">Produkte verwalten, bearbeiten und nachbestellen.</p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setShowForm(true);
          }}
          className="btn-primary"
        >
          <Plus size={18} /> Neues Produkt
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="card">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Produkt oder Barcode suchen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowLowStockOnly((v) => !v)}
              className={`inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold transition ${
                showLowStockOnly
                  ? "bg-amber-500 text-white hover:bg-amber-600"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <AlertTriangle size={16} />
              Niedriger Bestand
            </button>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <select
                value={filterCategory ?? ""}
                onChange={(e) =>
                  setFilterCategory(e.target.value ? Number(e.target.value) : null)
                }
                className="select h-10 pl-9 pr-8 py-0"
              >
                <option value="">Alle Kategorien</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <button onClick={load} className="btn-icon" title="Aktualisieren">
              <RefreshCw size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="table-header">
              <tr>
                <th className="px-4 py-3">Bild</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Barcode</th>
                <th className="px-4 py-3">Kategorie</th>
                <th className="px-4 py-3 text-right">Preis</th>
                <th className="px-4 py-3 text-right">Lagerbestand</th>
                <th className="px-4 py-3 text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <Package size={24} />
                      Keine Produkte gefunden.
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((product) => (
                  <tr key={product.id} className="transition hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <ProductImage product={product} size="sm" />
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {product.name}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">
                      {product.barcode || "-"}
                    </td>
                    <td className="px-4 py-3">
                      {product.category_name ? (
                        <span className="badge-info">{product.category_name}</span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {Number(product.price).toFixed(2)} €
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`font-semibold ${
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
                        <span className="badge-warning ml-1.5">!</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingProduct(product);
                            setShowForm(true);
                          }}
                          className="btn-icon text-indigo-500 hover:bg-indigo-50 hover:text-indigo-700"
                          title="Bearbeiten"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(product)}
                          className="btn-icon text-red-500 hover:bg-red-50 hover:text-red-700"
                          title="Loeschen"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
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
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
                <Trash2 size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Produkt loeschen?</h3>
            </div>
            <p className="text-sm text-slate-600">
              Möchten Sie "{deleteTarget.name}" wirklich loeschen? Diese Aktion kann
              nicht rueckgaengig gemacht werden, solange keine Bestellungen vorliegen.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="btn-secondary flex-1"
              >
                Abbrechen
              </button>
              <button onClick={handleDelete} className="btn-danger flex-1">
                Loeschen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
