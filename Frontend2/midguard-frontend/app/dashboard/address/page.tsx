"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function AddressPage() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    // 🔒 BLOCK ACCESS
    if (!token) {
      router.push("/login");
      return;
    }

    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const res = await api.getAddresses();
      setAddresses(res.addresses || []);
    } catch (err) {
      console.error(err);

      // 🔒 fallback → token expired / invalid
      localStorage.removeItem("token");
      router.push("/login");
    }
  };

  const handleDelete = async (id: string) => {
    await api.deleteAddress(id);
    loadAddresses();
  };

  const handleDefault = async (id: string) => {
    await api.setDefaultAddress(id);
    loadAddresses();
  };

  return (
    <div
      className="
      p-4 sm:p-6 min-h-screen
      bg-white text-black
      dark:bg-black dark:text-white
      transition-all duration-300
    "
    >
      <h1 className="text-xl sm:text-2xl font-bold mb-6">
        Saved Addresses
      </h1>

      {/* RESPONSIVE GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">

        {/* ADD NEW CARD */}
        <div
          className="
          border border-dashed border-gray-400 dark:border-gray-600
          rounded-xl flex items-center justify-center
          h-[150px] sm:h-[180px]
          cursor-pointer
          hover:border-cyan-500 transition
        "
          onClick={() => router.push("/dashboard/Createaddress")}
        >
          <span className="text-gray-500 dark:text-gray-400">
            + Add Address
          </span>
        </div>

        {/* ADDRESS LIST */}
        {addresses.map((addr) => (
          <div
            key={addr.address_uid}
            className={`
              p-4 rounded-xl border transition
              ${
                addr.is_default
                  ? "border-cyan-500 bg-gray-100 dark:bg-white/5"
                  : "border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-transparent"
              }
            `}
          >
            {/* HEADER */}
            <div className="flex justify-between items-start gap-2">
              <h2 className="font-semibold text-sm sm:text-base">
                {addr.full_name}
              </h2>

              {addr.is_default && (
                <span className="text-xs text-cyan-500 whitespace-nowrap">
                  Default
                </span>
              )}
            </div>

            {/* ADDRESS */}
            <p className="text-sm mt-2 text-gray-700 dark:text-gray-300">
              {addr.address_line1}, {addr.address_line2}
            </p>

            <p className="text-sm text-gray-700 dark:text-gray-300">
              {addr.city}, {addr.state} - {addr.postal_code}
            </p>

            <p className="text-sm mt-1">{addr.country}</p>

            <p className="text-xs text-gray-500 mt-1">
              Phone: {addr.phone_number}
            </p>

            {/* ACTIONS */}
            <div className="flex flex-col sm:flex-row justify-between gap-2 mt-4 text-sm">

              <button
                onClick={() => handleDefault(addr.address_uid)}
                className="
                  text-cyan-500 hover:underline
                "
              >
                Set default
              </button>

              <button
                onClick={() => handleDelete(addr.address_uid)}
                className="
                  text-red-500 hover:underline
                "
              >
                Remove
              </button>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}