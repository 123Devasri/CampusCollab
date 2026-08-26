const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./db");

// Initialize Express App
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Root Health Route
app.get("/", (req, res) => {
  res.json({
    message: "CampusCollab Backend API is running",
    status: "Healthy",
    time: new Date().toISOString()
  });
});

// Register API Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/profile", require("./routes/profile"));
app.use("/api/skills", require("./routes/skills"));
app.use("/api/github", require("./routes/github"));
app.use("/api/hackathons", require("./routes/hackathons"));
app.use("/api/teams", require("./routes/teams"));
app.use("/api/invitations", require("./routes/invitations"));
app.use("/api/teammates", require("./routes/teammates"));
app.use("/api/projects", require("./routes/projects"));
app.use("/api/dashboard", require("./routes/dashboard"));

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error("Unhandled Server Error:", err.stack);
  res.status(500).json({
    message: "Internal server error occurred.",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

// Start Listening
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`CampusCollab Server listening on port ${PORT}`);
});