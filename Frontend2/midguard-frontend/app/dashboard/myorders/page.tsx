"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import OrderCard from "@/components/myorder/ordercard";
import { adaptOrder } from "@/lib/adapters/orderadapter";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      const res = await api.getMyOrders();

      if (!res.success) {
        throw new Error(res.message || "Failed to load orders");
      }

      const adapted = (res.orders || []).map(adaptOrder);
      setOrders(adapted);
    } catch (err) {
      console.error("❌ Failed to load orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // 🔄 LOADING STATE
  if (loading) {
    return (
      <div className="p-6 text-gray-400 text-sm">
        Loading your orders...
      </div>
    );
  }

  // 📭 EMPTY STATE
  if (orders.length === 0) {
    return (
      <div className="p-6 text-center text-gray-400">
        <p className="text-lg">No orders yet</p>
        <p className="text-sm mt-1">
          Your transactions will appear here
        </p>
      </div>
    );
  }

  // ✅ MAIN UI
  return (
    <div className="p-6 space-y-4">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}