const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const { authenticate } = require("../middleware/auth");

// Helper to generate JWT Token
const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || "campuscollab_secret_key_2026_jwt_token";
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role
    },
    secret,
    { expiresIn: "7d" }
  );
};

// POST /api/auth/register - Register a new student account (regular users only; admin is strictly managed)
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, college, course, year, primaryRole, skills } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please provide your Name, Email, and Password."
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        message: "An account with this email address already exists. Please login."
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create student user (strictly role: "user")
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      college: college || "Campus University",
      course: course || "Computer Science",
      year: year || "1st Year",
      primaryRole: primaryRole || "Student Developer",
      skills: Array.isArray(skills) ? skills : [],
      role: "user"
    });

    const token = generateToken(newUser);

    res.status(201).json({
      message: `Registration successful! Welcome ${newUser.name}.`,
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        primaryRole: newUser.primaryRole,
        skills: newUser.skills
      }
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({
      message: "Registration failed. " + error.message
    });
  }
});

// POST /api/auth/login - Login existing user or admin
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please enter both Email and Password."
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password. Please check your credentials."
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password. Please check your credentials."
      });
    }

    const token = generateToken(user);

    res.json({
      message: "Login successful! Welcome back, " + user.name + ".",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        primaryRole: user.primaryRole,
        skills: user.skills
      }
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      message: "Login failed. " + error.message
    });
  }
});

// GET /api/auth/me - Fetch current authenticated user profile summary
router.get("/me", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({
        message: "User not found."
      });
    }
    res.json(user);
  } catch (error) {
    console.error("Auth Me Error:", error);
    res.status(500).json({
      message: "Could not fetch user details."
    });
  }
});

module.exports = router;
