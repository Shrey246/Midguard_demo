export function adaptMessage(input: any) {
  let msg = input;

  if (msg && msg.message) {
    msg = msg.message;
  }

  if (!msg || typeof msg !== "object") {
    console.error("❌ adaptMessage received invalid:", input);
    return null;
  }

  const id = msg.message_uid || msg.id;
  const content = msg.body || msg.message_text || msg.text || "";
  const sender = msg.sender_public_id || msg.sender || "unknown";
  const createdAt = msg.created_at || msg.createdAt || null;

  // ✅ FIX: derive type
  let type = msg.message_type || "text";

  if (!["text", "image", "document", "system"].includes(type)) {
    type = "text";
  }

  // map "document" → "file" (frontend naming)
  if (type === "document") type = "file";

  if (!id) {
    console.error("❌ Message missing ID:", msg);
    return null;
  }

  return {
    id,
    content,   // ✅ FIXED
    sender,
    type,      // ✅ FIXED
    createdAt,
  };
}