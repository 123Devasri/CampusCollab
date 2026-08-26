const mongoose = require("mongoose");

// Team Schema for hackathon teams and skill gap matching
const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ""
    },
    hackathon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hackathon"
    },
    hackathonName: {
      type: String,
      default: "Smart India Hackathon"
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    maxMembers: {
      type: Number,
      default: 4
    },
    requiredSkills: [
      {
        type: String,
        trim: true
      }
    ],
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true
        },
        role: {
          type: String,
          default: "Team Member"
        },
        joinedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    status: {
      type: String,
      enum: ["Open", "Full", "Completed"],
      default: "Open"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Team", teamSchema);
