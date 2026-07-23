import { OrderDetail } from "../types";
import { useI18n } from "../i18n/I18nContext";
import { X, Receipt, Printer } from "lucide-react";

interface Props {
  order: OrderDetail;
  onClose: () => void;
}

export default function ReceiptModal({ order, onClose }: Props) {
  const { t, lang } = useI18n();
  const currency = t("currency");
  const fmt = (n: number) => Math.round(n).toLocaleString("de-DE");
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="h-6 w-6 text-indigo-600" />
            <div>
              <h2 className="text-lg font-bold text-slate-800">{t("posSystem")}</h2>
              <p className="text-xs text-slate-400">{t("receipt")}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-3 flex justify-between text-xs font-medium text-slate-500">
          <span>{t("order")} #{order.id}</span>
          <span>{formatDate(order.order_date)}</span>
        </div>

        <div className="border-t border-dashed border-slate-300 py-3">
          <table className="w-full text-sm">
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="align-top">
                  <td className="py-1 text-slate-600">
                    {item.quantity}x {item.product_name}
                  </td>
                  <td className="py-1 text-right font-semibold text-slate-800">
                    {fmt(Number(item.line_total))} {currency}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-dashed border-slate-300 pt-3">
          <div className="flex justify-between text-lg font-extrabold text-slate-900">
            <span>{t("total")}</span>
            <span>{fmt(Number(order.total_amount))} {currency}</span>
          </div>
        </div>

        <p className="mt-4 text-center text-xs font-medium text-slate-400">
          {t("thankYou")}
        </p>

        <button
          onClick={() => window.print()}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          <Printer className="h-4 w-4" />
          {t("print")}
        </button>

        <button
          onClick={onClose}
          className="mt-2 w-full rounded-xl bg-indigo-600 py-2.5 font-semibold text-white transition hover:bg-indigo-700"
        >
          {t("close")}
        </button>
      </div>
    </div>
  );
}
