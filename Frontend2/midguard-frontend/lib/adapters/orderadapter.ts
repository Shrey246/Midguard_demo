export type OrderUI = {
  id: string;
  sessionId: string;

  productName: string;
  roomType: string;

  price: number;

  role: "buyer" | "seller";

  status:
    | "pending"
    | "in_progress"
    | "shipped"
    | "delivered"
    | "completed"
    | "disputed"
    | "cancelled";

  trackingLink?: string;

  createdAt: string;
};

export function adaptOrder(
  order: any,
  forceRole?: "buyer" | "seller"
): OrderUI {
  if (!order) {
    throw new Error("adaptOrder: order is undefined");
  }

  const room = order.Room || {};

  return {
    id: order.order_uid,

    sessionId: order.session_id,

    productName: room.product_name || "Unknown Product",
    roomType: room.room_type || "unknown",

    price: Number(order.final_amount) || 0,

    // ✅ FIX: safe role handling
    role: forceRole || order.role || "buyer",

    status: mapStatus(order),

    trackingLink: order.tracking_link || undefined,

    createdAt: order.created_at || order.createdAt,
  };
}

function mapStatus(order: any): OrderUI["status"] {
  // 🔴 HARD FAILSAFE (dispute first)
  if (order.escrow_status === "disputed") return "disputed";

  // ✅ COMPLETED FLOW
  if (order.order_status === "completed") return "completed";

  // ✅ SHIPPING STATES
  if (order.shipping_status === "delivered") return "delivered";
  if (order.shipping_status === "shipped") return "shipped";

  // ✅ ACTIVE ORDER
  if (order.order_status === "in_progress") return "in_progress";

  // ✅ CANCELLED
  if (order.order_status === "cancelled") return "cancelled";

  return "pending";
}