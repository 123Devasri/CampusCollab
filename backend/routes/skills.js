const express = require("express");
const router = express.Router();

const Skill = require("../models/Skill");

// GET /api/skills - Get all available skills grouped by category
router.get("/", async (req, res) => {
  try {
    const skills = await Skill.find().sort({ category: 1, name: 1 });
    res.json(skills);
  } catch (error) {
    console.error("Fetch Skills Error:", error);
    res.status(500).json({
      message: "Failed to fetch skills."
    });
  }
});

module.exports = router;
