// =============================
// components/dashboard/ProductCard.tsx
// =============================

export function ProductCard({ product }: any) {
  return (
    <div className="p-4 border border-gray-300 dark:border-white/10 rounded-xl bg-gray-100 dark:bg-white/5">
      <div className="h-32 bg-gray-200 dark:bg-black/40 rounded-md mb-3 flex items-center justify-center text-xs text-gray-400">
        Image
      </div>
      <h4 className="text-sm font-semibold">{product.name}</h4>
      <p className="text-sm text-gray-600 dark:text-gray-400">₹{product.price}</p>
      <button className="mt-2 px-3 py-1 text-sm border rounded-lg">Buy Now</button>
    </div>
  );
}
