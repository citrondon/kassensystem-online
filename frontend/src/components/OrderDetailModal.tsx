import { useEffect, useState } from "react";
import { OrderDetail } from "../types";
import { getOrderById } from "../services/api";
import { X, Receipt, Loader2 } from "lucide-react";

interface Props {
  orderId: number;
  onClose: () => void;
}

export default function OrderDetailModal({ orderId, onClose }: Props) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getOrderById(orderId);
        setOrder(data);
      } catch {
        setError("Bestellung konnte nicht geladen werden.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [orderId]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-800">
              Bestellung #{orderId}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Schliessen"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading && (
          <div className="flex flex-col items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
            <p className="mt-2 text-sm text-slate-500">Lade Bestellung...</p>
          </div>
        )}

        {error && <p className="py-8 text-center text-red-600 font-medium">{error}</p>}

        {order && (
          <div>
            <p className="mb-4 text-sm font-medium text-slate-500">
              {formatDate(order.order_date)}
            </p>

            <table className="w-full text-sm">
              <thead className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-2 text-left">Artikel</th>
                  <th className="py-2 text-right">Menge</th>
                  <th className="py-2 text-right">Einzelpreis</th>
                  <th className="py-2 text-right">Summe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2 font-semibold text-slate-800">
                      {item.product_name}
                    </td>
                    <td className="py-2 text-right">{item.quantity}</td>
                    <td className="py-2 text-right">
                      {Number(item.unit_price).toFixed(2)} €
                    </td>
                    <td className="py-2 text-right font-bold text-slate-800">
                      {Number(item.line_total).toFixed(2)} €
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4 flex justify-between border-t border-slate-100 pt-3 text-lg font-extrabold text-slate-900">
              <span>Gesamt</span>
              <span>{Number(order.total_amount).toFixed(2)} €</span>
            </div>

            <button
              onClick={onClose}
              className="mt-4 w-full rounded-xl bg-slate-100 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-200"
            >
              Schliessen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
