const express = require("express");
const router = express.Router();
const axios = require("axios");

const Hackathon = require("../models/Hackathon");
const Team = require("../models/Team");
const { authenticate, adminOnly } = require("../middleware/auth");

// GET /api/hackathons/external - Discover upcoming hackathon news/events via external API
router.get("/external", async (req, res) => {
  try {
    const apiKey = process.env.NEWS_API_KEY || "a56c8b61b73c4e6a9035c405e857a49b";
    const query = req.query.q || "hackathon";

    const response = await axios.get(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&language=en&pageSize=10&apiKey=${apiKey}`,
      { timeout: 4000 }
    );

    const articles = (response.data.articles || []).map((art, index) => ({
      id: `ext-${index}`,
      title: art.title,
      description: art.description || "Student innovation hackathon coverage.",
      source: art.source?.name || "Global Hackathon News",
      url: art.url,
      imageUrl: art.urlToImage || "",
      publishedAt: art.publishedAt
    }));

    res.json(articles);
  } catch (error) {
    console.error("External Hackathon Feed Error:", error.message);
    // Graceful fallback sample discovery items
    res.json([
      {
        id: "ext-sample-1",
        title: "Global Student AI & Sustainability Hackathon 2026",
        description: "Join over 5,000 students worldwide to build software combating climate change and university carbon footprints.",
        source: "Unstop & Devpost Hub",
        url: "https://unstop.com/hackathons",
        imageUrl: "",
        publishedAt: new Date().toISOString()
      },
      {
        id: "ext-sample-2",
        title: "Open Source India Dev Hack 2026",
        description: "Contribute to prominent open-source repositories and build collaborative campus tools with mentors.",
        source: "Tech Events Daily",
        url: "https://unstop.com/hackathons",
        imageUrl: "",
        publishedAt: new Date().toISOString()
      }
    ]);
  }
});

// GET /api/hackathons - List all hackathons from database with filtering
router.get("/", async (req, res) => {
  try {
    const { search, mode, technology } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { organizer: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { technology: { $regex: search, $options: "i" } }
      ];
    }

    if (mode && mode !== "All") {
      query.mode = mode;
    }

    if (technology && technology !== "All") {
      query.technology = { $regex: technology, $options: "i" };
    }

    const hackathons = await Hackathon.find(query).sort({ createdAt: -1 });
    res.json(hackathons);
  } catch (error) {
    console.error("Fetch Hackathons Error:", error);
    res.status(500).json({
      message: "Failed to load hackathons."
    });
  }
});

// GET /api/hackathons/:id - Get hackathon details & associated teams
router.get("/:id", async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) {
      return res.status(404).json({
        message: "Hackathon not found."
      });
    }

    // Find all teams created for this hackathon
    const teams = await Team.find({ hackathon: req.params.id })
      .populate("createdBy", "name primaryRole")
      .populate("members.user", "name primaryRole skills");

    res.json({
      hackathon,
      teams
    });
  } catch (error) {
    console.error("Get Hackathon Details Error:", error);
    res.status(500).json({
      message: "Failed to load hackathon details."
    });
  }
});

// POST /api/hackathons - Create a new hackathon (Admin or authorized student organizers)
router.post("/", authenticate, async (req, res) => {
  try {
    const {
      name,
      organizer,
      description,
      startDate,
      endDate,
      registrationDeadline,
      mode,
      location,
      technology,
      eligibility,
      officialUrl,
      imageUrl,
      prizePool
    } = req.body;

    if (!name || !organizer || !description || !officialUrl) {
      return res.status(400).json({
        message: "Please fill in Name, Organizer, Description, and Official URL."
      });
    }

    const newHackathon = await Hackathon.create({
      name,
      organizer,
      description,
      startDate: startDate || new Date().toISOString().split("T")[0],
      endDate: endDate || new Date().toISOString().split("T")[0],
      registrationDeadline: registrationDeadline || new Date().toISOString().split("T")[0],
      mode: mode || "Online",
      location: location || "Virtual",
      technology: technology || "General Software",
      eligibility: eligibility || "Open to all students",
      officialUrl,
      imageUrl: imageUrl || "",
      prizePool: prizePool || "Certificates & Prizes",
      createdBy: req.user.id
    });

    res.status(201).json({
      message: "Hackathon published successfully!",
      hackathon: newHackathon
    });
  } catch (error) {
    console.error("Create Hackathon Error:", error);
    res.status(500).json({
      message: "Failed to create hackathon. " + error.message
    });
  }
});

// PUT /api/hackathons/:id - Edit hackathon (Admin or Creator)
router.put("/:id", authenticate, async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) {
      return res.status(404).json({ message: "Hackathon not found" });
    }

    // Only admin or the creator can edit
    if (req.user.role !== "admin" && String(hackathon.createdBy) !== req.user.id) {
      return res.status(403).json({
        message: "Unauthorized. Only admins or the event creator can edit this hackathon."
      });
    }

    const updated = await Hackathon.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json({
      message: "Hackathon updated successfully!",
      hackathon: updated
    });
  } catch (error) {
    console.error("Update Hackathon Error:", error);
    res.status(500).json({
      message: "Failed to update hackathon."
    });
  }
});

// DELETE /api/hackathons/:id - Delete hackathon
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) {
      return res.status(404).json({ message: "Hackathon not found" });
    }

    if (req.user.role !== "admin" && String(hackathon.createdBy) !== req.user.id) {
      return res.status(403).json({
        message: "Unauthorized. Admin privileges required."
      });
    }

    await Hackathon.findByIdAndDelete(req.params.id);

    res.json({
      message: "Hackathon deleted successfully."
    });
  } catch (error) {
    console.error("Delete Hackathon Error:", error);
    res.status(500).json({
      message: "Failed to delete hackathon."
    });
  }
});

module.exports = router;
