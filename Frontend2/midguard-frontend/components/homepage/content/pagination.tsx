// =============================
// components/dashboard/Pagination.tsx
// =============================

export function Pagination() {
  return (
    <div className="flex items-center justify-center gap-4 mt-6">
      <button className="px-3 py-1 border">&lt;</button>
      <div className="text-sm">1 2 3 4 5 6 7</div>
      <button className="px-3 py-1 border">&gt;</button>
    </div>
  );
}
