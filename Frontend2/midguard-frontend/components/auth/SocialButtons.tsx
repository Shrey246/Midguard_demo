// =============================
// FILE: components/auth/SocialButtons.tsx (COMMON SOCIAL)
// =============================

import { motion } from "framer-motion";

export default function SocialButtons({ type }: { type: "login" | "signup" }) {
  return (
    <div className="border-l border-white/10 pl-6">
      <p className="text-gray-400 text-sm text-center mb-4">
        {type === "login" ? "Or login with a single click" : "Sign up with a single click"}
      </p>

      {["Google", "Facebook", "Apple"].map((item, i) => (
        <motion.button
          key={i}
          whileHover={{ scale: 1.03 }}
          className="w-full py-3 mb-3 rounded-lg border border-white/10 text-white hover:border-cyan-400 transition"
        >
          {type === "login" ? "Login" : "Sign Up"} with {item}
        </motion.button>
      ))}
    </div>
  );
}

