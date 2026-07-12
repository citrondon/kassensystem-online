import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import MobileNav from "./components/MobileNav";
import Dashboard from "./components/Dashboard";
import CashierInterface from "./components/CashierInterface";
import InventoryOverview from "./components/InventoryOverview";
import OrdersView from "./components/OrdersView";

type View = "dashboard" | "cashier" | "inventory" | "orders";

export default function App() {
  const [view, setView] = useState<View>("dashboard");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [view]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar active={view} onChange={setView} />
      <div className="ml-16 p-4 pb-24 lg:ml-64 lg:p-6 lg:pb-6">
        <main className="mx-auto max-w-7xl">
          {view === "dashboard" && <Dashboard onNavigate={setView} />}
          {view === "cashier" && <CashierInterface />}
          {view === "inventory" && <InventoryOverview />}
          {view === "orders" && <OrdersView />}
        </main>
      </div>
      <MobileNav active={view} onChange={setView} />
    </div>
  );
}
