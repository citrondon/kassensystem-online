import { Category } from "../types";

/**
 * Kategorie-Stile inspiriert vom "BazarStock"-Projekt eines Freundes.
 * Da unsere API noch keine Farben/Emojis liefert, mappen wir sie
 * clientseitig, bis das Backend erweitert wird.
 */

export const CATEGORY_META: Record<
  string,
  { color: string; bg: string; emoji: string; border: string }
> = {
  Alimentation: {
    color: "#E67E22",
    bg: "#FEF3E2",
    emoji: "🍚",
    border: "#FAD7A0",
  },
  Textiles: {
    color: "#8E44AD",
    bg: "#F5EEF8",
    emoji: "👗",
    border: "#D7BDE2",
  },
  Électronique: {
    color: "#2980B9",
    bg: "#EBF5FB",
    emoji: "📱",
    border: "#AED6F1",
  },
  Cosmétiques: {
    color: "#C0392B",
    bg: "#FDEDEC",
    emoji: "💄",
    border: "#F5B7B1",
  },
  Mobilier: {
    color: "#1ABC9C",
    bg: "#E8F8F5",
    emoji: "🪑",
    border: "#A3E4D7",
  },
  Autres: {
    color: "#7F8C8D",
    bg: "#F2F3F4",
    emoji: "📦",
    border: "#D5DBDB",
  },
  Lebensmittel: {
    color: "#E67E22",
    bg: "#FEF3E2",
    emoji: "🍞",
    border: "#FAD7A0",
  },
  Getränke: {
    color: "#3498DB",
    bg: "#EBF5FB",
    emoji: "🥤",
    border: "#AED6F1",
  },
  Kleidung: {
    color: "#8E44AD",
    bg: "#F5EEF8",
    emoji: "👕",
    border: "#D7BDE2",
  },
  Elektronik: {
    color: "#2980B9",
    bg: "#EBF5FB",
    emoji: "💻",
    border: "#AED6F1",
  },
  Drogerie: {
    color: "#C0392B",
    bg: "#FDEDEC",
    emoji: "🧴",
    border: "#F5B7B1",
  },
  Möbel: {
    color: "#1ABC9C",
    bg: "#E8F8F5",
    emoji: "🛋️",
    border: "#A3E4D7",
  },
  Sonstiges: {
    color: "#7F8C8D",
    bg: "#F2F3F4",
    emoji: "📦",
    border: "#D5DBDB",
  },
  default: {
    color: "#4B5563",
    bg: "#F3F4F6",
    emoji: "🏷️",
    border: "#D1D5DB",
  },
};

export function getCategoryMeta(name: string | null | undefined) {
  if (!name) return CATEGORY_META.default;
  return CATEGORY_META[name] ?? CATEGORY_META.default;
}

export function enrichCategories(categories: Category[]): Category[] {
  return categories.map((c) => {
    const meta = getCategoryMeta(c.name);
    return {
      ...c,
      color: meta.color,
      emoji: meta.emoji,
    };
  });
}
