"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

// ✅ Type safety (prevents many runtime bugs)
type WishlistItem = {
  room_uid: string;
  product_name: string;
  base_price: string;
  listing_status: string;
  room_type: "auction" | "public" | "private" | "digital";
  added_at: string;
};

const SECTION_TYPES: { key: WishlistItem["room_type"]; label: string }[] = [
  { key: "auction", label: "Auction Rooms" },
  { key: "public", label: "Public Rooms" },
  { key: "private", label: "Private Rooms" },
  { key: "digital", label: "Digital Rooms" },
];

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    auction: true,
    public: true,
    private: true,
    digital: true,
  });

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const data = await api.getWishlist();
      setWishlist(data || []);
    } catch (err) {
      console.error("❌ Failed to fetch wishlist:", err);
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleRemove = async (roomUid: string) => {
    try {
      await api.toggleWishlist(roomUid);

      // ✅ optimistic UI update
      setWishlist((prev) =>
        prev.filter((item) => item.room_uid !== roomUid)
      );
    } catch (err) {
      console.error("❌ Failed to remove wishlist item:", err);
    }
  };

  // ✅ Safe grouping (prevents undefined issues)
  const grouped: Record<string, WishlistItem[]> = SECTION_TYPES.reduce(
    (acc, type) => {
      acc[type.key] = wishlist.filter(
        (item) => item.room_type === type.key
      );
      return acc;
    },
    {} as Record<string, WishlistItem[]>
  );

  if (loading) {
    return <div className="p-6">Loading wishlist...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">My Wishlist</h1>

      {SECTION_TYPES.map((section) => {
        const items = grouped[section.key] || [];

        return (
          <div key={section.key} className="border rounded-2xl shadow">
            {/* HEADER */}
            <div
              onClick={() => toggleSection(section.key)}
              className="cursor-pointer flex justify-between items-center p-4 bg-gray-100 rounded-2xl"
            >
              <h2 className="text-lg font-semibold">{section.label}</h2>
              <span>{openSections[section.key] ? "▲" : "▼"}</span>
            </div>

            {/* CONTENT */}
            {openSections[section.key] && (
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.length === 0 ? (
                  <p className="text-gray-500">No items</p>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.room_uid}
                      className="border rounded-xl p-4 shadow-sm hover:shadow-md transition"
                    >
                      <h3 className="font-semibold text-lg">
                        {item.product_name}
                      </h3>

                      <p className="text-sm text-gray-500">
                        ₹{Number(item.base_price).toLocaleString()}
                      </p>

                      <p className="text-xs mt-1">
                        Status: {item.listing_status}
                      </p>

                      <p className="text-xs text-gray-400 mt-1">
                        Added:{" "}
                        {item.added_at
                          ? new Date(item.added_at).toLocaleString()
                          : "N/A"}
                      </p>

                      <button
                        onClick={() => handleRemove(item.room_uid)}
                        className="mt-3 text-red-500 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
