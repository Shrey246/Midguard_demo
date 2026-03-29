const { v4: uuidv4 } = require("uuid");

function generateId(prefix) {
  const uuid = uuidv4().replace(/-/g, "").slice(0, 12);
  return `${prefix}_${uuid}`;
}

module.exports = generateId;