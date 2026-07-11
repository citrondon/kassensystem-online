import { Router, Request, Response } from "express";
import {
  processCheckout,
  getOrders,
  getOrderById,
  CheckoutItem,
  PaymentMethod,
  CheckoutPayload,
} from "../controllers/orderController.js";

const router = Router();

router.get("/", getOrders);
router.get("/:id", getOrderById);

router.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const { items, paymentMethod, amountTendered, discountAmount } = req.body as {
      items?: CheckoutItem[];
      paymentMethod?: PaymentMethod;
      amountTendered?: number;
      discountAmount?: number;
    };

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, error: "Warenkorb ist leer oder ungueltig." });
      return;
    }

    for (const item of items) {
      if (
        typeof item.productId !== "number" ||
        typeof item.quantity !== "number" ||
        item.quantity <= 0
      ) {
        res.status(400).json({
          success: false,
          error: `Ungueltige Artikel-Daten: productId und quantity (positive Zahl) erforderlich.`,
        });
        return;
      }
    }

    const payload: CheckoutPayload = {
      items,
      paymentMethod,
      amountTendered,
      discountAmount,
    };

    const result = await processCheckout(payload);
    res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unbekannter Fehler beim Checkout.";
    res.status(400).json({ success: false, error: message });
  }
});

export default router;
