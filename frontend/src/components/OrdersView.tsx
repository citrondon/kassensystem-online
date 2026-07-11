import { useState, useEffect, useCallback } from "react";
import { OrderListItem } from "../types";
import { getOrders } from "../services/api";
import OrderDetailModal from "./OrderDetailModal";
import { RefreshCw, ClipboardList, Eye, Calendar, ShoppingBag } from "lucide-react";

export default function OrdersView() {
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOrders();
      setOrders(data);
    } catch {
      setError("Bestellungen konnten nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 animate-spin items-center justify-center rounded-full border-2 border-indigo-200 border-t-indigo-600"></div>
        <p className="text-slate-500">Lade Bestellungen...</p>
      </div>
    );
  }

  if (error) {
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
          <h1 className="text-2xl font-bold text-slate-900">Bestellungen</h1>
          <p className="text-slate-500">Verkaufsverlauf und Details einsehen.</p>
        </div>
        <button onClick={load} className="btn-secondary">
          <RefreshCw size={18} /> Aktualisieren
        </button>
      </div>

      <div className="card">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-16 text-center text-slate-400">
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <ClipboardList size={28} className="text-slate-400" />
            </div>
            <p className="font-medium">Noch keine Bestellungen.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="table-header">
                <tr>
                  <th className="px-4 py-3">Bestellung</th>
                  <th className="px-4 py-3">Datum</th>
                  <th className="px-4 py-3 text-right">Artikel</th>
                  <th className="px-4 py-3 text-right">Gesamt</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr key={order.id} className="transition hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                          <ShoppingBag size={16} />
                        </div>
                        <span className="font-semibold text-slate-900">#{order.id}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar size={16} className="text-slate-400" />
                        {formatDate(order.order_date)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="badge-info">{order.item_count}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900">
                      {Number(order.total_amount).toFixed(2)} €
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedId(order.id)}
                        className="btn-icon text-indigo-500 hover:bg-indigo-50 hover:text-indigo-700"
                        title="Details"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedId !== null && (
        <OrderDetailModal orderId={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </div>
  );
}
