const mongoose = require("mongoose");

// Hackathon Schema for admin-created and verified hackathons
const hackathonSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    organizer: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    startDate: {
      type: String,
      required: true
    },
    endDate: {
      type: String,
      required: true
    },
    registrationDeadline: {
      type: String,
      required: true
    },
    mode: {
      type: String,
      enum: ["Online", "Offline", "Hybrid"],
      default: "Online"
    },
    location: {
      type: String,
      default: "Virtual"
    },
    technology: {
      type: String,
      default: "General Software / AI"
    },
    eligibility: {
      type: String,
      default: "Open to all university students"
    },
    officialUrl: {
      type: String,
      required: true
    },
    imageUrl: {
      type: String,
      default: ""
    },
    prizePool: {
      type: String,
      default: "Certificates & Cash Prizes"
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Hackathon", hackathonSchema);
