"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { adminApi } from "@/lib/AdminApi";
import { adaptAdmin } from "@/lib/adapters/adminadapter";

type Admin = {
  adminId: string;
  email: string;
  role: string;
};

export default function AdminLayout({ children }: any) {
  const router = useRouter();
  const pathname = usePathname();

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
      } catch (err) {
        console.error("❌ Admin auth failed");

        localStorage.removeItem("adminToken");
        router.push("/admin/login");
      } finally {
        setLoading(false);
      }
    };

    fetchAdmin();
  }, [router]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-500">
        Loading admin panel...
      </div>
    );
  }

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

  const menu = [
    { name: "Dashboard", path: "/admin", key: "dashboard" },
    { name: "Users", path: "/admin/users", key: "users" },
    { name: "Rooms", path: "/admin/rooms", key: "rooms" },
    { name: "Orders", path: "/admin/orders", key: "orders" },
    { name: "Disputes", path: "/admin/disputes", key: "disputes" },
    { name: "Wallets", path: "/admin/wallets", key: "wallets" },
  ];

  const handleLogout = async () => {
    try {
      await adminApi.logout();
    } catch {
      // ignore
    } finally {
      localStorage.removeItem("adminToken");
      router.push("/admin/login");
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      
      {/* SIDEBAR */}
      <div className="w-64 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white p-5 shadow-2xl flex flex-col justify-between">
        
        <div>
          <h2 className="text-xl font-bold mb-8 tracking-wide">
            MidGuard Admin
          </h2>

          <div className="space-y-2">
            {menu
              .filter((item) =>
                item.key === "dashboard"
                  ? true
                  : permissions.includes(item.key)
              )
              .map((item) => (
                <Link key={item.path} href={item.path}>
                  <div
                    className={`p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                      pathname === item.path
                        ? "bg-white/20 backdrop-blur-md"
                        : "hover:bg-white/10"
                    }`}
                  >
                    {item.name}
                  </div>
                </Link>
              ))}
          </div>
        </div>

        {/* PROFILE */}
        <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl">
          <p className="text-sm font-semibold">{admin.email}</p>
          <p className="text-xs opacity-70">{admin.role}</p>
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col">
        
        {/* TOPBAR */}
        <div className="bg-white/70 backdrop-blur-md border-b border-gray-200 p-4 flex justify-between items-center shadow-sm">
          
          <div>
            <p className="font-semibold text-gray-800">{admin.email}</p>
            <p className="text-xs text-gray-500">{admin.role}</p>
          </div>

          <button
            onClick={handleLogout}
            className="text-red-500 hover:text-red-600 text-sm transition"
          >
            Logout
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-white rounded-2xl shadow-md p-6 min-h-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}