import { useState } from "react";
import Sidebar, { View } from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import CashierInterface from "./components/CashierInterface";
import InventoryOverview from "./components/InventoryOverview";
import OrdersView from "./components/OrdersView";

export default function App() {
  const [view, setView] = useState<View>("cashier");
  const [kioskMode, setKioskMode] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      {!kioskMode && <Sidebar active={view} onNavigate={setView} />}

      <main
        className={`min-h-screen p-4 lg:p-6 ${
          kioskMode ? "" : "ml-16 lg:ml-64"
        }`}
      >
        <div className="mx-auto max-w-7xl">
          {view === "dashboard" && <Dashboard onNavigate={setView} />}
          {view === "cashier" && (
            <CashierInterface
              kioskMode={kioskMode}
              onToggleKiosk={() => setKioskMode((v) => !v)}
            />
          )}
          {view === "inventory" && <InventoryOverview />}
          {view === "orders" && <OrdersView />}
        </div>
      </main>
    </div>
  );
}
