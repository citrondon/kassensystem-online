import { LayoutDashboard, ShoppingCart, Package, ClipboardList } from "lucide-react";

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
    label: "Verkäufe",
    icon: <ClipboardList className="h-5 w-5" />,
  },
];

/**
 * Mobile Bottom-Navigation – inspiriert vom "BazarStock"-Projekt eines Freundes.
 * Ergänzt die Desktop-Sidebar auf kleinen Screens mit einer klassischen
 * Touch-optimierten Bottom-Bar (max-width 480px-Style, aber mit unserem Design-System).
 */
export default function MobileNav({ active, onChange }: Props) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white lg:hidden">
      <div className="mx-auto flex max-w-md">
        {items.map((item) => {
          const isActive = active === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onChange(item.key)}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition ${
                isActive
                  ? "text-indigo-700"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <span className={isActive ? "text-indigo-600" : ""}>
                {item.icon}
              </span>
              {item.label}
              {isActive && (
                <span className="absolute bottom-1 h-1 w-8 rounded-full bg-indigo-600" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
