const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const Skill = require("./models/Skill");
const User = require("./models/User");

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/campuscollab";
    await mongoose.connect(uri);
    console.log("Connected to MongoDB successfully at:", uri);

    // Initialize standard skills taxonomy and the single platform admin
    await seedSkillsTaxonomy();
    await seedSingleAdmin();
  } catch (error) {
    console.error("MongoDB Connection Failed:", error.message);
  }
};

// Seed standard skill categories for student profile selection
const seedSkillsTaxonomy = async () => {
  try {
    const skillCount = await Skill.countDocuments();
    if (skillCount === 0) {
      const defaultSkills = [
        // Programming
        { name: "C", category: "Programming" },
        { name: "C++", category: "Programming" },
        { name: "Java", category: "Programming" },
        { name: "Python", category: "Programming" },
        { name: "JavaScript", category: "Programming" },
        { name: "TypeScript", category: "Programming" },
        // Frontend
        { name: "React", category: "Frontend" },
        { name: "Next.js", category: "Frontend" },
        { name: "HTML", category: "Frontend" },
        { name: "CSS", category: "Frontend" },
        { name: "Bootstrap", category: "Frontend" },
        { name: "Tailwind CSS", category: "Frontend" },
        { name: "UI/UX", category: "Frontend" },
        // Backend
        { name: "Node.js", category: "Backend" },
        { name: "Express", category: "Backend" },
        { name: "Django", category: "Backend" },
        { name: "FastAPI", category: "Backend" },
        { name: "Spring Boot", category: "Backend" },
        // Database
        { name: "MongoDB", category: "Database" },
        { name: "MySQL", category: "Database" },
        { name: "PostgreSQL", category: "Database" },
        { name: "Firebase", category: "Database" },
        // AI / ML
        { name: "Machine Learning", category: "AI/ML" },
        { name: "Deep Learning", category: "AI/ML" },
        { name: "TensorFlow", category: "AI/ML" },
        { name: "PyTorch", category: "AI/ML" },
        { name: "Scikit-learn", category: "AI/ML" },
        { name: "NLP", category: "AI/ML" },
        // Cloud & DevOps
        { name: "Git", category: "Cloud/DevOps" },
        { name: "Docker", category: "Cloud/DevOps" },
        { name: "AWS", category: "Cloud/DevOps" },
        { name: "Google Cloud", category: "Cloud/DevOps" }
      ];
      await Skill.insertMany(defaultSkills);
      console.log("Initialized standard technical skills taxonomy.");
    }
  } catch (seedErr) {
    console.error("Error initializing skills taxonomy:", seedErr.message);
  }
};

// Ensure the single platform admin exists (no mock students or mock hackathons)
const seedSingleAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: "admin" });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("123456", salt);

      await User.create({
        name: "Campus Administrator",
        email: "admin@campuscollab.edu",
        password: hashedPassword,
        college: "Campus University",
        course: "Administration",
        year: "Coordinator",
        bio: "CampusCollab platform administrator managing verified hackathons and student events.",
        primaryRole: "Campus Admin",
        skills: ["Administration", "Event Management", "Full Stack"],
        role: "admin"
      });
      console.log("Initialized single Platform Administrator (admin@campuscollab.edu).");
    }
  } catch (err) {
    console.error("Error initializing single admin:", err.message);
  }
};

module.exports = connectDB;