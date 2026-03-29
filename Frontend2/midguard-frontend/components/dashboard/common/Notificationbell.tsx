"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { api } from "@/lib/api";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const loadNotifications = async () => {
    try {
      const res = await api.getNotifications();
      setNotifications(res.notifications || []);
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);

      setNotifications((prev) =>
        prev.map((n) =>
          n.notification_uid === id ? { ...n, is_read: true } : n
        )
      );
    } catch (err) {
      console.error("Failed to mark read", err);
    }
  };

  useEffect(() => {
    loadNotifications();

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        loadNotifications();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="relative">
      {/* 🔔 Bell */}
      <div
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:border-cyan-400 transition"
      >
        <Bell size={18} />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 text-[10px] px-1.5 py-0.5 bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </div>

      {/* 📦 Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-[400px] overflow-y-auto z-[100] p-3 rounded-xl bg-black/80 border border-white/10 backdrop-blur-xl shadow-xl">

          <p className="text-sm font-semibold mb-2">Notifications</p>

          {notifications.length === 0 ? (
            <p className="text-xs text-gray-400">No notifications</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.notification_uid}
                onClick={() => markAsRead(n.notification_uid)}
                className={`p-3 rounded-lg mb-2 cursor-pointer border transition
                ${
                  n.is_read
                    ? "bg-white/5 border-white/5"
                    : "bg-cyan-500/10 border-cyan-400"
                }`}
              >
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-xs text-gray-400">{n.message}</p>

                <p className="text-[10px] text-gray-500 mt-1">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}