import { Category } from "../types";
import { Lang } from "../i18n/translations";

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
  // Aktuelle Kategorien aus der Datenbank (db/init.sql)
  "Obst & Gemuese": {
    color: "#E67E22",
    bg: "#FEF3E2",
    emoji: "🍎",
    border: "#FAD7A0",
  },
  Getraenke: {
    color: "#3498DB",
    bg: "#EBF5FB",
    emoji: "🥤",
    border: "#AED6F1",
  },
  Backwaren: {
    color: "#D4A373",
    bg: "#FDF6E3",
    emoji: "🥖",
    border: "#E6C89C",
  },
  Suessigkeiten: {
    color: "#C0392B",
    bg: "#FDEDEC",
    emoji: "🍫",
    border: "#F5B7B1",
  },
  Grundnahrungsmittel: {
    color: "#27AE60",
    bg: "#E8F8F5",
    emoji: "🥛",
    border: "#A3E4D7",
  },
  // Französische Entsprechungen (falls Kategorien umbenannt werden)
  "Fruits & Légumes": {
    color: "#E67E22",
    bg: "#FEF3E2",
    emoji: "🍎",
    border: "#FAD7A0",
  },
  Boissons: {
    color: "#3498DB",
    bg: "#EBF5FB",
    emoji: "🥤",
    border: "#AED6F1",
  },
  Boulangerie: {
    color: "#D4A373",
    bg: "#FDF6E3",
    emoji: "🥖",
    border: "#E6C89C",
  },
  Confiseries: {
    color: "#C0392B",
    bg: "#FDEDEC",
    emoji: "🍫",
    border: "#F5B7B1",
  },
  "Produits de base": {
    color: "#27AE60",
    bg: "#E8F8F5",
    emoji: "🥛",
    border: "#A3E4D7",
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

/**
 * Übersetzte Anzeigenamen für Kategorien. Die Schlüssel müssen exakt den
 * Namen in der Datenbank entsprechen (db/init.sql).
 */
export const CATEGORY_LABELS: Record<string, Record<Lang, string>> = {
  "Obst & Gemuese": { fr: "Fruits & Légumes", de: "Obst & Gemüse" },
  Getraenke: { fr: "Boissons", de: "Getränke" },
  Backwaren: { fr: "Boulangerie", de: "Backwaren" },
  Suessigkeiten: { fr: "Confiseries", de: "Süßigkeiten" },
  Grundnahrungsmittel: { fr: "Produits de base", de: "Grundnahrungsmittel" },
  // Französische Kategorien (falls die DB später auf Französisch läuft)
  "Fruits & Légumes": { fr: "Fruits & Légumes", de: "Obst & Gemüse" },
  Boissons: { fr: "Boissons", de: "Getränke" },
  Boulangerie: { fr: "Boulangerie", de: "Backwaren" },
  Confiseries: { fr: "Confiseries", de: "Süßigkeiten" },
  "Produits de base": { fr: "Produits de base", de: "Grundnahrungsmittel" },
  // Weitere Fallbacks
  Alimentation: { fr: "Alimentation", de: "Lebensmittel" },
  Textiles: { fr: "Textiles", de: "Kleidung" },
  Électronique: { fr: "Électronique", de: "Elektronik" },
  Cosmétiques: { fr: "Cosmétiques", de: "Drogerie" },
  Mobilier: { fr: "Mobilier", de: "Möbel" },
  Autres: { fr: "Autres", de: "Sonstiges" },
  Lebensmittel: { fr: "Alimentation", de: "Lebensmittel" },
  Getränke: { fr: "Boissons", de: "Getränke" },
  Kleidung: { fr: "Textiles", de: "Kleidung" },
  Elektronik: { fr: "Électronique", de: "Elektronik" },
  Drogerie: { fr: "Cosmétiques", de: "Drogerie" },
  Möbel: { fr: "Mobilier", de: "Möbel" },
  Sonstiges: { fr: "Autres", de: "Sonstiges" },
};

export function getCategoryLabel(name: string | null | undefined, lang: Lang): string {
  if (!name) return "";
  return CATEGORY_LABELS[name]?.[lang] ?? name;
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
