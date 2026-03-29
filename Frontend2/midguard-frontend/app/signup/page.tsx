"use client";

import AuthLayout from "@/components/auth/AuthLayout";
import InputField from "@/components/auth/InputField";
import SocialButtons from "@/components/auth/SocialButtons";
import { User, Lock, Mail, Phone } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "", // ✅ IMPORTANT
    password: "",
    confirmPassword: "",
  });

  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ THIS WAS MISSING
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      return alert("Passwords do not match");
    }

    try {
      const res = await api.register({
        fullName: form.fullName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        password: form.password,
      });

      if (!res.success) {
        return alert(res.message);
      }

      alert("Signup successful");

      // ✅ redirect to login
      router.push("/login");

    } catch (err) {
      console.error(err);
      alert("Signup failed");
    }
  };

  return (
    <AuthLayout>
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Create Your Account
        </h2>
        <p className="text-gray-400 text-sm mt-2">
          Step into the future of shopping
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 items-center">

        {/* ✅ CONNECTED FORM */}
        <form onSubmit={handleSubmit}>

          <InputField
            icon={<User size={18} />}
            name="fullName"
            type="text"
            placeholder="Full Name"
            value={form.fullName}
            onChange={handleChange}
          />

          <InputField
            icon={<Mail size={18} />}
            name="email"
            type="text"
            placeholder="Your Email"
            value={form.email}
            onChange={handleChange}
          />

          <InputField
            icon={<Phone size={18} />}
            name="phoneNumber" // ✅ FIXED
            type="text"
            placeholder="Phone Number"
            value={form.phoneNumber}
            onChange={handleChange}
          />

          <InputField
            icon={<Lock size={18} />}
            name="password"
            type="password"
            placeholder="Create Password"
            value={form.password}
            onChange={handleChange}
            toggle={showPass}
            setToggle={setShowPass}
          />

          <InputField
            icon={<Lock size={18} />}
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            toggle={showConfirm}
            setToggle={setShowConfirm}
          />

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-semibold"
          >
            Create Account
          </button>
        </form>

        <SocialButtons type="signup" />
      </div>

      <p className="text-center text-sm text-gray-400 mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-cyan-400">
          Login Now
        </Link>
      </p>
    </AuthLayout>
  );
}