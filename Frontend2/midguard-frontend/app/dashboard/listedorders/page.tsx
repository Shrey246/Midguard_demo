"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // ✅ added
import { api } from "@/lib/api";
import OrderCard from "@/components/myorder/ordercard";
import { adaptOrder } from "@/lib/adapters/orderadapter";

export default function ListedOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter(); // ✅ added

  // 🔒 AUTH GUARD
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const res = await api.getSellerOrders();

      if (!res.success) {
        throw new Error(res.message || "Failed to load orders");
      }

      const adapted = (res.orders || []).map((o: any) =>
        adaptOrder(o, "seller")
      );

      setOrders(adapted);
    } catch (err) {
      console.error("❌ Failed to load listed orders", err);

      // 🔒 fallback
      localStorage.removeItem("token");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="
        p-4 sm:p-6 text-sm
        text-gray-500 dark:text-gray-400
      ">
        Loading listed orders...
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="
        p-4 sm:p-6 text-center
        text-gray-500 dark:text-gray-400
      ">
        <p className="text-base sm:text-lg">No listed orders</p>
        <p className="text-xs sm:text-sm mt-1">
          Orders from your listings will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="
      p-4 sm:p-6 space-y-4
      bg-white dark:bg-black
      min-h-screen
      transition-all duration-300
    ">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}