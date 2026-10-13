import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import LoadingState from "../components/LoadingState";
import Modal from "../components/Modal";

function PathfinderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("roadmap"); // roadmap | tasklist | architecture | risks | history

  // Hover state for interactive roadmap nodes
  const [hoveredTask, setHoveredTask] = useState(null);
  const [activePhaseHover, setActivePhaseHover] = useState(null);
  const [highlightedTaskId, setHighlightedTaskId] = useState(null);

  // Filter state for Task List tab
  const [taskListStatusFilter, setTaskListStatusFilter] = useState("All");
  const [taskListModuleFilter, setTaskListModuleFilter] = useState("All");

  // Architecture Edit and Draft New Plan state
  const [isEditingArch, setIsEditingArch] = useState(false);
  const [archForm, setArchForm] = useState({
    recommendedArchitecture: "",
    frontendTech: "",
    backendTech: "",
    databaseTech: "",
    deploymentApproach: "",
    selectionRationale: ""
  });
  const [isSavingArch, setIsSavingArch] = useState(false);

  // Task update state
  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  // Selected task for detailed implementation modal
  const [selectedTask, setSelectedTask] = useState(null);

  // Blocker report modal
  const [blockerModalTask, setBlockerModalTask] = useState(null);
  const [blockerReasonInput, setBlockerReasonInput] = useState("");

  // Dynamic Replanning modal
  const [showRecalculateModal, setShowRecalculateModal] = useState(false);
  const [recalculateReason, setRecalculateReason] = useState("");
  const [recalculateDeadline, setRecalculateDeadline] = useState("");
  const [isRecalculating, setIsRecalculating] = useState(false);

  // Export to Kanban workspace state
  const [exportingToWorkspace, setExportingToWorkspace] = useState(false);
  const [exportSuccessMsg, setExportSuccessMsg] = useState("");

  const fetchPlan = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get(`/pathfinder/${id}`);
      setPlan(res.data);
      if (res.data?.constraints?.finalDeadline) {
        setRecalculateDeadline(new Date(res.data.constraints.finalDeadline).toISOString().slice(0, 16));
      }
    } catch (err) {
      console.error("Fetch plan error:", err);
      setError(err.response?.data?.message || "Failed to load project plan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, [id]);

  useEffect(() => {
    if (plan?.architectureAndTech) {
      setArchForm({
        recommendedArchitecture: plan.architectureAndTech.recommendedArchitecture || "",
        frontendTech: Array.isArray(plan.architectureAndTech.frontendTech)
          ? plan.architectureAndTech.frontendTech.join(", ")
          : (plan.architectureAndTech.frontendTech || ""),
        backendTech: Array.isArray(plan.architectureAndTech.backendTech)
          ? plan.architectureAndTech.backendTech.join(", ")
          : (plan.architectureAndTech.backendTech || ""),
        databaseTech: Array.isArray(plan.architectureAndTech.databaseTech)
          ? plan.architectureAndTech.databaseTech.join(", ")
          : (plan.architectureAndTech.databaseTech || ""),
        deploymentApproach: plan.architectureAndTech.deploymentApproach || "",
        selectionRationale: plan.architectureAndTech.selectionRationale || ""
      });
    }
  }, [plan]);

  // Save architecture & optionally draft a new plan
  const handleSaveArchitecture = async (draftNewPlan = false) => {
    try {
      setIsSavingArch(true);
      const res = await API.put(`/pathfinder/${id}/architecture`, {
        recommendedArchitecture: archForm.recommendedArchitecture,
        frontendTech: archForm.frontendTech.split(",").map((t) => t.trim()).filter(Boolean),
        backendTech: archForm.backendTech.split(",").map((t) => t.trim()).filter(Boolean),
        databaseTech: archForm.databaseTech.split(",").map((t) => t.trim()).filter(Boolean),
        deploymentApproach: archForm.deploymentApproach,
        selectionRationale: archForm.selectionRationale,
        draftNewPlan
      });
      setPlan(res.data.plan);
      setIsEditingArch(false);
      alert(draftNewPlan ? "Drafted new development plan with updated stack!" : "Architecture and tech stack updated!");
    } catch (err) {
      console.error("Save architecture error:", err);
      alert(err.response?.data?.message || "Failed to update architecture.");
    } finally {
      setIsSavingArch(false);
    }
  };

  // Jump from roadmap directly to that specific task in Task List tab
  const handleJumpToTask = (taskOrId) => {
    const tId = typeof taskOrId === "object" ? (taskOrId.taskId || taskOrId._id) : taskOrId;
    setHighlightedTaskId(tId);
    setTaskListStatusFilter("All");
    setActiveTab("tasklist");
    setTimeout(() => {
      const el = document.getElementById(`task-card-${tId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 200);
  };

  // Update task status (Not Started, In Progress, Blocked, Completed)
  const handleUpdateTaskStatus = async (taskId, newStatus, blockerReason = "") => {
    try {
      setUpdatingTaskId(taskId);
      const targetId = encodeURIComponent(taskId);
      const res = await API.put(`/pathfinder/${id}/tasks/${targetId}`, {
        status: newStatus,
        blockerReason
      });
      setPlan((prev) => ({
        ...prev,
        tasks: res.data.tasks
      }));
      if (hoveredTask && (hoveredTask.taskId === taskId || hoveredTask._id === taskId || String(hoveredTask._id) === String(taskId))) {
        setHoveredTask((prev) => ({ ...prev, status: newStatus, blockerReason }));
      }
    } catch (err) {
      console.error("Task update failed:", err);
      alert(err.response?.data?.message || "Failed to update task.");
    } finally {
      setUpdatingTaskId(null);
    }
  };

  // Update task assignee
  const handleUpdateTaskAssignee = async (taskId, memberName, memberUserId) => {
    try {
      setUpdatingTaskId(taskId);
      const targetId = encodeURIComponent(taskId);
      const res = await API.put(`/pathfinder/${id}/tasks/${targetId}`, {
        assignedTo: memberUserId || null,
        assignedMemberName: memberName
      });
      setPlan((prev) => ({
        ...prev,
        tasks: res.data.tasks
      }));
      if (hoveredTask && (hoveredTask.taskId === taskId || hoveredTask._id === taskId || String(hoveredTask._id) === String(taskId))) {
        setHoveredTask((prev) => ({ ...prev, assignedMemberName: memberName }));
      }
    } catch (err) {
      console.error("Task assignee update failed:", err);
      alert(err.response?.data?.message || "Failed to update assigned member.");
    } finally {
      setUpdatingTaskId(null);
    }
  };

  // Submit blocker report
  const handleSubmitBlocker = async (e) => {
    e.preventDefault();
    if (!blockerModalTask) return;
    await handleUpdateTaskStatus(blockerModalTask.taskId, "Blocked", blockerReasonInput);
    setBlockerModalTask(null);
    setBlockerReasonInput("");
  };

  // Submit recalculate plan
  const handleRecalculateSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsRecalculating(true);
      const res = await API.post(`/pathfinder/${id}/recalculate`, {
        reason: recalculateReason || "Manual schedule re-optimization",
        updatedDeadline: recalculateDeadline || undefined
      });
      setPlan(res.data.plan);
      setShowRecalculateModal(false);
      setRecalculateReason("");
      alert("Plan recalculated successfully! Review proposed task alignments.");
    } catch (err) {
      console.error("Recalculate failed:", err);
      alert(err.response?.data?.message || "Failed to recalculate plan.");
    } finally {
      setIsRecalculating(false);
    }
  };

  // Export to CampusCollab Kanban Workspace
  const handleExportToProject = async () => {
    try {
      setExportingToWorkspace(true);
      const res = await API.post(`/pathfinder/${id}/export-to-project`);
      setExportSuccessMsg("Roadmap exported to CampusCollab Kanban workspace!");
      setTimeout(() => {
        navigate(`/projects/${res.data.projectId}`);
      }, 1200);
    } catch (err) {
      console.error("Export to project failed:", err);
      alert(err.response?.data?.message || "Failed to export tasks.");
    } finally {
      setExportingToWorkspace(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading Project PathFinder roadmap..." />;
  }

  if (error || !plan) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger">{error || "Plan not found."}</div>
        <Link to="/pathfinder" className="btn btn-primary-custom">
          Back to PathFinder
        </Link>
      </div>
    );
  }

  const tasks = plan.tasks || [];
  const completedTasks = tasks.filter((t) => t.status === "Completed").length;
  const blockedTasks = tasks.filter((t) => t.status === "Blocked").length;
  const inProgressTasks = tasks.filter((t) => t.status === "In Progress").length;
  const progressPct = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  // Group tasks by module
  const tasksByModule = {};
  tasks.forEach((t) => {
    if (!tasksByModule[t.moduleName]) {
      tasksByModule[t.moduleName] = [];
    }
    tasksByModule[t.moduleName].push(t);
  });

  // Available members for task assignment
  const availableMembers = plan.teamMemberSnapshots && plan.teamMemberSnapshots.length > 0
    ? plan.teamMemberSnapshots
    : (plan.team?.members && plan.team.members.length > 0
      ? plan.team.members.map(m => ({ name: m.name || m.user?.name || "Member", userId: m.user?._id || m.user || m._id }))
      : [{ name: plan.createdBy?.name || "Member", userId: plan.createdBy?._id }]);

  // 4 Structured Phases matching the Product Development Roadmap reference
  const moduleNames = Object.keys(tasksByModule);
  
  const phase1Name = moduleNames[0] || "Research & Discovery";
  const phase1Tasks = tasksByModule[phase1Name] || [];
  const phase1Done = phase1Tasks.filter(t => t.status === "Completed").length;
  const phase1Pct = phase1Tasks.length > 0 ? Math.round((phase1Done / phase1Tasks.length) * 100) : 0;

  const phase2Name = moduleNames[1] || "Architecture & Design";
  const phase2Tasks = tasksByModule[phase2Name] || [];
  const phase2Done = phase2Tasks.filter(t => t.status === "Completed").length;
  const phase2Pct = phase2Tasks.length > 0 ? Math.round((phase2Done / phase2Tasks.length) * 100) : 0;

  const phase3Name = moduleNames[2] || "Development & QA";
  const phase3Tasks = [
    ...(tasksByModule[phase3Name] || []),
    ...(moduleNames.length > 4 ? (tasksByModule[moduleNames[3]] || []) : [])
  ];
  const phase3Done = phase3Tasks.filter(t => t.status === "Completed").length;
  const phase3Pct = phase3Tasks.length > 0 ? Math.round((phase3Done / phase3Tasks.length) * 100) : 0;

  const phase4Name = (moduleNames.length > 4 ? moduleNames[4] : moduleNames[3]) || "Deployment & Scaling";
  const phase4Tasks = (moduleNames.length > 4 ? (tasksByModule[moduleNames[4]] || []) : (tasksByModule[moduleNames[3]] || []));
  const phase4Done = phase4Tasks.filter(t => t.status === "Completed").length;
  const phase4Pct = phase4Tasks.length > 0 ? Math.round((phase4Done / phase4Tasks.length) * 100) : 0;

  const phases = [
    { id: 1, label: "1. Research & Discovery", name: phase1Name, color: "#a855f7", tasks: phase1Tasks, done: phase1Done, pct: phase1Pct },
    { id: 2, label: "2. Architecture & Design", name: phase2Name, color: "#eab308", tasks: phase2Tasks, done: phase2Done, pct: phase2Pct },
    { id: 3, label: "3. Development & QA", name: phase3Name, color: "#3b82f6", tasks: phase3Tasks, done: phase3Done, pct: phase3Pct },
    { id: 4, label: "4. Deployment & Scaling", name: phase4Name, color: "#22c55e", tasks: phase4Tasks, done: phase4Done, pct: phase4Pct }
  ];

  return (
    <div className="pathfinder-details-page py-4">
      <div className="container">
        {/* Top Breadcrumb & Actions */}
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div>
            <Link to="/pathfinder" className="text-decoration-none small text-muted">
              All Development Plans
            </Link>
            <h3 className="fw-bold text-dark mb-0 mt-1">{plan.title}</h3>
            <span className="text-muted small">
              Squad: <strong>{plan.team?.name || "Independent Team"}</strong> • Category: {plan.projectCategory}
            </span>
          </div>

          <div className="d-flex gap-2 flex-wrap">
            <button
              onClick={() => setShowRecalculateModal(true)}
              className="btn btn-outline-warning text-dark fw-semibold btn-sm shadow-sm"
              title="Re-optimize roadmap based on progress and blockers"
            >
              Recalculate Plan
            </button>
            <button
              onClick={handleExportToProject}
              disabled={exportingToWorkspace}
              className="btn btn-outline-custom btn-sm fw-semibold shadow-sm"
            >
              {exportingToWorkspace ? "Exporting..." : "Export to Project Kanban"}
            </button>
          </div>
        </div>

        {exportSuccessMsg && (
          <div className="alert alert-success py-2 mb-3 small" role="alert">
            {exportSuccessMsg}
          </div>
        )}

        {/* Quick Progress Banner */}
        <div className="card border shadow-sm rounded-3 p-3 bg-white mb-4">
          <div className="row g-3 align-items-center">
            <div className="col-md-3">
              <div className="small text-muted mb-1">Overall Roadmap Progress</div>
              <div className="h4 fw-bold text-primary mb-0">{progressPct}% Complete</div>
              <div className="small text-muted">{completedTasks} of {tasks.length} tasks finished</div>
            </div>
            <div className="col-md-5">
              <div className="progress mb-2" style={{ height: "10px" }}>
                <div
                  className="progress-bar bg-success"
                  role="progressbar"
                  style={{ width: `${progressPct}%` }}
                ></div>
                <div
                  className="progress-bar bg-warning"
                  role="progressbar"
                  style={{ width: `${(inProgressTasks / (tasks.length || 1)) * 100}%` }}
                ></div>
                <div
                  className="progress-bar bg-danger"
                  role="progressbar"
                  style={{ width: `${(blockedTasks / (tasks.length || 1)) * 100}%` }}
                ></div>
              </div>
              <div className="d-flex gap-3 small text-muted">
                <span><strong className="text-success">{completedTasks}</strong> Done</span>
                <span><strong className="text-warning-emphasis">{inProgressTasks}</strong> In Progress</span>
                <span><strong className="text-danger">{blockedTasks}</strong> Blocked</span>
              </div>
            </div>
            <div className="col-md-4 text-md-end">
              <div className="small text-muted">Deadline</div>
              <div className="fw-bold text-dark fs-6">
                {new Date(plan.constraints?.finalDeadline).toLocaleString()}
              </div>
              <span className="badge bg-primary-subtle text-primary border small">
                {plan.constraints?.projectType}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <ul className="nav nav-pills mb-4 gap-2 flex-wrap">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "roadmap" ? "active" : ""}`}
              onClick={() => setActiveTab("roadmap")}
            >
              Development Roadmap
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "tasklist" ? "active" : ""}`}
              onClick={() => setActiveTab("tasklist")}
            >
              Task List ({tasks.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "architecture" ? "active" : ""}`}
              onClick={() => setActiveTab("architecture")}
            >
              Architecture & Tech
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "risks" ? "active" : ""}`}
              onClick={() => setActiveTab("risks")}
            >
              Risks & Feasibility
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "history" ? "active" : ""}`}
              onClick={() => setActiveTab("history")}
            >
              Revision History ({plan.planHistory?.length || 1})
            </button>
          </li>
        </ul>

        {/* TAB 1: VISUAL DEVELOPMENT ROADMAP (Interactive Product Development Roadmap Board) */}
        {activeTab === "roadmap" && (
          <div className="card border shadow-sm rounded-4 p-4 bg-white mb-4">
            {/* Header Banner */}
            <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom flex-wrap gap-2">
              <div>
                <h4 className="fw-bold text-dark mb-1" style={{ letterSpacing: "-0.3px" }}>
                  Product Development Roadmap
                </h4>
                <span className="text-muted small">
                  Interactive milestone journey &bull; Hover over waypoints or phases to inspect progress
                </span>
              </div>
              <div className="text-end">
                <span className="badge px-3 py-2 fs-6 fw-semibold rounded-pill" style={{ background: "#f0fdfa", color: "#0d9488", border: "1px solid #99f6e4" }}>
                  {plan.team?.name || "CampusCollab Squad"}
                </span>
                <div className="text-muted small mt-1">{plan.title}</div>
              </div>
            </div>

            {/* 3-Column Board Grid matching reference layout */}
            <div className="row g-4 align-items-stretch">
              {/* LEFT COLUMN: Phase 1, Phase 2, Key Project Roles */}
              <div className="col-lg-3 col-md-6 d-flex flex-column gap-3">
                {/* Phase 1 Card */}
                <div 
                  className={`card border rounded-4 p-3 transition-all ${activePhaseHover === 1 ? "card-highlighted" : "bg-white"}`}
                  style={{ 
                    border: activePhaseHover === 1 ? "2px solid #8b5cf6" : "1px solid var(--border-color)",
                    boxShadow: activePhaseHover === 1 ? "0 8px 24px rgba(139, 92, 246, 0.2)" : "none",
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={() => setActivePhaseHover(1)}
                  onMouseLeave={() => setActivePhaseHover(null)}
                >
                  <div 
                    className="d-flex justify-content-between align-items-center px-3 py-1 rounded-3 fw-bold small mb-3" 
                    style={{ background: "#f3e8ff", color: "#7e22ce", border: "1px solid #d8b4fe" }}
                  >
                    <span>{phases[0].label}</span>
                    <span className="badge rounded-pill" style={{ background: "#8b5cf6", color: "#ffffff", fontSize: "0.7rem" }}>
                      {phases[0].pct}%
                    </span>
                  </div>
                  <ul className="list-unstyled mb-0 small ps-1">
                    {phases[0].tasks.slice(0, 5).map((t, idx) => (
                      <li 
                        key={idx} 
                        className="py-1 cursor-pointer d-flex align-items-baseline gap-2 roadmap-task-hover"
                        onClick={() => handleJumpToTask(t)}
                        title="Click to jump and edit this task"
                      >
                        <span style={{ color: "#8b5cf6", fontWeight: "bold" }}>&bull;</span>
                        <span className="text-truncate flex-grow-1 text-dark">{t.title}</span>
                      </li>
                    ))}
                    {phases[0].tasks.length === 0 && (
                      <li className="text-muted small py-1">Setup project foundation</li>
                    )}
                  </ul>
                </div>

                {/* Phase 2 Card */}
                <div 
                  className={`card border rounded-4 p-3 transition-all ${activePhaseHover === 2 ? "card-highlighted" : "bg-white"}`}
                  style={{ 
                    border: activePhaseHover === 2 ? "2px solid #f59e0b" : "1px solid var(--border-color)",
                    boxShadow: activePhaseHover === 2 ? "0 8px 24px rgba(245, 158, 11, 0.2)" : "none",
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={() => setActivePhaseHover(2)}
                  onMouseLeave={() => setActivePhaseHover(null)}
                >
                  <div 
                    className="d-flex justify-content-between align-items-center px-3 py-1 rounded-3 fw-bold small mb-3" 
                    style={{ background: "#fef3c7", color: "#b45309", border: "1px solid #fde68a" }}
                  >
                    <span>{phases[1].label}</span>
                    <span className="badge rounded-pill" style={{ background: "#f59e0b", color: "#ffffff", fontSize: "0.7rem" }}>
                      {phases[1].pct}%
                    </span>
                  </div>
                  <ul className="list-unstyled mb-0 small ps-1">
                    {phases[1].tasks.slice(0, 5).map((t, idx) => (
                      <li 
                        key={idx} 
                        className="py-1 cursor-pointer d-flex align-items-baseline gap-2 roadmap-task-hover"
                        onClick={() => handleJumpToTask(t)}
                        title="Click to jump and edit this task"
                      >
                        <span style={{ color: "#f59e0b", fontWeight: "bold" }}>&bull;</span>
                        <span className="text-truncate flex-grow-1 text-dark">{t.title}</span>
                      </li>
                    ))}
                    {phases[1].tasks.length === 0 && (
                      <li className="text-muted small py-1">Architecture and data models</li>
                    )}
                  </ul>
                </div>

                {/* Key Project Roles Card */}
                <div className="card border rounded-4 p-3 bg-light shadow-none mt-auto">
                  <div className="fw-bold small text-dark mb-2">Key Project Roles:</div>
                  <ul className="list-unstyled mb-0 small ps-1" style={{ fontSize: "0.8rem", lineHeight: "1.6" }}>
                    {availableMembers.slice(0, 4).map((m, idx) => (
                      <li key={idx} className="mb-1 text-truncate">
                        <span className="text-primary fw-bold">&bull;</span>{" "}
                        <strong className="text-dark">
                          {m.preferredRole || (idx === 0 ? "Lead Engineer" : idx === 1 ? "Backend Specialist" : idx === 2 ? "UI/UX Designer" : "QA Analyst")}:
                        </strong>{" "}
                        <span className="text-secondary">{m.name}</span>
                      </li>
                    ))}
                    {availableMembers.length === 0 && (
                      <li><span className="text-primary fw-bold">&bull;</span> <strong className="text-dark">Full Stack Engineer:</strong> <span className="text-secondary">Project Creator</span></li>
                    )}
                  </ul>
                </div>
              </div>

              {/* CENTER COLUMN: Winding S-Roadway with Location Pins & Notes */}
              <div className="col-lg-6 col-md-12 d-flex flex-column gap-3">
                {/* Winding Road Canvas */}
                <div 
                  className="position-relative rounded-4 p-3 d-flex flex-column align-items-center justify-content-center border"
                  style={{ background: "#f8fafc", minHeight: "410px" }}
                >
                  <svg viewBox="0 0 500 480" className="w-100" style={{ maxHeight: "410px", overflow: "visible" }}>
                    <defs>
                      <filter id="pinShadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#0f172a" floodOpacity="0.25" />
                      </filter>
                    </defs>

                    {/* Road Surface (Serpentine S-Curve with Light UI Curb) */}
                    <path
                      d="M 285,45 C 240,110 150,140 170,180 C 195,230 400,240 380,310 C 360,370 190,390 190,460"
                      fill="none"
                      stroke="#cbd5e1"
                      strokeWidth="66"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 285,45 C 240,110 150,140 170,180 C 195,230 400,240 380,310 C 360,370 190,390 190,460"
                      fill="none"
                      stroke="#334155"
                      strokeWidth="58"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 285,45 C 240,110 150,140 170,180 C 195,230 400,240 380,310 C 360,370 190,390 190,460"
                      fill="none"
                      stroke="#1e293b"
                      strokeWidth="52"
                      strokeLinecap="round"
                    />
                    {/* Yellow Dashed Dividing Lane */}
                    <path
                      d="M 285,45 C 240,110 150,140 170,180 C 195,230 400,240 380,310 C 360,370 190,390 190,460"
                      fill="none"
                      stroke="#facc15"
                      strokeWidth="3"
                      strokeDasharray="14 12"
                    />

                    {/* Finish Flag at Destination */}
                    <g transform="translate(285, 30)">
                      <line x1="0" y1="0" x2="0" y2="28" stroke="#64748b" strokeWidth="2.5" />
                      <polygon points="0,0 26,8 0,16" fill="#0d9488" />
                    </g>

                    {/* Location Pin 1: Research & Discovery */}
                    <g
                      transform="translate(190, 420)"
                      className="cursor-pointer"
                      style={{ cursor: "pointer", transition: "all 0.2s" }}
                      onMouseEnter={() => setActivePhaseHover(1)}
                      onMouseLeave={() => setActivePhaseHover(null)}
                      onClick={() => handleJumpToTask(phases[0].tasks[0] || "TASK-101")}
                    >
                      <path
                        d="M 0,-32 C -11,-32 -20,-23 -20,-12 C -20,3 0,16 0,16 C 0,16 20,3 20,-12 C 20,-23 11,-32 0,-32 Z"
                        fill={activePhaseHover === 1 ? "#7c3aed" : "#8b5cf6"}
                        stroke="#ffffff"
                        strokeWidth="2.5"
                        filter="url(#pinShadow)"
                      />
                      <circle cx="0" cy="-14" r="7" fill="#ffffff" />
                      <circle cx="0" cy="-14" r="3.5" fill={activePhaseHover === 1 ? "#7c3aed" : "#8b5cf6"} />
                      <text 
                        x="-30" 
                        y="-36" 
                        fill={activePhaseHover === 1 ? "#7c3aed" : "#0f172a"} 
                        fontSize="11" 
                        fontWeight={activePhaseHover === 1 ? "800" : "700"} 
                        textAnchor="end"
                      >
                        1. Research & Discovery
                      </text>
                    </g>

                    {/* Location Pin 2: Architecture & Design */}
                    <g
                      transform="translate(375, 290)"
                      className="cursor-pointer"
                      style={{ cursor: "pointer", transition: "all 0.2s" }}
                      onMouseEnter={() => setActivePhaseHover(2)}
                      onMouseLeave={() => setActivePhaseHover(null)}
                      onClick={() => handleJumpToTask(phases[1].tasks[0] || "TASK-103")}
                    >
                      <path
                        d="M 0,-32 C -11,-32 -20,-23 -20,-12 C -20,3 0,16 0,16 C 0,16 20,3 20,-12 C 20,-23 11,-32 0,-32 Z"
                        fill={activePhaseHover === 2 ? "#d97706" : "#f59e0b"}
                        stroke="#ffffff"
                        strokeWidth="2.5"
                        filter="url(#pinShadow)"
                      />
                      <circle cx="0" cy="-14" r="7" fill="#ffffff" />
                      <circle cx="0" cy="-14" r="3.5" fill={activePhaseHover === 2 ? "#d97706" : "#f59e0b"} />
                      <text 
                        x="32" 
                        y="-12" 
                        fill={activePhaseHover === 2 ? "#b45309" : "#0f172a"} 
                        fontSize="11" 
                        fontWeight={activePhaseHover === 2 ? "800" : "700"} 
                        textAnchor="start"
                      >
                        2. Architecture & Design
                      </text>
                    </g>

                    {/* Location Pin 3: Development & QA */}
                    <g
                      transform="translate(170, 180)"
                      className="cursor-pointer"
                      style={{ cursor: "pointer", transition: "all 0.2s" }}
                      onMouseEnter={() => setActivePhaseHover(3)}
                      onMouseLeave={() => setActivePhaseHover(null)}
                      onClick={() => handleJumpToTask(phases[2].tasks[0] || "TASK-105")}
                    >
                      <path
                        d="M 0,-32 C -11,-32 -20,-23 -20,-12 C -20,3 0,16 0,16 C 0,16 20,3 20,-12 C 20,-23 11,-32 0,-32 Z"
                        fill={activePhaseHover === 3 ? "#0369a1" : "#0284c7"}
                        stroke="#ffffff"
                        strokeWidth="2.5"
                        filter="url(#pinShadow)"
                      />
                      <circle cx="0" cy="-14" r="7" fill="#ffffff" />
                      <circle cx="0" cy="-14" r="3.5" fill={activePhaseHover === 3 ? "#0369a1" : "#0284c7"} />
                      <text 
                        x="-30" 
                        y="-12" 
                        fill={activePhaseHover === 3 ? "#0369a1" : "#0f172a"} 
                        fontSize="11" 
                        fontWeight={activePhaseHover === 3 ? "800" : "700"} 
                        textAnchor="end"
                      >
                        3. Development & QA
                      </text>
                    </g>

                    {/* Location Pin 4: Deployment & Scaling */}
                    <g
                      transform="translate(285, 80)"
                      className="cursor-pointer"
                      style={{ cursor: "pointer", transition: "all 0.2s" }}
                      onMouseEnter={() => setActivePhaseHover(4)}
                      onMouseLeave={() => setActivePhaseHover(null)}
                      onClick={() => handleJumpToTask(phases[3].tasks[0] || "TASK-107")}
                    >
                      <path
                        d="M 0,-32 C -11,-32 -20,-23 -20,-12 C -20,3 0,16 0,16 C 0,16 20,3 20,-12 C 20,-23 11,-32 0,-32 Z"
                        fill={activePhaseHover === 4 ? "#059669" : "#10b981"}
                        stroke="#ffffff"
                        strokeWidth="2.5"
                        filter="url(#pinShadow)"
                      />
                      <circle cx="0" cy="-14" r="7" fill="#ffffff" />
                      <circle cx="0" cy="-14" r="3.5" fill={activePhaseHover === 4 ? "#059669" : "#10b981"} />
                      <text 
                        x="0" 
                        y="-40" 
                        fill={activePhaseHover === 4 ? "#15803d" : "#0f172a"} 
                        fontSize="11" 
                        fontWeight={activePhaseHover === 4 ? "800" : "700"} 
                        textAnchor="middle"
                      >
                        4. Deployment & Scaling
                      </text>
                    </g>
                  </svg>
                </div>

                {/* Project Notes Card (matching reference layout in light theme) */}
                <div className="card border rounded-4 p-3 bg-white shadow-sm mt-auto">
                  <div className="fw-bold small text-dark mb-2">Project Notes:</div>
                  <ul className="list-unstyled mb-0 small ps-1" style={{ fontSize: "0.82rem", lineHeight: "1.6" }}>
                    <li><span className="text-primary fw-bold">&bull;</span> <strong className="text-dark">Priority:</strong> <span className="text-secondary">Core feature development & security validation</span></li>
                    <li><span className="text-primary fw-bold">&bull;</span> <strong className="text-dark">Deadline:</strong> <span className="text-secondary">{new Date(plan.constraints?.finalDeadline).toLocaleDateString()} ({plan.constraints?.projectType || "Sprint"})</span></li>
                    <li><span className="text-primary fw-bold">&bull;</span> <strong className="text-dark">Architecture:</strong> <span className="text-secondary">{plan.architectureAndTech?.recommendedArchitecture || "Modular Architecture"}</span></li>
                    <li><span className="text-primary fw-bold">&bull;</span> <strong className="text-dark">Deployment:</strong> <span className="text-secondary">{plan.architectureAndTech?.deploymentApproach || "Cloud Container Deployment"}</span></li>
                  </ul>
                </div>
              </div>

              {/* RIGHT COLUMN: Phase 3, Phase 4, Roadmap Completion */}
              <div className="col-lg-3 col-md-6 d-flex flex-column gap-3">
                {/* Phase 3 Card */}
                <div 
                  className={`card border rounded-4 p-3 transition-all ${activePhaseHover === 3 ? "card-highlighted" : "bg-white"}`}
                  style={{ 
                    border: activePhaseHover === 3 ? "2px solid #0284c7" : "1px solid var(--border-color)",
                    boxShadow: activePhaseHover === 3 ? "0 8px 24px rgba(2, 132, 199, 0.2)" : "none",
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={() => setActivePhaseHover(3)}
                  onMouseLeave={() => setActivePhaseHover(null)}
                >
                  <div 
                    className="d-flex justify-content-between align-items-center px-3 py-1 rounded-3 fw-bold small mb-3" 
                    style={{ background: "#e0f2fe", color: "#0369a1", border: "1px solid #bae6fd" }}
                  >
                    <span>{phases[2].label}</span>
                    <span className="badge rounded-pill" style={{ background: "#0284c7", color: "#ffffff", fontSize: "0.7rem" }}>
                      {phases[2].pct}%
                    </span>
                  </div>
                  <ul className="list-unstyled mb-0 small ps-1">
                    {phases[2].tasks.slice(0, 5).map((t, idx) => (
                      <li 
                        key={idx} 
                        className="py-1 cursor-pointer d-flex align-items-baseline gap-2 roadmap-task-hover"
                        onClick={() => handleJumpToTask(t)}
                        title="Click to jump and edit this task"
                      >
                        <span style={{ color: "#0284c7", fontWeight: "bold" }}>&bull;</span>
                        <span className="text-truncate flex-grow-1 text-dark">{t.title}</span>
                      </li>
                    ))}
                    {phases[2].tasks.length === 0 && (
                      <li className="text-muted small py-1">Full-stack development and testing</li>
                    )}
                  </ul>
                </div>

                {/* Phase 4 Card */}
                <div 
                  className={`card border rounded-4 p-3 transition-all ${activePhaseHover === 4 ? "card-highlighted" : "bg-white"}`}
                  style={{ 
                    border: activePhaseHover === 4 ? "2px solid #10b981" : "1px solid var(--border-color)",
                    boxShadow: activePhaseHover === 4 ? "0 8px 24px rgba(16, 185, 129, 0.2)" : "none",
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={() => setActivePhaseHover(4)}
                  onMouseLeave={() => setActivePhaseHover(null)}
                >
                  <div 
                    className="d-flex justify-content-between align-items-center px-3 py-1 rounded-3 fw-bold small mb-3" 
                    style={{ background: "#dcfce7", color: "#15803d", border: "1px solid #bbf7d0" }}
                  >
                    <span>{phases[3].label}</span>
                    <span className="badge rounded-pill" style={{ background: "#10b981", color: "#ffffff", fontSize: "0.7rem" }}>
                      {phases[3].pct}%
                    </span>
                  </div>
                  <ul className="list-unstyled mb-0 small ps-1">
                    {phases[3].tasks.slice(0, 5).map((t, idx) => (
                      <li 
                        key={idx} 
                        className="py-1 cursor-pointer d-flex align-items-baseline gap-2 roadmap-task-hover"
                        onClick={() => handleJumpToTask(t)}
                        title="Click to jump and edit this task"
                      >
                        <span style={{ color: "#10b981", fontWeight: "bold" }}>&bull;</span>
                        <span className="text-truncate flex-grow-1 text-dark">{t.title}</span>
                      </li>
                    ))}
                    {phases[3].tasks.length === 0 && (
                      <li className="text-muted small py-1">Cloud deployment and demo pitch</li>
                    )}
                  </ul>
                </div>

                {/* Roadmap Completion Progress Chart */}
                <div className="card border rounded-4 p-3 bg-light shadow-none mt-auto">
                  <div className="fw-bold small text-dark mb-3">Roadmap Completion</div>
                  <div className="d-flex flex-column gap-2">
                    {phases.map((ph, pIdx) => (
                      <div key={pIdx}>
                        <div className="d-flex justify-content-between small text-muted mb-1" style={{ fontSize: "0.74rem" }}>
                          <span className="text-dark fw-semibold">Phase {ph.id}</span>
                          <span className="fw-semibold text-dark">{ph.pct}%</span>
                        </div>
                        <div className="progress" style={{ height: "12px", background: "#e2e8f0", borderRadius: "4px" }}>
                          <div 
                            className="progress-bar"
                            role="progressbar"
                            style={{ width: `${ph.pct}%`, background: ph.color, borderRadius: "4px" }}
                            aria-valuenow={ph.pct}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="d-flex justify-content-between mt-2 pt-1 border-top text-muted" style={{ fontSize: "0.68rem" }}>
                    <span>0%</span>
                    <span>20%</span>
                    <span>40%</span>
                    <span>60%</span>
                    <span>80%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TASK LIST & TEAM ASSIGNMENT (Replaces Beginner Guidance) */}
        {activeTab === "tasklist" && (
          <div>
            <div className="card border shadow-sm rounded-4 p-4 bg-white mb-4">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                <h5 className="fw-bold text-dark mb-0">Task List</h5>
              </div>

              {/* Status Filter Bar */}
              <div className="d-flex gap-2 flex-wrap mb-4">
                {["All", "Not Started", "In Progress", "Completed", "Blocked"].map((st) => {
                  const count = st === "All"
                    ? tasks.length
                    : tasks.filter((t) => t.status === st).length;

                  return (
                    <button
                      key={st}
                      onClick={() => setTaskListStatusFilter(st)}
                      className={`btn btn-sm px-3 fw-semibold rounded-pill ${
                        taskListStatusFilter === st
                          ? "btn-primary-custom"
                          : "btn-outline-custom border"
                      }`}
                    >
                      {st} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Task Cards List */}
              <div className="d-flex flex-column gap-3">
                {tasks.filter((t) => taskListStatusFilter === "All" || t.status === taskListStatusFilter).length === 0 ? (
                  <div className="card border rounded-3 p-4 text-center bg-light">
                    <div className="fw-semibold text-dark mb-1">No tasks currently in "{taskListStatusFilter}" status</div>
                    <div className="text-muted small mb-3">All {tasks.length} tasks in this project are tracked across the roadmap phases.</div>
                    <button onClick={() => setTaskListStatusFilter("All")} className="btn btn-sm btn-primary-custom mx-auto">
                      Show All Tasks ({tasks.length})
                    </button>
                  </div>
                ) : (
                  tasks
                    .filter((t) => taskListStatusFilter === "All" || t.status === taskListStatusFilter)
                    .map((task) => {
                      const isHighlighted = highlightedTaskId === task.taskId || (task._id && highlightedTaskId === String(task._id));

                      return (
                        <div
                          key={task.taskId || task._id}
                          id={`task-card-${task.taskId || task._id}`}
                          className={`card border rounded-3 p-3 transition-all ${
                            isHighlighted
                              ? "ring-highlight"
                              : task.status === "Completed"
                              ? "bg-light border-success-subtle"
                              : task.status === "Blocked"
                              ? "bg-danger-subtle border-danger"
                              : "bg-white"
                          }`}
                        >
                          <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                            {/* Task Details */}
                            <div style={{ flex: "1 1 360px" }}>
                              <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                                <span className="badge bg-secondary-subtle text-secondary border font-monospace small">
                                  {task.taskId}
                                </span>
                                <span className="badge bg-primary-subtle text-primary border small">
                                  {task.moduleName}
                                </span>
                                <span className="fw-bold text-dark">{task.title}</span>
                                {task.priority === "Critical" && (
                                  <span className="badge bg-danger text-white small">Critical</span>
                                )}
                                {isHighlighted && (
                                  <span className="badge bg-primary text-white small">Selected Task</span>
                                )}
                              </div>

                              <div className="d-flex gap-3 flex-wrap small text-muted">
                                <span>
                                  <strong>Schedule:</strong> Hour {task.scheduledStartHour} - Hour {task.scheduledEndHour} ({task.estimatedHours}h effort)
                                </span>
                                {task.dependencies && task.dependencies.length > 0 && (
                                  <span>
                                    <strong>Prerequisites:</strong>{" "}
                                    {task.dependencies.map((dep, dIdx) => (
                                      <span key={dIdx} className="badge bg-light text-secondary border font-monospace me-1">
                                        {dep}
                                      </span>
                                    ))}
                                  </span>
                                )}
                              </div>

                              {task.status === "Blocked" && task.blockerReason && (
                                <div className="alert alert-danger py-1 px-2 mt-2 mb-0 small d-flex justify-content-between align-items-center">
                                  <div>
                                    <strong>Blocker:</strong> {task.blockerReason}
                                  </div>
                                  <button
                                    onClick={() => handleUpdateTaskStatus(task._id || task.taskId, "In Progress", "")}
                                    className="btn btn-sm btn-outline-danger py-0 px-2 fw-semibold"
                                  >
                                    Clear Blocker
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Interactive Controls: Change Status & Assignee */}
                            <div className="d-flex flex-column gap-2 align-items-end" style={{ minWidth: "240px" }}>
                              {/* Status Selector */}
                              <div className="d-flex align-items-center gap-2 w-100 justify-content-end">
                                <span className="small text-muted">Status:</span>
                                <select
                                  className={`form-select form-select-sm fw-semibold shadow-none ${
                                    task.status === "Completed"
                                      ? "border-success text-success bg-success-subtle"
                                      : task.status === "In Progress"
                                      ? "border-warning text-warning-emphasis bg-warning-subtle"
                                      : task.status === "Blocked"
                                      ? "border-danger text-danger bg-danger-subtle"
                                      : "border-secondary text-secondary"
                                  }`}
                                  style={{ width: "140px" }}
                                  value={task.status}
                                  disabled={updatingTaskId === (task._id || task.taskId)}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === "Blocked") {
                                      setBlockerModalTask(task);
                                    } else {
                                      handleUpdateTaskStatus(task._id || task.taskId, val);
                                    }
                                  }}
                                >
                                  <option value="Not Started">Not Started</option>
                                  <option value="In Progress">In Progress</option>
                                  <option value="Blocked">Blocked</option>
                                  <option value="Completed">Completed</option>
                                </select>
                              </div>

                              {/* Assignee Selector */}
                              <div className="d-flex align-items-center gap-2 w-100 justify-content-end">
                                <span className="small text-muted">Assignee:</span>
                                <select
                                  className="form-select form-select-sm fw-medium shadow-none"
                                  style={{ width: "140px" }}
                                  value={task.assignedMemberName || ""}
                                  disabled={updatingTaskId === (task._id || task.taskId)}
                                  onChange={(e) => {
                                    const newName = e.target.value;
                                    const targetMember = availableMembers.find((m) => m.name === newName);
                                    handleUpdateTaskAssignee(task._id || task.taskId, newName, targetMember?.userId);
                                  }}
                                >
                                  {availableMembers.map((m, mIdx) => (
                                    <option key={mIdx} value={m.name}>
                                      {m.name}
                                    </option>
                                  ))}
                                  {!availableMembers.some((m) => m.name === task.assignedMemberName) && (
                                    <option value={task.assignedMemberName}>{task.assignedMemberName}</option>
                                  )}
                                </select>
                              </div>

                              {/* Guidance Button */}
                              <button
                                onClick={() => setSelectedTask(task)}
                                className="btn btn-outline-custom btn-sm py-1 px-3 fw-semibold mt-1"
                              >
                                Guidance Details
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ARCHITECTURE & TECH */}
        {activeTab === "architecture" && (
          <div className="card border shadow-sm rounded-4 p-4 bg-white">
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
              <div>
                <h5 className="fw-bold text-dark mb-0">System Architecture & Tech Stack</h5>
                <span className="text-muted small">Tailored specifically to project problem statement and member skills</span>
              </div>
              <div className="d-flex gap-2 align-items-center">
                <span className="badge bg-primary-subtle text-primary border px-3 py-1">
                  Domain-Aware Architecture
                </span>
                <button
                  className="btn btn-outline-custom btn-sm fw-semibold"
                  onClick={() => setIsEditingArch(!isEditingArch)}
                >
                  {isEditingArch ? "Cancel Editing" : "Edit Architecture & Stack"}
                </button>
              </div>
            </div>

            {/* If in edit mode: render interactive editable form */}
            {isEditingArch ? (
              <div className="p-4 bg-light rounded-3 border mb-4">
                <div className="mb-3">
                  <h6 className="fw-bold text-dark mb-1">Modify System Architecture & Technologies</h6>
                  <p className="text-muted small mb-0">
                    Adjust your architectural pattern, frameworks, database, or deployment strategy. You can save these modifications directly or click <strong>Draft New Plan with This Stack</strong> to re-engineer all task roadmaps and milestones tailored to this new stack.
                  </p>
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-dark">Recommended Architecture Pattern</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. Modular Monolith / Microservices / Event-Driven / Serverless"
                      value={archForm.recommendedArchitecture}
                      onChange={(e) => setArchForm({ ...archForm, recommendedArchitecture: e.target.value })}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-dark">Deployment Approach</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. Vercel + Render + MongoDB Atlas"
                      value={archForm.deploymentApproach}
                      onChange={(e) => setArchForm({ ...archForm, deploymentApproach: e.target.value })}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label small fw-semibold text-dark">Frontend Technologies (comma-separated)</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. React.js, Tailwind CSS, Vite"
                      value={archForm.frontendTech}
                      onChange={(e) => setArchForm({ ...archForm, frontendTech: e.target.value })}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label small fw-semibold text-dark">Backend Technologies (comma-separated)</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. Node.js, Express, Socket.io"
                      value={archForm.backendTech}
                      onChange={(e) => setArchForm({ ...archForm, backendTech: e.target.value })}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label small fw-semibold text-dark">Database & Storage (comma-separated)</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. MongoDB, Redis, PostgreSQL"
                      value={archForm.databaseTech}
                      onChange={(e) => setArchForm({ ...archForm, databaseTech: e.target.value })}
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label small fw-semibold text-dark">Selection Rationale & Notes</label>
                    <textarea
                      className="form-control form-control-sm"
                      rows="3"
                      placeholder="Provide reasoning for choosing this architecture and technology stack..."
                      value={archForm.selectionRationale}
                      onChange={(e) => setArchForm({ ...archForm, selectionRationale: e.target.value })}
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2 mt-4 pt-2 border-top">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    disabled={isSavingArch}
                    onClick={() => setIsEditingArch(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-custom btn-sm fw-semibold"
                    disabled={isSavingArch}
                    onClick={() => handleSaveArchitecture(false)}
                  >
                    {isSavingArch ? "Saving..." : "Save Architecture Changes"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary-custom btn-sm fw-semibold"
                    disabled={isSavingArch}
                    onClick={() => handleSaveArchitecture(true)}
                  >
                    {isSavingArch ? "Drafting New Plan..." : "Draft New Plan with This Stack"}
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Pattern & Rationale */}
                <div className="p-3 bg-light rounded-3 border mb-4">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span className="badge bg-primary text-white">Recommended Pattern</span>
                    <span className="fw-bold text-dark fs-6">{plan.architectureAndTech?.recommendedArchitecture}</span>
                  </div>
                  <p className="text-secondary small mb-2">
                    {plan.architectureAndTech?.selectionRationale}
                  </p>

                  {/* Tailored Domain Data Entities if present */}
                  {plan.architectureAndTech?.coreEntities && plan.architectureAndTech.coreEntities.length > 0 && (
                    <div className="mt-2 pt-2 border-top">
                      <span className="fw-semibold text-dark small me-2">Tailored Data Models / Schemas:</span>
                      <div className="d-inline-flex flex-wrap gap-1 align-items-center">
                        {plan.architectureAndTech.coreEntities.map((ent, eIdx) => (
                          <span key={eIdx} className="badge bg-white text-primary border font-monospace">
                            {ent}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {plan.architectureAndTech?.stackIncompatibilitiesWarning && (
                    <div className="alert alert-warning py-1 px-2 small mt-2 mb-0">
                      Warning: {plan.architectureAndTech.stackIncompatibilitiesWarning}
                    </div>
                  )}
                </div>

                {/* Tech Stack Cards Grid */}
                <div className="row g-3 mb-4">
                  <div className="col-md-3">
                    <div className="p-3 border rounded-3 h-100 bg-white">
                      <span className="badge bg-primary-subtle text-primary border mb-2">Frontend</span>
                      <div className="d-flex flex-wrap gap-1">
                        {(plan.architectureAndTech?.frontendTech || []).map((t, idx) => (
                          <span key={idx} className="badge bg-light text-dark border">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="p-3 border rounded-3 h-100 bg-white">
                      <span className="badge bg-success-subtle text-success border mb-2">Backend</span>
                      <div className="d-flex flex-wrap gap-1">
                        {(plan.architectureAndTech?.backendTech || []).map((t, idx) => (
                          <span key={idx} className="badge bg-light text-dark border">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="p-3 border rounded-3 h-100 bg-white">
                      <span className="badge bg-warning-subtle text-warning-emphasis border mb-2">Database & Cache</span>
                      <div className="d-flex flex-wrap gap-1">
                        {(plan.architectureAndTech?.databaseTech || []).map((t, idx) => (
                          <span key={idx} className="badge bg-light text-dark border">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="p-3 border rounded-3 h-100 bg-white">
                      <span className="badge bg-info-subtle text-dark border mb-2">Deployment</span>
                      <p className="small text-secondary mb-0">
                        {plan.architectureAndTech?.deploymentApproach}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Data Flow Architecture Pipeline */}
                <h6 className="fw-bold text-dark mb-2">System Data Flow Pipeline</h6>
                <div className="d-flex flex-wrap align-items-center gap-2 p-3 bg-light rounded-3 border mb-3 text-center">
                  <span className="badge bg-white text-dark border p-2 flex-grow-1">
                    1. Client UX & Ingestion
                  </span>
                  <span className="text-muted fw-bold">{"->"}</span>
                  <span className="badge bg-white text-dark border p-2 flex-grow-1">
                    2. API Gateway & Validation
                  </span>
                  <span className="text-muted fw-bold">{"->"}</span>
                  <span className="badge bg-white text-dark border p-2 flex-grow-1">
                    3. Database & Business Engine
                  </span>
                  <span className="text-muted fw-bold">{"->"}</span>
                  <span className="badge bg-white text-dark border p-2 flex-grow-1">
                    4. Real-time Sync & Alerts
                  </span>
                </div>
                <p className="text-muted small mb-0">
                  {plan.architectureAndTech?.dataFlowSummary}
                </p>
              </>
            )}
          </div>
        )}

        {/* TAB 5: RISKS & FEASIBILITY */}
        {activeTab === "risks" && (
          <div className="card border shadow-sm rounded-3 p-4 bg-white">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-primary mb-0">Risk Assessment & Feasibility Analysis</h5>
              <span className={`badge px-3 py-2 ${
                plan.risksAndFeasibility?.overallFeasibilityScore === "High Feasibility"
                  ? "bg-success text-white"
                  : "bg-warning text-dark"
              }`}>
                {plan.risksAndFeasibility?.overallFeasibilityScore}
              </span>
            </div>

            <div className="p-3 bg-light rounded border mb-4">
              <div className="fw-bold text-dark small mb-1">Scope Recommendation</div>
              <p className="text-muted small mb-0">{plan.risksAndFeasibility?.scopeRecommendation}</p>
            </div>

            <h6 className="fw-bold text-dark mb-2">Identified Risks & Mitigation Strategies</h6>
            <div className="d-flex flex-column gap-3">
              {(plan.risksAndFeasibility?.risks || []).map((risk, rIdx) => (
                <div key={rIdx} className="p-3 border rounded bg-white">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="badge bg-secondary-subtle text-secondary border small">
                      {risk.category}
                    </span>
                    <span className={`badge ${risk.severity === "High" ? "bg-danger" : "bg-warning text-dark"}`}>
                      {risk.severity} Severity
                    </span>
                  </div>
                  <div className="fw-semibold text-dark small my-1">{risk.description}</div>
                  <div className="small text-muted">
                    <strong>Mitigation:</strong> {risk.mitigationStrategy}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: HISTORY */}
        {activeTab === "history" && (
          <div className="card border shadow-sm rounded-3 p-4 bg-white">
            <h5 className="fw-bold text-primary mb-3">Plan Revisions & History</h5>
            <div className="timeline-list">
              {(plan.planHistory || []).map((hist, hIdx) => (
                <div key={hIdx} className="p-3 border rounded mb-2 bg-light">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-bold text-dark">Revision #{hist.revisionNumber}</span>
                    <span className="text-muted small">{new Date(hist.recalculatedAt).toLocaleString()}</span>
                  </div>
                  <div className="small text-secondary mb-1">
                    <strong>Trigger:</strong> {hist.recalculationReason}
                  </div>
                  <div className="small text-muted">{hist.summaryOfChanges}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODAL 1: Task Detail & Guidance Modal */}
        <Modal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          title={selectedTask ? `[${selectedTask.taskId}] ${selectedTask.title}` : "Task Guidance"}
        >
          {selectedTask && (
            <div>
              <div className="mb-3">
                <span className="badge bg-primary-subtle text-primary border me-2">
                  Module: {selectedTask.moduleName}
                </span>
                <span className="badge bg-light text-dark border">
                  Est. Effort: {selectedTask.estimatedHours} hours
                </span>
              </div>

              <div className="mb-3">
                <h6 className="fw-bold text-dark small mb-1">Task Scope & Purpose</h6>
                <p className="text-muted small">{selectedTask.description}</p>
              </div>

              <div className="mb-3">
                <h6 className="fw-bold text-dark small mb-1">Assigned Teammate Rationale</h6>
                <div className="p-2 bg-light rounded border small text-secondary">
                  <strong>Assigned to:</strong> {selectedTask.assignedMemberName}
                  <br />
                  {selectedTask.assignmentReason}
                </div>
              </div>

              {selectedTask.learningPrerequisites && selectedTask.learningPrerequisites.length > 0 && (
                <div className="mb-3">
                  <h6 className="fw-bold text-dark small mb-1">Learning Prerequisites for Beginner</h6>
                  <ul className="small text-muted ps-3 mb-0">
                    {selectedTask.learningPrerequisites.map((lr, lIdx) => (
                      <li key={lIdx}>{lr}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mb-3">
                <h6 className="fw-bold text-dark small mb-1">Acceptance & Completion Criteria</h6>
                <ul className="small text-muted ps-3 mb-0">
                  {(selectedTask.acceptanceCriteria || []).map((ac, aIdx) => (
                    <li key={aIdx}>{ac}</li>
                  ))}
                </ul>
              </div>

              <div className="d-flex justify-content-end">
                <button
                  onClick={() => setSelectedTask(null)}
                  className="btn btn-outline-secondary btn-sm"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* MODAL 2: Report Blocker Modal */}
        <Modal
          isOpen={!!blockerModalTask}
          onClose={() => setBlockerModalTask(null)}
          title={`Report Blocker for ${blockerModalTask?.taskId}`}
        >
          <form onSubmit={handleSubmitBlocker}>
            <div className="mb-3">
              <label className="form-label fw-semibold small">
                Describe the blocker preventing this task from moving forward:
              </label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="e.g. Awaiting backend CORS fix / API token expired / Database connection failing"
                value={blockerReasonInput}
                onChange={(e) => setBlockerReasonInput(e.target.value)}
                required
              ></textarea>
            </div>
            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setBlockerModalTask(null)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-danger btn-sm fw-semibold">
                Report Blocker & Flag Task
              </button>
            </div>
          </form>
        </Modal>

        {/* MODAL 3: Recalculate Plan Modal */}
        <Modal
          isOpen={showRecalculateModal}
          onClose={() => setShowRecalculateModal(false)}
          title="Dynamic Replanning Engine"
        >
          <form onSubmit={handleRecalculateSubmit}>
            <div className="mb-3">
              <p className="text-muted small">
                The engine will preserve all <strong>{completedTasks} completed tasks</strong> and dynamically reschedule remaining tasks according to updated deadlines, member capacities, and active blockers.
              </p>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold small">Reason for Replanning *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Teammate unavailable for 4 hours / Hackathon deadline shortened"
                value={recalculateReason}
                onChange={(e) => setRecalculateReason(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold small">Updated Deadline (Optional)</label>
              <input
                type="datetime-local"
                className="form-control"
                value={recalculateDeadline}
                onChange={(e) => setRecalculateDeadline(e.target.value)}
              />
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setShowRecalculateModal(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isRecalculating}
                className="btn btn-warning text-dark fw-semibold btn-sm"
              >
                {isRecalculating ? "Recalculating..." : "Execute Replanning"}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}

export default PathfinderDetails;
