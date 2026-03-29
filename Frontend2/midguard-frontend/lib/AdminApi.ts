const ADMIN_BASE = "http://localhost:5000/api/admin";

const getAdminToken = () => localStorage.getItem("adminToken");

const adminFetch = async (url: string, options: any = {}) => {
  const token = getAdminToken();

  const res = await fetch(`${ADMIN_BASE}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    throw new Error(data?.error || "Admin API Error");
  }

  return data;
};

export const adminApi = {
  // 🔐 AUTH
  login: async (data: any) => {
    const res = await fetch(`${ADMIN_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result?.error || "Login failed");
    }

    if (result.token) {
      localStorage.setItem("adminToken", result.token);
    }

    return result;
  },

  logout: async () => {
    await adminFetch("/auth/logout", { method: "POST" });
    localStorage.removeItem("adminToken");
  },

  // 🔥 ADD THIS (FIX YOUR ERROR)
getMe: async () => {
  const token = getAdminToken();
  if (!token) throw new Error("NO_TOKEN");

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));

    return {
      admin_id: payload.admin_id,
      role: payload.role,
    };
  } catch {
    throw new Error("INVALID_TOKEN");
  }
},

  // 🏠 ROOMS
  getRooms: (query = "") =>
    adminFetch(`/rooms${query}`),

  activateRoom: (roomUid: string) =>
    adminFetch(`/rooms/${roomUid}/activate`, { method: "POST" }),

  cancelRoom: (roomUid: string) =>
    adminFetch(`/rooms/${roomUid}/cancel`, { method: "POST" }),

  // 📦 ORDERS
  getOrders: (query = "") =>
    adminFetch(`/orders${query}`),

  // 💰 ESCROW
  releaseEscrow: (sessionId: string) =>
    adminFetch(`/escrow/${sessionId}/release`, { method: "POST" }),

  // 💸 WALLET
  adjustWallet: (data: any) =>
    adminFetch(`/wallet/adjust`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // ⚖️ DISPUTES
  getDisputes: () =>
    adminFetch(`/disputes`),

  resolveDispute: (data: any) =>
    adminFetch(`/disputes/resolve`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

    // 👑 ADMIN MANAGEMENT
    createAdmin: (data: {
      email: string;
      password: string;
      role: "support" | "operations" | "super" | "superadmin";
    }) =>
      adminFetch(`/admins/create`, {
        method: "POST",
        body: JSON.stringify(data),
      }),

      // 👤 USERS
    getUsers: () => adminFetch("/users"),

    getUser: (id: string) =>
      adminFetch(`/users/${id}`),
};