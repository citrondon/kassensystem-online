import { useEffect, useState } from "react";
import { OrderDetail } from "../types";
import { getOrderById } from "../services/api";
import { X, Calendar, ShoppingBag, Receipt } from "lucide-react";

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
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
              <ShoppingBag size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Bestellung #{orderId}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="btn-icon"
            aria-label="Schliessen"
          >
            <X size={20} />
          </button>
        </div>

        {loading && <p className="py-8 text-center text-slate-500">Lade Bestellung...</p>}

        {error && <p className="py-8 text-center text-red-600">{error}</p>}

        {order && (
          <div>
            <p className="mb-4 flex items-center gap-2 text-sm text-slate-500">
              <Calendar size={16} />
              {formatDate(order.order_date)}
            </p>

            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-2 text-left">Artikel</th>
                  <th className="py-2 text-right">Menge</th>
                  <th className="py-2 text-right">Einzelpreis</th>
                  <th className="py-2 text-right">Summe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2 font-medium text-slate-900">
                      {item.product_name}
                    </td>
                    <td className="py-2 text-right">{item.quantity}</td>
                    <td className="py-2 text-right">
                      {Number(item.unit_price).toFixed(2)} €
                    </td>
                    <td className="py-2 text-right font-semibold">
                      {Number(item.line_total).toFixed(2)} €
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4 flex justify-between border-t border-slate-200 pt-3 text-lg font-bold">
              <span>Gesamt</span>
              <span>{Number(order.total_amount).toFixed(2)} €</span>
            </div>

            <div className="mt-5 flex gap-3">
              <button onClick={() => window.print()} className="btn-secondary flex-1">
                <Receipt size={18} /> Drucken
              </button>
              <button onClick={onClose} className="btn-primary flex-1">
                Schliessen
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
