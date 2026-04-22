/** Recherche texte insensible à la casse (tableau de bord). */

export function normalizeSearch(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function matchesSearch(haystackParts: string[], query: string): boolean {
  const q = normalizeSearch(query);
  if (!q) return true;
  const blob = haystackParts.map(normalizeSearch).join(" ");
  return blob.includes(q);
}
