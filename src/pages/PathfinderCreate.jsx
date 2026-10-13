import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import LoadingState from "../components/LoadingState";

function PathfinderCreate() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Step Tracker: 1 = Problem, 2 = Mode & Stack, 3 = Team & Members, 4 = Deadline & Constraints
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Existing Teams List
  const [userTeams, setUserTeams] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1
    title: "",
    problemStatement: "",
    expectedOutcome: "",
    targetUsers: "",
    projectCategory: "Web Application",
    mandatoryRequirements: "",
    referenceLinks: "",
    evaluationCriteria: "",

    // Step 2
    planningMode: "guide_from_scratch",
    specifiedStack: {
      frontend: "React, Bootstrap, HTML/CSS",
      backend: "Node.js, Express",
      database: "MongoDB",
      programmingLanguages: "JavaScript",
      frameworks: "",
      apisAndServices: "",
      aiMlTools: "",
      existingCodeOrDatasets: ""
    },

    // Step 3
    selectedTeamId: "",
    teamMembers: [],

    // Step 4
    finalDeadline: new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 16),
    timeZone: "Asia/Kolkata",
    projectType: "24-hour hackathon",
    availableHoursTotal: 24,
    infrastructureLimits: "",
    mandatoryFeatures: "",
    optionalFeatures: "",
    deploymentRequirements: "Live URL (Vercel / Render)",
    demoPresentationTime: ""
  });

  // Fetch user teams to prefill
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoadingTeams(true);
        const res = await API.get("/teams/my");
        setUserTeams(res.data || []);

        // Initialize teamMembers with current user
        if (user) {
          setFormData((prev) => ({
            ...prev,
            teamMembers: [
              {
                userId: user.id || user._id,
                name: user.name || "Student",
                email: user.email || "",
                technicalSkills: Array.isArray(user.skills) ? user.skills.join(", ") : "JavaScript, React",
                proficiencyLevel: "Intermediate",
                preferredRole: user.primaryRole || "Full Stack Developer",
                availableHours: 20,
                tasksInterestedIn: "",
                willingToLearn: ""
              }
            ]
          }));
        }
      } catch (err) {
        console.error("Fetch my teams error:", err);
      } finally {
        setLoadingTeams(false);
      }
    };
    fetchTeams();
  }, [user]);

  // When user selects a team, populate members from team
  const handleSelectTeam = async (teamId) => {
    setFormData((prev) => ({ ...prev, selectedTeamId: teamId }));
    if (!teamId) return;

    try {
      const res = await API.get(`/teams/${teamId}`);
      const team = res.data?.team;
      if (team && Array.isArray(team.members)) {
        const loadedMembers = team.members.map((m) => {
          const u = m.user || {};
          return {
            userId: u._id || null,
            name: u.name || "Teammate",
            email: u.email || "",
            technicalSkills: Array.isArray(u.skills) ? u.skills.join(", ") : "General Tech",
            proficiencyLevel: "Intermediate",
            preferredRole: m.role || u.primaryRole || "Developer",
            availableHours: 20,
            tasksInterestedIn: "",
            willingToLearn: ""
          };
        });
        setFormData((prev) => ({ ...prev, teamMembers: loadedMembers }));
      }
    } catch (err) {
      console.error("Load team members error:", err);
    }
  };

  // Member management handlers
  const handleAddMember = () => {
    setFormData((prev) => ({
      ...prev,
      teamMembers: [
        ...prev.teamMembers,
        {
          userId: null,
          name: "",
          email: "",
          technicalSkills: "",
          proficiencyLevel: "Beginner",
          preferredRole: "Developer",
          availableHours: 15,
          tasksInterestedIn: "",
          willingToLearn: ""
        }
      ]
    }));
  };

  const handleUpdateMember = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.teamMembers];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, teamMembers: updated };
    });
  };

  const handleRemoveMember = (index) => {
    if (formData.teamMembers.length <= 1) {
      alert("A project must have at least one team member.");
      return;
    }
    setFormData((prev) => {
      const updated = prev.teamMembers.filter((_, idx) => idx !== index);
      return { ...prev, teamMembers: updated };
    });
  };

  // Step Navigation & Validation
  const handleNext = () => {
    setErrorMsg("");
    if (currentStep === 1) {
      if (!formData.title.trim()) {
        setErrorMsg("Please enter a Project Title.");
        return;
      }
      if (!formData.problemStatement.trim() || formData.problemStatement.trim().length < 15) {
        setErrorMsg("Please provide a descriptive problem statement (minimum 15 characters).");
        return;
      }
    }
    if (currentStep === 3) {
      if (formData.teamMembers.some((m) => !m.name.trim())) {
        setErrorMsg("Please provide names for all team members.");
        return;
      }
    }
    setCurrentStep((prev) => Math.min(4, prev + 1));
  };

  const handleBack = () => {
    setErrorMsg("");
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  // Final Submit Handler
  const handleSubmitPlan = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.finalDeadline) {
      setErrorMsg("Please select a valid deadline date and time.");
      return;
    }

    // Format member snapshots with arrays
    const formattedMembers = formData.teamMembers.map((m) => ({
      userId: m.userId,
      name: m.name.trim(),
      email: m.email.trim(),
      technicalSkills: m.technicalSkills ? m.technicalSkills.split(",").map((s) => s.trim()).filter(Boolean) : [],
      proficiencyLevel: m.proficiencyLevel,
      preferredRole: m.preferredRole,
      availableHours: Number(m.availableHours) || 20,
      tasksInterestedIn: m.tasksInterestedIn ? m.tasksInterestedIn.split(",").map((s) => s.trim()).filter(Boolean) : [],
      willingToLearn: m.willingToLearn ? m.willingToLearn.split(",").map((s) => s.trim()).filter(Boolean) : []
    }));

    // Format specified stack
    const formattedStack = {
      frontend: formData.specifiedStack.frontend.split(",").map((s) => s.trim()).filter(Boolean),
      backend: formData.specifiedStack.backend.split(",").map((s) => s.trim()).filter(Boolean),
      database: formData.specifiedStack.database.split(",").map((s) => s.trim()).filter(Boolean),
      programmingLanguages: formData.specifiedStack.programmingLanguages.split(",").map((s) => s.trim()).filter(Boolean),
      frameworks: formData.specifiedStack.frameworks.split(",").map((s) => s.trim()).filter(Boolean),
      apisAndServices: formData.specifiedStack.apisAndServices.split(",").map((s) => s.trim()).filter(Boolean),
      aiMlTools: formData.specifiedStack.aiMlTools.split(",").map((s) => s.trim()).filter(Boolean),
      existingCodeOrDatasets: formData.specifiedStack.existingCodeOrDatasets
    };

    const payload = {
      title: formData.title,
      problemStatement: formData.problemStatement,
      expectedOutcome: formData.expectedOutcome,
      targetUsers: formData.targetUsers,
      projectCategory: formData.projectCategory,
      mandatoryRequirements: formData.mandatoryRequirements ? formData.mandatoryRequirements.split(",").map((s) => s.trim()).filter(Boolean) : [],
      referenceLinks: formData.referenceLinks ? formData.referenceLinks.split("\n").map((s) => s.trim()).filter(Boolean) : [],
      evaluationCriteria: formData.evaluationCriteria ? formData.evaluationCriteria.split(",").map((s) => s.trim()).filter(Boolean) : [],
      teamId: formData.selectedTeamId || null,
      planningMode: formData.planningMode,
      specifiedStack: formattedStack,
      teamMembers: formattedMembers,
      constraints: {
        finalDeadline: formData.finalDeadline,
        timeZone: formData.timeZone,
        projectType: formData.projectType,
        availableHoursTotal: Number(formData.availableHoursTotal) || 24,
        infrastructureLimits: formData.infrastructureLimits,
        mandatoryFeatures: formData.mandatoryFeatures ? formData.mandatoryFeatures.split(",").map((s) => s.trim()).filter(Boolean) : [],
        optionalFeatures: formData.optionalFeatures ? formData.optionalFeatures.split(",").map((s) => s.trim()).filter(Boolean) : [],
        deploymentRequirements: formData.deploymentRequirements,
        demoPresentationTime: formData.demoPresentationTime || null
      }
    };

    try {
      setIsSubmitting(true);
      const res = await API.post("/pathfinder/generate", payload);
      navigate(`/pathfinder/${res.data.plan?._id}`);
    } catch (err) {
      console.error("Plan generation failed:", err);
      setErrorMsg(err.response?.data?.message || "Failed to generate project roadmap. Please check your inputs.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pathfinder-create-page py-4">
      <div className="container" style={{ maxWidth: "860px" }}>
        {/* Header Breadcrumb */}
        <div className="mb-3 d-flex justify-content-between align-items-center">
          <div>
            <Link to="/pathfinder" className="text-decoration-none small text-muted">
              Back to Project PathFinder
            </Link>
            <h3 className="fw-bold text-dark mt-1 mb-0">Create Development Plan</h3>
          </div>
          <span className="badge bg-primary-subtle text-primary border px-3 py-2">
            Step {currentStep} of 4
          </span>
        </div>

        {/* Step Progress Indicators */}
        <div className="card border shadow-sm rounded-3 p-3 bg-white mb-4">
          <div className="row text-center g-2">
            <div className={`col-3 ${currentStep >= 1 ? "text-primary fw-bold" : "text-muted"}`}>
              <div className={`badge rounded-circle p-2 mb-1 ${currentStep >= 1 ? "bg-primary text-white" : "bg-light text-secondary border"}`}>
                1
              </div>
              <div className="small">Problem Statement</div>
            </div>
            <div className={`col-3 ${currentStep >= 2 ? "text-primary fw-bold" : "text-muted"}`}>
              <div className={`badge rounded-circle p-2 mb-1 ${currentStep >= 2 ? "bg-primary text-white" : "bg-light text-secondary border"}`}>
                2
              </div>
              <div className="small">Planning Mode</div>
            </div>
            <div className={`col-3 ${currentStep >= 3 ? "text-primary fw-bold" : "text-muted"}`}>
              <div className={`badge rounded-circle p-2 mb-1 ${currentStep >= 3 ? "bg-primary text-white" : "bg-light text-secondary border"}`}>
                3
              </div>
              <div className="small">Team & Members</div>
            </div>
            <div className={`col-3 ${currentStep >= 4 ? "text-primary fw-bold" : "text-muted"}`}>
              <div className={`badge rounded-circle p-2 mb-1 ${currentStep >= 4 ? "bg-primary text-white" : "bg-light text-secondary border"}`}>
                4
              </div>
              <div className="small">Deadline & Constraints</div>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="alert alert-danger py-2 small mb-4" role="alert">
            {errorMsg}
          </div>
        )}

        {isSubmitting ? (
          <div className="card border shadow-sm rounded-3 p-5 bg-white text-center">
            <LoadingState message="Generating personalized development plan, analyzing dependencies, and calculating topological roadmap..." />
            <p className="text-muted small mt-2">
              Validating skill allocations, computing parallel tracks, and establishing beginner guidance.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmitPlan}>
            {/* STEP 1: Problem Statement */}
            {currentStep === 1 && (
              <div className="card border shadow-sm rounded-3 p-4 bg-white mb-4">
                <h5 className="fw-bold text-primary mb-3">Step 1: Problem Statement & Objectives</h5>

                <div className="mb-3">
                  <label className="form-label fw-semibold small">Project Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Campus Emergency Dispatch & Real-Time Alert System"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold small">Detailed Problem Statement *</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    placeholder="Describe the real-world problem you are aiming to solve in detail..."
                    value={formData.problemStatement}
                    onChange={(e) => setFormData({ ...formData, problemStatement: e.target.value })}
                    required
                  ></textarea>
                  <div className="form-text">
                    Be specific about pain points. The planning engine extracts functional modules directly from this text.
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">Expected Solution / Outcome</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Responsive web dashboard with live SMS alerts & map pins"
                      value={formData.expectedOutcome}
                      onChange={(e) => setFormData({ ...formData, expectedOutcome: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">Target Users</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. University security guards, students, wardens"
                      value={formData.targetUsers}
                      onChange={(e) => setFormData({ ...formData, targetUsers: e.target.value })}
                    />
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">Project Category</label>
                    <select
                      className="form-select"
                      value={formData.projectCategory}
                      onChange={(e) => setFormData({ ...formData, projectCategory: e.target.value })}
                    >
                      <option value="Web Application">Web Application</option>
                      <option value="Mobile App">Mobile App</option>
                      <option value="AI / Machine Learning">AI / Machine Learning</option>
                      <option value="IoT & Hardware">IoT & Hardware</option>
                      <option value="Cybersecurity">Cybersecurity</option>
                      <option value="Blockchain / Web3">Blockchain / Web3</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">Mandatory Hackathon Requirements (comma separated)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Open-source APIs only, Must have mobile layout"
                      value={formData.mandatoryRequirements}
                      onChange={(e) => setFormData({ ...formData, mandatoryRequirements: e.target.value })}
                    />
                  </div>
                </div>

                <div className="mb-2">
                  <label className="form-label fw-semibold small">Reference Links or Docs (one per line)</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    placeholder="https://github.com/example/api-doc&#10;https://devpost.com/hackathon-rules"
                    value={formData.referenceLinks}
                    onChange={(e) => setFormData({ ...formData, referenceLinks: e.target.value })}
                  ></textarea>
                </div>
              </div>
            )}

            {/* STEP 2: Choose Planning Mode & Tech Stack */}
            {currentStep === 2 && (
              <div className="card border shadow-sm rounded-3 p-4 bg-white mb-4">
                <h5 className="fw-bold text-primary mb-3">Step 2: Choose Planning Mode</h5>

                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <div
                      className={`card p-3 h-100 cursor-pointer ${
                        formData.planningMode === "guide_from_scratch"
                          ? "border-primary bg-primary-subtle"
                          : "border bg-light"
                      }`}
                      style={{ cursor: "pointer" }}
                      onClick={() => setFormData({ ...formData, planningMode: "guide_from_scratch" })}
                    >
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <input
                          type="radio"
                          name="planningMode"
                          checked={formData.planningMode === "guide_from_scratch"}
                          onChange={() => {}}
                        />
                        <h6 className="fw-bold text-dark mb-0">Mode A: Guide Me From Scratch</h6>
                      </div>
                      <p className="text-muted small mb-0">
                        Ideal for students who are unsure how to approach the challenge. The engine analyzes team skills, explains the problem in plain language, and recommends an optimal architecture and stack.
                      </p>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div
                      className={`card p-3 h-100 cursor-pointer ${
                        formData.planningMode === "specified_stack"
                          ? "border-primary bg-primary-subtle"
                          : "border bg-light"
                      }`}
                      style={{ cursor: "pointer" }}
                      onClick={() => setFormData({ ...formData, planningMode: "specified_stack" })}
                    >
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <input
                          type="radio"
                          name="planningMode"
                          checked={formData.planningMode === "specified_stack"}
                          onChange={() => {}}
                        />
                        <h6 className="fw-bold text-dark mb-0">Mode B: I Know My Tech Stack</h6>
                      </div>
                      <p className="text-muted small mb-0">
                        Ideal for teams with predetermined frameworks or APIs. Specify your tools and the engine will respect your choices while checking for compatibility warnings.
                      </p>
                    </div>
                  </div>
                </div>

                {formData.planningMode === "specified_stack" && (
                  <div className="p-3 border rounded bg-light">
                    <h6 className="fw-bold text-dark mb-3">Specify Your Technology Stack</h6>

                    <div className="row g-3 mb-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold small">Frontend Technologies</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. React, Next.js, Tailwind CSS"
                          value={formData.specifiedStack.frontend}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              specifiedStack: { ...formData.specifiedStack, frontend: e.target.value }
                            })
                          }
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold small">Backend Technologies</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. Node.js, Express, FastAPI, Django"
                          value={formData.specifiedStack.backend}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              specifiedStack: { ...formData.specifiedStack, backend: e.target.value }
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="row g-3 mb-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold small">Database & Storage</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. MongoDB, PostgreSQL, SQLite"
                          value={formData.specifiedStack.database}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              specifiedStack: { ...formData.specifiedStack, database: e.target.value }
                            })
                          }
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold small">Programming Languages</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. JavaScript, Python, TypeScript"
                          value={formData.specifiedStack.programmingLanguages}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              specifiedStack: { ...formData.specifiedStack, programmingLanguages: e.target.value }
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="row g-3 mb-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold small">External APIs & Services</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. Twilio SMS, Google Maps API, Stripe"
                          value={formData.specifiedStack.apisAndServices}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              specifiedStack: { ...formData.specifiedStack, apisAndServices: e.target.value }
                            })
                          }
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold small">AI / ML Models (Optional)</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. Hugging Face, OpenCV, PyTorch"
                          value={formData.specifiedStack.aiMlTools}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              specifiedStack: { ...formData.specifiedStack, aiMlTools: e.target.value }
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: Team and Member Details */}
            {currentStep === 3 && (
              <div className="card border shadow-sm rounded-3 p-4 bg-white mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h5 className="fw-bold text-primary mb-0">Step 3: Team Members & Skills</h5>
                    <p className="text-muted small mb-0">
                      Configure your squad members. The engine uses their skills and availability to assign tasks fairly.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddMember}
                    className="btn btn-outline-custom btn-sm fw-semibold"
                  >
                    + Add Member
                  </button>
                </div>

                {/* Optional select from existing team */}
                {userTeams.length > 0 && (
                  <div className="mb-4 p-3 bg-light rounded border">
                    <label className="form-label fw-semibold small">Or Link to Existing CampusCollab Squad:</label>
                    <select
                      className="form-select form-select-sm"
                      value={formData.selectedTeamId}
                      onChange={(e) => handleSelectTeam(e.target.value)}
                    >
                      <option value="">-- Create roadmap for independent squad --</option>
                      {userTeams.map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.name} ({t.hackathonName || "Hackathon"}) - {t.members?.length || 1} members
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Member Cards */}
                <div className="d-flex flex-column gap-3">
                  {formData.teamMembers.map((member, idx) => (
                    <div key={idx} className="p-3 border rounded bg-light position-relative">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="badge bg-primary text-white">Member #{idx + 1}</span>
                        {formData.teamMembers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(idx)}
                            className="btn btn-link text-danger p-0 text-decoration-none small"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="row g-2 mb-2">
                        <div className="col-md-4">
                          <label className="form-label fw-semibold small mb-1">Name *</label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Teammate Name"
                            value={member.name}
                            onChange={(e) => handleUpdateMember(idx, "name", e.target.value)}
                            required
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label fw-semibold small mb-1">Preferred Role</label>
                          <select
                            className="form-select form-select-sm"
                            value={member.preferredRole}
                            onChange={(e) => handleUpdateMember(idx, "preferredRole", e.target.value)}
                          >
                            <option value="Frontend Developer">Frontend Developer</option>
                            <option value="Backend Developer">Backend Developer</option>
                            <option value="Full Stack Developer">Full Stack Developer</option>
                            <option value="UI/UX Designer">UI/UX Designer</option>
                            <option value="ML/AI Developer">ML/AI Developer</option>
                            <option value="Project Lead">Project Lead</option>
                          </select>
                        </div>
                        <div className="col-md-4">
                          <label className="form-label fw-semibold small mb-1">Proficiency Level</label>
                          <select
                            className="form-select form-select-sm"
                            value={member.proficiencyLevel}
                            onChange={(e) => handleUpdateMember(idx, "proficiencyLevel", e.target.value)}
                          >
                            <option value="Beginner">Beginner (Needs learning steps)</option>
                            <option value="Intermediate">Intermediate (Independent worker)</option>
                            <option value="Advanced">Advanced (Can lead critical tasks)</option>
                          </select>
                        </div>
                      </div>

                      <div className="row g-2">
                        <div className="col-md-8">
                          <label className="form-label fw-semibold small mb-1">Known Skills (comma separated)</label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="e.g. React, JavaScript, Node.js, Python"
                            value={member.technicalSkills}
                            onChange={(e) => handleUpdateMember(idx, "technicalSkills", e.target.value)}
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label fw-semibold small mb-1">Available Hours for Project</label>
                          <input
                            type="number"
                            min="1"
                            max="80"
                            className="form-control form-control-sm"
                            value={member.availableHours}
                            onChange={(e) => handleUpdateMember(idx, "availableHours", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 4: Deadline & Constraints */}
            {currentStep === 4 && (
              <div className="card border shadow-sm rounded-3 p-4 bg-white mb-4">
                <h5 className="fw-bold text-primary mb-3">Step 4: Deadline, Timeframe & Constraints</h5>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">Final Project Deadline *</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={formData.finalDeadline}
                      onChange={(e) => setFormData({ ...formData, finalDeadline: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">Project Type / Format</label>
                    <select
                      className="form-select"
                      value={formData.projectType}
                      onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                    >
                      <option value="24-hour hackathon">24-hour hackathon</option>
                      <option value="36-hour hackathon">36-hour hackathon</option>
                      <option value="48-hour hackathon">48-hour hackathon</option>
                      <option value="1-week sprint">1-week sprint</option>
                      <option value="2-week project">2-week project</option>
                      <option value="semester-long">Semester-long project</option>
                    </select>
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">Total Estimated Working Hours Window</label>
                    <input
                      type="number"
                      min="6"
                      max="200"
                      className="form-control"
                      value={formData.availableHoursTotal}
                      onChange={(e) => setFormData({ ...formData, availableHoursTotal: e.target.value })}
                    />
                    <div className="form-text">Used to assess feasibility and critical-path buffers.</div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">Deployment Requirements</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Live public Vercel URL, Demo video"
                      value={formData.deploymentRequirements}
                      onChange={(e) => setFormData({ ...formData, deploymentRequirements: e.target.value })}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold small">Mandatory Features (MVP Must-Haves)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. User login, Emergency SMS trigger, Interactive incident map"
                    value={formData.mandatoryFeatures}
                    onChange={(e) => setFormData({ ...formData, mandatoryFeatures: e.target.value })}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold small">Optional / Stretch Features (Nice-to-Haves)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Dark mode, Voice recognition, Push notifications"
                    value={formData.optionalFeatures}
                    onChange={(e) => setFormData({ ...formData, optionalFeatures: e.target.value })}
                  />
                  <div className="form-text">
                    Stretch features are automatically scheduled as lower priority so your MVP stays safe.
                  </div>
                </div>

                <div className="mb-2">
                  <label className="form-label fw-semibold small">Infrastructure / Resource Limitations</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Free-tier cloud limits, No dedicated GPU server, Local MongoDB only"
                    value={formData.infrastructureLimits}
                    onChange={(e) => setFormData({ ...formData, infrastructureLimits: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="d-flex justify-content-between align-items-center mt-3">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="btn btn-outline-custom fw-semibold"
                >
                  Back
                </button>
              ) : (
                <Link to="/pathfinder" className="btn btn-outline-secondary">
                  Cancel
                </Link>
              )}

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn btn-primary-custom fw-semibold"
                >
                  Continue to Next Step
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-success fw-semibold shadow-sm px-4"
                >
                  {isSubmitting ? "Generating Plan..." : "Generate Project Development Plan"}
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default PathfinderCreate;
