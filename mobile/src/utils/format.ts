/** CFA hat keine Dezimalstellen. Beträge als Integer speichern/anzeigen. */
export function formatCFA(amount: number): string {
  return new Intl.NumberFormat("fr-FR").format(amount) + " CFA";
}

export function formatShortDate(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
