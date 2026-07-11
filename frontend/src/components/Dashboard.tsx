import { useEffect, useState, useCallback } from "react";
import { Euro, ShoppingBag, AlertTriangle, PackageX, ArrowRight } from "lucide-react";
import { Product, OrderListItem } from "../types";
import { getProducts, getOrders } from "../services/api";
import { View } from "./Sidebar";

interface Props {
  onNavigate: (view: View) => void;
}

interface KpiCardProps {
  label: string;
  value: string;
  subtext?: string;
  icon: typeof Euro;
  iconColor: string;
  accent: string;
  onClick?: () => void;
}

function KpiCard({ label, value, subtext, icon: Icon, iconColor, accent, onClick }: KpiCardProps) {
  return (
    <button
      onClick={onClick}
      className={`card-elevated flex w-full items-start gap-4 text-left ${onClick ? "cursor-pointer" : "cursor-default"}`}
    >
      <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${iconColor}`}>
        <Icon size={24} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className={`mt-1 text-2xl font-bold ${accent}`}>{value}</p>
        {subtext && <p className="mt-0.5 text-xs text-slate-500">{subtext}</p>}
      </div>
      {onClick && <ArrowRight size={18} className="mt-1 text-slate-400" />}
    </button>
  );
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function Dashboard({ onNavigate }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const errors: string[] = [];
    try {
      const productData = await getProducts();
      setProducts(productData);
    } catch {
      errors.push("Produkte konnten nicht geladen werden.");
    }
    try {
      const orderData = await getOrders();
      setOrders(orderData);
    } catch {
      errors.push("Bestellungen konnten nicht geladen werden.");
    }
    if (errors.length > 0) {
      setError(errors.join(" | "));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const today = new Date();
  const todaysOrders = orders.filter((o) => isSameDay(new Date(o.order_date), today));
  const revenueToday = todaysOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);

  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= p.low_stock_threshold);
  const outOfStock = products.filter((p) => p.stock === 0);

  if (loading) {
    return (
      <div className="py-16 text-center">
        <p className="text-slate-500">Lade Dashboard...</p>
      </div>
    );
  }

  if (error && products.length === 0 && orders.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-red-600">{error}</p>
        <button onClick={load} className="btn-primary mt-4">
          Erneut versuchen
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500">Überblick über Kasse, Inventar und Bestellungen.</p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Umsatz heute"
          value={`${revenueToday.toFixed(2)} €`}
          subtext={`${todaysOrders.length} Bestellung${todaysOrders.length === 1 ? "" : "en"}`}
          icon={Euro}
          iconColor="bg-emerald-100 text-emerald-600"
          accent="text-slate-900"
          onClick={() => onNavigate("orders")}
        />
        <KpiCard
          label="Bestellungen heute"
          value={String(todaysOrders.length)}
          subtext={new Date().toLocaleDateString("de-DE")}
          icon={ShoppingBag}
          iconColor="bg-indigo-100 text-indigo-600"
          accent="text-slate-900"
          onClick={() => onNavigate("orders")}
        />
        <KpiCard
          label="Niedriger Bestand"
          value={String(lowStock.length)}
          subtext={lowStock.length > 0 ? "Auffüllung prüfen" : "Alle Produkte ausreichend"}
          icon={AlertTriangle}
          iconColor="bg-amber-100 text-amber-600"
          accent={lowStock.length > 0 ? "text-amber-600" : "text-slate-900"}
          onClick={() => onNavigate("inventory")}
        />
        <KpiCard
          label="Ausverkauft"
          value={String(outOfStock.length)}
          subtext={outOfStock.length > 0 ? "Nicht verkäuflich" : "Alles verfügbar"}
          icon={PackageX}
          iconColor="bg-red-100 text-red-600"
          accent={outOfStock.length > 0 ? "text-red-600" : "text-slate-900"}
          onClick={() => onNavigate("inventory")}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card-elevated">
          <h2 className="text-lg font-semibold text-slate-900">Schnellzugriff</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button onClick={() => onNavigate("cashier")} className="btn-primary">
              <ShoppingBag size={18} /> Kasse öffnen
            </button>
            <button onClick={() => onNavigate("inventory")} className="btn-secondary">
              <AlertTriangle size={18} /> Inventar prüfen
            </button>
          </div>
        </div>

        <div className="card-elevated">
          <h2 className="text-lg font-semibold text-slate-900">Gesamtbestellungen</h2>
          <p className="mt-1 text-3xl font-bold text-slate-900">{orders.length}</p>
          <p className="text-sm text-slate-500">Alle Bestellungen im System</p>
        </div>
      </div>
    </div>
  );
}
