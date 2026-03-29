// =============================
// components/dashboard/CategoryChips.tsx
// =============================

export function CategoryChips() {
  const chips = ["All", "Electronics", "RAM"];

  return (
    <div className="flex gap-3 mb-4">
      {chips.map((chip) => (
        <button
          key={chip}
          className="px-4 py-1 rounded-full text-sm border border-gray-300 dark:border-white/10 bg-gray-100 dark:bg-white/5 hover:border-cyan-400"
        >
          {chip}
        </button>
      ))}
    </div>
  );
}
