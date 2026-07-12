import { useState, useEffect, useCallback } from "react";
import { Product, OrderListItem } from "../types";
import { getProducts, getOrders } from "../services/api";
import {
  TrendingUp,
  ShoppingBag,
  AlertTriangle,
  PackageX,
  ArrowRight,
  Loader2,
  Store,
} from "lucide-react";

type View = "dashboard" | "cashier" | "inventory" | "orders";

interface Props {
  onNavigate: (view: View) => void;
}

export default function Dashboard({ onNavigate }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, o] = await Promise.all([getProducts(), getOrders()]);
      setProducts(p);
      setOrders(o);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const todayStr = new Date().toISOString().split("T")[0];
  const todayOrders = orders.filter((o) => o.order_date.startsWith(todayStr));
  const todayRevenue = todayOrders.reduce(
    (sum, o) => sum + Number(o.total_amount),
    0
  );
  const lowStockCount = products.filter(
    (p) => p.stock > 0 && p.stock <= p.low_stock_threshold
  ).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;
  const totalValue = products.reduce(
    (sum, p) => sum + Number(p.price) * p.stock,
    0
  );

  const cards = [
    {
      label: "Umsatz heute",
      value: `${todayRevenue.toFixed(2)} €`,
      icon: <TrendingUp className="h-6 w-6 text-emerald-600" />,
      bg: "bg-emerald-50",
      onClick: () => onNavigate("orders"),
    },
    {
      label: "Bestellungen heute",
      value: String(todayOrders.length),
      icon: <ShoppingBag className="h-6 w-6 text-indigo-600" />,
      bg: "bg-indigo-50",
      onClick: () => onNavigate("orders"),
    },
    {
      label: "Lagerwert",
      value: `${totalValue.toFixed(2)} €`,
      icon: <Store className="h-6 w-6 text-blue-600" />,
      bg: "bg-blue-50",
      onClick: () => onNavigate("inventory"),
    },
    {
      label: "Niedriger Bestand",
      value: String(lowStockCount),
      icon: <AlertTriangle className="h-6 w-6 text-amber-600" />,
      bg: "bg-amber-50",
      onClick: () => onNavigate("inventory"),
    },
    {
      label: "Ausverkauft",
      value: String(outOfStockCount),
      icon: <PackageX className="h-6 w-6 text-red-600" />,
      bg: "bg-red-50",
      onClick: () => onNavigate("inventory"),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500">Übersicht über Ihr Geschäft</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {cards.map((card) => (
            <button
              key={card.label}
              onClick={card.onClick}
              className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:shadow-md hover:-translate-y-0.5"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.bg}`}>
                {card.icon}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-500">{card.label}</p>
                <p className="text-xl font-bold text-slate-800">{card.value}</p>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-300" />
            </button>
          ))}
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="panel p-5">
            <h2 className="mb-4 text-lg font-bold text-slate-800">Schnellzugriff</h2>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => onNavigate("cashier")}
                className="btn-primary flex items-center justify-center gap-2"
              >
                <ShoppingBag className="h-5 w-5" />
                Kasse öffnen
              </button>
              <button
                onClick={() => onNavigate("inventory")}
                className="btn-secondary flex items-center justify-center gap-2"
              >
                <PackageX className="h-5 w-5" />
                Inventar verwalten
              </button>
            </div>
          </div>

          <div className="panel p-5">
            <h2 className="mb-4 text-lg font-bold text-slate-800">Letzte Bestellungen</h2>
            {orders.length === 0 ? (
              <p className="text-center text-sm text-slate-400 py-4">Noch keine Bestellungen.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {orders.slice(0, 5).map((order) => (
                  <li
                    key={order.id}
                    className="flex items-center justify-between py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Bestellung #{order.id}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(order.order_date).toLocaleString("de-DE", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-slate-800">
                      {Number(order.total_amount).toFixed(2)} €
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
