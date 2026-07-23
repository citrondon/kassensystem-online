import { useState, useEffect, useRef } from "react";
import { Product, Category, ProductFormData } from "../types";
import { createProduct, updateProduct, uploadProductImage } from "../services/api";
import { useI18n } from "../i18n/I18nContext";
import { getCategoryLabel } from "../utils/categoryStyles";
import { X, ImagePlus, Save, Loader2 } from "lucide-react";

interface Props {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}

export default function ProductFormModal({ product, categories, onClose, onSaved }: Props) {
  const { t, lang } = useI18n();
  const currency = t("currency");
  const isEdit = !!product;
  const [name, setName] = useState(product?.name ?? "");
  const [barcode, setBarcode] = useState(product?.barcode ?? "");
  const [price, setPrice] = useState(product ? Number(product.price) : 0);
  const [costPrice, setCostPrice] = useState(product ? Number(product.cost_price) : 0);
  const [stock, setStock] = useState(product?.stock ?? 0);
  const [categoryId, setCategoryId] = useState<number | null>(product?.category_id ?? null);
  const [lowStockThreshold, setLowStockThreshold] = useState(
    product?.low_stock_threshold ?? 10
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(product?.image_url ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    setName(product?.name ?? "");
    setBarcode(product?.barcode ?? "");
    setPrice(product ? Number(product.price) : 0);
    setCostPrice(product ? Number(product.cost_price) : 0);
    setStock(product?.stock ?? 0);
    setCategoryId(product?.category_id ?? null);
    setLowStockThreshold(product?.low_stock_threshold ?? 10);
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    setImagePreview(product?.image_url ?? null);
    setImageFile(null);
    setError(null);
    setWarning(null);
  }, [product]);

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
      const url = URL.createObjectURL(file);
      blobUrlRef.current = url;
      setImagePreview(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setWarning(null);

    const formData: ProductFormData = {
      name: name.trim(),
      barcode: barcode.trim(),
      price,
      costPrice,
      stock,
      categoryId,
      lowStockThreshold,
    };

    try {
      let productId: number;
      if (isEdit && product) {
        await updateProduct(product.id, formData, product.image_url);
        productId = product.id;
      } else {
        const created = await createProduct(formData);
        productId = created.id;
      }

      if (imageFile) {
        try {
          await uploadProductImage(productId, imageFile);
        } catch {
          setWarning(t("savedWithImageWarning"));
          onSaved();
          return;
        }
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("saveError"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">
            {isEdit ? t("editProduct") : t("newProduct")}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label={t("close")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 border border-red-200">
            {error}
          </div>
        )}

        {warning && (
          <div className="mb-4 rounded-xl bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-700 border border-amber-200">
            {warning}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">{t("product")} *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">{t("barcode")}</label>
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="input"
              />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  {t("price")} ({currency}) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="input"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  {t("costPrice")} ({currency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={costPrice}
                  onChange={(e) => setCostPrice(Number(e.target.value))}
                  className="input"
                />
              </div>
            </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                {t("stock")}
              </label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="input"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                {t("lowStockThreshold")}
              </label>
              <input
                type="number"
                min="0"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">{t("category")}</label>
            <select
              value={categoryId ?? ""}
              onChange={(e) =>
                setCategoryId(e.target.value ? Number(e.target.value) : null)
              }
              className="input"
            >
              <option value="">{t("categoryNone")}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {getCategoryLabel(cat.name, lang)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              {t("image")}
            </label>
            <div className="flex items-center gap-4">
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt={t("image")}
                  className="h-20 w-20 rounded-xl object-cover border border-slate-200"
                />
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <ImagePlus className="h-4 w-4" />
                {t("chooseImage")}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex flex-1 items-center justify-center gap-2"
            >
              {saving ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Save className="h-5 w-5" />
              )}
              {saving ? t("processing") : isEdit ? t("save") : t("create")}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              {t("cancel")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
