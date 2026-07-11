import { LayoutDashboard, ShoppingCart, Package, ClipboardList } from "lucide-react";

export type View = "dashboard" | "cashier" | "inventory" | "orders";

interface Props {
  active: View;
  onNavigate: (view: View) => void;
}

export default function Sidebar({ active, onNavigate }: Props) {
  const items: { key: View; label: string; icon: typeof LayoutDashboard }[] = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "cashier", label: "Kasse", icon: ShoppingCart },
    { key: "inventory", label: "Inventar", icon: Package },
    { key: "orders", label: "Bestellungen", icon: ClipboardList },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-16 flex-col border-r border-slate-200 bg-white shadow-sm lg:w-64">
      <div className="flex h-16 items-center justify-center border-b border-slate-200 px-4 lg:justify-start lg:gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
          <ShoppingCart size={20} />
        </div>
        <span className="hidden text-lg font-bold text-slate-900 lg:block">POS</span>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {items.map((item) => {
          const isActive = active === item.key;
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition lg:px-4 ${
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
              title={item.label}
            >
              <Icon size={20} className={isActive ? "text-indigo-600" : "text-slate-500"} />
              <span className="hidden lg:block">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
