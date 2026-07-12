import { z } from "zod";

const MAX_NAME_LENGTH = 255;
const MAX_BARCODE_LENGTH = 50;
const MAX_IMAGE_URL_LENGTH = 500;

export const productCreateSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich.").max(MAX_NAME_LENGTH, "Name ist zu lang."),
  barcode: z.string().max(MAX_BARCODE_LENGTH, "Barcode ist zu lang.").optional().nullable(),
  price: z.number().min(0, "Preis darf nicht negativ sein."),
  stock: z.number().int().min(0, "Bestand darf nicht negativ sein.").optional().default(0),
  categoryId: z.number().int().positive("Kategorie-ID muss positiv sein.").optional().nullable(),
  lowStockThreshold: z.number().int().min(0, "Mindestbestand darf nicht negativ sein.").optional().default(10),
});

export const productUpdateSchema = productCreateSchema.extend({
  imageUrl: z.string().max(MAX_IMAGE_URL_LENGTH, "Bild-URL ist zu lang.").optional().nullable(),
});

export const productIdParamSchema = z.object({
  id: z.coerce.number().int().positive("Produkt-ID muss positiv sein."),
});

export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
