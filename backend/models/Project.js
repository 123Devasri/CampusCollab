const mongoose = require("mongoose");

// Project Schema for Campus projects, hackathon workspaces, and task management
const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team"
    },
    hackathon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hackathon"
    },
    role: {
      type: String,
      default: "Lead Developer"
    },
    techStack: [
      {
        type: String,
        trim: true
      }
    ],
    githubUrl: {
      type: String,
      default: ""
    },
    liveUrl: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: ["Planning", "In Progress", "Testing", "Completed"],
      default: "Planning"
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    requiredRoles: [
      {
        type: String,
        trim: true
      }
    ],
    tasks: [
      {
        title: {
          type: String,
          required: true
        },
        description: {
          type: String,
          default: ""
        },
        assignedUser: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        status: {
          type: String,
          enum: ["Todo", "In Progress", "Completed"],
          default: "Todo"
        },
        priority: {
          type: String,
          enum: ["Low", "Medium", "High"],
          default: "Medium"
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    collaborationRequests: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true
        },
        role: {
          type: String,
          default: "Collaborator"
        },
        message: {
          type: String,
          default: "I'd like to collaborate on this project."
        },
        status: {
          type: String,
          enum: ["pending", "accepted", "rejected"],
          default: "pending"
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Project", projectSchema);
