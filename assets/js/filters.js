export const categories = [
  { id: "all", label: "Todos" },
  { id: "whey", label: "Whey Protein" },
  { id: "creatina", label: "Creatina" },
  { id: "pre", label: "Pré-treino" },
  { id: "vitaminas", label: "Vitaminas" },
  { id: "kits", label: "Kits" },
  { id: "barras", label: "Barras" }
];

// ================= FILTRO =================
export function filterProducts(products, category) {
  if (category === "all") return products;

  return products.filter(product => product.category === category);
}