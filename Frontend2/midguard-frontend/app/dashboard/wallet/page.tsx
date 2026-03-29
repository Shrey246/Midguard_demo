"use client";

import { api } from "@/lib/api";
import { useEffect, useState } from "react";

export default function WalletPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
    const [wallet, setWallet] = useState<any>(null);

        useEffect(() => {
          fetchLedger();
          fetchWallet();

          const id = localStorage.getItem("userId");
          setUserId(id);
        }, []);

        const fetchWallet = async () => {
          try {
            const data = await api.getWallet();
            setWallet(data.data);
          } catch (err) {
            console.error("Failed to fetch wallet", err);
          }
        };

        const fetchLedger = async () => {
      try {
        const data = await api.getLedger();
        setTransactions(data.transactions || []);
      } catch (err) {
        console.error("Failed to fetch ledger", err);
      }
    };



  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-1">Wallet Ledger</h1>
         <div className="flex justify-between items-start mb-6">

  {/* LEFT: USER ID */}
  <div>
    <p className="text-sm text-gray-400">
      User ID: {userId || "N/A"}
    </p>
  </div>

  {/* RIGHT: BALANCES (STACKED) */}
  <div className="text-right">

    {/* AVAILABLE */}
    <div className="mb-2">
      <p className="text-xs text-gray-400">Available Balance</p>
      <p className="text-2xl font-bold text-green-400">
        ₹{wallet?.available_balance ?? 0}
      </p>
    </div>

    {/* LOCKED */}
    <div>
      <p className="text-xs text-gray-400">Locked Balance</p>
      <p className="text-xl font-semibold text-yellow-400">
        ₹{wallet?.locked_balance ?? 0}
      </p>
    </div>

  </div>
</div>


    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full text-sm text-left">

        <thead className="bg-white/5 text-gray-400 uppercase text-xs">
          <tr>
            <th className="px-4 py-3">#</th>
            <th className="px-4 py-3">Txn ID</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Reference</th>
            <th className="px-4 py-3 text-right">Amount</th>
          </tr>
        </thead>

        <tbody>
          {transactions.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="text-center py-6 text-gray-400"
              >
                No transactions yet
              </td>
            </tr>
          ) : (
            transactions.map((tx, index) => {
              const isCredit =
                ["credit", "refund", "unlock"].includes(tx.transaction_type);

              const isDebit =
                ["debit", "lock", "escrow_in"].includes(tx.transaction_type);

              return (
                <tr
                  key={tx.transaction_uid}
                  className="border-t border-white/10 hover:bg-white/5 transition"
                >
                  <td className="px-4 py-3">{index + 1}</td>

                  <td className="px-4 py-3 font-mono text-xs">
                    {tx.transaction_uid}
                  </td>

                  <td className="px-4 py-3 text-gray-400">
                    {new Date(tx.created_at).toLocaleString()}
                  </td>

                  <td className="px-4 py-3 capitalize">
                    {tx.transaction_type}
                  </td>

                  <td className="px-4 py-3 capitalize">
                    {tx.reference_type}
                  </td>

                  <td
                    className={`px-4 py-3 text-right font-semibold ${
                      isCredit
                        ? "text-green-400"
                        : isDebit
                        ? "text-red-400"
                        : "text-gray-400"
                    }`}
                  >
                    {isCredit ? "+" : "-"} ₹{tx.amount}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>

      </table>
    </div>
  </div>
);
}