// =============================
// components/dashboard/QuickActions.tsx
// =============================

import Link from "next/link";

export function QuickActions() {
  const actions = [
    { label: "Auction Rooms", href: "/dashboard/listroom/auction" },
    { label: "Marketplace", href: "/dashboard/listroom/public" },
    { label: "Private Rooms", href: "dashboard/join-private" }, // special case
    { label: "Digital Products", href: "/dashboard/listroom/digital" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      {actions.map((a) => (
        <Link key={a.label} href={a.href}>
          <div className="p-4 text-center rounded-xl border border-gray-300 dark:border-white/10 bg-gray-100 dark:bg-white/5 hover:scale-[1.03] transition">
            {a.label} →
          </div>
        </Link>
      ))}
    </div>
  );
}