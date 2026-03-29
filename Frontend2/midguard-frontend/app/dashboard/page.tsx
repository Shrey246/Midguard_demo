"use client";

import Sidebar from "@/components/homepage/Navbars/sidebar/side";
import { Hero } from "@/components/homepage/content/hero";
import { StatsGrid } from "@/components/homepage/content/statsgrid";
import { CategoryChips } from "@/components/homepage/content/categorychips";
import { QuickActions } from "@/components/homepage/content/quickactions";
import { ProductsGrid } from "@/components/homepage/content/productsgrid";
import { Pagination } from "@/components/homepage/content/pagination";
import { Footer } from "@/components/homepage/content/footer";
import FloatingActions from "@/components/homepage/content/floatingbuttons";

export default function DashboardPage() {

  // 🔥 MOCK DATA
  const stats = { rooms: 12, transactions: 40, users: 25, escrow: 10 };

  const products = [
    { id: 1, name: "Product 1", price: "10,000" },
    { id: 2, name: "Product 2", price: "12,000" },
    { id: 3, name: "Product 3", price: "8,000" },
    { id: 4, name: "Product 4", price: "15,000" },
  ];

  return (
    <div className="flex">

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN AREA */}
      <div className="flex-1 relative min-h-screen overflow-hidden">

        {/* 🌈 SUBTLE BACKGROUND GRADIENT */}
        <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-100 dark:from-black dark:to-[#0a0a0a]" />

        {/* ✨ SOFT GLOW (premium but subtle) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-cyan-500/20 blur-3xl pointer-events-none" />

        {/* CONTENT */}
        <div className="relative z-10 p-6">

          {/* HERO + STATS */}
          <div className="flex justify-between mb-6">
            <Hero />
            <StatsGrid/>
          </div>

          <CategoryChips />
          <QuickActions />
          <ProductsGrid products={products} />
          <Pagination />
          <FloatingActions />
          <Footer />

        </div>
      </div>
    </div>
  );
}