const { AdminLog } = require("../../models");
const { v4: uuidv4 } = require("uuid");

// 🔐 CONFIG
const MAX_STATE_SIZE = 10000; // prevent huge payloads

// ================= HELPERS =================

// sanitize sensitive fields
function sanitizeData(data) {
  if (!data || typeof data !== "object") return data;

  const clone = JSON.parse(JSON.stringify(data));

  const sensitiveKeys = ["password", "password_hash", "token"];

  for (const key of sensitiveKeys) {
    if (clone[key]) clone[key] = "***REDACTED***";
  }

  return clone;
}

// limit JSON size
function limitSize(data) {
  try {
    const str = JSON.stringify(data);
    if (str.length > MAX_STATE_SIZE) {
      return { truncated: true };
    }
    return data;
  } catch {
    return null;
  }
}

// normalize strings
function normalize(value) {
  if (!value) return value;
  return String(value).toUpperCase().trim();
}

// ================= LOGGER =================

async function logAdminAction({
  admin_id,
  action_type,
  target_type,
  target_id,
  before_state = null,
  after_state = null,
  metadata = {},
  ip_address = null,
  user_agent = null
}) {
  try {
    // 🚨 VALIDATION
    if (!admin_id || !action_type || !target_type) {
      console.error("Invalid admin log payload");
      return;
    }

    // 🔄 NORMALIZATION
    const normalizedAction = normalize(action_type);
    const normalizedTarget = normalize(target_type);

    // 🔐 SANITIZE
    const safeBefore = limitSize(sanitizeData(before_state));
    const safeAfter = limitSize(sanitizeData(after_state));
    const safeMetadata = limitSize(sanitizeData(metadata));

    await AdminLog.create({
      log_id: "LOG_" + uuidv4(),

      admin_id,
      action_type: normalizedAction,
      target_type: normalizedTarget,
      target_id: target_id || null,

      before_state: safeBefore,
      after_state: safeAfter,
      metadata: safeMetadata,

      ip_address,
      user_agent
    });

  } catch (err) {
    // 🔥 NEVER BREAK SYSTEM
    console.error("🚨 ADMIN LOG FAILURE:", err.message);
  }
}

module.exports = { logAdminAction };