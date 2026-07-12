import { useState, useEffect, useCallback } from "react";
import { OrderListItem } from "../types";
import { getOrders } from "../services/api";
import { useI18n } from "../i18n/I18nContext";
import OrderDetailModal from "./OrderDetailModal";
import { RefreshCw, Eye, ClipboardList, Loader2 } from "lucide-react";

export default function OrdersView() {
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { t, lang } = useI18n();
  const currency = t("currency");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOrders();
      setOrders(data);
    } catch {
      setError(t("errorLoading"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString(lang === "fr" ? "fr-FR" : "de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="mb-3 h-10 w-10 animate-spin text-slate-300" />
        <p className="text-sm font-medium text-slate-400">{t("loadingOrders")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-red-600 font-medium">{error}</p>
        <button
          onClick={load}
          className="mt-3 btn-primary"
        >
          {t("retry")}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">{t("orders")}</h1>
        <button
          onClick={load}
          className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          <RefreshCw className="h-4 w-4" />
          {t("refresh")}
        </button>
      </div>

      <div className="panel">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <ClipboardList className="mb-3 h-10 w-10 text-slate-200" />
            <p className="text-sm font-medium text-slate-400">{t("noOrdersYet")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3">{t("order")}</th>
                  <th className="px-5 py-3">{t("date")}</th>
                  <th className="px-5 py-3 text-right">{t("quantity")}</th>
                  <th className="px-5 py-3 text-right">{t("total")}</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {orders.map((order) => (
                  <tr key={order.id} className="transition hover:bg-slate-50/50">
                    <td className="px-5 py-3 font-semibold text-slate-800">#{order.id}</td>
                    <td className="px-5 py-3 text-slate-600">
                      {formatDate(order.order_date)}
                    </td>
                    <td className="px-5 py-3 text-right text-slate-600">
                      {order.item_count}
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-slate-800">
                      {Number(order.total_amount).toFixed(2)} {currency}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => setSelectedId(order.id)}
                        className="flex items-center gap-1 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        {t("details")}
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
