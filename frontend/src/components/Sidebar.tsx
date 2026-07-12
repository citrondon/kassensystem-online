import { LayoutDashboard, ShoppingCart, Package, ClipboardList, Store } from "lucide-react";

type View = "dashboard" | "cashier" | "inventory" | "orders";

interface Props {
  active: View;
  onChange: (view: View) => void;
}

const items: { key: View; label: string; icon: React.ReactNode }[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    key: "cashier",
    label: "Kasse",
    icon: <ShoppingCart className="h-5 w-5" />,
  },
  {
    key: "inventory",
    label: "Inventar",
    icon: <Package className="h-5 w-5" />,
  },
  {
    key: "orders",
    label: "Bestellungen",
    icon: <ClipboardList className="h-5 w-5" />,
  },
];

export default function Sidebar({ active, onChange }: Props) {
  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-16 flex-col items-center border-r border-slate-200 bg-white py-4 shadow-sm lg:w-64 lg:items-stretch lg:px-4">
      <div className="mb-8 flex items-center justify-center lg:justify-start lg:gap-3 lg:px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
          <Store className="h-6 w-6" />
        </div>
        <span className="hidden text-lg font-bold text-slate-800 lg:block">POS System</span>
      </div>

      <nav className="flex flex-1 flex-col gap-2">
        {items.map((item) => {
          const isActive = active === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onChange(item.key)}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
              title={item.label}
            >
              <span className={isActive ? "text-indigo-600" : "text-slate-400"}>
                {item.icon}
              </span>
              <span className="hidden lg:block">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
