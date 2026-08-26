const express = require("express");
const router = express.Router();

const User = require("../models/User");

// GET /api/teammates - Browse all students to find teammates
router.get("/", async (req, res) => {
  try {
    const { skill, role, search } = req.query;
    let query = { role: { $ne: "admin" } };

    if (skill && skill !== "All") {
      query.skills = { $regex: skill, $options: "i" };
    }

    if (role && role !== "All") {
      query.primaryRole = { $regex: role, $options: "i" };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { college: { $regex: search, $options: "i" } },
        { course: { $regex: search, $options: "i" } },
        { bio: { $regex: search, $options: "i" } },
        { skills: { $regex: search, $options: "i" } },
        { primaryRole: { $regex: search, $options: "i" } }
      ];
    }

    const students = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(students);
  } catch (error) {
    console.error("Browse Teammates Error:", error);
    res.status(500).json({ message: "Failed to load students." });
  }
});

module.exports = router;
