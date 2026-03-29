"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { adaptRoom } from "@/lib/adapters/roomadapater";
import ProductCard from "@/components/Product/Productcard";

export default function RoomsByTypePage() {
  const params = useParams();
  const type = params?.type as string;

  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!type) return;

    const fetchRooms = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/rooms?type=${type}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
          }
        );

        const data = await res.json();

        // ✅ SAFE handling (matches your backend)
        const adapted = (data.data || []).map(adaptRoom);

        setRooms(adapted);
      } catch (err) {
        console.error("❌ Failed to fetch rooms:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [type]);

  return (
    <div className="p-6">
      {/* HEADER */}
      <h1 className="text-2xl font-bold capitalize mb-6">
        {type} Rooms
      </h1>

      {/* LOADING */}
      {loading && (
        <p className="text-gray-400">Loading rooms...</p>
      )}

      {/* EMPTY */}
      {!loading && rooms.length === 0 && (
        <p className="text-gray-400">No rooms found</p>
      )}

      {/* GRID */}
      {!loading && rooms.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {rooms.map((room) => (
            <ProductCard key={room.id} room={room} />
          ))}
        </div>
      )}
    </div>
  );
}