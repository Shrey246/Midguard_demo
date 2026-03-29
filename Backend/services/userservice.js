// backend/services/userService.js

const { User, Wallet } = require('../models');
const { ulid } = require('ulid');
const { generateToken } = require('../utils/jwt');
const bcrypt = require('bcrypt');
const notificationService = require("./notificationservice");
const jwt = require("jsonwebtoken");
const { BlacklistedToken } = require("../models");

/**
 * Generate base username from full name
 * "Shreyas Manjunath" -> "shreyas"
 */
const generateBaseUsername = (fullName) => {
  return fullName
    .trim()
    .split(/\s+/)[0]
    .toLowerCase();
};

/**
 * Ensure username is unique
 * shreyas -> shreyas1 -> shreyas2
 */
const generateUniqueUsername = async (baseUsername) => {
  let username = baseUsername;
  let counter = 0;

  while (await User.findOne({ where: { username } })) {
    counter++;
    username = `${baseUsername}${counter}`;
  }

  return username;
};

/**
 * Safe DOB parser (DD-MM-YYYY -> YYYY-MM-DD)
 */
const parseDOB = (dobString) => {
  if (!dobString) return null;

  const parts = dobString.split('-');
  if (parts.length !== 3) {
    throw new Error('Invalid date format. Expected DD-MM-YYYY');
  }

  const [day, month, year] = parts;
  return `${year}-${month}-${day}`;
};

/**
 * Get user by email
 */
const getUserByEmail = async (email) => {
  return await User.findOne({ where: { email } });
};

/**
 * STEP 1: Register user (minimal required data)
 */
const registerUser = async (data) => {
  const {
    fullName,
    email,
    phoneNumber,
    password
  } = data;

  // Required validation (step 1)
  if (!fullName || !email || !phoneNumber || !password) {
    throw new Error('Required fields missing');
  }

  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }

  if (await getUserByEmail(email)) {
    throw new Error('Email already registered');
  }

  const baseUsername = generateBaseUsername(fullName);
  const username = await generateUniqueUsername(baseUsername);
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({
    publicId: ulid(),
    fullName,
    username,
    email,
    phoneNumber,
    passwordHash,
    authProvider: 'email'
  });
  
  await Wallet.create({
  user_public_id: user.publicId,
  available_balance: 0,
  locked_balance: 0
});

await notificationService.createNotification(
  user.publicId,
  "welcome",
  "Welcome to MidGuard",
  "Your account has been successfully created. You can now start trading securely.",
  "user",
  user.publicId
 );

  return {
    publicId: user.publicId,
    username: user.username
  };
};

/**
 * STEP 2 / 3: Update profile progressively
 */
const updateUserProfile = async (publicId, updates) => {
  if (!publicId) {
    throw new Error('publicId is required');
  }

  if (updates.dateOfBirth) {
    updates.dateOfBirth = parseDOB(updates.dateOfBirth);
  }

  await User.update(updates, {
    where: { publicId }
  });

  return true;
};

/**
 * LOGIN: verify user credentials
 */
const loginUser = async (email, password) => {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  const user = await getUserByEmail(email);
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  const token = generateToken({
  publicId: user.publicId,
  email: user.email
});

return {
  token,
  user: {
    publicId: user.publicId,
    username: user.username,
    email: user.email
  }
};
};

/**
 * LOGOUT: blacklist token
 */
const logoutUser = async (token) => {
  if (!token) {
    throw new Error("Token required");
  }

  const decoded = jwt.decode(token);

  if (!decoded || !decoded.exp) {
    throw new Error("Invalid token");
  }

  await BlacklistedToken.create({
    token,
    expiresAt: new Date(decoded.exp * 1000)
  });

  return true;
};

module.exports = {
  registerUser,
  updateUserProfile,
  getUserByEmail,
  loginUser,
  logoutUser,
};

console.log('User model:', User);
