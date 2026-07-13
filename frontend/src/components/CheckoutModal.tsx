import { useState, useMemo } from "react";
import { CartItem, PaymentMethod } from "../types";
import { useI18n } from "../i18n/I18nContext";
import { X, Receipt, Banknote, CreditCard, Wallet, Percent, Tag } from "lucide-react";

interface Props {
  cart: CartItem[];
  isOpen: boolean;
  onClose: () => void;
  onCheckout: (paymentMethod: PaymentMethod, amountTendered: number, discountAmount: number) => void;
  isCheckingOut: boolean;
}

export default function CheckoutModal({ cart, isOpen, onClose, onCheckout, isCheckingOut }: Props) {
  const { t } = useI18n();
  const currency = t("currency");

  const paymentOptions: { key: PaymentMethod; label: string; icon: typeof Banknote }[] = [
    { key: "cash", label: t("cash"), icon: Banknote },
    { key: "card", label: t("card"), icon: CreditCard },
    { key: "other", label: t("other"), icon: Wallet },
  ];
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [discountPercent, setDiscountPercent] = useState<string>("0");
  const [amountTendered, setAmountTendered] = useState<string>("");

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0),
    [cart]
  );

  const discountAmount = useMemo(() => {
    const percent = Math.max(0, Math.min(100, Number(discountPercent) || 0));
    return (subtotal * percent) / 100;
  }, [subtotal, discountPercent]);

  const total = useMemo(() => Math.max(0, subtotal - discountAmount), [subtotal, discountAmount]);

  const change = useMemo(() => {
    if (paymentMethod !== "cash") return 0;
    const tendered = Number(amountTendered) || 0;
    return Math.max(0, tendered - total);
  }, [paymentMethod, amountTendered, total]);

  const isValid = useMemo(() => {
    if (paymentMethod === "cash") {
      return (Number(amountTendered) || 0) >= total;
    }
    return true;
  }, [paymentMethod, amountTendered, total]);

  const handleSubmit = () => {
    if (!isValid) return;
    onCheckout(paymentMethod, Number(amountTendered) || 0, discountAmount);
  };

  if (!isOpen) return null;

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
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
              <Receipt size={18} />
            </div>
            <h2 className="text-lg font-bold text-slate-900">{t("payment")}</h2>
          </div>
          <button onClick={onClose} className="btn-icon" aria-label={t("close")}>
            <X size={20} />
          </button>
        </div>

        <div className="mb-4 space-y-1 rounded-xl bg-slate-50 p-3 text-sm">
          {cart.map((item) => (
            <div key={item.id} className="flex justify-between text-slate-600">
                    <span>
                {item.quantity}x {item.name}
              </span>
              <span className="font-medium">{(Number(item.price) * item.quantity).toFixed(2)} {currency}</span>
            </div>
          ))}
        </div>

        <div className="mb-4">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            {t("payment")}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {paymentOptions.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setPaymentMethod(key)}
                className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-sm font-medium transition ${
                  paymentMethod === key
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon size={20} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {paymentMethod === "cash" && (
          <div className="mb-4">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              {t("received")}
            </label>

            {/* Amount display */}
            <div className="mb-3 rounded-xl bg-slate-100 py-3 text-center">
              <span className="text-3xl font-bold text-slate-900">
                {(Number(amountTendered) || 0).toFixed(2)} {currency}
              </span>
            </div>

            {/* Banknote buttons */}
            <div className="grid grid-cols-3 gap-2">
              {[5, 10, 20, 50, 100, 200].map((denom) => (
                <button
                  key={denom}
                  onClick={() => setAmountTendered(String(denom))}
                  className={`rounded-xl border-2 py-3 text-lg font-bold transition ${
                    Number(amountTendered) === denom
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {denom} {currency}
                </button>
              ))}
            </div>

            {/* Exact + Clear buttons */}
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                onClick={() => setAmountTendered(total.toFixed(2))}
                className="rounded-xl bg-indigo-600 py-2.5 text-sm font-bold text-white hover:bg-indigo-700"
              >
                {"Exakt"}
              </button>
              <button
                onClick={() => setAmountTendered("")}
                className="rounded-xl border-2 border-amber-300 bg-amber-50 py-2.5 text-sm font-bold text-amber-700 hover:bg-amber-100"
              >
                C
              </button>
            </div>

            {change > 0 && (
              <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-center text-lg font-bold text-emerald-700">
                {t("change")}: {change.toFixed(2)} {currency}
              </p>
            )}
            {!isValid && amountTendered !== "" && (
              <p className="mt-2 text-sm text-red-600">
                {t("receivedTooLow", { amount: total.toFixed(2), currency })}
              </p>
            )}
          </div>
        )}

        <div className="mb-4">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            {t("discount")}
          </label>
          <div className="relative">
            <Percent
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={100}
              value={discountPercent}
              onChange={(e) => setDiscountPercent(e.target.value)}
              className="input pl-10"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">%</span>
          </div>
          {discountAmount > 0 && (
            <p className="mt-2 flex items-center gap-1 text-sm text-emerald-600">
              <Tag size={14} />
              {t("savings")}: {discountAmount.toFixed(2)} {currency}
            </p>
          )}
        </div>

        <div className="mb-6 space-y-2 rounded-xl bg-slate-50 p-4 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>{t("subtotal")}</span>
            <span>{subtotal.toFixed(2)} {currency}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>{t("discount")}</span>
              <span>-{discountAmount.toFixed(2)} {currency}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold text-slate-900">
            <span>{t("toPay")}</span>
            <span>{total.toFixed(2)} {currency}</span>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!isValid || isCheckingOut}
          className="btn-primary w-full"
        >
          {isCheckingOut ? t("processing") : `${t("checkout")} (${total.toFixed(2)} ${currency})`}
        </button>
      </div>
    </div>
  );
}
