// =============================
// FILE: components/auth/InputField.tsx (COMMON INPUT)
// =============================

import { Eye, EyeOff } from "lucide-react";

export default function InputField({
  icon,
  type,
  name,
  placeholder,
  value,
  onChange,
  toggle,
  setToggle,
}: any) {
  return (
    <div className="relative mb-4">
      <div className="absolute left-3 top-3 text-gray-400">{icon}</div>

      <input
        name={name}
        type={toggle ? "text" : type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full pl-10 pr-10 py-3 rounded-lg bg-transparent border border-white/10 text-white focus:border-cyan-400 outline-none"
      />

      {type === "password" && (
        <div
          className="absolute right-3 top-3 cursor-pointer text-gray-400"
          onClick={() => setToggle(!toggle)}
        >
          {toggle ? <EyeOff size={18} /> : <Eye size={18} />}
        </div>
      )}
    </div>
  );
}

