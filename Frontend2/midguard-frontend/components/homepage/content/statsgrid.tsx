"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api"; // ✅ adjust path if needed

export function StatsGrid() {
  const [stats, setStats] = useState({
    rooms: 0,
    transactions: 0,
    users: 0,
    escrow: 0,
  });

  const fetchStats = async () => {
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error("❌ Stats fetch failed:", err);
    }
  };

  useEffect(() => {
    fetchStats(); // initial load

    const interval = setInterval(() => {
      fetchStats();
    }, 4000); // ⏱ every 4 sec

    return () => clearInterval(interval); // cleanup
  }, []);

  const items = [
    { label: "Active Rooms", value: stats.rooms },
    { label: "Trusted Transactions", value: stats.transactions },
    { label: "Active Users", value: stats.users },
    { label: "Escrow's Handled", value: stats.escrow },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 w-[420px]">
      {items.map((item, i) => (
        <div
          key={i}
          className="p-4 rounded-xl border border-gray-300 dark:border-white/10 bg-gray-100 dark:bg-white/5"
        >
          <p className="text-xs text-gray-500">{item.label}</p>
          <h3 className="text-lg font-semibold">
            {item.value ?? 0}
          </h3>
        </div>
      ))}
    </div>
  );
}