"use client";

import { useState, useMemo, useEffect } from "react";

type Bid = {
  user: string;
  amount: number;
};

type Props = {
  bids: Bid[];
  currentUser: string;
  isEnded?: boolean;
  endTime: string;
  onPlaceBid: (amount: number) => void;
};

export default function BidPanel({
  bids,
  currentUser,
  endTime,
  onPlaceBid,
  isEnded = false,
}: Props) {
  const [input, setInput] = useState("");
  const [timeLeft, setTimeLeft] = useState("");

  const highestBid = useMemo(() => {
    if (!bids.length) return 0;
    return Math.max(...bids.map((b) => b.amount));
  }, [bids]);

  const minBid = Math.ceil(highestBid * 1.25);

  const topBidders = useMemo(() => {
    return [...bids]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);
  }, [bids]);

  useEffect(() => {
    if (!endTime) return;

    const interval = setInterval(() => {
      const diff = new Date(endTime).getTime() - Date.now();

      if (diff <= 0) {
        setTimeLeft("Ended");
        clearInterval(interval);
        return;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);

      setTimeLeft(`${h}h ${m}m ${s}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  const isValid =
    input &&
    Number(input) >= minBid &&
    timeLeft !== "Ended" &&
    !isEnded;

  const handleClick = () => {
    if (!isValid) return;

    onPlaceBid(Number(input));
    setInput("");
  };

  return (
    <div className="
      bg-gray-100 dark:bg-white/5 backdrop-blur-xl
      p-4 sm:p-6 rounded-2xl shadow-lg space-y-5 sm:space-y-6
      transition-all duration-300
    ">
      
      {/* TOP BIDDERS */}
      <div>
        <h3 className="font-semibold mb-3 text-sm sm:text-base">
          Top Bidders
        </h3>

        <div className="space-y-2">
          {topBidders.map((b, i) => (
            <div
              key={i}
              className={`
                flex justify-between p-2 rounded-lg text-sm sm:text-base
                ${b.user === currentUser
                  ? "bg-orange-500/20"
                  : "bg-gray-200 dark:bg-white/10"}
              `}
            >
              <span className="truncate">
                #{i + 1} {b.user}
              </span>
              <span>₹{b.amount}</span>
            </div>
          ))}

          {!topBidders.length && (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No bids yet
            </p>
          )}
        </div>
      </div>

      {/* TIMER */}
      <div className="text-center">
        <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
          Time Remaining
        </p>
        <div
          className={`
            text-xl sm:text-2xl font-bold
            ${timeLeft === "Ended"
              ? "text-red-500"
              : "text-green-500"}
          `}
        >
          {timeLeft || "--"}
        </div>
      </div>

      {/* BID INPUT */}
      <div className="space-y-3">
        <input
          type="number"
          placeholder={`Min ₹${minBid}`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isEnded}
          className="
            w-full p-2.5 sm:p-3 rounded-xl
            bg-gray-200 dark:bg-white/10
            text-black dark:text-white
            outline-none
            disabled:opacity-50
          "
        />

        <p className="text-xs text-gray-500 dark:text-gray-400">
          Minimum bid: ₹{minBid}
        </p>

        <button
          onClick={handleClick}
          disabled={!isValid}
          className={`
            w-full py-2.5 sm:py-3 rounded-xl font-semibold transition text-white
            ${isValid
              ? "bg-orange-500 hover:bg-orange-600"
              : "bg-gray-500 cursor-not-allowed"}
          `}
        >
          {isEnded || timeLeft === "Ended"
            ? "Auction Ended"
            : "Place Bid"}
        </button>
      </div>
    </div>
  );
}