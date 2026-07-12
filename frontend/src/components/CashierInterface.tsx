import { useState, useEffect, useCallback } from "react";
import { Product, CartItem, CheckoutResponse, Category, OrderDetail, PaymentMethod } from "../types";
import {
  getProducts,
  getCategories,
  checkout,
  getOrderById,
} from "../services/api";
import { getCategoryMeta } from "../utils/categoryStyles";
import ProductList from "./ProductList";
import Cart from "./Cart";
import Scanner from "./Scanner";
import CheckoutModal from "./CheckoutModal";
import ReceiptModal from "./ReceiptModal";
import { Search, X, ScanBarcode, ChevronDown, ChevronUp } from "lucide-react";

export default function CashierInterface() {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [receipt, setReceipt] = useState<OrderDetail | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      const data = await getProducts(searchTerm || undefined, activeCategory);
      setProducts(data);
    } catch {
      setNotification({ type: "error", message: "Produkte konnten nicht geladen werden." });
    }
  }, [searchTerm, activeCategory]);

  useEffect(() => {
    const timer = setTimeout(loadProducts, 200);
    return () => clearTimeout(timer);
  }, [loadProducts]);

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(null), 3000);
    return () => clearTimeout(timer);
  }, [notification]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      if (product.stock <= 0) return prev;
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const increment = (id: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id && item.quantity < item.stock
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decrement = (id: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleScan = (barcode: string) => {
    const product = products.find((p) => p.barcode === barcode);
    if (product) {
      if (product.stock <= 0) {
        setNotification({ type: "error", message: `'${product.name}' ist nicht auf Lager.` });
        return;
      }
      addToCart(product);
      setNotification({ type: "success", message: `'${product.name}' hinzugefuegt.` });
    } else {
      void getProducts(barcode).then((all) => {
        const found = all.find((p) => p.barcode === barcode);
        if (found) {
          if (found.stock <= 0) {
            setNotification({ type: "error", message: `'${found.name}' ist nicht auf Lager.` });
            return;
          }
          addToCart(found);
          setNotification({ type: "success", message: `'${found.name}' hinzugefuegt.` });
        } else {
          setNotification({
            type: "error",
            message: `Kein Produkt mit Barcode '${barcode}' gefunden.`,
          });
        }
      }).catch(() => {
        setNotification({ type: "error", message: "Produktsuche fehlgeschlagen." });
      });
    }
  };

  const handleStartCheckout = () => {
    if (cart.length === 0) return;
    setCheckoutModalOpen(true);
  };

  const handleCheckout = async (
    paymentMethod: PaymentMethod,
    amountTendered: number,
    discountAmount: number
  ) => {
    setCheckoutModalOpen(false);
    setIsCheckingOut(true);
    setNotification(null);
    try {
      const items = cart.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      }));
      const result: CheckoutResponse = await checkout(
        items,
        paymentMethod,
        amountTendered,
        discountAmount
      );
      if (result.success && result.orderId) {
        setNotification({ type: "success", message: result.message });
        setCart([]);
        loadProducts();
        try {
          const detail = await getOrderById(result.orderId);
          setReceipt(detail);
        } catch {
          // Receipt optional, don't block
        }
      } else {
        setNotification({
          type: "error",
          message: result.error || "Checkout fehlgeschlagen.",
        });
        loadProducts();
      }
    } catch {
      setNotification({ type: "error", message: "Netzwerkfehler beim Checkout." });
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Kasse</h1>
        {notification && (
          <div
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold shadow-sm ${
              notification.type === "success"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {notification.message}
            <button
              onClick={() => setNotification(null)}
              className="ml-1 rounded-md p-0.5 hover:bg-black/5"
              aria-label="Schliessen"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[260px_1fr_340px]">
        {/* Linke Spalte: Suche, Kategorien, Scanner */}
        <div className="space-y-4">
          <div className="panel p-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Produkt suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Kategorien
              </p>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => setActiveCategory(null)}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition"
                  style={
                    activeCategory === null
                      ? { background: "#EEF2FF", color: "#4F46E5" }
                      : undefined
                  }
                >
                  <span className="flex items-center gap-2">
                    <span>🏪</span> Alle
                  </span>
                  {activeCategory === null && (
                    <span className="h-2 w-2 rounded-full bg-indigo-600" />
                  )}
                </button>
                {categories.map((cat) => {
                  const meta = getCategoryMeta(cat.name);
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition"
                      style={
                        isActive
                          ? {
                              background: meta.bg,
                              color: meta.color,
                              border: `1px solid ${meta.border}`,
                            }
                          : undefined
                      }
                      title={`${meta.emoji} ${cat.name}`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{meta.emoji}</span>
                        <span style={!isActive ? { color: meta.color } : undefined}>
                          {cat.name}
                        </span>
                      </span>
                      {isActive && (
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ background: meta.color }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <button
                onClick={() => setScannerOpen((v) => !v)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                <span className="flex items-center gap-2">
                  <ScanBarcode className="h-5 w-5" />
                  Barcode scannen
                </span>
                {scannerOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              {scannerOpen && (
                <div className="mt-2">
                  <Scanner onScan={handleScan} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mittlere Spalte: Produkte */}
        <div>
          <ProductList products={products} onAdd={addToCart} />
        </div>

        {/* Rechte Spalte: Warenkorb */}
        <div className="xl:sticky xl:top-4 xl:self-start">
          <Cart
            cart={cart}
            onIncrement={increment}
            onDecrement={decrement}
            onRemove={removeItem}
            onCheckout={handleStartCheckout}
            isCheckingOut={isCheckingOut}
          />
        </div>
      </div>

      <CheckoutModal
        cart={cart}
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        onCheckout={handleCheckout}
        isCheckingOut={isCheckingOut}
      />

      {receipt && <ReceiptModal order={receipt} onClose={() => setReceipt(null)} />}
    </div>
  );
}
