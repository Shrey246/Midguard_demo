"use client";

import { useState } from "react";

export default function PolicyPage() {
  const [active, setActive] = useState<"privacy" | "terms">("privacy");

  return (
    <div className="min-h-screen bg-[#0b0b0f] text-white p-6">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* 🔥 TAB SWITCH */}
        <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1">
          <button
            onClick={() => setActive("privacy")}
            className={`w-1/2 py-3 rounded-xl text-sm font-medium transition ${
              active === "privacy"
                ? "bg-purple-500 text-white shadow-lg"
                : "text-gray-400"
            }`}
          >
            Privacy Policy
          </button>

          <button
            onClick={() => setActive("terms")}
            className={`w-1/2 py-3 rounded-xl text-sm font-medium transition ${
              active === "terms"
                ? "bg-purple-500 text-white shadow-lg"
                : "text-gray-400"
            }`}
          >
            Terms & Conditions
          </button>
        </div>

        {/* ================= CONTENT ================= */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6">

          {/* 🔐 PRIVACY POLICY */}
          {active === "privacy" && (
            <>
              <h1 className="text-2xl font-semibold">Privacy Policy</h1>

              <div className="border-t border-white/10 pt-6 space-y-6">

                <Section
                  number="1."
                  title="Information We Collect"
                  content="We collect personal details such as your name, email, phone number, and transaction data to provide and improve our services."
                />

                <Section
                  number="2."
                  title="Use of Information"
                  content="Your information is used to facilitate transactions, improve platform performance, and enhance user experience."
                />

                <Section
                  number="3."
                  title="Data Protection"
                  content="We implement industry-standard security measures to protect your data from unauthorized access or misuse."
                />

              </div>
            </>
          )}

          {/* 📜 TERMS & CONDITIONS */}
          {active === "terms" && (
            <>
              <h1 className="text-2xl font-semibold">Terms & Conditions</h1>

              <div className="border-t border-white/10 pt-6 space-y-6">

                <Section
                  number="1."
                  title="Acceptance of Terms"
                  content="By using MidGuard, you agree to comply with all applicable terms, conditions, and policies."
                />

                <Section
                  number="2."
                  title="User Responsibilities"
                  content="Users are responsible for providing accurate information and ensuring fair and lawful use of the platform."
                />

                <Section
                  number="3."
                  title="Intellectual Property"
                  content="All platform content, branding, and technology are owned by MidGuard and protected by applicable laws."
                />

              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

/* ================= REUSABLE SECTION ================= */

function Section({ number, title, content }: any) {
  return (
    <div className="space-y-2">
      <h2 className="text-lg font-medium">
        {number} {title}
      </h2>
      <p className="text-gray-400 text-sm leading-relaxed max-w-3xl">
        {content}
      </p>
    </div>
  );
}