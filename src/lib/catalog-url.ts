export function catalogHref(filters: {
  q?: string;
  region?: string;
  couleur?: string;
  prix?: string;
}) {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.region) params.set("region", filters.region);
  if (filters.couleur) params.set("couleur", filters.couleur);
  if (filters.prix) params.set("prix", filters.prix);
  const query = params.toString();
  return query ? `/?${query}` : "/";
}
