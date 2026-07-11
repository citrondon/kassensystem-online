import { OrderDetail } from "../types";
import { X, Printer, Receipt, Banknote, CreditCard, Wallet } from "lucide-react";

interface Props {
  order: OrderDetail;
  onClose: () => void;
}

const paymentLabels: Record<string, string> = {
  cash: "Barzahlung",
  card: "Kartenzahlung",
  other: "Sonstige Zahlung",
};

const paymentIcons: Record<string, typeof Banknote> = {
  cash: Banknote,
  card: CreditCard,
  other: Wallet,
};

export default function ReceiptModal({ order, onClose }: Props) {
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

  const subtotal = order.items.reduce((sum, item) => sum + Number(item.line_total), 0);
  const discount = Number(order.discount_amount) || 0;
  const total = Number(order.total_amount);
  const tendered = Number(order.amount_tendered) || 0;
  const change = Number(order.change_amount) || 0;
  const PaymentIcon = paymentIcons[order.payment_method] || Banknote;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 print-overlay"
      onClick={onClose}
    >
      <div
        className="receipt-sheet w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between print-hide">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
              <Receipt size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold leading-tight text-slate-900">POS System</h2>
              <p className="text-xs text-slate-500">Kassenbeleg</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon" aria-label="Schliessen">
            <X size={20} />
          </button>
        </div>

        <div className="mb-4 text-center">
          <h3 className="text-xl font-bold text-slate-900">Kassenbeleg</h3>
          <p className="text-xs text-slate-500">POS System</p>
        </div>

        <div className="mb-3 flex justify-between text-xs text-slate-500">
          <span>Bestellung #{order.id}</span>
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
                  <td className="py-1 text-right font-semibold text-slate-900">
                    {Number(item.line_total).toFixed(2)} €
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-dashed border-slate-300 py-3 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Zwischensumme</span>
            <span>{subtotal.toFixed(2)} €</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Rabatt</span>
              <span>-{discount.toFixed(2)} €</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold">
            <span>Gesamt</span>
            <span>{total.toFixed(2)} €</span>
          </div>
        </div>

        <div className="border-t border-dashed border-slate-300 py-3 text-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <PaymentIcon size={18} />
            <span>{paymentLabels[order.payment_method] || order.payment_method}</span>
          </div>
          {order.payment_method === "cash" && (
            <>
              <div className="flex justify-between text-slate-600">
                <span>Erhalten</span>
                <span>{tendered.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between font-semibold text-emerald-600">
                <span>Rückgeld</span>
                <span>{change.toFixed(2)} €</span>
              </div>
            </>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          Vielen Dank fuer Ihren Einkauf!
        </p>

        <div className="mt-5 flex gap-3 print-hide">
          <button onClick={() => window.print()} className="btn-secondary flex-1">
            <Printer size={18} /> Drucken
          </button>
          <button onClick={onClose} className="btn-primary flex-1">
            Schliessen
          </button>
        </div>
      </div>
    </div>
  );
}
