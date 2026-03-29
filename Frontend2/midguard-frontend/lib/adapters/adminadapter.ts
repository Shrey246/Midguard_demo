export type AdminRole =
  | "support"
  | "operations"
  | "super"
  | "superadmin";

// 🔹 Normalize Admin Profile
export const adaptAdmin = (data: any) => ({
  adminId: data.admin_id,
  email: data.email,
  role: data.role,
  createdBy: data.created_by || null,
  isActive: data.is_active,
});

// 🔹 Rooms
export const adaptRoom = (room: any) => ({
  id: room.room_uid,
  title: room.title,
  type: room.room_type,
  status: room.listing_status,
  createdAt: room.created_at,
});

// 🔹 Orders
export const adaptOrder = (order: any) => ({
  id: order.order_uid,
  status: order.order_status,
  paymentStatus: order.payment_status,
  amount: order.amount,
  createdAt: order.created_at,
});

// 🔹 Disputes
export const adaptDispute = (d: any) => ({
  id: d.dispute_id || d.id,
  status: d.status,
  priority: d.priority,
  orderId: d.order_uid,
});

// 🔹 Escrow
export const adaptEscrow = (e: any) => ({
  sessionId: e.session_id,
  status: e.status,
});

export const adaptCreatedAdmin = (data: any) => ({
  id: data.id,
  email: data.email,
  role: data.role,
});

export const canCreateAdmin = (role: AdminRole) => {
  return role === "superadmin";
};

export const adaptUser = (u: any) => ({
  id: u.publicId,
  email: u.email,
  createdAt: u.createdAt,
});