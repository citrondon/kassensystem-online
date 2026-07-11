import { Product } from "../types";
import ProductImage from "./ProductImage";
import { PackageX, AlertTriangle, Star } from "lucide-react";

interface Props {
  products: Product[];
  onAdd: (product: Product) => void;
  favorites: number[];
  onToggleFavorite: (id: number) => void;
}

export default function ProductList({ products, onAdd, favorites, onToggleFavorite }: Props) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
        <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
          <PackageX size={28} className="text-slate-400" />
        </div>
        <p className="font-medium">Keine Produkte gefunden.</p>
        <p className="text-sm">Passe die Suche oder Kategorie an.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => {
        const isLowStock = product.stock > 0 && product.stock <= product.low_stock_threshold;
        const isOutOfStock = product.stock === 0;

        const isFavorite = favorites.includes(product.id);

        return (
          <div
            key={product.id}
            role="button"
            tabIndex={isOutOfStock ? -1 : 0}
            onClick={() => !isOutOfStock && onAdd(product)}
            onKeyDown={(e) => {
              if (isOutOfStock) return;
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onAdd(product);
              }
            }}
            aria-disabled={isOutOfStock}
            aria-label={`${product.name} zum Warenkorb hinzufügen`}
            className={`group relative flex flex-col rounded-2xl border bg-white p-4 text-left shadow-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-200 ${
              isOutOfStock
                ? "cursor-not-allowed border-slate-200 opacity-50"
                : "cursor-pointer border-slate-200 hover:border-indigo-200 hover:shadow-md active:scale-[0.98]"
            }`}
          >
            <div className="mb-3 flex items-start justify-between">
              <ProductImage product={product} size="xl" />
              <div className="flex flex-col items-end gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(product.id);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-amber-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                  aria-label={isFavorite ? "Aus Favoriten entfernen" : "Zu Favoriten hinzufügen"}
                >
                  <Star
                    size={18}
                    className={isFavorite ? "fill-amber-400 text-amber-400" : "text-slate-300"}
                  />
                </button>
                {isOutOfStock ? (
                  <span className="badge-danger">Ausverkauft</span>
                ) : isLowStock ? (
                  <span className="badge-warning flex items-center gap-1">
                    <AlertTriangle size={10} /> Wenig
                  </span>
                ) : (
                  <span className="badge-success">Verfügbar</span>
                )}
              </div>
            </div>

            <div className="mt-auto">
              <p className="truncate text-sm font-semibold text-slate-900">{product.name}</p>
              <p className="mt-1 text-lg font-bold text-indigo-600">
                {Number(product.price).toFixed(2)} €
              </p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Lager: <span className="font-semibold">{product.stock}</span>
                </span>
                {product.category_name && (
                  <span className="badge-info truncate max-w-[7rem]">
                    {product.category_name}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
