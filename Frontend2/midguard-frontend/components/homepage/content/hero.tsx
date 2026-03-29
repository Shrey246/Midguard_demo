// =====================================================
// STRUCTURE
// components/dashboard/
//   Hero.tsx
//   StatsGrid.tsx
//   CategoryChips.tsx
//   QuickActions.tsx
//   ProductCard.tsx
//   ProductsGrid.tsx
//   Pagination.tsx
//   Footer.tsx
// app/dashboard/page.tsx
// =====================================================

// =============================
// components/dashboard/Hero.tsx
// =============================
"use client";

export function Hero() {
  return (
    <div className="w-full flex items-start justify-between gap-6 mb-6">
      <div>
        <h2 className="text-2xl font-bold text-black dark:text-white">
          Welcome to <span className="text-cyan-500">MidGuard</span>
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Find and hustle for your next favorite thing
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          Your physical and digital product trade center
        </p>
      </div>
    </div>
  );
}








