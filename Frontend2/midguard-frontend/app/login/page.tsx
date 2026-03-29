"use client";

import AuthLayout from "@/components/auth/AuthLayout";
import InputField from "@/components/auth/InputField";
import SocialButtons from "@/components/auth/SocialButtons";
import { User, Lock } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [show, setShow] = useState(false);
  const router = useRouter();


  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ THIS WAS MISSIN
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      const res = await api.login(form);

      if (!res.success) {
        return alert(res.message);
      }

      // ✅ IMPORTANT: token is inside data
      const token = res.data.token;

      localStorage.setItem("token", token);
      console.log(res);
      localStorage.setItem("userId", res.data.user.publicId);


      // ✅ redirect after login
      router.push("/dashboard");

    } catch (err) {
      console.error(err);
      alert("Login failed");
    }
  };

  return (
    <AuthLayout>
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Welcome Back!
        </h2>
        <p className="text-gray-400 text-sm mt-2">
          Login to access your account
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 items-center">

        {/* ✅ CONNECTED FORM */}
        <form onSubmit={handleSubmit}>

          <InputField
            icon={<User size={18} />}
            name="email"
            type="text"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
          />

          <InputField
            icon={<Lock size={18} />}
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            toggle={show}
            setToggle={setShow}
          />

          <div className="flex justify-between text-sm text-gray-400 mb-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" /> Remember Me
            </label>
            <span className="text-cyan-400 cursor-pointer">Forgot Password?</span>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-semibold"
          >
            Login
          </button>
        </form>

        <SocialButtons type="login" />
      </div>

      <p className="text-center text-sm text-gray-400 mt-6">
        Don't have an account?{" "}
        <Link href="/signup" className="text-cyan-400">
          Sign Up Now
        </Link>
      </p>
    </AuthLayout>
  );
}