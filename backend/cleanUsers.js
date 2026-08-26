const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");
const Team = require("./models/Team");
const Project = require("./models/Project");
const Invitation = require("./models/Invitation");
const JoinRequest = require("./models/JoinRequest");

async function cleanDatabase() {
  try {
    const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/campuscollab";
    await mongoose.connect(uri);
    console.log("Connected to MongoDB for cleanup at:", uri);

    // 1. Delete all users except admin@campuscollab.edu
    const deleteResult = await User.deleteMany({ email: { $ne: "admin@campuscollab.edu" } });
    console.log(`Deleted ${deleteResult.deletedCount} user(s) (including Akil Kumar, Dhanya Lakshmi, and all mock accounts).`);

    // 2. Ensure single Admin exists
    let admin = await User.findOne({ email: "admin@campuscollab.edu" });
    if (!admin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("123456", salt);

      admin = await User.create({
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
      console.log("Created fresh Platform Administrator (admin@campuscollab.edu).");
    } else {
      console.log("Single Platform Administrator verified: admin@campuscollab.edu");
    }

    // 3. Clean up teams, invitations, and join requests that belonged to removed users
    const teamsResult = await Team.deleteMany({});
    console.log(`Reset ${teamsResult.deletedCount} old mock team(s).`);

    const invResult = await Invitation.deleteMany({});
    console.log(`Reset ${invResult.deletedCount} invitation(s).`);

    const reqResult = await JoinRequest.deleteMany({});
    console.log(`Reset ${reqResult.deletedCount} join request(s).`);

    const projResult = await Project.deleteMany({});
    console.log(`Reset ${projResult.deletedCount} old mock project(s).`);

    const remainingUsers = await User.find({}, "name email role");
    console.log("\n--- Remaining Database Users ---");
    console.log(remainingUsers);
    console.log("--------------------------------\n");

    console.log("Database cleanup completed successfully! Only 1 Admin is present.");
    process.exit(0);
  } catch (err) {
    console.error("Cleanup error:", err);
    process.exit(1);
  }
}

cleanDatabase();
