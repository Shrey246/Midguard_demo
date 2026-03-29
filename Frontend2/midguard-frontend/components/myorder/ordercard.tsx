"use client";

import { useRouter } from "next/navigation";

type Props = {
  order: any; // already adapted OrderUI
};

export default function OrderCard({ order }: Props) {
  const router = useRouter();

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "shipped":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "delivered":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "disputed":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "cancelled":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      case "in_progress":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default:
        return "bg-white/10 text-gray-300 border-white/10";
    }
  };

  const handleClick = () => {
    // 👉 navigate to escrow (core flow)
    router.push(`/dashboard/escrow/${order.sessionId}`);
  };

  return (
    <div
      onClick={handleClick}
      className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400 transition cursor-pointer"
    >
      {/* TOP */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-400">
          {order.role === "buyer" ? "Buying" : "Selling"}
        </p>

        <span
          className={`text-xs px-3 py-1 rounded-full border ${getStatusStyle(
            order.status
          )}`}
        >
          {order.status.replace("_", " ").toUpperCase()}
        </span>
      </div>

      {/* PRODUCT */}
      <h2 className="text-lg font-semibold text-white">
        {order.productName}
      </h2>

      {/* META */}
      <div className="flex items-center justify-between mt-2">
        <p className="text-sm text-gray-400">
          {order.roomType.toUpperCase()}
        </p>

        <p className="text-lg font-bold text-cyan-400">
          ₹{order.price}
        </p>
      </div>

      {/* TRACKING */}
      {order.trackingLink && (
        <div className="mt-3">
          <a
            href={order.trackingLink}
            target="_blank"
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-blue-400 hover:underline"
          >
            Track Package →
          </a>
        </div>
      )}

      {/* DATE */}
      <p className="text-[10px] text-gray-500 mt-3">
        {new Date(order.createdAt).toLocaleString()}
      </p>
    </div>
  );
}