// =============================
// components/dashboard/ProductsGrid.tsx
// =============================

import { ProductCard } from "./productcard";

export function ProductsGrid({ products }: any) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Best Selling Products of the Week</h2>

      <div className="grid grid-cols-4 gap-6">
        {products.map((p: any) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
