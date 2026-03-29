
"use client";

import { useState } from "react";

type Props = {
  licenseKey?: string;
  downloadUrl?: string;
  accessUrl?: string;
  instructions?: string;
};

export default function DigitalDeliveryPanel({
  licenseKey,
  downloadUrl,
  accessUrl,
  instructions,
}: Props) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="bg-green-500/10 border border-green-500/30 
      backdrop-blur-xl p-6 rounded-2xl shadow-lg space-y-5">

      {/* SUCCESS */}
      <h2 className="text-green-400 font-semibold text-lg">
        ✔ Payment Successful
      </h2>

      {/* LICENSE KEY */}
      {licenseKey && (
        <div>
          <p className="text-sm text-gray-400 mb-1">License Key</p>

          <div className="flex items-center gap-3">
            <div className="bg-black/40 px-4 py-2 rounded-lg font-mono">
              {revealed ? licenseKey : "••••-••••-••••"}
            </div>

            <button
              onClick={() => setRevealed(true)}
              className="text-sm bg-white/10 px-3 py-1 rounded-lg"
            >
              Reveal
            </button>

            <button
              onClick={() => navigator.clipboard.writeText(licenseKey)}
              className="text-sm bg-white/10 px-3 py-1 rounded-lg"
            >
              Copy
            </button>
          </div>
        </div>
      )}

      {/* DOWNLOAD */}
      {downloadUrl && (
        <a
          href={downloadUrl}
          target="_blank"
          className="inline-block bg-blue-500 hover:bg-blue-600 px-5 py-2 rounded-xl"
        >
          Download File
        </a>
      )}

      {/* ACCESS LINK */}
      {accessUrl && (
        <a
          href={accessUrl}
          target="_blank"
          className="block text-blue-400 underline text-sm"
        >
          Access Product
        </a>
      )}

      {/* INSTRUCTIONS */}
      {instructions && (
        <p className="text-sm text-gray-400">
          {instructions}
        </p>
      )}
    </div>
  );
}