"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function FloatingActions() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [roomId, setRoomId] = useState("");

  const handleJoin = () => {
    if (!roomId) return;
    router.push(`/dashboard/rooms/${roomId}`);
  };

  return (
    <>
      {/* BUTTONS */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">

        {/* CREATE ROOM */}
        <button
          onClick={() => router.push("/dashboard/createroom")}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-semibold shadow-lg hover:scale-105 transition"
        >
          Create Room +
        </button>

        {/* JOIN ROOM */}
        <button
          onClick={() => setOpen(true)}
          className="px-5 py-3 rounded-xl bg-red-500 text-white font-semibold shadow-lg hover:scale-105 transition"
        >
          Join Room →
        </button>
      </div>

      {/* OVERLAY + MODAL */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">

          {/* BACKDROP */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* MODAL */}
          <div className="relative z-[110] w-[400px] p-6 rounded-2xl bg-white dark:bg-black border border-gray-300 dark:border-white/10 shadow-xl">

            {/* CLOSE */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-gray-500"
            >
              ✕
            </button>

            <h2 className="text-lg font-semibold text-center mb-4">
              Join Room
            </h2>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm text-gray-500">Room ID:</span>
              <input
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Enter Room ID"
                className="flex-1 px-3 py-2 rounded-lg border bg-gray-100 dark:bg-white/5"
              />
            </div>

            <button
              onClick={handleJoin}
              className="w-full py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-semibold"
            >
              JOIN
            </button>
          </div>
        </div>
      )}
    </>
  );
}