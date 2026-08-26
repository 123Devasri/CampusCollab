const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Team = require("../models/Team");
const Project = require("../models/Project");
const { authenticate } = require("../middleware/auth");

// GET /api/profile - Get current logged-in user's full profile
router.get("/", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({
        message: "Profile not found."
      });
    }

    // Get user's teams
    const teams = await Team.find({
      "members.user": req.user.id
    }).populate("hackathon", "name officialUrl");

    // Get user's projects
    const projects = await Project.find({
      createdBy: req.user.id
    });

    res.json({
      user,
      teams,
      projects
    });
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({
      message: "Failed to fetch profile. " + error.message
    });
  }
});

// GET /api/profile/:id - Get public profile of a student
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({
        message: "Student profile not found."
      });
    }

    // Get public teams
    const teams = await Team.find({
      "members.user": req.params.id
    }).populate("hackathon", "name");

    // Get public projects
    const projects = await Project.find({
      createdBy: req.params.id
    });

    res.json({
      user,
      teams,
      projects
    });
  } catch (error) {
    console.error("Get Public Profile Error:", error);
    res.status(500).json({
      message: "Failed to fetch student profile."
    });
  }
});

// PUT /api/profile - Update current user profile
router.setProfile = router.put("/", authenticate, async (req, res) => {
  try {
    const {
      name,
      college,
      course,
      year,
      bio,
      primaryRole,
      skills,
      interests,
      githubUsername,
      githubUrl,
      linkedinUrl,
      avatar
    } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          ...(name && { name }),
          ...(college && { college }),
          ...(course && { course }),
          ...(year && { year }),
          ...(bio !== undefined && { bio }),
          ...(primaryRole && { primaryRole }),
          ...(skills && { skills }),
          ...(interests && { interests }),
          ...(githubUsername !== undefined && { githubUsername }),
          ...(githubUrl !== undefined && { githubUrl }),
          ...(linkedinUrl !== undefined && { linkedinUrl }),
          ...(avatar !== undefined && { avatar })
        }
      },
      { new: true, runValidators: true }
    ).select("-password");

    res.json({
      message: "Profile updated successfully!",
      user: updatedUser
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({
      message: "Failed to update profile. " + error.message
    });
  }
});

// POST /api/profile/skills - Add a new skill
router.post("/skills", authenticate, async (req, res) => {
  try {
    const { skill } = req.body;
    if (!skill || typeof skill !== "string" || !skill.trim()) {
      return res.status(400).json({
        message: "Please specify a valid skill name."
      });
    }

    const trimmedSkill = skill.trim();

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.skills.includes(trimmedSkill)) {
      return res.status(400).json({
        message: `Skill '${trimmedSkill}' is already in your tech stack.`
      });
    }

    user.skills.push(trimmedSkill);
    await user.save();

    res.json({
      message: `Added '${trimmedSkill}' to your tech stack.`,
      skills: user.skills
    });
  } catch (error) {
    console.error("Add Skill Error:", error);
    res.status(500).json({
      message: "Could not add skill."
    });
  }
});

// DELETE /api/profile/skills/:skillName - Remove a skill
router.delete("/skills/:skillName", authenticate, async (req, res) => {
  try {
    const skillName = decodeURIComponent(req.params.skillName);

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.skills = user.skills.filter((s) => s.toLowerCase() !== skillName.toLowerCase());
    await user.save();

    res.json({
      message: `Removed '${skillName}' from your tech stack.`,
      skills: user.skills
    });
  } catch (error) {
    console.error("Delete Skill Error:", error);
    res.status(500).json({
      message: "Could not remove skill."
    });
  }
});

module.exports = router;
