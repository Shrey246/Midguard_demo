// backend/controllers/authController.js

const userService = require('../services/userservice');

/**
 * STEP 1: Register user (basic info)
 * fullName, email, phoneNumber, password
 */
const register = async (req, res) => {
  try {
    const result = await userService.registerUser(req.body);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * LOGIN
 * email, password
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await userService.loginUser(email, password);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


/**
 * STEP 2 / 3: Update user profile progressively
 * DOB, gender, profession, language, bio, etc.
 */
const updateProfile = async (req, res) => {
  try {
    const publicId = req.user.publicId;
    const updates = req.body;

    await userService.updateUserProfile(publicId, updates);



    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * LOGOUT
 */
const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    await userService.logoutUser(token);

    return res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  register,
  login,
  updateProfile,
  logout
};
