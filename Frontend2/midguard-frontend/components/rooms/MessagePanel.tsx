"use client";

import { useState } from "react";

type Message = {
  id: string;
  sender: string;
  content: string;
  type: "text" | "image" | "file" | "system";
  createdAt?: string;
};

type Props = {
  sessionId: string;
  messages: (Message | null | undefined)[];
  currentUser: string;
  onSend: (msg: string, file?: File) => Promise<void> | void;
};

export default function MessagePanel({
  sessionId,
  messages,
  currentUser,
  onSend,
}: Props) {
  const [input, setInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!input.trim() && !file) return;

    try {
      setSending(true);

      await onSend(input.trim(), file || undefined);

      setInput("");
      setFile(null);

    } catch (err) {
      console.error("❌ Send failed:", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="
      bg-gray-100 dark:bg-white/5 backdrop-blur-xl
      rounded-2xl p-3 sm:p-4 shadow-lg
      flex flex-col
      h-[260px] sm:h-[300px] md:h-[350px]
      transition-all duration-300
    ">

      {/* HEADER */}
      <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2">
        Session: <span className="text-black dark:text-white">{sessionId}</span>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto space-y-2 text-xs sm:text-sm mb-3 pr-1">

        {messages && messages.length > 0 ? (
          messages
            .filter((msg): msg is Message => {
              if (!msg || !msg.id) {
                console.error("❌ Invalid message dropped:", msg);
                return false;
              }
              return true;
            })
            .map((msg) => {
              const isMe = msg.sender === currentUser;

              return (
                <div
                  key={msg.id}
                  className={`
                    max-w-[85%] sm:max-w-[70%]
                    p-2 rounded-lg break-words
                    ${isMe
                      ? "ml-auto bg-orange-500/20 text-right"
                      : "bg-gray-200 dark:bg-white/10"}
                  `}
                >
                  {/* TEXT */}
                  {msg.type === "text" && (
                    <p>{msg.content || "⚠️ Empty message"}</p>
                  )}

                  {/* IMAGE */}
                  {msg.type === "image" && msg.content && (
                    <img
                      src={msg.content}
                      alt="message"
                      className="rounded-lg max-h-32 sm:max-h-40"
                    />
                  )}

                  {/* FILE */}
                  {msg.type === "file" && msg.content && (
                    <a
                      href={msg.content}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-blue-500 dark:text-blue-400"
                    >
                      Download File
                    </a>
                  )}

                  {/* SYSTEM MESSAGE */}
                  {msg.type === "system" && (
                    <p className="text-gray-500 dark:text-gray-400 italic text-center">
                      {msg.content}
                    </p>
                  )}

                  {/* TIMESTAMP */}
                  {msg.createdAt && (
                    <div className="text-[10px] text-gray-500 mt-1">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </div>
                  )}
                </div>
              );
            })
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center">
            No messages yet
          </p>
        )}
      </div>

      {/* INPUT */}
      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="
            flex-1 p-2 rounded-xl
            bg-gray-200 dark:bg-white/10
            outline-none
            text-black dark:text-white
          "
        />

        <input
          type="file"
          onChange={(e) =>
            setFile(e.target.files?.[0] || null)
          }
          className="text-xs"
        />

        <button
          onClick={handleSend}
          disabled={sending || (!input.trim() && !file)}
          className={`
            px-4 py-2 sm:py-1 rounded-xl text-white
            ${sending
              ? "bg-gray-500"
              : "bg-orange-500 hover:bg-orange-600"}
          `}
        >
          {sending ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}