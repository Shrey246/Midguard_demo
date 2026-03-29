"use client";

import ImageView from "@/components/rooms/ImageView";
import ProductView from "@/components/rooms/ProductView";
import BidPanel from "@/components/rooms/BidPanel";
import FloatingActionPanel from "@/components/rooms/FloatingActionPanel";

import { api } from "@/lib/api";
import { adaptRoom } from "@/lib/adapters/roomadapater";
import { adaptBid } from "@/lib/adapters/bidsadapter";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();

  const roomId = params.id as string;

  const [room, setRoom] = useState<any>(null);
  const [images, setImages] = useState<string[]>([]);
  const [bids, setBids] = useState<any[]>([]);
  const [addressUid, setAddressUid] = useState<string>("");
  const [loadingAction, setLoadingAction] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  const isAuction = (room?.type || "").toLowerCase() === "auction";
  const isActive = room?.status === "active";
  const isLocked = room?.status === "locked";
  const isEnded =
    room?.endTime && new Date() > new Date(room.endTime);

  // =========================
  // FETCH ROOM
  // =========================
  useEffect(() => {
    if (!roomId) return;

    const fetchRoom = async () => {
      try {
        const res = await api.getRoom(roomId);
        const raw = res.data || res;
        setRoom(adaptRoom(raw));
      } catch (err) {
        console.error("❌ Failed to load room", err);
      }
    };

    fetchRoom();
  }, [roomId]);

  useEffect(() => {
  const token = localStorage.getItem("token");

  if (!token) {
    router.push("/login");
  }
  }, []);

  // =========================
  // POLL BIDS
  // =========================
  useEffect(() => {
    if (!room?.id || !isAuction) return;

    const interval = setInterval(async () => {
      try {
        const res = await api.getBids(room.id);

        const raw =
          res.data?.bids ||
          res.data ||
          [];

        const adapted = (Array.isArray(raw) ? raw : [])
          .map(adaptBid)
          .filter(Boolean);

        setBids(adapted);
      } catch (err) {
        console.error("Polling failed", err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [room?.id, isAuction]);

  // =========================
  // FETCH IMAGES
  // =========================
  useEffect(() => {
    if (!room?.id) return;

    const fetchImages = async () => {
      try {
        const res = await api.getRoomAssets(room.id);

        const assets =
          res.assets ||
          res.data?.assets ||
          [];

        const urls = assets
          .filter((a: any) => a.purpose === "listing_image")
          .map((a: any) => a.file_url);

        setImages(urls);
      } catch (err) {
        console.error("❌ Failed to load images", err);
      }
    };

    fetchImages();
  }, [room?.id]);

  // =========================
  // FETCH ADDRESS
  // =========================
  useEffect(() => {
    const loadAddress = async () => {
      try {
        const res = await api.getAddresses();

        const list =
          res.addresses ||
          res.data?.addresses ||
          [];

        if (!Array.isArray(list) || list.length === 0) return;

        const defaultAddr =
          list.find((a: any) => a.is_default) || list[0];

        setAddressUid(defaultAddr.address_uid);
      } catch (err) {
        console.error("❌ Failed to load address", err);
      }
    };

    loadAddress();
  }, []);

  // =========================
  // Fetch Wishlist
  // =========================
  useEffect(() => {
    if (!room?.id) return;

    const checkWishlist = async () => {
      try {
        const res = await api.isWishlisted(room.id);
        setWishlisted(res);
      } catch (err) {
        console.error("❌ Failed to check wishlist", err);
      }
    };

    checkWishlist();
  }, [room?.id]);

  // =========================
  // ACTION HANDLERS (UNCHANGED)
  // =========================
  const handleBid = async (amount: number) => {
    if (!isActive) {
      alert("Auction not active");
      return;
    }

    if (isEnded) {
      alert("Auction already ended");
      return;
    }

    try {
      const res = await api.placeBid(room.id, amount);

      const raw = res.data?.bid || res.data;
      const newBid = adaptBid(raw);

      if (!newBid) return;

      setBids((prev) => [newBid, ...prev]);
    } catch (err: any) {
      console.error("❌ Bid failed", err);
      alert(err?.message || "Bid failed");
    }
  };

  const handleBuy = async () => {
    try {
      if (!addressUid) {
        alert("Please add an address first");
        router.push("/dashboard/address");
        return;
      }

      setLoadingAction(true);

      const res = await api.createBuyOrder(
        room.id,
        addressUid,
        room.product.price,
        room.product.sellerId
      );

      if (res.success) {
        router.push(`dashboard/escrow/${res.data.session_id}`);
      } else {
        alert(res.error || "Order failed");
      }
    } catch (err: any) {
      console.error("❌ BUY ERROR:", err);
      alert("Something went wrong");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleLockDeal = async () => {
    try {
      if (!addressUid) {
        alert("Please add an address first");
        router.push("/dashboard/address");
        return;
      }

      setLoadingAction(true);

      const res = await api.createBuyOrder(
        room.id,
        addressUid,
        room.product.price,
        room.product.sellerId
      );

      if (res.success) {
        router.push(`dashboard/escrow/${res.data.session_id}`);
      }
    } catch (err: any) {
      console.error("❌ Lock deal failed", err);
      alert(err?.error || "Failed to lock deal");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleWishlist = async () => {
    try {
      const res = await api.toggleWishlist(room.id);
      setWishlisted(res.added);
    } catch (err) {
      console.error("❌ Wishlist toggle failed", err);
    }
  };

  const actionMap: any = {
    public: [
      {
        label: wishlisted ? "❤️ Wishlisted" : "🤍 Wishlist",
        onClick: handleWishlist,
      },
      {
        label: loadingAction ? "Processing..." : "Buy Now",
        onClick: handleBuy,
        variant: "primary",
      },
    ],
    private: [
      {
        label: loadingAction ? "Processing..." : "Lock-in Deal",
        onClick: handleLockDeal,
        variant: "primary",
      },
    ],
    digital: [
      {
        label: loadingAction ? "Processing..." : "Buy Now",
        onClick: handleBuy,
        variant: "primary",
      },
    ],
  };

  const actions = actionMap[room?.type] || [];

  if (!room) return <div className="p-6">Loading...</div>;

  return (
    <>
      {/* OVERLAY */}
      {!isActive && isAuction && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="
            bg-white dark:bg-black
            p-4 sm:p-6 rounded-lg text-center
            max-w-sm w-full
          ">
            <h2 className="text-lg sm:text-xl font-semibold mb-2">
              Auction Not Active
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              This auction is not active yet or has ended.
            </p>
          </div>
        </div>
      )}

      <div className="
        p-4 sm:p-6 space-y-6
        bg-white dark:bg-black
        text-black dark:text-white
        min-h-screen
      ">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

          <div className="space-y-6">
            <ImageView images={images} />
            <ProductView product={room.product} />
          </div>

          <div className="space-y-6">
            {isAuction && (
              <>
                {isLocked && (
                  <div className="text-green-600 font-semibold text-sm sm:text-base">
                    Auction closed. Waiting for winner confirmation.
                  </div>
                )}

                {isEnded && !isLocked && (
                  <div className="text-red-500 font-semibold text-sm sm:text-base">
                    Auction ended. Processing results...
                  </div>
                )}

                {isActive && !isEnded && (
                  <BidPanel
                    bids={bids}
                    currentUser="you"
                    endTime={room.endTime || ""}
                    onPlaceBid={handleBid}
                    isEnded={isEnded}
                  />
                )}
              </>
            )}
          </div>

        </div>

        {(room.type || "").toLowerCase() !== "auction" && (
          <FloatingActionPanel roomType={room.type} actions={actions} />
        )}
      </div>
    </>
  );
}