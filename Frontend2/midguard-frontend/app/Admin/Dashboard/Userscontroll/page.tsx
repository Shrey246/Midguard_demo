"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/AdminApi";
import { adaptUser } from "@/lib//adapters/adminadapter";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const res = await adminApi.getUsers();
      setUsers(res.map(adaptUser));
    };
    load();
  }, []);

  return (
    <div className="p-6 text-white min-h-screen bg-gradient-to-br from-blue-500 to-indigo-700">
      <h1 className="text-2xl mb-6">Users</h1>

      <div className="space-y-3">
        {users.map((u) => (
          <div
            key={u.id}
            className="p-4 bg-white/10 rounded-xl flex justify-between"
          >
            <div>
              <p>{u.email}</p>
              <p className="text-xs opacity-70">{u.id}</p>
            </div>
            <button className="px-3 py-1 bg-blue-900 rounded">
              View
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}