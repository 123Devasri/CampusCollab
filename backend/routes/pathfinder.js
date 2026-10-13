const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const PathfinderPlan = require("../models/PathfinderPlan");
const Team = require("../models/Team");
const Project = require("../models/Project");
const User = require("../models/User");
const { authenticate } = require("../middleware/auth");
const { planWithAIOrFallback } = require("../services/aiPlannerService");
const { recalculatePlan } = require("../services/pathfinderEngine");

/**
 * Helper to check whether user has view/edit authorization on a plan
 */
function isPlanAuthorized(plan, userId, userRole) {
  if (userRole === "admin") return true;
  if (String(plan.createdBy) === String(userId)) return true;
  if (plan.teamMemberSnapshots && plan.teamMemberSnapshots.some((m) => String(m.userId) === String(userId))) {
    return true;
  }
  return false;
}

// GET /api/pathfinder - List plans accessible to the authenticated user
router.get("/", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const plans = await PathfinderPlan.find({
      $or: [
        { createdBy: userId },
        { "teamMemberSnapshots.userId": userId }
      ]
    })
      .select("title projectCategory planningMode constraints.finalDeadline constraints.projectType risksAndFeasibility.overallFeasibilityScore createdAt updatedAt tasks")
      .populate("team", "name")
      .populate("createdBy", "name primaryRole")
      .sort({ updatedAt: -1 });

    const summary = plans.map((p) => {
      const total = p.tasks.length;
      const completed = p.tasks.filter((t) => t.status === "Completed").length;
      const blocked = p.tasks.filter((t) => t.status === "Blocked").length;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        _id: p._id,
        title: p.title,
        projectCategory: p.projectCategory,
        planningMode: p.planningMode,
        finalDeadline: p.constraints?.finalDeadline,
        projectType: p.constraints?.projectType,
        feasibility: p.risksAndFeasibility?.overallFeasibilityScore,
        totalTasks: total,
        completedTasks: completed,
        blockedTasks: blocked,
        progress,
        teamName: p.team?.name || "Independent Squad",
        createdBy: p.createdBy?.name,
        updatedAt: p.updatedAt
      };
    });

    res.json(summary);
  } catch (error) {
    console.error("List Pathfinder Plans Error:", error);
    res.status(500).json({ message: "Failed to fetch project plans." });
  }
});

// GET /api/pathfinder/:id - Get full plan details
router.get("/:id", authenticate, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid plan ID." });
    }

    const plan = await PathfinderPlan.findById(req.params.id)
      .populate("createdBy", "name email primaryRole avatar")
      .populate("team", "name hackathonName members")
      .populate("linkedProject", "title status");

    if (!plan) {
      return res.status(404).json({ message: "Project plan not found." });
    }

    if (!isPlanAuthorized(plan, req.user.id, req.user.role)) {
      return res.status(403).json({ message: "Unauthorized to access this plan." });
    }

    res.json(plan);
  } catch (error) {
    console.error("Get Pathfinder Plan Error:", error);
    res.status(500).json({ message: "Failed to load project plan." });
  }
});

// POST /api/pathfinder/generate - Generate & save a new PathFinder plan
router.post("/generate", authenticate, async (req, res) => {
  try {
    const {
      title,
      problemStatement,
      expectedOutcome,
      targetUsers,
      projectCategory,
      mandatoryRequirements,
      referenceLinks,
      evaluationCriteria,
      teamId,
      planningMode,
      specifiedStack,
      teamMembers,
      constraints
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Project title is required." });
    }
    if (!problemStatement || problemStatement.trim().length < 15) {
      return res.status(400).json({ message: "Please provide a detailed problem statement (at least 15 characters)." });
    }
    if (!constraints || !constraints.finalDeadline) {
      return res.status(400).json({ message: "A valid final deadline is required." });
    }

    // Build member snapshots
    let snapshots = [];
    if (Array.isArray(teamMembers) && teamMembers.length > 0) {
      snapshots = teamMembers.map((m) => ({
        userId: m.userId || null,
        name: m.name || "Teammate",
        email: m.email || "",
        technicalSkills: Array.isArray(m.technicalSkills) ? m.technicalSkills : (m.skills || []),
        proficiencyLevel: m.proficiencyLevel || "Intermediate",
        preferredRole: m.preferredRole || "Developer",
        availableHours: Number(m.availableHours) || 20,
        tasksInterestedIn: Array.isArray(m.tasksInterestedIn) ? m.tasksInterestedIn : [],
        willingToLearn: Array.isArray(m.willingToLearn) ? m.willingToLearn : []
      }));
    } else {
      // Default to creator's profile
      const creator = await User.findById(req.user.id);
      snapshots = [
        {
          userId: creator._id,
          name: creator.name,
          email: creator.email,
          technicalSkills: creator.skills || ["JavaScript", "React"],
          proficiencyLevel: "Intermediate",
          preferredRole: creator.primaryRole || "Full Stack Developer",
          availableHours: 24,
          tasksInterestedIn: [],
          willingToLearn: []
        }
      ];
    }

    const planningPayload = {
      title: title.trim(),
      problemStatement: problemStatement.trim(),
      expectedOutcome: expectedOutcome || "",
      targetUsers: targetUsers || "",
      projectCategory: projectCategory || "Web Application",
      mandatoryRequirements: Array.isArray(mandatoryRequirements) ? mandatoryRequirements : [],
      referenceLinks: Array.isArray(referenceLinks) ? referenceLinks : [],
      evaluationCriteria: Array.isArray(evaluationCriteria) ? evaluationCriteria : [],
      planningMode: planningMode || "guide_from_scratch",
      specifiedStack: specifiedStack || {},
      memberSnapshots: snapshots,
      constraints: {
        finalDeadline: new Date(constraints.finalDeadline),
        timeZone: constraints.timeZone || "Asia/Kolkata",
        projectType: constraints.projectType || "24-hour hackathon",
        availableHoursTotal: Number(constraints.availableHoursTotal) || 24,
        infrastructureLimits: constraints.infrastructureLimits || "",
        mandatoryFeatures: Array.isArray(constraints.mandatoryFeatures) ? constraints.mandatoryFeatures : [],
        optionalFeatures: Array.isArray(constraints.optionalFeatures) ? constraints.optionalFeatures : [],
        deploymentRequirements: constraints.deploymentRequirements || "",
        demoPresentationTime: constraints.demoPresentationTime ? new Date(constraints.demoPresentationTime) : null
      }
    };

    // Execute planning engine (with AI enhancement or verified deterministic fallback)
    const generatedRoadmap = await planWithAIOrFallback(planningPayload);

    // Save plan to MongoDB
    const newPlan = new PathfinderPlan({
      title: planningPayload.title,
      problemStatement: planningPayload.problemStatement,
      expectedOutcome: planningPayload.expectedOutcome,
      targetUsers: planningPayload.targetUsers,
      projectCategory: planningPayload.projectCategory,
      mandatoryRequirements: planningPayload.mandatoryRequirements,
      referenceLinks: planningPayload.referenceLinks,
      evaluationCriteria: planningPayload.evaluationCriteria,
      createdBy: req.user.id,
      team: teamId || null,
      planningMode: planningPayload.planningMode,
      specifiedStack: planningPayload.specifiedStack,
      teamMemberSnapshots: snapshots,
      constraints: planningPayload.constraints,
      problemAnalysis: generatedRoadmap.problemAnalysis,
      architectureAndTech: generatedRoadmap.architectureAndTech,
      modules: generatedRoadmap.modules,
      tasks: generatedRoadmap.tasks,
      timelineMilestones: generatedRoadmap.timelineMilestones,
      risksAndFeasibility: generatedRoadmap.risksAndFeasibility,
      planHistory: [
        {
          revisionNumber: 1,
          recalculatedAt: new Date(),
          recalculationReason: "Initial plan generation",
          summaryOfChanges: `Generated initial roadmap with ${generatedRoadmap.tasks.length} tasks and ${generatedRoadmap.modules.length} architectural modules.`
        }
      ],
      generationMetadata: generatedRoadmap.generationMetadata
    });

    await newPlan.save();

    res.status(201).json({
      message: "Project PathFinder plan generated successfully!",
      plan: newPlan
    });
  } catch (error) {
    console.error("Generate Pathfinder Plan Error:", error);
    res.status(500).json({ message: "Failed to generate project plan. " + error.message });
  }
});

// PUT /api/pathfinder/:id/tasks/:taskId - Update individual task status, assignment or blocker
router.put("/:id/tasks/:taskId", authenticate, async (req, res) => {
  try {
    const { status, assignedTo, blockerReason, priority } = req.body;
    const plan = await PathfinderPlan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({ message: "Project plan not found." });
    }

    if (!isPlanAuthorized(plan, req.user.id, req.user.role)) {
      return res.status(403).json({ message: "Unauthorized to modify this plan." });
    }

    let task = null;
    const targetId = decodeURIComponent(req.params.taskId).trim();
    if (mongoose.Types.ObjectId.isValid(targetId)) {
      task = plan.tasks.id(targetId);
    }
    if (!task) {
      task = plan.tasks.find(
        (t) =>
          String(t._id) === targetId ||
          t.taskId === targetId ||
          (t.taskId && t.taskId.toLowerCase() === targetId.toLowerCase())
      );
    }
    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    if (status) {
      task.status = status;
      if (status === "Completed") {
        task.completionDate = new Date();
        task.blockerReason = "";
      }
    }

    if (assignedTo !== undefined || req.body.assignedMemberName !== undefined) {
      const targetAssignee = assignedTo || req.body.assignedMemberName;
      if (targetAssignee) {
        const member = plan.teamMemberSnapshots.find(
          (m) => String(m.userId) === String(targetAssignee) || m.name.toLowerCase() === String(targetAssignee).toLowerCase()
        );
        if (member) {
          task.assignedMemberName = member.name;
          task.assignedTo = member.userId || null;
        } else {
          task.assignedMemberName = targetAssignee;
          task.assignedTo = null;
        }
      } else {
        task.assignedMemberName = "Unassigned";
        task.assignedTo = null;
      }
    }

    if (blockerReason !== undefined) task.blockerReason = blockerReason;
    if (priority) task.priority = priority;

    await plan.save();

    res.json({
      message: "Task updated successfully!",
      task,
      tasks: plan.tasks
    });
  } catch (error) {
    console.error("Update Pathfinder Task Error:", error);
    res.status(500).json({ message: "Failed to update task." });
  }
});

// PUT /api/pathfinder/:id/architecture - Update architecture & stack, with option to draft a new plan
router.put("/:id/architecture", authenticate, async (req, res) => {
  try {
    const {
      recommendedArchitecture,
      frontendTech,
      backendTech,
      databaseTech,
      deploymentApproach,
      selectionRationale,
      draftNewPlan
    } = req.body;

    const plan = await PathfinderPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: "Project plan not found." });
    }

    if (!isPlanAuthorized(plan, req.user.id, req.user.role)) {
      return res.status(403).json({ message: "Unauthorized to modify this plan." });
    }

    // Update architectureAndTech
    if (recommendedArchitecture) plan.architectureAndTech.recommendedArchitecture = recommendedArchitecture;
    if (Array.isArray(frontendTech)) plan.architectureAndTech.frontendTech = frontendTech;
    if (Array.isArray(backendTech)) plan.architectureAndTech.backendTech = backendTech;
    if (Array.isArray(databaseTech)) plan.architectureAndTech.databaseTech = databaseTech;
    if (deploymentApproach) plan.architectureAndTech.deploymentApproach = deploymentApproach;
    if (selectionRationale) plan.architectureAndTech.selectionRationale = selectionRationale;

    // Update specifiedStack
    plan.specifiedStack = {
      frontend: Array.isArray(frontendTech) ? frontendTech.join(", ") : (frontendTech || ""),
      backend: Array.isArray(backendTech) ? backendTech.join(", ") : (backendTech || ""),
      database: Array.isArray(databaseTech) ? databaseTech.join(", ") : (databaseTech || ""),
      frameworks: "",
      apisAndServices: "",
      aiMlTools: ""
    };

    if (draftNewPlan) {
      // Re-generate plan using the planning engine with the updated stack preferences
      const planningPayload = {
        title: plan.title,
        problemStatement: plan.problemStatement,
        expectedOutcome: plan.expectedOutcome || "",
        targetUsers: plan.targetUsers || "",
        projectCategory: plan.projectCategory || "Web Application",
        mandatoryRequirements: plan.mandatoryRequirements || [],
        referenceLinks: plan.referenceLinks || [],
        evaluationCriteria: plan.evaluationCriteria || [],
        planningMode: "know_my_stack",
        specifiedStack: plan.specifiedStack,
        memberSnapshots: plan.teamMemberSnapshots || [],
        constraints: plan.constraints
      };

      const generatedRoadmap = await planWithAIOrFallback(planningPayload);

      plan.architectureAndTech = generatedRoadmap.architectureAndTech;
      plan.modules = generatedRoadmap.modules;
      plan.tasks = generatedRoadmap.tasks;
      plan.timelineMilestones = generatedRoadmap.timelineMilestones;
      plan.risksAndFeasibility = generatedRoadmap.risksAndFeasibility;

      plan.planHistory.push({
        revisionNumber: (plan.planHistory?.length || 0) + 1,
        recalculatedAt: new Date(),
        recalculationReason: "Drafted new plan with updated architecture & technology stack",
        summaryOfChanges: `Updated stack to ${plan.specifiedStack.frontend} / ${plan.specifiedStack.backend} / ${plan.specifiedStack.database}. Re-engineered ${generatedRoadmap.tasks.length} tasks and ${generatedRoadmap.modules.length} modules.`
      });
    }

    await plan.save();

    res.json({
      message: draftNewPlan ? "Drafted new development plan with updated stack!" : "Architecture and technology stack updated successfully!",
      plan
    });
  } catch (error) {
    console.error("Update Architecture Error:", error);
    res.status(500).json({ message: "Failed to update architecture. " + error.message });
  }
});

// POST /api/pathfinder/:id/recalculate - Dynamic Replanning
router.post("/:id/recalculate", authenticate, async (req, res) => {
  try {
    const { updatedMemberAvailability, updatedDeadline, reason } = req.body;
    const plan = await PathfinderPlan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({ message: "Project plan not found." });
    }

    if (!isPlanAuthorized(plan, req.user.id, req.user.role)) {
      return res.status(403).json({ message: "Unauthorized to recalculate this plan." });
    }

    const recalculated = recalculatePlan(plan, {
      updatedMemberAvailability,
      updatedDeadline,
      reason
    });

    plan.tasks = recalculated.tasks;
    plan.timelineMilestones = recalculated.timelineMilestones;
    plan.risksAndFeasibility = recalculated.risksAndFeasibility;
    plan.teamMemberSnapshots = recalculated.teamMemberSnapshots;
    plan.constraints = recalculated.constraints;
    plan.planHistory.push(recalculated.historyEntry);

    await plan.save();

    res.json({
      message: "Project roadmap recalculated and optimized!",
      plan
    });
  } catch (error) {
    console.error("Recalculate Pathfinder Plan Error:", error);
    res.status(500).json({ message: "Failed to recalculate plan. " + error.message });
  }
});

// POST /api/pathfinder/:id/export-to-project - Link or export roadmap tasks into CampusCollab Kanban Workspace
router.post("/:id/export-to-project", authenticate, async (req, res) => {
  try {
    const plan = await PathfinderPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found." });
    }

    if (!isPlanAuthorized(plan, req.user.id, req.user.role)) {
      return res.status(403).json({ message: "Unauthorized." });
    }

    // Convert pathfinder tasks to Project model tasks
    const projectTasks = plan.tasks.map((t) => ({
      title: `[${t.taskId}] ${t.title}`,
      description: `${t.description}\n\nModule: ${t.moduleName}\nEst. Hours: ${t.estimatedHours}`,
      assignedUser: t.assignedTo || req.user.id,
      status: t.status === "Completed" ? "Completed" : t.status === "In Progress" ? "In Progress" : "Todo",
      priority: t.priority === "Critical" || t.priority === "High" ? "High" : t.priority === "Medium" ? "Medium" : "Low",
      createdAt: new Date()
    }));

    // Check if a project card already exists for this team, linkedProject, or title
    let project = null;
    if (plan.linkedProject) {
      project = await Project.findById(plan.linkedProject);
    }
    if (!project && plan.team) {
      project = await Project.findOne({ team: plan.team });
    }
    if (!project) {
      const cleanTitle = plan.title.trim();
      project = await Project.findOne({
        createdBy: req.user.id,
        $or: [
          { title: { $regex: new RegExp(`^${cleanTitle.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\s*\\(workspace\\)$`, "i") } },
          { title: { $regex: new RegExp(`^${cleanTitle.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, "i") } }
        ]
      });
    }

    if (project) {
      // Update that one existing card! Do not create duplicate cards.
      project.title = `${plan.title} (Workspace)`;
      project.description = plan.problemStatement;
      if (plan.team) project.team = plan.team;
      project.role = "Lead Architect";
      project.techStack = [
        ...(plan.architectureAndTech?.frontendTech || []),
        ...(plan.architectureAndTech?.backendTech || [])
      ];
      project.status = "In Progress";
      project.tasks = projectTasks;
      await project.save();

      plan.linkedProject = project._id;
      await plan.save();

      return res.json({
        message: "Updated existing project workspace with roadmap tasks!",
        projectId: project._id,
        isUpdated: true
      });
    }

    // Otherwise create the single project workspace card
    project = await Project.create({
      title: `${plan.title} (Workspace)`,
      description: plan.problemStatement,
      createdBy: req.user.id,
      team: plan.team || null,
      role: "Lead Architect",
      techStack: [
        ...(plan.architectureAndTech?.frontendTech || []),
        ...(plan.architectureAndTech?.backendTech || [])
      ],
      status: "In Progress",
      tasks: projectTasks
    });

    plan.linkedProject = project._id;
    await plan.save();

    res.json({
      message: "Exported roadmap tasks to CampusCollab project workspace!",
      projectId: project._id,
      isUpdated: false
    });
  } catch (error) {
    console.error("Export to Project Error:", error);
    res.status(500).json({ message: "Failed to export tasks to project workspace." });
  }
});

// DELETE /api/pathfinder/:id - Delete a plan
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const plan = await PathfinderPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found." });
    }

    if (String(plan.createdBy) !== String(req.user.id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "Only the creator or admin can delete this plan." });
    }

    await PathfinderPlan.findByIdAndDelete(req.params.id);
    res.json({ message: "Project plan deleted." });
  } catch (error) {
    console.error("Delete Pathfinder Plan Error:", error);
    res.status(500).json({ message: "Failed to delete plan." });
  }
});

module.exports = router;
