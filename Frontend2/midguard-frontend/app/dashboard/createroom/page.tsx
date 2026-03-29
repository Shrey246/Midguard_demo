"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function CreateRoomPage() {
  const router = useRouter();

  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    product_name: "",
    description: "",
    base_price: "",
    used_duration: "",
    warranty_remaining: "",
    original_box_available: false,
    invoice_available: false,
    room_type: "public",

    room_password: "",
    auction_duration: "",
  });

  // 🔐 TOKEN CHECK
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const now = Date.now() / 1000;

      if (payload.exp < now) {
        localStorage.removeItem("token");
        router.push("/login");
      }
    } catch {
      router.push("/login");
    }
  }, []);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);

    if (form.room_type === "digital" && fileArray.length > 1) {
      alert("Digital room allows only 1 image");
      return;
    }

    if (form.room_type !== "digital" && fileArray.length > 5) {
      alert("Max 5 images allowed");
      return;
    }

    setImages(fileArray);
  };

  const handleSubmit = async () => {
    if (loading) return;

    try {
      setLoading(true);

      // 🔥 BASIC VALIDATION
      if (!form.product_name || !form.base_price) {
        alert("Product name and price are required");
        return;
      }

      if (isNaN(Number(form.base_price))) {
        alert("Price must be a number");
        return;
      }

      // 🔥 PREPARE PAYLOAD
      const payload: any = {
        ...form,
        base_price: Number(form.base_price),
      };

      // 🔥 CLEANUP
      if (form.room_type !== "private") {
        delete payload.room_password;
      }

      if (form.room_type !== "auction") {
        delete payload.auction_duration;
      }

      // 🔥 CREATE ROOM
      const res = await api.createRoom(payload);

      if (!res.success) {
        throw new Error(res.error || "Failed to create room");
      }

      const roomUid = res.data.room_uid;

      // 🔥 UPLOAD IMAGES (SAFE LOOP)
      for (const file of images) {
        try {
          const formData = new FormData();

          formData.append("file", file);
          formData.append("context_type", "room");
          formData.append("context_id", roomUid);
          formData.append("purpose", "listing_image");

          await api.uploadAsset(formData);
        } catch (err) {
          console.error("Image upload failed:", err);
        }
      }

      // 🔥 REDIRECT
      router.push(`/dashboard/rooms/${roomUid}`);

    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to create room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center px-4 py-6 bg-gradient-to-b from-white to-gray-100 dark:from-black dark:to-[#0a0a0a]">
      <div className="w-full max-w-4xl p-4 sm:p-6 rounded-2xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5">

        <h1 className="text-xl sm:text-2xl font-bold mb-6">
          Create a New Room
        </h1>

        {/* PRODUCT */}
        <section className="mb-6">
          <h2 className="font-semibold mb-2">Product Details</h2>

          <input
            name="product_name"
            placeholder="Product Name"
            onChange={handleChange}
            className="w-full mb-3 p-3 rounded-lg bg-gray-100 dark:bg-white/5"
          />

          <textarea
            name="description"
            placeholder="Description"
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-gray-100 dark:bg-white/5"
          />
        </section>

        {/* CONDITION */}
        <section className="mb-6">
          <h2 className="font-semibold mb-2">Condition & Pricing</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <input
              name="used_duration"
              placeholder="Used Duration"
              onChange={handleChange}
              className="p-3 rounded-lg bg-gray-100 dark:bg-white/5"
            />

            <input
              name="warranty_remaining"
              placeholder="Warranty Remaining"
              onChange={handleChange}
              className="p-3 rounded-lg bg-gray-100 dark:bg-white/5"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <input
              name="base_price"
              placeholder="Price"
              onChange={handleChange}
              className="p-3 rounded-lg bg-gray-100 dark:bg-white/5"
            />

            <select
              name="room_type"
              onChange={handleChange}
              className="p-3 rounded-lg bg-gray-100 dark:bg-white/5"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="auction">Auction</option>
              <option value="digital">Digital</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 text-sm">
            <label>
              <input type="checkbox" name="original_box_available" onChange={handleChange} /> Box Available
            </label>

            <label>
              <input type="checkbox" name="invoice_available" onChange={handleChange} /> Invoice Available
            </label>
          </div>
        </section>

        {/* PRIVATE */}
        {form.room_type === "private" && (
          <section className="mb-6 p-4 rounded-xl border bg-yellow-50 dark:bg-yellow-900/10">
            <h2 className="font-semibold mb-2">Private Room Security</h2>

            <input
              name="room_password"
              placeholder="Set Room Password"
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-gray-100 dark:bg-white/5"
            />
          </section>
        )}

        {/* AUCTION */}
        {form.room_type === "auction" && (
          <section className="mb-6 p-4 rounded-xl border bg-blue-50 dark:bg-blue-900/10">
            <h2 className="font-semibold mb-2">Auction Duration</h2>

            <select
              name="auction_duration"
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-gray-100 dark:bg-white/5"
            >
              <option value="">Select Duration</option>
              <option value="1">1 Hour</option>
              <option value="2">2 Hours</option>
              <option value="3">3 Hours</option>
            </select>
          </section>
        )}

        {/* MEDIA */}
        <section className="mb-6">
          <h2 className="font-semibold mb-2">Upload Images</h2>

          <input
            type="file"
            multiple
            onChange={(e) => handleImageChange(e.target.files)}
            className="mb-3"
          />

          <p className="text-sm text-gray-400">
            {form.room_type === "digital"
              ? "Only 1 image allowed"
              : "Max 5 images allowed"}
          </p>
        </section>

        {/* SUBMIT */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-semibold disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Room"}
        </button>
      </div>
    </div>
  );
}