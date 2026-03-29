"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminApi } from "@/lib/AdminApi";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await adminApi.login({ email, password });

      const token = res.token || res.data?.token;
      if (!token) throw new Error("Invalid login");

      localStorage.setItem("adminToken", token);
      router.push("/Admin/Dashboard/");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-screen flex items-center justify-center overflow-hidden">
      
      {/* 🌊 Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-700 animate-gradient" />

      {/* 🔵 Floating blobs */}
      <div className="absolute w-[500px] h-[500px] bg-blue-300 opacity-30 blur-3xl rounded-full top-[-150px] left-[-150px] animate-blob" />
      <div className="absolute w-[400px] h-[400px] bg-indigo-400 opacity-30 blur-3xl rounded-full bottom-[-100px] right-[-100px] animate-blob animation-delay-2000" />

      {/* 💎 Glass Card */}
      <div className="z-10 w-[360px] p-8 rounded-3xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl text-white text-center">
        
        {/* 👤 Icon */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-900 flex items-center justify-center shadow-lg">
          <span className="text-xl">👤</span>
        </div>

        <h2 className="text-lg tracking-widest mb-6 opacity-80">
          ADMIN LOGIN
        </h2>

        {error && (
          <div className="mb-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* EMAIL */}
        <input
          type="email"
          placeholder="EMAIL ID"
          className="w-full mb-4 p-3 rounded-full bg-transparent border border-white/40 placeholder-white/60 outline-none focus:border-white"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="PASSWORD"
          className="w-full mb-6 p-3 rounded-full bg-transparent border border-white/40 placeholder-white/60 outline-none focus:border-white"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* BUTTON */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-3 rounded-full bg-blue-900 hover:bg-blue-800 transition shadow-lg"
        >
          {loading ? "Signing in..." : "LOGIN"}
        </button>
      </div>

      {/* 🎬 Animations */}
      <style jsx global>{`
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradientMove 10s ease infinite;
        }

        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }

        .animate-blob {
          animation: blob 8s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}