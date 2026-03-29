"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, LogOut } from "lucide-react";
import { api } from "@/lib/api"; // ✅ adjust if path differs

export default function SettingsPage() {
  const router = useRouter();

  const [dark, setDark] = useState(true);
  const [promo, setPromo] = useState(true);
  const [orders, setOrders] = useState(true);

  // 🔥 LOGOUT HANDLER
  const handleLogout = async () => {
    try {
      await api.logout();
      localStorage.removeItem("token");
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0b0f] text-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* ================= APPEARANCE ================= */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">Appearance</h2>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Theme</p>
              <p className="text-sm text-gray-400">
                Customize your visual experience.
              </p>
            </div>

            <div className="flex bg-white/10 rounded-lg p-1">
              <button
                onClick={() => setDark(false)}
                className={`px-4 py-1 rounded-md text-sm transition ${
                  !dark ? "bg-white text-black" : "text-gray-300"
                }`}
              >
                Light
              </button>
              <button
                onClick={() => setDark(true)}
                className={`px-4 py-1 rounded-md text-sm transition ${
                  dark ? "bg-purple-500 text-white" : "text-gray-300"
                }`}
              >
                Dark
              </button>
            </div>
          </div>
        </div>

        {/* ================= NOTIFICATIONS ================= */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">Notifications</h2>

          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <div>
              <p className="font-medium">Promotional Offers</p>
              <p className="text-sm text-gray-400">
                Receive updates on sales and special deals.
              </p>
            </div>

            <Toggle value={promo} setValue={setPromo} />
          </div>

          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <div>
              <p className="font-medium">Order Updates</p>
              <p className="text-sm text-gray-400">
                Get notified about your order status.
              </p>
            </div>

            <Toggle value={orders} setValue={setOrders} />
          </div>
        </div>

        {/* ================= ACCOUNT & LEGAL ================= */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">Account & Legal</h2>

          <div className="divide-y divide-white/10">

            <Row
              label="Edit Profile"
              onClick={() => router.push("/dashboard/Account")}
            />

            <Row
              label="Manage Addresses"
              onClick={() => router.push("/dashboard/address")}
            />

            <Row
              label="About Us"
              highlight
              onClick={() => router.push("/dashboard/Aboutus")}
            />

            <Row
              label="Privacy Policy & Terms"
              onClick={() => router.push("/dashboard/policy")}
            />

            {/* 🔥 LOGOUT */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between py-4 text-red-400 hover:text-red-500 transition"
            >
              <span>Logout</span>
              <LogOut size={18} />
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}

/* ================= REUSABLE COMPONENTS ================= */

function Toggle({ value, setValue }: any) {
  return (
    <button
      onClick={() => setValue(!value)}
      className={`w-12 h-6 flex items-center rounded-full p-1 transition ${
        value ? "bg-purple-500" : "bg-gray-600"
      }`}
    >
      <div
        className={`w-4 h-4 bg-white rounded-full shadow-md transform transition ${
          value ? "translate-x-6" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function Row({ label, onClick, highlight }: any) {
  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between py-4 cursor-pointer hover:bg-white/5 px-2 rounded-lg transition"
    >
      <span
        className={`${
          highlight ? "text-purple-400" : "text-gray-200"
        }`}
      >
        {label}
      </span>
      <ChevronRight size={18} className="text-gray-500" />
    </div>
  );
}