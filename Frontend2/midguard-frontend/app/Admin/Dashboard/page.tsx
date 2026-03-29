"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminApi } from "@/lib/AdminApi";
import { adaptAdmin } from "@/lib/adapters/adminadapter";

type Admin = {
  adminId: string;
  email: string;
  role: string;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const token = localStorage.getItem("adminToken");

        if (!token) {
          router.push("/admin/login");
          return;
        }

        const data = await adminApi.getMe();
        const normalized = adaptAdmin(data);

        setAdmin(normalized);
      } catch (err: any) {
        console.error("❌ Admin fetch failed:", err.message);

        localStorage.removeItem("adminToken");
        router.push("/admin/login");
      } finally {
        setLoading(false);
      }
    };

    fetchAdmin();
  }, [router]);

  if (loading)
    return <div className="p-6 text-gray-500">Loading admin...</div>;

  if (!admin) return null;

  const getPermissions = (role: string) => {
    switch (role) {
      case "super":
        return ["users", "rooms", "orders", "disputes", "wallets"];
      case "operations":
        return ["rooms", "orders", "disputes"];
      case "support":
        return ["rooms", "orders"];
      default:
        return [];
    }
  };

  const permissions = getPermissions(admin.role);

  const cards = [
    { name: "Users", path: "/admin/users", key: "users" },
    { name: "Rooms", path: "/admin/rooms", key: "rooms" },
    { name: "Orders", path: "/admin/orders", key: "orders" },
    { name: "Disputes", path: "/admin/disputes", key: "disputes" },
    { name: "Wallets", path: "/admin/wallets", key: "wallets" },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-700 text-white p-6 rounded-2xl shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-xl">
            {admin.email?.[0]?.toUpperCase() || "A"}
          </div>

          <div>
            <p className="text-lg font-semibold">{admin.email}</p>
            <p className="text-xs mt-1 bg-white/20 inline-block px-2 py-1 rounded">
              {admin.role}
            </p>
          </div>
        </div>

        <div className="text-right">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-sm opacity-80">System control panel ⚡</p>
        </div>
      </div>

      {/* ACTION GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {cards
          .filter((card) => permissions.includes(card.key))
          .map((card) => (
            <div
              key={card.name}
              onClick={() => router.push(card.path)}
              className="cursor-pointer p-6 rounded-2xl bg-white shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
            >
              <h2 className="text-lg font-semibold">{card.name}</h2>
              <p className="text-sm text-gray-500 mt-2">
                Manage {card.name.toLowerCase()}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
}