

const BASE_URL = "http://localhost:5000/";
const Auth_URL = "http://localhost:5000/Auth";
export const api = {

  //LOGIN API
  login: async (data: any) => {
    const res = await fetch(`${Auth_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    return res.json();
  },

  //SIGNUP API
  register: async (data: any) => {
    const res = await fetch(`${Auth_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    return res.json();
  },

  //LOGOUT API
logout: async () => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${Auth_URL}/logout`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
},

  //Create Room API
  createRoom: async (data: any) => {
  const token = localStorage.getItem("token");

  const res = await fetch("http://localhost:5000/rooms", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  return res.json();
  },

   //Product Image Upload API
  uploadAsset: async (formData: FormData) => {
  return fetch("http://localhost:5000/assets/upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: formData,
  }).then(res => res.json());
  },

  //Auth
  getMe: async () => {
      const res = await fetch("http://localhost:5000/auth/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      return res.json();
  },

  //wallet API
  getWallet: async () => {
  const res = await fetch("http://localhost:5000/wallet", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  return res.json();
  },

  //Ledger API
  getLedger: async () => {
      const res = await fetch("http://localhost:5000/wallet/ledger", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }

      return res.json();
  },

// =========================
// GET MESSAGES
// =========================
getMessages: async (sessionId: string) => {
  const res = await fetch(
    `http://localhost:5000/sessions/${sessionId}/messages`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  const data = await res.json();

  // ✅ HANDLE HTTP + API ERRORS
  if (!res.ok || !data.success) {
    console.error("❌ getMessages failed:", data);
    throw new Error(data.error || "Failed to fetch messages");
  }

  // ✅ ALWAYS RETURN ARRAY
  return data.data || [];
},

// =========================
// SEND MESSAGE
// =========================
sendMessage: async (sessionId: string, body: string) => {
  if (!body || body.trim().length === 0) {
    throw new Error("Message cannot be empty");
  }

  const res = await fetch(
    `http://localhost:5000/sessions/${sessionId}/messages/text`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ body: body.trim() }),
    }
  );

  const data = await res.json();

  // ✅ HANDLE ERRORS PROPERLY
  if (!res.ok || !data.success) {
    console.error("❌ sendMessage failed:", data);
    throw new Error(data.error || "Failed to send message");
  }

  // ✅ NORMALIZE RESPONSE
  // depending on your controller:
  // data.data = { message, attachments }

  if (!data.data || !data.data.message) {
    console.error("❌ Invalid message response:", data);
    throw new Error("Invalid message response");
  }

  return data.data.message; // ✅ ALWAYS RETURN MESSAGE OBJECT
},

// Product detials APIs
  getRoom: async (roomId: string) => {
  const res = await fetch(
    `http://localhost:5000/rooms/${roomId}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  return res.json();
 },

// ASSET APIs
  getRoomAssets: async (roomId: string) => {
  const res = await fetch(
    `http://localhost:5000/assets?context_type=room&context_id=${roomId}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  return res.json();
 },

//BID APIs
//GET BIDS
  getBids: async (roomId: string) => {
  const res = await fetch(
    `http://localhost:5000/bids/room/${roomId}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  return res.json();
 },



// PLACE BID
  placeBid: async (roomId: string, amount: number) => {
  const res = await fetch(`http://localhost:5000/bids`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({
      room_uid: roomId,
      bid_amount: amount,
    }),
  });

  return res.json();
 },

 // ORDER APIs
createBuyOrder: async (roomUid: string, addressUid: string, amount: number, sellerId: string) => {
  const res = await fetch(`http://localhost:5000/orders/buy`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({
      room_uid: roomUid,
      amount,
      seller_public_id: sellerId,
      address_uid: addressUid,
    }),
  });

  return res.json();
},

// ADDRESS API
// CREATE ADDRESS
createAddress: async (data: any) => {
  const res = await fetch(`${BASE_URL}address`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(data),
  });

  return res.json();
},

// GET ALL ADDRESSES
getAddresses: async () => {
  const res = await fetch(`${BASE_URL}address`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  return res.json();
},

// DELETE ADDRESS
deleteAddress: async (id: string) => {
  const res = await fetch(`${BASE_URL}address/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  return res.json();
},

// SET DEFAULT ADDRESS
setDefaultAddress: async (id: string) => {
  const res = await fetch(`${BASE_URL}address/default`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ address_uid: id }),
  });

  return res.json();
},


// ================= ESCROW APIs =================

// 📊 GET ESCROW DETAILS
getEscrow: async (sessionId: string) => {
  const res = await fetch(
    `http://localhost:5000/escrow/${sessionId}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  return res.json();
},

// 🚚 SELLER SHIPS PRODUCT
shipOrder: async (
  sessionId: string,
  data: { courierName: string; trackingLink: string }
) => {
  const res = await fetch(
    `http://localhost:5000/escrow/${sessionId}/ship`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(data),
    }
  );

  return res.json();
},

// 📦 BUYER CONFIRMS DELIVERY
confirmDelivery: async (sessionId: string) => {
  const res = await fetch(
    `http://localhost:5000/escrow/${sessionId}/confirm`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  return res.json();
},

// 💻 DIGITAL DELIVERY (optional)
confirmDigitalDelivery: async (sessionId: string) => {
  const res = await fetch(
    `http://localhost:5000/escrow/${sessionId}/digital-delivery`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  return res.json();
},

// ⚠️ RAISE DISPUTE
raiseDispute: async (sessionId: string, reason: string) => {
  const res = await fetch(
    `http://localhost:5000/escrow/${sessionId}/dispute`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ reason }),
    }
  );

  return res.json();
},

getNotifications: async () => {
  const res = await fetch("http://localhost:5000/notifications", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  return res.json();
},

markNotificationRead: async (notificationId: string) => {
  const res = await fetch("http://localhost:5000/notifications/read", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ notificationId }),
  });

  return res.json();
},

getMyOrders: async () => {
  const res = await fetch("http://localhost:5000/orders/my", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  return res.json();
},

getSellerOrders: async () => {
    const res = await fetch("http://localhost:5000/orders/seller", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    return res.json();
},

  // =========================
// WISHLIST APIs
// =========================

// ❤️ TOGGLE WISHLIST
toggleWishlist: async (roomUid: string) => {
  const res = await fetch(
    `http://localhost:5000/wishlist/toggle/${roomUid}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  return res.json();
},

// 📦 GET WISHLIST
getWishlist: async () => {
  const res = await fetch(`http://localhost:5000/wishlist`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  const data = await res.json();

  // ✅ HANDLE ERROR (match your message APIs style)
  if (!res.ok || !data.success) {
    console.error("❌ getWishlist failed:", data);
    throw new Error(data.error || "Failed to fetch wishlist");
  }

  // ✅ NORMALIZE (frontend-friendly)
  return data.data || [];
},

// 🔍 CHECK IF WISHLISTED
isWishlisted: async (roomUid: string) => {
  const res = await fetch(
    `http://localhost:5000/wishlist/check/${roomUid}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  const data = await res.json();

  if (!res.ok || !data.success) {
    console.error("❌ isWishlisted failed:", data);
    throw new Error(data.error || "Failed to check wishlist");
  }

  return data.isWishlisted;
},

activateRoom: async (roomUid: string) => {
  const res = await fetch(
    `http://localhost:5000/rooms/${roomUid}/activate`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  return res.json();
},

joinPrivateRoom: async (roomUid: string, password: string) => {
  const res = await fetch(
    `http://localhost:5000/rooms/${roomUid}/join`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ password }),
    }
  );

  return res.json();
},

getRemainingTime: (endTime: string) => {
  if (!endTime) return 0;

  return Math.max(0, new Date(endTime).getTime() - Date.now());
},

getDashboardStats: async () => {
    const res = await fetch("http://localhost:5000/api/dashboard/stats", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const data = await res.json();

    // ✅ Handle errors properly (match your style)
    if (!res.ok || !data.success) {
      console.error("❌ getDashboardStats failed:", data);
      throw new Error(data.error || "Failed to fetch dashboard stats");
    }

    return data.data; // ✅ return clean stats object
},

}
