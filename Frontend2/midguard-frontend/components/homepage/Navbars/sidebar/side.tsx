"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutGrid,
  Package,
  ListOrdered,
  Heart,
  Settings,
  Shield,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";

import NavItem from "../../navitem";
import { api } from "@/lib/api"; // ⚠️ adjust path if needed

export default function Sidebar({ open, setOpen }: any) {
  const pathname = usePathname();
  const [dark, setDark] = useState(false);

  // 🔥 INIT THEME
  useEffect(() => {
    const saved = localStorage.getItem("theme");

    if (saved === "dark") {
      setDark(true);
      document.documentElement.classList.add("dark");
    } else {
      setDark(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // 🔥 LOGOUT HANDLER
  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.error("Logout failed");
    }

    // always clear
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/login";
  };

  return (
    <div
      className={`fixed top-0 left-0 h-screen w-[260px] bg-black/80 backdrop-blur-xl border-r border-white/10 p-4 z-50 transform transition-transform duration-300 flex flex-col ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* TOP */}
      <div>
        <button
          onClick={() => setOpen(false)}
          className="mb-4 text-gray-400"
        >
          ✕
        </button>

        {/* LOGO */}
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-bold">
            MG
          </div>
          <div>
            <h1 className="text-white font-semibold">MidGuard</h1>
            <p className="text-xs text-gray-400">Marketplace</p>
          </div>
        </div>

        {/* NAV */}
        <nav className="space-y-2">
          <NavItem href="/dashboard" icon={<LayoutGrid size={18} />} label="Discover" pathname={pathname} />
          <NavItem href="/dashboard/myorders/" icon={<Package size={18} />} label="My Orders" pathname={pathname} />
          <NavItem href="/dashboard/listedorders/" icon={<ListOrdered size={18} />} label="Listed Orders" pathname={pathname} />
          <NavItem href="/dashboard/wishlist/" icon={<Heart size={18} />} label="Wishlist" pathname={pathname} />
          <NavItem href="/dashboard/settings/" icon={<Settings size={18} />} label="Settings" pathname={pathname} />
          <NavItem href="/dashboard/policy/" icon={<Shield size={18} />} label="Privacy & Policy" pathname={pathname} />
        </nav>
      </div>

      {/* BOTTOM (PUSHED DOWN) */}
      <div className="mt-auto space-y-4">

        {/* DARK MODE */}
        <div className="flex items-center justify-between px-3 py-3 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 text-gray-300 text-sm">
            {dark ? <Moon size={16} /> : <Sun size={16} />}
            {dark ? "Dark Mode" : "Light Mode"}
          </div>

          <button
            onClick={() => {
              const newDark = !dark;
              setDark(newDark);

              if (newDark) {
                document.documentElement.classList.add("dark");
                localStorage.setItem("theme", "dark");
              } else {
                document.documentElement.classList.remove("dark");
                localStorage.setItem("theme", "light");
              }
            }}
            className={`w-10 h-5 flex items-center rounded-full p-1 transition ${
              dark ? "bg-cyan-500" : "bg-gray-500"
            }`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full shadow-md transform transition ${
                dark ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* 🔥 FANCY LOGOUT BUTTON */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl 
          bg-gradient-to-r from-red-500 to-pink-500 
          hover:from-red-600 hover:to-pink-600 
          text-white font-semibold 
          shadow-lg shadow-red-500/20 
          hover:shadow-red-500/40 
          transition-all duration-300 active:scale-95"
        >
          <LogOut size={18} />
          Logout
        </button>

      </div>
    </div>
  );
}