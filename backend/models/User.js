const mongoose = require("mongoose");

// User Schema for student profiles and authentication
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    college: {
      type: String,
      default: "College / University"
    },
    course: {
      type: String,
      default: "Software Systems"
    },
    year: {
      type: String,
      default: "2nd Year"
    },
    bio: {
      type: String,
      default: "Interested in building student-focused software and collaborating in hackathons."
    },
    avatar: {
      type: String,
      default: ""
    },
    primaryRole: {
      type: String,
      default: "Full Stack Developer"
    },
    skills: [
      {
        type: String,
        trim: true
      }
    ],
    interests: [
      {
        type: String,
        trim: true
      }
    ],
    githubUsername: {
      type: String,
      default: ""
    },
    githubUrl: {
      type: String,
      default: ""
    },
    linkedinUrl: {
      type: String,
      default: ""
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);
