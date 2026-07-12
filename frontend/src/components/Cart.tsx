import { CartItem } from "../types";
import ProductImage from "./ProductImage";
import { Minus, Plus, Trash2, ShoppingCart, Loader2 } from "lucide-react";

interface Props {
  cart: CartItem[];
  onIncrement: (id: number) => void;
  onDecrement: (id: number) => void;
  onRemove: (id: number) => void;
  onCheckout: () => void;
  isCheckingOut: boolean;
}

export default function Cart({
  cart,
  onIncrement,
  onDecrement,
  onRemove,
  onCheckout,
  isCheckingOut,
}: Props) {
  const total = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex h-full max-h-[calc(100vh-6rem)] flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
        <ShoppingCart className="h-5 w-5 text-slate-400" />
        <h2 className="text-base font-bold text-slate-800">Warenkorb</h2>
        {itemCount > 0 && (
          <span className="ml-auto rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-700">
            {itemCount}
          </span>
        )}
      </div>

      {cart.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center py-10">
          <ShoppingCart className="mb-3 h-10 w-10 text-slate-200" />
          <p className="text-sm font-medium text-slate-400">Warenkorb ist leer</p>
          <p className="mt-1 text-xs text-slate-300">Tippen Sie auf ein Produkt, um es hinzuzufügen.</p>
        </div>
      ) : (
        <ul className="flex-1 divide-y divide-slate-50 overflow-y-auto px-2">
          {cart.map((item) => (
            <li key={item.id} className="flex items-center gap-3 py-3 px-2">
              <ProductImage product={item} size="md" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{item.name}</p>
                <p className="text-xs text-slate-500">
                  {Number(item.price).toFixed(2)} € / Stk.
                </p>
                <p className="text-sm font-bold text-slate-800">
                  {(Number(item.price) * item.quantity).toFixed(2)} €
                </p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onDecrement(item.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-700 transition hover:bg-slate-200"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                  <button
                    onClick={() => onIncrement(item.id)}
                    disabled={item.quantity >= item.stock}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-700 transition hover:bg-slate-200 disabled:opacity-40"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <button
                  onClick={() => onRemove(item.id)}
                  className="flex items-center gap-1 text-xs font-medium text-red-500 transition hover:text-red-700"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Entfernen
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="border-t border-slate-100 px-4 py-4">
        <div className="mb-3 flex items-end justify-between">
          <span className="text-sm font-medium text-slate-500">Gesamtsumme</span>
          <span className="text-2xl font-extrabold text-slate-900">{total.toFixed(2)} €</span>
        </div>
        <button
          onClick={onCheckout}
          disabled={cart.length === 0 || isCheckingOut}
          className="btn-success flex w-full items-center justify-center gap-2"
        >
          {isCheckingOut ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Verarbeite...
            </>
          ) : (
            <>
              <ShoppingCart className="h-5 w-5" />
              Kauf abschliessen
            </>
          )}
        </button>
      </div>
    </div>
  );
}
