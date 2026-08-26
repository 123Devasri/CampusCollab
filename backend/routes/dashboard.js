const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Hackathon = require("../models/Hackathon");
const Team = require("../models/Team");
const Project = require("../models/Project");
const Invitation = require("../models/Invitation");
const { authenticate } = require("../middleware/auth");

// Helper: Calculate skill gap for a team
const calculateTeamGap = (team) => {
  const required = team.requiredSkills || [];
  if (required.length === 0) {
    return {
      requiredSkills: [],
      coveredSkills: [],
      missingSkills: [],
      coveragePercentage: 100
    };
  }

  const memberSkillsSet = new Set();
  (team.members || []).forEach((m) => {
    if (m.user && Array.isArray(m.user.skills)) {
      m.user.skills.forEach((s) => memberSkillsSet.add(s.toLowerCase()));
    }
  });

  const coveredSkills = [];
  const missingSkills = [];

  required.forEach((reqSkill) => {
    if (memberSkillsSet.has(reqSkill.toLowerCase())) {
      coveredSkills.push(reqSkill);
    } else {
      missingSkills.push(reqSkill);
    }
  });

  const coveragePercentage = Math.round((coveredSkills.length / required.length) * 100);
  return {
    requiredSkills: required,
    coveredSkills,
    missingSkills,
    coveragePercentage
  };
};

// GET /api/dashboard - Clean, focused dashboard data for student
router.get("/", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // 1. My Registered Teams with Teammates & Hackathon Details
    const myTeamsRaw = await Team.find({
      "members.user": req.user.id
    })
      .populate("hackathon", "name organizer officialUrl mode startDate endDate registrationDeadline prizePool")
      .populate("members.user", "name primaryRole skills email college course year")
      .populate("createdBy", "name primaryRole")
      .sort({ createdAt: -1 });

    // 2. Fetch Projects linked to these teams or created by user
    const teamIds = myTeamsRaw.map((t) => t._id);
    const projectsRaw = await Project.find({
      $or: [{ createdBy: req.user.id }, { team: { $in: teamIds } }]
    })
      .populate("team", "name")
      .populate("hackathon", "name")
      .populate("tasks.assignedUser", "name primaryRole")
      .sort({ updatedAt: -1 });

    const projectsMap = {};
    projectsRaw.forEach((p) => {
      if (p.team) {
        const tId = String(p.team._id || p.team);
        projectsMap[tId] = p;
      }
    });

    const myRegisteredHackathons = myTeamsRaw.map((team) => {
      const gap = calculateTeamGap(team);
      const linkedProject = projectsMap[String(team._id)] || null;

      let projectInfo = null;
      if (linkedProject) {
        const totalTasks = linkedProject.tasks.length;
        const completedTasks = linkedProject.tasks.filter((t) => t.status === "Completed").length;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : linkedProject.status === "Completed" ? 100 : 0;
        projectInfo = {
          ...linkedProject.toObject(),
          totalTasks,
          completedTasks,
          progress
        };
      }

      return {
        ...team.toObject(),
        skillGap: gap,
        project: projectInfo
      };
    });

    // 3. Pending Invitations for this user
    const pendingInvitations = await Invitation.find({
      invitedUser: req.user.id,
      status: "pending"
    })
      .populate("team", "name description hackathonName")
      .populate("invitedBy", "name primaryRole email");

    res.json({
      user,
      myRegisteredHackathons,
      pendingInvitations
    });
  } catch (error) {
    console.error("Dashboard Aggregation Error:", error);
    res.status(500).json({ message: "Failed to load dashboard data." });
  }
});

module.exports = router;
