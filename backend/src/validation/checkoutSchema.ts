import { z } from "zod";

export const checkoutItemSchema = z.object({
  productId: z.number().int().positive("Produkt-ID muss eine positive Zahl sein."),
  quantity: z.number().int().positive("Menge muss eine positive Zahl sein."),
});

export const checkoutPayloadSchema = z.object({
  items: z.array(checkoutItemSchema).min(1, "Warenkorb ist leer."),
  paymentMethod: z.enum(["cash", "card", "other"]).optional().default("cash"),
  amountTendered: z.number().min(0, "Betrag darf nicht negativ sein.").optional().default(0),
  discountAmount: z.number().min(0, "Rabatt darf nicht negativ sein.").optional().default(0),
});

export type CheckoutItemInput = z.infer<typeof checkoutItemSchema>;
export type CheckoutPayloadInput = z.infer<typeof checkoutPayloadSchema>;
