import { useState, useEffect, useCallback } from "react";
import { Search, ScanBarcode, X, ShoppingCart, Star, Maximize, Minimize, History } from "lucide-react";
import { Product, CartItem, CheckoutResponse, Category, OrderDetail, OrderListItem, PaymentMethod } from "../types";
import { getProducts, getCategories, checkout, getOrderById, getOrders } from "../services/api";
import ProductList from "./ProductList";
import Cart from "./Cart";
import Scanner from "./Scanner";
import ReceiptModal from "./ReceiptModal";
import CheckoutModal from "./CheckoutModal";
import Toast, { Toast as ToastType } from "./Toast";

interface CashierProps {
  kioskMode?: boolean;
  onToggleKiosk?: () => void;
}

export default function CashierInterface({ kioskMode = false, onToggleKiosk }: CashierProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [toast, setToast] = useState<ToastType | null>(null);
  const [receipt, setReceipt] = useState<OrderDetail | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [recentOrders, setRecentOrders] = useState<OrderListItem[]>([]);
  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem("pos:favorites");
      return saved ? (JSON.parse(saved) as number[]) : [];
    } catch {
      return [];
    }
  });
  const [showFavorites, setShowFavorites] = useState(false);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setToast({ type: "error", message: "Kategorien konnten nicht geladen werden." }));

    getOrders()
      .then((orders) => setRecentOrders(orders.slice(0, 5)))
      .catch(() => {
        // Recent orders optional, don't block
      });
  }, []);

  useEffect(() => {
    localStorage.setItem("pos:favorites", JSON.stringify(favorites));
  }, [favorites]);

  const loadProducts = useCallback(async () => {
    try {
      const data = await getProducts(
        searchTerm || undefined,
        showFavorites ? null : activeCategory
      );
      const filtered = showFavorites ? data.filter((p) => favorites.includes(p.id)) : data;
      setProducts(filtered);
    } catch {
      setToast({ type: "error", message: "Produkte konnten nicht geladen werden." });
    }
  }, [searchTerm, activeCategory, showFavorites, favorites]);

  useEffect(() => {
    const timer = setTimeout(loadProducts, 200);
    return () => clearTimeout(timer);
  }, [loadProducts]);

  useEffect(() => {
    if (!cartOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCartOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [cartOpen]);

  const addToCart = (product: Product, quantity: number = 1) => {
    const qty = Math.max(1, Math.min(quantity, product.stock));
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        const newQty = Math.min(existing.quantity + qty, product.stock);
        if (newQty === existing.quantity) return prev;
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: newQty } : item
        );
      }
      if (product.stock <= 0) return prev;
      return [...prev, { ...product, quantity: qty }];
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

  const setQuantity = (id: number, quantity: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.min(quantity, item.stock) } : item
      )
    );
  };

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  const handleToggleKiosk = () => {
    if (!kioskMode) {
      void document.documentElement.requestFullscreen().catch(() => {
        // Fullscreen request may fail; ignore and continue with CSS-only kiosk mode
      });
    } else if (document.fullscreenElement) {
      void document.exitFullscreen();
    }
    onToggleKiosk?.();
  };

  const repeatOrder = async (orderId: number) => {
    try {
      const detail = await getOrderById(orderId);
      const allProducts = await getProducts();
      let added = 0;
      for (const item of detail.items) {
        const product = allProducts.find((p) => p.id === item.product_id);
        if (!product || product.stock <= 0) continue;
        addToCart(product, Math.min(item.quantity, product.stock));
        added++;
      }
      if (added > 0) {
        setToast({
          type: "success",
          message: `${added} Artikel aus Bestellung #${orderId} hinzugefuegt.`,
        });
        setCartOpen(true);
      } else {
        setToast({ type: "error", message: "Keine Artikel konnten wiederholt werden." });
      }
    } catch {
      setToast({ type: "error", message: "Bestellung konnte nicht geladen werden." });
    }
  };

  const handleScan = (barcode: string) => {
    const product = products.find((p) => p.barcode === barcode);
    if (product) {
      if (product.stock <= 0) {
        setToast({ type: "error", message: `'${product.name}' ist nicht auf Lager.` });
        return;
      }
      addToCart(product);
      setToast({ type: "success", message: `'${product.name}' hinzugefuegt.` });
    } else {
      void getProducts(barcode).then((all) => {
        const found = all.find((p) => p.barcode === barcode);
        if (found) {
          if (found.stock <= 0) {
            setToast({ type: "error", message: `'${found.name}' ist nicht auf Lager.` });
            return;
          }
          addToCart(found);
          setToast({ type: "success", message: `'${found.name}' hinzugefuegt.` });
        } else {
          setToast({
            type: "error",
            message: `Kein Produkt mit Barcode '${barcode}' gefunden.`,
          });
        }
      }).catch(() => {
        setToast({ type: "error", message: "Produktsuche fehlgeschlagen." });
      });
    }
  };

  const handleCheckout = async (
    paymentMethod: PaymentMethod,
    amountTendered: number,
    discountAmount: number
  ) => {
    setIsCheckingOut(true);
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
        let message = result.message;
        if (paymentMethod === "cash" && result.changeAmount && result.changeAmount > 0) {
          message += ` Rückgeld: ${result.changeAmount.toFixed(2)} €.`;
        }
        setToast({ type: "success", message });
        setCart([]);
        setCartOpen(false);
        setCheckoutOpen(false);
        loadProducts();
        getOrders().then((orders) => setRecentOrders(orders.slice(0, 5))).catch(() => {});
        try {
          const detail = await getOrderById(result.orderId);
          setReceipt(detail);
        } catch {
          // Receipt optional, don't block
        }
      } else {
        setToast({
          type: "error",
          message: result.error || "Checkout fehlgeschlagen.",
        });
        loadProducts();
      }
    } catch {
      setToast({ type: "error", message: "Netzwerkfehler beim Checkout." });
    } finally {
      setIsCheckingOut(false);
    }
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

  return (
    <div className="relative flex h-[calc(100vh-2rem)] gap-4 lg:h-[calc(100vh-3rem)]">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {!kioskMode && (
        <div className="flex w-56 flex-shrink-0 flex-col gap-4">
          {/* search + categories + scanner */}
        <div className="card flex flex-col gap-3 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label="Suche leeren"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <button
            onClick={() => setScannerOpen((v) => !v)}
            className={`btn-secondary ${scannerOpen ? "bg-indigo-100 text-indigo-700" : ""}`}
          >
            <ScanBarcode size={18} />
            {scannerOpen ? "Scanner ausblenden" : "Barcode scannen"}
          </button>
        </div>

        <div className="card flex flex-1 flex-col overflow-hidden">
          <h2 className="border-b border-slate-200 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Kategorien
          </h2>
          <div className="scrollbar-thin flex-1 overflow-y-auto p-2">
            <div className="space-y-1">
              <button
                onClick={() => {
                  setActiveCategory(null);
                  setShowFavorites(true);
                }}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
                  showFavorites
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Star size={16} className={showFavorites ? "fill-amber-400 text-amber-400" : "text-slate-400"} />
                Favoriten
              </button>
              <button
                onClick={() => {
                  setActiveCategory(null);
                  setShowFavorites(false);
                }}
                className={`flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
                  activeCategory === null && !showFavorites
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                Alle Produkte
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setShowFavorites(false);
                  }}
                  className={`flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
                    activeCategory === cat.id && !showFavorites
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {scannerOpen && (
          <div className="card p-3">
            <Scanner onScan={handleScan} onClose={() => setScannerOpen(false)} />
          </div>
        )}

        {recentOrders.length > 0 && (
          <div className="card flex flex-col overflow-hidden">
            <h2 className="border-b border-slate-200 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Letzte Verkäufe
            </h2>
            <div className="scrollbar-thin max-h-48 overflow-y-auto p-2">
              <div className="space-y-1">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-slate-50"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900">#{order.id}</p>
                      <p className="text-xs text-slate-500">
                        {Number(order.total_amount).toFixed(2)} €
                      </p>
                    </div>
                    <button
                      onClick={() => repeatOrder(order.id)}
                      className="ml-2 flex h-8 items-center gap-1 rounded-lg bg-indigo-50 px-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
                      aria-label={`Bestellung ${order.id} wiederholen`}
                    >
                      <History size={14} />
                      Wiederholen
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      )}

      {/* Middle column: product grid */}
      <div className="card flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Produkte</h2>
            <p className="text-sm text-slate-500">{products.length} Produkte gefunden</p>
          </div>
          <div className="flex items-center gap-2">
            {kioskMode && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input h-10 py-2 pl-10 pr-8 text-sm"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label="Suche leeren"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            )}
            <button
              onClick={handleToggleKiosk}
              className="btn-icon"
              aria-label={kioskMode ? "Kiosk-Modus verlassen" : "Kiosk-Modus"}
              title={kioskMode ? "Kiosk-Modus verlassen" : "Kiosk-Modus"}
            >
              {kioskMode ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>
          </div>
        </div>
        <div className="scrollbar-thin flex-1 overflow-y-auto p-4">
          <ProductList
            products={products}
            onAdd={addToCart}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        </div>
      </div>

      {/* Floating cart button */}
      <button
        onClick={() => setCartOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-3 rounded-full bg-indigo-600 px-5 py-3.5 text-white shadow-lg transition hover:bg-indigo-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 active:scale-[0.98]"
        aria-label="Warenkorb"
      >
        <div className="relative">
          <ShoppingCart size={22} />
          {cartItemCount > 0 && (
            <span className="absolute -right-2.5 -top-2.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold">
              {cartItemCount}
            </span>
          )}
        </div>
        <span className="font-semibold">{cartTotal.toFixed(2)} €</span>
      </button>

      {/* Slide-over cart */}
      {cartOpen && (
        <>
          <div
            className="absolute inset-0 z-20 bg-black/30"
            onClick={() => setCartOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 right-0 z-30 flex w-96 flex-col overflow-hidden rounded-l-xl border-l border-slate-200 bg-white shadow-xl">
            <Cart
              cart={cart}
              onIncrement={increment}
              onDecrement={decrement}
              onRemove={removeItem}
              onQuantityChange={setQuantity}
              onCheckout={() => setCheckoutOpen(true)}
              isCheckingOut={isCheckingOut}
              onClose={() => setCartOpen(false)}
            />
          </div>
        </>
      )}

      {receipt && <ReceiptModal order={receipt} onClose={() => setReceipt(null)} />}

      <CheckoutModal
        cart={cart}
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onCheckout={handleCheckout}
        isCheckingOut={isCheckingOut}
      />
    </div>
  );
}
