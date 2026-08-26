const express = require("express");
const router = express.Router();

const Invitation = require("../models/Invitation");
const Team = require("../models/Team");
const User = require("../models/User");
const { authenticate } = require("../middleware/auth");

// GET /api/invitations - Get invitations received and sent by current user
router.get("/", authenticate, async (req, res) => {
  try {
    const received = await Invitation.find({ invitedUser: req.user.id })
      .populate("team", "name description hackathonName maxMembers members requiredSkills")
      .populate("invitedBy", "name primaryRole")
      .sort({ createdAt: -1 });

    const sent = await Invitation.find({ invitedBy: req.user.id })
      .populate("team", "name")
      .populate("invitedUser", "name primaryRole skills")
      .sort({ createdAt: -1 });

    res.json({
      received,
      sent
    });
  } catch (error) {
    console.error("Fetch Invitations Error:", error);
    res.status(500).json({ message: "Failed to fetch invitations." });
  }
});

// PUT /api/invitations/:id - Accept or reject an invitation
router.put("/:id", authenticate, async (req, res) => {
  try {
    const { action } = req.body; // "accepted" or "rejected"
    const invitation = await Invitation.findById(req.params.id)
      .populate("team")
      .populate("invitedUser");

    if (!invitation) {
      return res.status(404).json({ message: "Invitation not found." });
    }

    if (String(invitation.invitedUser._id) !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to respond to this invitation." });
    }

    if (invitation.status !== "pending") {
      return res.status(400).json({ message: `Invitation has already been ${invitation.status}.` });
    }

    if (action === "accepted") {
      const team = await Team.findById(invitation.team._id);
      if (!team) {
        return res.status(404).json({ message: "Associated team no longer exists." });
      }

      if (team.members.length >= team.maxMembers) {
        invitation.status = "rejected";
        await invitation.save();
        return res.status(400).json({ message: "This team has already reached maximum capacity." });
      }

      // Check if already in team
      const alreadyMember = team.members.some((m) => String(m.user) === req.user.id);
      if (!alreadyMember) {
        const user = await User.findById(req.user.id);
        const role = user?.primaryRole || "Team Member";

        team.members.push({
          user: req.user.id,
          role,
          joinedAt: new Date()
        });

        if (team.members.length >= team.maxMembers) {
          team.status = "Full";
        }

        await team.save();
      }

      invitation.status = "accepted";
      await invitation.save();

      return res.json({
        message: `You have successfully joined ${team.name}!`,
        teamId: team._id
      });
    } else {
      invitation.status = "rejected";
      await invitation.save();
      return res.json({ message: "Invitation declined." });
    }
  } catch (error) {
    console.error("Respond to Invitation Error:", error);
    res.status(500).json({ message: "Failed to process invitation response." });
  }
});

module.exports = router;
