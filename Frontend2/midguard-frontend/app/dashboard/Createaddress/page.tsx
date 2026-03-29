"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function CreateAddress() {
  const router = useRouter();

  const [form, setForm] = useState({
    label: "home",
    full_name: "",
    phone_number: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
    is_default: false,
  });

  // 🔒 AUTH GUARD
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }
  }, []);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    try {
      await api.createAddress(form);
      router.push("/dashboard/address");
    } catch (err) {
      console.error(err);

      // fallback (token expired etc.)
      localStorage.removeItem("token");
      router.push("/login");
    }
  };

  return (
    <div
      className="
      p-4 sm:p-6 min-h-screen
      bg-white text-black
      dark:bg-black dark:text-white
      transition-all duration-300
    "
    >
      <div className="max-w-xl mx-auto">

        <h1 className="text-xl sm:text-2xl font-bold mb-6">
          Add New Address
        </h1>

        <div className="space-y-4">

          {/* LABEL */}
          <select
            name="label"
            onChange={handleChange}
            className="
              w-full p-2.5 rounded-lg
              bg-gray-100 dark:bg-white/10
              border border-gray-300 dark:border-white/10
              outline-none
            "
          >
            <option value="home">Home</option>
            <option value="work">Work</option>
            <option value="other">Other</option>
          </select>

          {/* INPUTS */}
          <Input name="full_name" placeholder="Full Name" onChange={handleChange} />
          <Input name="phone_number" placeholder="Phone Number" onChange={handleChange} />
          <Input name="postal_code" placeholder="Pincode" onChange={handleChange} />
          <Input name="address_line1" placeholder="Flat, Building..." onChange={handleChange} />
          <Input name="address_line2" placeholder="Area, Street..." onChange={handleChange} />
          <Input name="city" placeholder="City" onChange={handleChange} />
          <Input name="state" placeholder="State" onChange={handleChange} />

          {/* CHECKBOX */}
          <label className="flex gap-2 items-center text-sm">
            <input
              type="checkbox"
              name="is_default"
              onChange={handleChange}
            />
            Make default
          </label>

          {/* BUTTON */}
          <button
            onClick={handleSubmit}
            className="
              w-full py-2.5 rounded-lg
              bg-cyan-500 hover:bg-cyan-600
              text-white font-semibold
              transition
            "
          >
            Add Address
          </button>

        </div>
      </div>
    </div>
  );
}

/* 🔧 REUSABLE INPUT COMPONENT */
function Input({ name, placeholder, onChange }: any) {
  return (
    <input
      name={name}
      placeholder={placeholder}
      onChange={onChange}
      className="
        w-full p-2.5 rounded-lg
        bg-gray-100 dark:bg-white/10
        border border-gray-300 dark:border-white/10
        outline-none
        focus:ring-2 focus:ring-cyan-500
        transition
      "
    />
  );
}