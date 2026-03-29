"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation"; // ✅ added router
import { api } from "@/lib/api";
import MessagePanel from "@/components/rooms/MessagePanel";
import { adaptMessage } from "@/lib/adapters/messageadapter";
import ImageView from "@/components/rooms/ImageView";

// ================= DELIVERY STEPS =================
const DELIVERY_STEPS = [
  "funds_received",
  "in_transit",
  "delivered",
  "released",
];

// ================= COMPONENT =================
export default function EscrowPage() {
  const params = useParams();
  const router = useRouter(); // ✅ added
  const routeSessionId = params.sessionId as string;

  // ================= STATE =================
  const [escrow, setEscrow] = useState<any>(null);
  const [order, setOrder] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [images, setImages] = useState<string[]>([]);

  const sessionUid = escrow?.session_id;

  // ================= 🔒 AUTH GUARD =================
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
  }, []);

  // ================= FETCH ESCROW =================
  const fetchEscrow = async () => {
    try {
      if (!routeSessionId) return;

      const res = await api.getEscrow(routeSessionId);

      if (!res || !res.escrow) {
        console.error("❌ Invalid escrow response:", res);
        return;
      }

      setEscrow(res.escrow);
      setOrder(res.order);

    } catch (err) {
      console.error("❌ Escrow fetch error:", err);

      // 🔒 fallback protection
      localStorage.removeItem("token");
      router.push("/login");
    }
  };

  // ================= FETCH MESSAGES =================
  const fetchMessages = async (sessionId: string) => {
    try {
      if (!sessionId) return;

      const raw = await api.getMessages(sessionId);

      const adapted = raw
        .map((m: any) => {
          const adaptedMsg = adaptMessage(m);

          if (!adaptedMsg) {
            console.error("❌ Dropped invalid message:", m);
          }

          return adaptedMsg;
        })
        .filter(Boolean);

      setMessages(adapted);

    } catch (err) {
      console.error("❌ Failed to load messages:", err);
    }
  };

  // ================= FETCH IMAGES =================
  useEffect(() => {
    if (!order?.room_uid) return;

    const fetchImages = async () => {
      try {
        const res = await api.getRoomAssets(order.room_uid);

        const assets =
          res?.assets ||
          res?.data?.assets ||
          [];

        const urls = assets
          .filter((a: any) => a.purpose === "listing_image")
          .map((a: any) => a.file_url);

        setImages(urls);

      } catch (err) {
        console.error("❌ Failed to load images:", err);
      }
    };

    fetchImages();
  }, [order?.room_uid]);

  // ================= SEND MESSAGE =================
  const sendMessage = async (msg: string, file?: File) => {
    try {
      if (file) {
        console.log("File upload not implemented yet");
        return;
      }

      if (!sessionUid) {
        console.error("❌ No sessionUid available");
        return;
      }

      const rawMessage = await api.sendMessage(sessionUid, msg);

      const newMsg = adaptMessage(rawMessage);

      if (!newMsg) {
        console.error("❌ Invalid sent message:", rawMessage);
        return;
      }

      setMessages((prev) => [...prev, newMsg]);

    } catch (err: any) {
      console.error("❌ Send failed:", err);
    }
  };

  // ================= DELIVERY ACTIONS =================
  const markShipped = async () => {
    try {
      if (!sessionUid) return;

      await api.shipOrder(sessionUid, {
        courierName: "Delhivery",
        trackingLink: "https://tracking.link",
      });

      fetchEscrow();

    } catch (err) {
      console.error("❌ Ship failed:", err);
    }
  };

  const confirmDelivery = async () => {
    try {
      if (!sessionUid) return;

      await api.confirmDelivery(sessionUid);
      fetchEscrow();

    } catch (err) {
      console.error("❌ Confirm delivery failed:", err);
    }
  };

  // ================= INIT =================
  useEffect(() => {
    if (!routeSessionId) return;

    setMessages([]);
    setEscrow(null);
    setOrder(null);

    fetchEscrow();
  }, [routeSessionId]);

  useEffect(() => {
    if (!sessionUid) return;

    fetchMessages(sessionUid);
  }, [sessionUid]);

  // ================= DELIVERY UI =================
  const getStepIndex = (status: string) => {
    return DELIVERY_STEPS.indexOf(status);
  };

  const currentStep = escrow
    ? getStepIndex(escrow.escrow_status)
    : 0;

  const formatStep = (step: string) => {
    switch (step) {
      case "funds_received": return "Payment Secured";
      case "in_transit": return "Shipped";
      case "delivered": return "Delivered";
      case "released": return "Payment Released";
      default: return step;
    }
  };

  return (
    <div className="
      p-4 sm:p-6 space-y-6 min-h-screen
      bg-white text-black
      dark:bg-black dark:text-white
      transition-all duration-300
    ">

      <div className="text-lg sm:text-xl font-semibold border-b pb-3 border-gray-300 dark:border-white/10">
        Escrow Session
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">

        <ImageView images={images} />

        <div className="border border-gray-300 dark:border-white/10 p-4 space-y-2 max-h-[260px] overflow-y-auto bg-gray-100 dark:bg-transparent rounded-lg">

          <div><b>Amount:</b> ₹{order?.final_amount}</div>
          <div><b>Platform Fee:</b> ₹{order?.platform_fee}</div>
          <div><b>Seller Gets:</b> ₹{order?.seller_net_amount}</div>

          <div><b>Buyer:</b> {escrow?.buyer_public_id}</div>
          <div><b>Seller:</b> {escrow?.seller_public_id}</div>

          <div><b>Payment:</b> {order?.payment_status}</div>
          <div><b>Shipping:</b> {order?.shipping_status}</div>

          <div><b>Courier:</b> {order?.courier_name || "N/A"}</div>
          <div><b>Tracking:</b> {order?.tracking_link || "N/A"}</div>

          <div><b>Escrow Status:</b> {escrow?.escrow_status}</div>
        </div>

        <div className="border border-gray-300 dark:border-white/10 p-4 flex flex-col justify-between bg-gray-100 dark:bg-transparent rounded-lg">

          <div>
            <div className="font-semibold mb-4">Delivery Progress</div>

            {DELIVERY_STEPS.map((step, index) => {
              const isCompleted = index <= currentStep;

              return (
                <div key={step} className="flex items-center mb-3">
                  <div
                    className={`w-4 h-4 rounded-full mr-3 ${
                      isCompleted ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                  <div className={isCompleted ? "" : "text-gray-400"}>
                    {formatStep(step)}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 space-y-2 border-t pt-3 border-gray-300 dark:border-white/10">

            {order?.shipping_status === "not_shipped" && (
              <button
                onClick={markShipped}
                className="bg-blue-500 text-white px-3 py-1 text-sm w-full rounded"
              >
                Mark as Shipped
              </button>
            )}

            {escrow?.escrow_status === "in_transit" && (
              <button
                onClick={confirmDelivery}
                className="bg-green-600 text-white px-3 py-1 text-sm w-full rounded"
              >
                Confirm Delivery
              </button>
            )}

          </div>

        </div>
      </div>

      {sessionUid && (
        <MessagePanel
          sessionId={sessionUid}
          messages={messages}
          currentUser="you"
          onSend={sendMessage}
        />
      )}
    </div>
  );
}