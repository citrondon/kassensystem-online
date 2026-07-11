import { useState } from "react";
import { CartItem } from "../types";
import ProductImage from "./ProductImage";
import { Trash2, Minus, Plus, ShoppingCart, Receipt, X } from "lucide-react";

interface Props {
  cart: CartItem[];
  onIncrement: (id: number) => void;
  onDecrement: (id: number) => void;
  onRemove: (id: number) => void;
  onQuantityChange?: (id: number, quantity: number) => void;
  onCheckout: () => void;
  isCheckingOut: boolean;
  onClose?: () => void;
}

export default function Cart({
  cart,
  onIncrement,
  onDecrement,
  onRemove,
  onQuantityChange,
  onCheckout,
  isCheckingOut,
  onClose,
}: Props) {
  const total = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const [editingQty, setEditingQty] = useState<Record<number, string>>({});

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div className="flex items-center gap-2">
          <ShoppingCart size={20} className="text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900">Warenkorb</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge-info">{itemCount} Artikel</span>
          {onClose && (
            <button
              onClick={onClose}
              className="btn-icon"
              aria-label="Warenkorb schliessen"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {cart.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100">
            <ShoppingCart size={32} className="text-slate-400" />
          </div>
          <p className="font-semibold text-slate-700">Warenkorb ist leer</p>
          <p className="mt-1 text-sm text-slate-500">Tippe auf ein Produkt, um es hinzuzufügen.</p>
        </div>
      ) : (
        <ul className="scrollbar-thin flex-1 divide-y divide-slate-100 overflow-y-auto px-2">
          {cart.map((item) => (
            <li key={item.id} className="flex items-center gap-3 px-3 py-3">
              <ProductImage product={item} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-slate-900">{item.name}</p>
                <p className="text-sm text-slate-500">
                  {Number(item.price).toFixed(2)} € x {item.quantity} ={" "}
                  <span className="font-semibold text-slate-900">
                    {(Number(item.price) * item.quantity).toFixed(2)} €
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onDecrement(item.id)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700 transition hover:bg-slate-200"
                  aria-label="Menge verringern"
                >
                  <Minus size={16} />
                </button>
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={item.stock}
                  value={editingQty[item.id] ?? item.quantity}
                  onChange={(e) =>
                    setEditingQty((prev) => ({ ...prev, [item.id]: e.target.value }))
                  }
                  onBlur={(e) => {
                    let qty = parseInt(e.target.value, 10);
                    if (Number.isNaN(qty) || qty <= 0) {
                      onRemove(item.id);
                    } else {
                      qty = Math.min(qty, item.stock);
                      onQuantityChange?.(item.id, qty);
                    }
                    setEditingQty((prev) => {
                      const next = { ...prev };
                      delete next[item.id];
                      return next;
                    });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      (e.target as HTMLInputElement).blur();
                    }
                  }}
                  className="h-9 w-12 rounded-lg border border-slate-300 py-1 text-center text-sm font-semibold focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  aria-label="Menge"
                />
                <button
                  onClick={() => onIncrement(item.id)}
                  disabled={item.quantity >= item.stock}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700 transition hover:bg-slate-200 disabled:opacity-40"
                  aria-label="Menge erhöhen"
                >
                  <Plus size={16} />
                </button>
                <button
                  onClick={() => onRemove(item.id)}
                  className="ml-1 flex h-9 w-9 items-center justify-center rounded-lg text-red-400 transition hover:bg-red-50 hover:text-red-600"
                  aria-label="Entfernen"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="border-t border-slate-200 p-4">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-slate-600">Zwischensumme</span>
          <span className="font-semibold text-slate-900">{total.toFixed(2)} €</span>
        </div>
        <div className="mb-4 flex items-center justify-between text-lg font-bold">
          <span>Gesamt</span>
          <span className="text-indigo-700">{total.toFixed(2)} €</span>
        </div>
        <button
          onClick={onCheckout}
          disabled={cart.length === 0 || isCheckingOut}
          className="btn-primary w-full"
        >
          <Receipt size={18} />
          {isCheckingOut ? "Verarbeite..." : "Kauf abschliessen"}
        </button>
      </div>
    </div>
  );
}
