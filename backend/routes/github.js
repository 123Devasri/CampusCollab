const express = require("express");
const router = express.Router();
const axios = require("axios");

// GET /api/github/user/:username - Safe proxy to GitHub public user API
router.get("/user/:username", async (req, res) => {
  try {
    const { username } = req.params;
    if (!username || username === "undefined" || username === "null" || username.trim() === "") {
      return res.json({
        login: "",
        name: "",
        avatar_url: "",
        html_url: "",
        bio: "",
        public_repos: 0,
        followers: 0,
        following: 0
      });
    }

    const cleanUsername = username.replace(/^https?:\/\/github\.com\//, "").replace(/\/$/, "").trim();
    if (!cleanUsername) {
      return res.json({
        login: "",
        name: "",
        avatar_url: "",
        html_url: "",
        bio: "",
        public_repos: 0,
        followers: 0,
        following: 0
      });
    }

    const response = await axios.get(`https://api.github.com/users/${cleanUsername}`, {
      headers: {
        "User-Agent": "CampusCollab-StudentApp"
      },
      timeout: 5000,
      validateStatus: (status) => status < 500
    });

    if (response.status === 404) {
      return res.json({
        login: cleanUsername,
        name: cleanUsername,
        avatar_url: "",
        html_url: `https://github.com/${cleanUsername}`,
        bio: "",
        public_repos: 0,
        followers: 0,
        following: 0
      });
    }

    const data = response.data;
    res.json({
      login: data.login,
      name: data.name || data.login,
      avatar_url: data.avatar_url,
      html_url: data.html_url,
      bio: data.bio || "",
      public_repos: data.public_repos,
      followers: data.followers,
      following: data.following
    });
  } catch (error) {
    res.json({
      login: req.params.username,
      name: req.params.username,
      avatar_url: "",
      html_url: `https://github.com/${req.params.username}`,
      bio: "",
      public_repos: 0,
      followers: 0,
      following: 0
    });
  }
});

// GET /api/github/repos/:username - Safe proxy to GitHub public repositories
router.get("/repos/:username", async (req, res) => {
  try {
    const { username } = req.params;
    if (!username || username === "undefined" || username === "null" || username.trim() === "") {
      return res.json([]);
    }

    const cleanUsername = username.replace(/^https?:\/\/github\.com\//, "").replace(/\/$/, "").trim();
    if (!cleanUsername) {
      return res.json([]);
    }

    const response = await axios.get(
      `https://api.github.com/users/${cleanUsername}/repos?sort=updated&per_page=12`,
      {
        headers: {
          "User-Agent": "CampusCollab-StudentApp"
        },
        timeout: 5000,
        validateStatus: (status) => status < 500
      }
    );

    if (response.status === 404 || !Array.isArray(response.data)) {
      return res.json([]);
    }

    const repos = response.data.map((repo) => ({
      id: repo.id,
      name: repo.name,
      description: repo.description || "No description provided.",
      language: repo.language || "General",
      stargazers_count: repo.stargazers_count,
      forks_count: repo.forks_count,
      html_url: repo.html_url,
      updated_at: repo.updated_at
    }));

    res.json(repos);
  } catch (error) {
    res.json([]);
  }
});

module.exports = router;
