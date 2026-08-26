const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Team = require("../models/Team");
const User = require("../models/User");
const Invitation = require("../models/Invitation");
const JoinRequest = require("../models/JoinRequest");
const Project = require("../models/Project");
const { authenticate } = require("../middleware/auth");

// Helper function: Calculate skill coverage and gaps for a team
const calculateSkillGap = (team) => {
  const required = team.requiredSkills || [];
  if (required.length === 0) {
    return {
      requiredSkills: [],
      coveredSkills: [],
      missingSkills: [],
      coveragePercentage: 100
    };
  }

  // Collect all skills from all members
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

// GET /api/teams - List all teams with optional filtering
router.get("/", async (req, res) => {
  try {
    const { hackathonId, status, skill } = req.query;
    let query = {};

    if (hackathonId) {
      query.hackathon = hackathonId;
    }

    if (status && status !== "All") {
      query.status = status;
    }

    if (skill && skill !== "All") {
      query.requiredSkills = { $regex: skill, $options: "i" };
    }

    const teams = await Team.find(query)
      .populate("hackathon", "name organizer officialUrl mode registrationDeadline")
      .populate("createdBy", "name primaryRole email")
      .populate("members.user", "name primaryRole skills email avatar")
      .sort({ createdAt: -1 });

    const teamsWithGaps = teams.map((team) => {
      const gap = calculateSkillGap(team);
      return {
        ...team.toObject(),
        skillGap: gap
      };
    });

    res.json(teamsWithGaps);
  } catch (error) {
    console.error("Fetch Teams Error:", error);
    res.status(500).json({ message: "Failed to fetch teams." });
  }
});

// GET /api/teams/my - Get all teams where current user is a member (MUST be defined BEFORE /:id)
router.get("/my", authenticate, async (req, res) => {
  try {
    const teams = await Team.find({
      "members.user": req.user.id
    })
      .populate("hackathon", "name organizer officialUrl mode registrationDeadline")
      .populate("createdBy", "name primaryRole email")
      .populate("members.user", "name primaryRole skills email avatar")
      .sort({ createdAt: -1 });

    const teamsWithGaps = teams.map((team) => {
      const gap = calculateSkillGap(team);
      return {
        ...team.toObject(),
        skillGap: gap
      };
    });

    res.json(teamsWithGaps);
  } catch (error) {
    console.error("Fetch My Teams Error:", error);
    res.status(500).json({ message: "Failed to fetch user teams." });
  }
});

// POST /api/teams - Create a new team (Creator becomes Team Admin)
router.post("/", authenticate, async (req, res) => {
  try {
    const { name, description, hackathonId, hackathonName, requiredSkills, maxMembers } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Please provide a Team Name." });
    }

    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found." });
    }

    const newTeam = await Team.create({
      name,
      description: description || "",
      hackathon: (hackathonId && mongoose.Types.ObjectId.isValid(hackathonId)) ? hackathonId : null,
      hackathonName: hackathonName || "Smart India Hackathon",
      createdBy: req.user.id,
      maxMembers: maxMembers || 4,
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : ["Frontend", "Backend", "Database", "AI/ML"],
      members: [
        {
          user: req.user.id,
          role: "Team Admin",
          joinedAt: new Date()
        }
      ]
    });

    const populatedTeam = await Team.findById(newTeam._id)
      .populate("hackathon", "name officialUrl")
      .populate("members.user", "name primaryRole skills");

    res.status(201).json({
      message: `Team '${name}' created successfully! You are the Team Admin.`,
      team: populatedTeam
    });
  } catch (error) {
    console.error("Create Team Error:", error);
    res.status(500).json({ message: "Failed to create team. " + error.message });
  }
});

// GET /api/teams/:id - Get team details, skill gaps, members, and linked project
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Invalid team ID format." });
    }

    const team = await Team.findById(req.params.id)
      .populate("hackathon")
      .populate("createdBy", "name primaryRole email")
      .populate("members.user", "name primaryRole skills email avatar githubUsername");

    if (!team) {
      return res.status(404).json({ message: "Team not found." });
    }

    const skillGap = calculateSkillGap(team);

    // Find if there is a linked project for this team
    const project = await Project.findOne({ team: req.params.id })
      .populate("tasks.assignedUser", "name primaryRole");

    // Find pending join requests
    const joinRequests = await JoinRequest.find({ team: req.params.id, status: "pending" })
      .populate("user", "name primaryRole skills githubUsername email");

    res.json({
      team,
      skillGap,
      project,
      joinRequests
    });
  } catch (error) {
    console.error("Get Team Details Error:", error);
    res.status(500).json({ message: "Failed to load team details." });
  }
});

// GET /api/teams/:id/recommendations - Complementary skill matching algorithm
router.get("/:id/recommendations", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Invalid team ID format." });
    }

    const team = await Team.findById(req.params.id).populate("members.user", "skills");
    if (!team) {
      return res.status(404).json({ message: "Team not found." });
    }

    const { missingSkills } = calculateSkillGap(team);

    // Get IDs of current team members to exclude them
    const memberUserIds = team.members.map((m) => m.user?._id || m.user);

    // Fetch candidate students who are not in this team
    const candidates = await User.find({
      _id: { $nin: memberUserIds },
      role: { $ne: "admin" }
    }).select("name email primaryRole skills bio githubUsername avatar college course");

    // Score candidates based on how many missing skills they fill (Rule-based explainable fit)
    const recommendations = [];

    candidates.forEach((student) => {
      const studentSkills = student.skills || [];
      const matchedMissing = [];

      missingSkills.forEach((missingSkill) => {
        const hasSkill = studentSkills.some(
          (s) =>
            s.toLowerCase() === missingSkill.toLowerCase() ||
            s.toLowerCase().includes(missingSkill.toLowerCase()) ||
            missingSkill.toLowerCase().includes(s.toLowerCase())
        );
        if (hasSkill) {
          matchedMissing.push(missingSkill);
        }
      });

      // Also check general role compatibility
      const roleMatchesMissing = missingSkills.some(
        (m) =>
          student.primaryRole.toLowerCase().includes(m.toLowerCase()) ||
          m.toLowerCase().includes(student.primaryRole.toLowerCase())
      );

      if (matchedMissing.length > 0 || roleMatchesMissing) {
        // Calculate fit percentage: 70% to 98%
        const scoreFraction = missingSkills.length > 0 ? matchedMissing.length / missingSkills.length : 0.5;
        const fitScore = Math.min(98, Math.max(70, Math.round(65 + scoreFraction * 30 + (roleMatchesMissing ? 5 : 0))));

        const matchedList = matchedMissing.length > 0 ? matchedMissing.join(", ") : student.primaryRole;
        const reason = `Matches your team's missing skill requirements in ${matchedList}.`;

        recommendations.push({
          student,
          fitScore,
          matchedSkills: matchedMissing,
          reason
        });
      }
    });

    // Sort by fit score descending
    recommendations.sort((a, b) => b.fitScore - a.fitScore);

    res.json(recommendations);
  } catch (error) {
    console.error("Recommendations Error:", error);
    res.status(500).json({ message: "Failed to generate teammate recommendations." });
  }
});

// POST /api/teams/:id/invite - Invite a student to the team (Team Admin only)
router.post("/:id/invite", authenticate, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Invalid team ID format." });
    }

    const { userId, message } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "Please specify the student to invite." });
    }

    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: "Team not found." });
    }

    // Verify creator / admin rights
    if (String(team.createdBy) !== req.user.id) {
      return res.status(403).json({ message: "Only the Team Admin can send invitations." });
    }

    // Check if team is full
    if (team.members.length >= team.maxMembers) {
      return res.status(400).json({ message: "This team is already at maximum capacity." });
    }

    // Check if user is already a member
    const alreadyMember = team.members.some((m) => String(m.user) === String(userId));
    if (alreadyMember) {
      return res.status(400).json({ message: "This student is already a member of the team." });
    }

    // Check if invitation already pending
    const existingInvite = await Invitation.findOne({
      team: team._id,
      invitedUser: userId,
      status: "pending"
    });

    if (existingInvite) {
      return res.status(400).json({ message: "An invitation is already pending for this student." });
    }

    const newInvite = await Invitation.create({
      team: team._id,
      invitedUser: userId,
      invitedBy: req.user.id,
      message: message || `We would love for you to join ${team.name}!`
    });

    res.status(201).json({
      message: "Invitation sent successfully!",
      invitation: newInvite
    });
  } catch (error) {
    console.error("Send Invitation Error:", error);
    res.status(500).json({ message: "Failed to send invitation. " + error.message });
  }
});

// POST /api/teams/:id/join - Student requests to join a team
router.post("/:id/join", authenticate, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Invalid team ID format." });
    }

    const { message } = req.body;
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: "Team not found." });
    }

    // Check if team is full
    if (team.members.length >= team.maxMembers) {
      return res.status(400).json({ message: "This team is currently full." });
    }

    // Check if already a member
    const alreadyMember = team.members.some((m) => String(m.user) === req.user.id);
    if (alreadyMember) {
      return res.status(400).json({ message: "You are already a member of this team." });
    }

    // Check if request already pending
    const existingReq = await JoinRequest.findOne({
      team: team._id,
      user: req.user.id,
      status: "pending"
    });

    if (existingReq) {
      return res.status(400).json({ message: "You have already submitted a join request for this team." });
    }

    const joinRequest = await JoinRequest.create({
      team: team._id,
      user: req.user.id,
      message: message || "I would like to join your team."
    });

    res.status(201).json({
      message: "Join request submitted to the Team Admin!",
      joinRequest
    });
  } catch (error) {
    console.error("Join Request Error:", error);
    res.status(500).json({ message: "Failed to submit join request." });
  }
});

// PUT /api/teams/:id/requests/:requestId - Team Admin accepts or rejects join request
router.put("/:id/requests/:requestId", authenticate, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id) || !mongoose.Types.ObjectId.isValid(req.params.requestId)) {
      return res.status(404).json({ message: "Invalid ID format." });
    }

    const { action } = req.body; // 'accepted' or 'rejected'
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: "Team not found." });
    }

    if (String(team.createdBy) !== req.user.id) {
      return res.status(403).json({ message: "Only the Team Admin can process join requests." });
    }

    const joinRequest = await JoinRequest.findById(req.params.requestId).populate("user");
    if (!joinRequest) {
      return res.status(404).json({ message: "Join request not found." });
    }

    if (action === "accepted") {
      if (team.members.length >= team.maxMembers) {
        return res.status(400).json({ message: "Team is already full." });
      }

      // Add to team members
      const applicantRole = joinRequest.user?.primaryRole || "Team Member";
      team.members.push({
        user: joinRequest.user._id,
        role: applicantRole,
        joinedAt: new Date()
      });

      if (team.members.length >= team.maxMembers) {
        team.status = "Full";
      }

      await team.save();

      joinRequest.status = "accepted";
      await joinRequest.save();

      return res.json({
        message: `${joinRequest.user?.name || "Student"} has joined the team!`,
        team
      });
    } else {
      joinRequest.status = "rejected";
      await joinRequest.save();
      return res.json({ message: "Join request declined." });
    }
  } catch (error) {
    console.error("Process Join Request Error:", error);
    res.status(500).json({ message: "Failed to process join request." });
  }
});

// DELETE /api/teams/:id/members/:userId - Remove member or leave team
router.delete("/:id/members/:userId", authenticate, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Invalid team ID format." });
    }

    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: "Team not found." });
    }

    const targetUserId = req.params.userId;
    const isTeamAdmin = String(team.createdBy) === req.user.id;
    const isSelfLeaving = req.user.id === targetUserId;

    if (!isTeamAdmin && !isSelfLeaving) {
      return res.status(403).json({ message: "Unauthorized to remove this member." });
    }

    if (String(team.createdBy) === targetUserId && isSelfLeaving) {
      return res.status(400).json({
        message: "Team Admin cannot leave the team directly. Please assign another admin or delete the team."
      });
    }

    team.members = team.members.filter((m) => String(m.user) !== targetUserId);
    if (team.members.length < team.maxMembers) {
      team.status = "Open";
    }
    await team.save();

    res.json({
      message: "Member removed from team successfully.",
      team
    });
  } catch (error) {
    console.error("Remove Member Error:", error);
    res.status(500).json({ message: "Failed to remove member." });
  }
});

// PUT /api/teams/:id - Update team info / required skills
router.put("/:id", authenticate, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Invalid team ID format." });
    }

    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: "Team not found." });
    }

    if (String(team.createdBy) !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Only the Team Admin can update team settings." });
    }

    const { name, description, requiredSkills, maxMembers } = req.body;

    if (name) team.name = name;
    if (description !== undefined) team.description = description;
    if (requiredSkills) team.requiredSkills = requiredSkills;
    if (maxMembers) team.maxMembers = maxMembers;

    await team.save();

    res.json({
      message: "Team details updated successfully!",
      team
    });
  } catch (error) {
    console.error("Update Team Error:", error);
    res.status(500).json({ message: "Failed to update team." });
  }
});

module.exports = router;
