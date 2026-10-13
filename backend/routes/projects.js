const express = require("express");
const router = express.Router();

const Project = require("../models/Project");
const Team = require("../models/Team");
const { authenticate } = require("../middleware/auth");

// GET /api/projects - List public campus projects with search and filters
router.get("/", async (req, res) => {
  try {
    const { search, tech, status } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { role: { $regex: search, $options: "i" } },
        { techStack: { $regex: search, $options: "i" } }
      ];
    }

    if (tech && tech !== "All") {
      query.techStack = { $regex: tech, $options: "i" };
    }

    if (status && status !== "All") {
      query.status = status;
    }

    const projects = await Project.find(query)
      .populate("createdBy", "name primaryRole avatar")
      .populate("team", "name")
      .populate("hackathon", "name")
      .sort({ updatedAt: -1, createdAt: -1 });

    // Deduplicate: Each unique project gets exactly one card, preserving all distinct project cards
    const uniqueMap = new Map();
    for (const p of projects) {
      const normalizedTitle = (p.title || "").trim().toLowerCase().replace(/\s+\(workspace\)$/i, "");
      const teamId = p.team ? String(p.team._id || p.team) : null;
      const key = teamId ? `team_${teamId}_${normalizedTitle}` : `title_${normalizedTitle}`;

      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, p);
      }
    }

    const dedupedProjects = Array.from(uniqueMap.values());
    res.json(dedupedProjects);
  } catch (error) {
    console.error("Fetch Projects Error:", error);
    res.status(500).json({ message: "Failed to fetch projects." });
  }
});

// POST /api/projects - Create or update project (one card per unique project)
router.post("/", authenticate, async (req, res) => {
  try {
    const {
      projectId,
      title,
      description,
      teamId,
      hackathonId,
      role,
      techStack,
      githubUrl,
      liveUrl,
      status,
      requiredRoles
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Please provide Project Title and Description." });
    }

    // Check if an existing project card should be updated instead of creating a duplicate
    let existingProject = null;

    if (projectId) {
      existingProject = await Project.findById(projectId);
    }

    if (!existingProject && title) {
      const cleanTitle = title.trim();
      const escaped = cleanTitle.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const titleRegex = new RegExp(`^${escaped}(\\s*\\(workspace\\))?$`, "i");

      if (teamId) {
        existingProject = await Project.findOne({
          team: teamId,
          title: { $regex: titleRegex }
        });
      }

      if (!existingProject) {
        existingProject = await Project.findOne({
          createdBy: req.user.id,
          title: { $regex: titleRegex }
        });
      }
    }

    // If an existing project is found, update that one card!
    if (existingProject) {
      existingProject.title = title.trim();
      existingProject.description = description;
      if (teamId) existingProject.team = teamId;
      if (hackathonId) existingProject.hackathon = hackathonId;
      if (role) existingProject.role = role;
      if (Array.isArray(techStack)) existingProject.techStack = techStack;
      if (githubUrl !== undefined) existingProject.githubUrl = githubUrl;
      if (liveUrl !== undefined) existingProject.liveUrl = liveUrl;
      if (status) existingProject.status = status;
      if (Array.isArray(requiredRoles) && requiredRoles.length > 0) {
        existingProject.requiredRoles = requiredRoles;
      }

      await existingProject.save();

      const populated = await Project.findById(existingProject._id)
        .populate("createdBy", "name primaryRole")
        .populate("team", "name");

      return res.status(200).json({
        message: `Project '${existingProject.title}' updated successfully.`,
        project: populated,
        isUpdated: true
      });
    }

    // Otherwise create new unique project
    const newProject = await Project.create({
      title: title.trim(),
      description,
      createdBy: req.user.id,
      team: teamId || null,
      hackathon: hackathonId || null,
      role: role || "Project Lead",
      techStack: Array.isArray(techStack) ? techStack : [],
      githubUrl: githubUrl || "",
      liveUrl: liveUrl || "",
      status: status || "Planning",
      requiredRoles: Array.isArray(requiredRoles) ? requiredRoles : []
    });

    const populated = await Project.findById(newProject._id)
      .populate("createdBy", "name primaryRole")
      .populate("team", "name");

    res.status(201).json({
      message: "Project created successfully!",
      project: populated,
      isUpdated: false
    });
  } catch (error) {
    console.error("Create/Update Project Error:", error);
    res.status(500).json({ message: "Failed to save project. " + error.message });
  }
});

// GET /api/projects/:id - Get full project workspace details
router.get("/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("createdBy", "name email primaryRole avatar")
      .populate({
        path: "team",
        populate: {
          path: "members.user",
          select: "name primaryRole skills email avatar"
        }
      })
      .populate("hackathon", "name officialUrl")
      .populate("tasks.assignedUser", "name primaryRole")
      .populate("collaborationRequests.user", "name primaryRole skills email");

    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    // Calculate completion progress percentage
    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter((t) => t.status === "Completed").length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : project.status === "Completed" ? 100 : 0;

    res.json({
      project,
      progress,
      totalTasks,
      completedTasks
    });
  } catch (error) {
    console.error("Get Project Details Error:", error);
    res.status(500).json({ message: "Failed to load project details." });
  }
});

// PUT /api/projects/:id - Update project settings
router.put("/:id", authenticate, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    // Check authorization: Owner or Team Admin
    const isOwner = String(project.createdBy) === req.user.id;
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized to modify this project." });
    }

    const {
      title,
      description,
      role,
      techStack,
      githubUrl,
      liveUrl,
      status,
      requiredRoles,
      isFeatured
    } = req.body;

    if (title) project.title = title;
    if (description) project.description = description;
    if (role) project.role = role;
    if (techStack) project.techStack = techStack;
    if (githubUrl !== undefined) project.githubUrl = githubUrl;
    if (liveUrl !== undefined) project.liveUrl = liveUrl;
    if (status) project.status = status;
    if (requiredRoles) project.requiredRoles = requiredRoles;
    if (isFeatured !== undefined) project.isFeatured = isFeatured;

    await project.save();

    res.json({
      message: "Project updated successfully!",
      project
    });
  } catch (error) {
    console.error("Update Project Error:", error);
    res.status(500).json({ message: "Failed to update project." });
  }
});

// DELETE /api/projects/:id - Delete project
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    if (String(project.createdBy) !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized to delete this project." });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.json({ message: "Project deleted successfully." });
  } catch (error) {
    console.error("Delete Project Error:", error);
    res.status(500).json({ message: "Failed to delete project." });
  }
});

// POST /api/projects/:id/tasks - Add a task/feature to project
router.post("/:id/tasks", authenticate, async (req, res) => {
  try {
    const { title, description, assignedUserId, priority } = req.body;
    if (!title) {
      return res.status(400).json({ message: "Please provide a task title." });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    project.tasks.push({
      title,
      description: description || "",
      assignedUser: assignedUserId || req.user.id,
      status: "Todo",
      priority: priority || "Medium",
      createdAt: new Date()
    });

    await project.save();

    res.status(201).json({
      message: "Task added to project feature tracker!",
      tasks: project.tasks
    });
  } catch (error) {
    console.error("Add Task Error:", error);
    res.status(500).json({ message: "Failed to add task." });
  }
});

// PUT /api/projects/:id/tasks/:taskId - Update a project task status or assignment
router.put("/:id/tasks/:taskId", authenticate, async (req, res) => {
  try {
    const { status, assignedUserId, priority, title, description } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    const task = project.tasks.id(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    if (status) task.status = status;
    if (assignedUserId !== undefined) task.assignedUser = assignedUserId;
    if (priority) task.priority = priority;
    if (title) task.title = title;
    if (description !== undefined) task.description = description;

    // Auto update project status if all tasks completed
    const allCompleted = project.tasks.length > 0 && project.tasks.every((t) => t.status === "Completed");
    if (allCompleted) {
      project.status = "Completed";
    }

    await project.save();

    res.json({
      message: "Task updated successfully!",
      tasks: project.tasks,
      projectStatus: project.status
    });
  } catch (error) {
    console.error("Update Task Error:", error);
    res.status(500).json({ message: "Failed to update task." });
  }
});

// DELETE /api/projects/:id/tasks/:taskId - Remove a task
router.delete("/:id/tasks/:taskId", authenticate, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    project.tasks.pull(req.params.taskId);
    await project.save();

    res.json({
      message: "Task removed.",
      tasks: project.tasks
    });
  } catch (error) {
    console.error("Delete Task Error:", error);
    res.status(500).json({ message: "Failed to delete task." });
  }
});

// POST /api/projects/:id/collaborate - Request to collaborate on a project
router.post("/:id/collaborate", authenticate, async (req, res) => {
  try {
    const { role, message } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    // Check if already requested
    const alreadyReq = project.collaborationRequests.some(
      (r) => String(r.user) === req.user.id && r.status === "pending"
    );
    if (alreadyReq) {
      return res.status(400).json({ message: "Collaboration request already pending." });
    }

    project.collaborationRequests.push({
      user: req.user.id,
      role: role || "Developer",
      message: message || "I would like to collaborate on this project."
    });

    await project.save();

    res.status(201).json({
      message: "Collaboration request sent to project creator!",
      collaborationRequests: project.collaborationRequests
    });
  } catch (error) {
    console.error("Collaborate Request Error:", error);
    res.status(500).json({ message: "Failed to submit collaboration request." });
  }
});

// PUT /api/projects/:id/requests/:requestId - Respond to collaboration request
router.put("/:id/requests/:requestId", authenticate, async (req, res) => {
  try {
    const { action } = req.body; // 'accepted' or 'rejected'
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    if (String(project.createdBy) !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized to manage collaboration requests." });
    }

    const reqItem = project.collaborationRequests.id(req.params.requestId);
    if (!reqItem) {
      return res.status(404).json({ message: "Request not found." });
    }

    reqItem.status = action === "accepted" ? "accepted" : "rejected";
    await project.save();

    res.json({
      message: `Collaboration request ${reqItem.status}.`,
      collaborationRequests: project.collaborationRequests
    });
  } catch (error) {
    console.error("Respond Collaboration Request Error:", error);
    res.status(500).json({ message: "Failed to update collaboration request." });
  }
});

module.exports = router;
