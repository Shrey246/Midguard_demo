// =============================
// FILE: components/auth/AuthLayout.tsx (COMMON WRAPPER)
// =============================
"use client";

import { motion } from "framer-motion";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">

      {/* Animated Background */}
      <div className="absolute w-[600px] h-[600px] bg-cyan-500 opacity-20 blur-[120px] animate-pulse top-[-100px] left-[-100px]" />
      <div className="absolute w-[600px] h-[600px] bg-purple-600 opacity-20 blur-[120px] animate-pulse bottom-[-100px] right-[-100px]" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-8 w-[900px] max-w-[95%]"
      >
        {children}
      </motion.div>
    </div>
  );
}





