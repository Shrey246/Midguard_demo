"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, Wallet, User, Menu } from "lucide-react";
import { api } from "@/lib/api";
import NotificationBell from "@/components/dashboard/common/Notificationbell";

export default function Topbar({ setOpen }: any) {
  const pathname = usePathname();
  const router = useRouter();
  const [address, setAddress] = useState<any>(null); 
  const [walletOpen, setWalletOpen] = useState(false);
  const [wallet, setWallet] = useState<any>(null);
  const [query, setQuery] = useState("");

  // 🔥 Load wallet
  const loadWallet = async () => {
    try {
      const data = await api.getWallet();
      setWallet(data.data);
    } catch (err) {
      console.error("Failed to load wallet", err);
    }
  };

      const loadAddress = async () => {
      try {
        const res = await api.getAddresses();
        const list = res.addresses || [];

        const defaultAddr = list.find((a: any) => a.is_default) || list[0];
        setAddress(defaultAddr);
      } catch (err) {
        console.error("Failed to load address", err);
      }
    };

  // 🔥 Auto load + smart refresh
      useEffect(() => {
        loadWallet();
        loadAddress();

        const interval = setInterval(() => {
          if (document.visibilityState === "visible") {
            loadWallet();
            loadAddress();
          }
        }, 5000);

        return () => clearInterval(interval);
      }, []);

  // 🔥 Dynamic page title
  const getTitle = () => {
    if (pathname.includes("/dashboard")) return "Discover";
    if (pathname.includes("/orders")) return "My Orders";
    if (pathname.includes("/listed")) return "Listed Orders";
    if (pathname.includes("/wishlist")) return "Wishlist";
    if (pathname.includes("/settings")) return "Settings";
    return "MidGuard";
  };

  // 🔍 Search handler
  const handleSearch = () => {
    if (!query) return;

    if (pathname.includes("/dashboard")) {
      router.push(`/search/products?q=${query}`);
    } else if (pathname.includes("/orders")) {
      router.push(`/search/orders?q=${query}`);
    } else if (pathname.includes("/listed")) {
      router.push(`/search/listed?q=${query}`);
    } else if (pathname.includes("/wishlist")) {
      router.push(`/search/wishlist?q=${query}`);
    }
  };

  return (
    <div className="w-full h-[70px] flex items-center justify-between px-6 border-b border-white/10 bg-black/60 backdrop-blur-xl relative z-50">

      {/* LEFT */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-400 transition"
        >
          <Menu size={18} />
        </button>

        <h1 className="text-lg font-semibold text-white">
          {getTitle()}
        </h1>
      </div>

      {/* CENTER */}
      <div className="w-[40%] relative">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Search..."
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-400"
        />
        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4 relative">
        {/* 🔔 NOTIFICATIONS */}
          <NotificationBell />
      {/* ADDRESS */}
      <div
        onClick={() => router.push("/dashboard/address")}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:border-cyan-400 transition"
      >
        📍
        <span className="text-sm">
          {address?.postal_code || "Add Address"}
        </span>
      </div>

        {/* WALLET */}
        <div className="relative">
          <div
            onClick={() => setWalletOpen((prev) => !prev)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:border-cyan-400 transition"
          >
            <Wallet size={16} />
            <span className="text-sm">
              ₹{wallet?.available_balance ?? 0}
            </span>
          </div>

          {walletOpen && (
            <div className="absolute right-0 mt-2 w-60 z-[100] p-4 rounded-xl bg-black/80 border border-white/10 backdrop-blur-xl shadow-xl">

              {/* HEADER */}
              <div className="flex items-center gap-2 mb-3">
                <Wallet size={16} />
                <span className="text-sm font-semibold">Wallet</span>
              </div>

              {/* AVAILABLE */}
              <p className="text-xs text-gray-400">Available</p>
              <p className="text-lg font-bold text-green-400">
                ₹{wallet?.available_balance ?? 0}
              </p>

              {/* LOCKED */}
              <p className="text-xs text-gray-400 mt-2">Locked</p>
              <p className="text-lg font-bold text-yellow-400">
                ₹{wallet?.locked_balance ?? 0}
              </p>

              {/* BUTTON */}
              <button
                onClick={() => router.push("/dashboard/wallet")}
                className="mt-4 w-full py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-semibold hover:scale-105 transition"
              >
                View Ledger →
              </button>

            </div>
          )}
        </div>

        {/* ACCOUNT */}
        <User
          size={20}
          className="cursor-pointer text-gray-300 hover:text-white"
          onClick={() => router.push("/dashboard/Account")}
        />

      </div>
    </div>
  );
}