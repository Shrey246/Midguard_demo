"use client";

import { useEffect, useState } from "react";
import ProductImage from "./ProductImage";
import ActionButton from "./ActionButton";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function ProductCard({ room }: any) {
  const router = useRouter();

  const [image, setImage] = useState<string | undefined>(undefined);

  // ✅ random markup (runs once per card)
  const [markup] = useState(() => {
    return Math.floor(Math.random() * 30) + 10; // 10% → 40%
  });

  const price = Math.floor(room.product.price);

  const mrp = Math.floor(price * (1 + markup / 100));

  const discountPercent = Math.floor(((mrp - price) / mrp) * 100);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const res = await api.getRoomAssets(room.id);

        if (
          res?.success &&
          Array.isArray(res.assets) &&
          res.assets.length > 0
        ) {
          const first = res.assets[0];

          const raw =
            first?.url ||
            first?.file_url ||
            first?.path ||
            first?.asset_url;

          if (raw) {
            const img = raw.startsWith("http")
              ? raw
              : `http://localhost:5000${raw}`;

            setImage(img);
          } else {
            setImage(undefined);
          }
        } else {
          setImage(undefined);
        }
      } catch (err) {
        console.error("Image fetch failed:", err);
        setImage(undefined);
      }
    };

    fetchImage();
  }, [room.id]);

  return (
    <div className="border rounded-xl p-4 bg-white/5 hover:shadow-lg transition">
      
      {/* IMAGE */}
      <ProductImage src={image} />

      {/* NAME */}
      <h2 className="mt-3 font-semibold text-sm line-clamp-2">
        {room.product.name}
      </h2>

      {/* PRICE SECTION */}
      <div className="flex items-center gap-2 mt-2 text-sm">
        
        {/* DP = Discount % */}
        <span className="px-2 py-1 border rounded text-xs">
          {discountPercent}% OFF
        </span>

        <span className="font-semibold">
          ₹{price}
        </span>
      </div>

      {/* MRP */}
      <p className="text-xs text-gray-400 line-through">
        ₹{mrp}
      </p>

      {/* BUTTON */}
      <ActionButton
        type={room.type}
        onClick={() => router.push(`/dashboard/rooms/${room.id}`)}
      />
    </div>
  );
}