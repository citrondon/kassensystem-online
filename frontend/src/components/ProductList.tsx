import { Product } from "../types";
import { useI18n } from "../i18n/I18nContext";
import { getCategoryLabel } from "../utils/categoryStyles";
import ProductImage from "./ProductImage";
import { Plus, AlertCircle } from "lucide-react";

interface Props {
  products: Product[];
  onAdd: (product: Product) => void;
}

export default function ProductList({ products, onAdd }: Props) {
  const { t, lang } = useI18n();
  const currency = t("currency");
  const fmt = (n: number) => Math.round(n).toLocaleString("de-DE");

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white py-16">
        <AlertCircle className="mb-2 h-10 w-10 text-slate-300" />
        <p className="text-sm font-medium text-slate-400">{t("noProductsFound")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 xl:grid-cols-3">
      {products.map((product) => {
        const isLowStock = product.stock > 0 && product.stock <= product.low_stock_threshold;
        const isOutOfStock = product.stock === 0;

        return (
          <button
            key={product.id}
            disabled={isOutOfStock}
            onClick={() => onAdd(product)}
            className={`group relative flex flex-col rounded-xl border bg-white p-2.5 text-left shadow-sm transition sm:p-4 ${
              isOutOfStock
                ? "cursor-not-allowed border-slate-200 opacity-50"
                : "border-slate-200 hover:border-indigo-300 hover:shadow-md active:scale-95"
            }`}
          >
            <div className="mb-3 flex items-start justify-between">
              <ProductImage product={product} size="lg" />
              {!isOutOfStock && (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 opacity-0 transition group-hover:opacity-100">
                  <Plus className="h-5 w-5" />
                </span>
              )}
            </div>

            <div className="mt-auto">
              <p className="text-sm font-semibold text-slate-800 line-clamp-2">
                {product.name}
              </p>
              <p className="mt-1 text-lg font-bold text-slate-900">
                {fmt(Number(product.price))} {currency}
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                {isOutOfStock ? (
                  <span className="badge bg-red-100 text-red-700">{t("outOfStock")}</span>
                ) : isLowStock ? (
                  <span className="badge bg-amber-100 text-amber-700">
                    {t("onlyLeft")} {product.stock}
                  </span>
                ) : (
                  <span className="badge bg-emerald-100 text-emerald-700">
                    {t("stock")}: {product.stock}
                  </span>
                )}
                {product.category_name && (
                  <span className="badge bg-slate-100 text-slate-600">
                    {getCategoryLabel(product.category_name, lang)}
                  </span>
                )}
              </div>

              {product.barcode && (
                <p className="mt-2 font-mono text-[10px] text-slate-400">
                  {product.barcode}
                </p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
