const mongoose = require("mongoose");

// Skill Schema for standardized technology stacks
const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    category: {
      type: String,
      enum: ["Programming", "Frontend", "Backend", "Database", "AI/ML", "Cloud/DevOps", "Other"],
      default: "Other"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Skill", skillSchema);
