import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import LoadingState from "../components/LoadingState";
import SkillBadge from "../components/SkillBadge";
import ProjectCard from "../components/ProjectCard";

function Profile() {
  const { user: authUser, refreshUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview"); // overview, edit, skills, github, projects

  // Edit form state
  const [formData, setFormData] = useState({
    name: "",
    college: "",
    course: "",
    year: "",
    bio: "",
    primaryRole: "",
    githubUsername: "",
    githubUrl: "",
    linkedinUrl: ""
  });

  // Skills state
  const [allAvailableSkills, setAllAvailableSkills] = useState([]);
  const [customSkillInput, setCustomSkillInput] = useState("");

  // GitHub integration state
  const [githubProfile, setGithubProfile] = useState(null);
  const [githubRepos, setGithubRepos] = useState([]);
  const [loadingGithub, setLoadingGithub] = useState(false);

  // Status messages
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Load profile data
  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await API.get("/profile");
      setProfileData(res.data);

      const u = res.data.user;
      setFormData({
        name: u.name || "",
        college: u.college || "",
        course: u.course || "",
        year: u.year || "",
        bio: u.bio || "",
        primaryRole: u.primaryRole || "",
        githubUsername: u.githubUsername || "",
        githubUrl: u.githubUrl || "",
        linkedinUrl: u.linkedinUrl || ""
      });

      if (u.githubUsername) {
        fetchGithubInfo(u.githubUsername);
      }
    } catch (err) {
      console.error("Profile load error:", err);
      setErrorMsg("Failed to load profile details.");
    } finally {
      setLoading(false);
    }
  };

  const loadSkillsCatalogue = async () => {
    try {
      const res = await API.get("/skills");
      setAllAvailableSkills(res.data);
    } catch (err) {
      console.error("Skills catalog error:", err);
    }
  };

  useEffect(() => {
    loadProfile();
    loadSkillsCatalogue();
  }, []);

  const fetchGithubInfo = async (username) => {
    if (!username) return;
    try {
      setLoadingGithub(true);
      const [userRes, reposRes] = await Promise.all([
        API.get(`/github/user/${username}`),
        API.get(`/github/repos/${username}`)
      ]);
      setGithubProfile(userRes.data);
      setGithubRepos(reposRes.data);
    } catch (err) {
      console.error("GitHub fetch error:", err);
    } finally {
      setLoadingGithub(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    try {
      await API.put("/profile", formData);
      setSuccessMsg("Profile updated successfully.");
      refreshUser();
      loadProfile();

      if (formData.githubUsername) {
        fetchGithubInfo(formData.githubUsername);
      }
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      console.error("Update error:", err);
      setErrorMsg(err.response?.data?.message || "Failed to update profile.");
    }
  };

  const handleAddSkill = async (skillName) => {
    if (!skillName || !skillName.trim()) return;
    try {
      await API.post("/profile/skills", { skill: skillName.trim() });
      setSuccessMsg(`Added '${skillName}' to your tech stack.`);
      setCustomSkillInput("");
      refreshUser();
      loadProfile();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      alert(err.response?.data?.message || "Could not add skill.");
    }
  };

  const handleRemoveSkill = async (skillName) => {
    try {
      await API.delete(`/profile/skills/${encodeURIComponent(skillName)}`);
      setSuccessMsg(`Removed '${skillName}'`);
      refreshUser();
      loadProfile();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      alert(err.response?.data?.message || "Could not remove skill.");
    }
  };

  if (loading) {
    return <LoadingState message="Loading developer profile..." />;
  }

  const user = profileData?.user;
  const teams = profileData?.teams || [];
  const projects = profileData?.projects || [];

  return (
    <div
      className="profile-page py-4"
    >
      <div
        className="container"
      >
        {/* Profile Banner */}
        <div
          className="card border shadow-sm rounded-3 p-4 bg-white mb-4"
        >
          <div
            className="d-flex flex-column flex-md-row align-items-center gap-4"
          >
            <div
              className="avatar-circle avatar-large shadow-sm"
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>

            <div
              className="text-center text-md-start flex-grow-1"
            >
              <div
                className="d-flex flex-wrap align-items-center justify-content-center justify-content-md-start gap-2 mb-1"
              >
                <h3
                  className="fw-bold text-primary mb-0"
                >
                  {user?.name}
                </h3>

                <span
                  className="badge bg-primary-subtle text-primary border"
                >
                  {user?.primaryRole || "Student Developer"}
                </span>

                {user?.role === "admin" && (
                  <span
                    className="badge bg-warning text-dark"
                  >
                    Administrator
                  </span>
                )}
              </div>

              <p
                className="text-muted mb-2"
              >
                {user?.college} • {user?.course} ({user?.year})
              </p>

              {user?.bio && (
                <p
                  className="text-secondary small mb-2"
                  style={{ maxWidth: "680px" }}
                >
                  {user.bio}
                </p>
              )}

              <div
                className="d-flex flex-wrap justify-content-center justify-content-md-start gap-3 mt-2"
              >
                {user?.githubUsername && (
                  <a
                    href={`https://github.com/${user.githubUsername}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline-dark btn-sm"
                  >
                    github.com/{user.githubUsername} ↗
                  </a>
                )}

                <div
                  className="text-muted small d-flex align-items-center"
                >
                  {user?.email}
                </div>
              </div>
            </div>

            <div
              className="text-center text-md-end"
            >
              <button
                onClick={() => setActiveTab("edit")}
                className="btn btn-primary-custom btn-sm fw-semibold"
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Feedback Alerts */}
        {successMsg && (
          <div
            className="alert alert-success py-2 alert-dismissible fade show"
            role="alert"
          >
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div
            className="alert alert-danger py-2"
            role="alert"
          >
            {errorMsg}
          </div>
        )}

        {/* Profile Navigation Tabs */}
        <ul
          className="nav nav-pills mb-4 bg-white p-2 rounded-3 shadow-sm border"
        >
          <li
            className="nav-item"
          >
            <button
              className={`nav-link ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>
          </li>

          <li
            className="nav-item"
          >
            <button
              className={`nav-link ${activeTab === "skills" ? "active" : ""}`}
              onClick={() => setActiveTab("skills")}
            >
              Technology Stack ({user?.skills?.length || 0})
            </button>
          </li>

          <li
            className="nav-item"
          >
            <button
              className={`nav-link ${activeTab === "github" ? "active" : ""}`}
              onClick={() => setActiveTab("github")}
            >
              GitHub Showcase
            </button>
          </li>

          <li
            className="nav-item"
          >
            <button
              className={`nav-link ${activeTab === "projects" ? "active" : ""}`}
              onClick={() => setActiveTab("projects")}
            >
              Projects & Teams ({projects.length + teams.length})
            </button>
          </li>

          <li
            className="nav-item"
          >
            <button
              className={`nav-link ${activeTab === "edit" ? "active" : ""}`}
              onClick={() => setActiveTab("edit")}
            >
              Settings
            </button>
          </li>
        </ul>

        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <div
            className="row g-4"
          >
            <div
              className="col-lg-6"
            >
              <div
                className="card border shadow-sm rounded-3 p-4 bg-white h-100"
              >
                <h5
                  className="fw-bold text-primary mb-3"
                >
                  Technology Stack
                </h5>

                <div
                  className="d-flex flex-wrap gap-1 mb-3"
                >
                  {user?.skills && user.skills.length > 0 ? (
                    user.skills.map((s, idx) => (
                      <SkillBadge
                        key={idx}
                        name={s}
                      />
                    ))
                  ) : (
                    <p
                      className="text-muted small"
                    >
                      No skills added yet. Go to the Tech Stack tab to select your skills.
                    </p>
                  )}
                </div>

                <button
                  onClick={() => setActiveTab("skills")}
                  className="btn btn-outline-primary btn-sm align-self-start"
                >
                  Manage Skills
                </button>
              </div>
            </div>

            <div
              className="col-lg-6"
            >
              <div
                className="card border shadow-sm rounded-3 p-4 bg-white h-100"
              >
                <h5
                  className="fw-bold text-primary mb-3"
                >
                  Hackathon Teams
                </h5>

                {teams.length > 0 ? (
                  <div
                    className="d-flex flex-column gap-2"
                  >
                    {teams.map((t) => (
                      <div
                        key={t._id}
                        className="p-3 bg-light rounded border d-flex justify-content-between align-items-center"
                      >
                        <div>
                          <h6
                            className="fw-bold mb-1"
                          >
                            {t.name}
                          </h6>

                          <span
                            className="text-muted small"
                          >
                            {t.hackathonName || t.hackathon?.name}
                          </span>
                        </div>

                        <Link
                          to={`/teams/${t._id}`}
                          className="btn btn-outline-custom btn-sm"
                        >
                          View Team
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p
                    className="text-muted small"
                  >
                    You have not joined any teams yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Technology Stack */}
        {activeTab === "skills" && (
          <div
            className="card border shadow-sm rounded-3 p-4 bg-white"
          >
            <h5
              className="fw-bold text-primary mb-2"
            >
              Technology Stack
            </h5>

            <p
              className="text-muted small mb-4"
            >
              Select the technologies and programming languages you work with.
            </p>

            {/* Current Skills */}
            <div
              className="mb-4 p-3 bg-light rounded border"
            >
              <h6
                className="fw-bold text-dark mb-2"
              >
                Active Skills ({user?.skills?.length || 0}):
              </h6>

              <div
                className="d-flex flex-wrap gap-1"
              >
                {user?.skills && user.skills.length > 0 ? (
                  user.skills.map((skill, idx) => (
                    <SkillBadge
                      key={idx}
                      name={skill}
                      onRemove={handleRemoveSkill}
                    />
                  ))
                ) : (
                  <span
                    className="text-muted small"
                  >
                    No skills added yet. Select from below or type a custom skill.
                  </span>
                )}
              </div>
            </div>

            {/* Add Custom Skill */}
            <div
              className="row g-2 mb-4"
            >
              <div
                className="col-md-8 col-lg-6"
              >
                <div
                  className="input-group"
                >
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Next.js, FastAPI, PyTorch"
                    value={customSkillInput}
                    onChange={(e) => setCustomSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSkill(customSkillInput);
                      }
                    }}
                  />

                  <button
                    className="btn btn-primary-custom"
                    type="button"
                    onClick={() => handleAddSkill(customSkillInput)}
                  >
                    Add Skill
                  </button>
                </div>
              </div>
            </div>

            {/* Predefined Categories */}
            <h6
              className="fw-bold text-dark mb-3"
            >
              Standard Tech Stack:
            </h6>

            {["Frontend", "Backend", "Database", "AI/ML", "Programming", "Cloud/DevOps"].map((cat) => {
              const catSkills = allAvailableSkills.filter((s) => s.category === cat);
              return (
                <div
                  key={cat}
                  className="mb-3"
                >
                  <p
                    className="fw-semibold text-secondary small mb-1"
                  >
                    {cat}:
                  </p>

                  <div
                    className="d-flex flex-wrap gap-1"
                  >
                    {catSkills.map((s) => {
                      const isAdded = user?.skills?.includes(s.name);
                      return (
                        <button
                          key={s._id || s.name}
                          type="button"
                          onClick={() => (!isAdded ? handleAddSkill(s.name) : handleRemoveSkill(s.name))}
                          className={`btn btn-sm ${isAdded ? "btn-primary" : "btn-outline-secondary"}`}
                          style={{ fontSize: "0.82rem" }}
                        >
                          {isAdded ? `Added: ${s.name}` : `+ ${s.name}`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 3: GitHub Showcase */}
        {activeTab === "github" && (
          <div
            className="card border shadow-sm rounded-3 p-4 bg-white"
          >
            <div
              className="d-flex justify-content-between align-items-center mb-3"
            >
              <div>
                <h5
                  className="fw-bold text-primary mb-1"
                >
                  GitHub Profile & Repository Showcase
                </h5>

                <p
                  className="text-muted small mb-0"
                >
                  Public repositories fetched from the GitHub REST API.
                </p>
              </div>

              {user?.githubUsername && (
                <button
                  onClick={() => fetchGithubInfo(user.githubUsername)}
                  className="btn btn-outline-dark btn-sm"
                >
                  Refresh Repos
                </button>
              )}
            </div>

            {!user?.githubUsername ? (
              <div
                className="text-center py-5 bg-light rounded border"
              >
                <h5
                  className="fw-bold"
                >
                  Connect Your GitHub Username
                </h5>

                <p
                  className="text-muted small mb-3"
                >
                  Enter your GitHub username in settings to display your open repositories.
                </p>

                <button
                  onClick={() => setActiveTab("edit")}
                  className="btn btn-primary-custom btn-sm"
                >
                  Add GitHub Username
                </button>
              </div>
            ) : loadingGithub ? (
              <LoadingState message="Fetching repositories from GitHub..." />
            ) : (
              <div>
                {githubProfile && (
                  <div
                    className="p-3 bg-light rounded border mb-4 d-flex align-items-center gap-3"
                  >
                    {githubProfile.avatar_url && (
                      <img
                        src={githubProfile.avatar_url}
                        alt="GitHub avatar"
                        className="rounded-circle"
                        width="50"
                        height="50"
                      />
                    )}

                    <div>
                      <h6
                        className="fw-bold mb-0"
                      >
                        {githubProfile.name} (@{githubProfile.login})
                      </h6>

                      <p
                        className="small text-muted mb-0"
                      >
                        {githubProfile.bio || "Developer"} • {githubProfile.public_repos} Public Repositories • {githubProfile.followers} Followers
                      </p>
                    </div>
                  </div>
                )}

                <h6
                  className="fw-bold text-dark mb-3"
                >
                  Public Repositories ({githubRepos.length}):
                </h6>

                {githubRepos.length > 0 ? (
                  <div
                    className="row g-3"
                  >
                    {githubRepos.map((repo) => (
                      <div
                        key={repo.id}
                        className="col-md-6 col-lg-4"
                      >
                        <div
                          className="card border h-100 shadow-sm rounded-3 p-3 bg-white"
                        >
                          <h6
                            className="fw-bold text-primary mb-1 text-truncate"
                          >
                            <a
                              href={repo.html_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-decoration-none text-primary"
                            >
                              {repo.name}
                            </a>
                          </h6>

                          <p
                            className="text-muted small text-truncate-2 mb-3"
                            style={{ minHeight: "36px" }}
                          >
                            {repo.description}
                          </p>

                          <div
                            className="mt-auto d-flex justify-content-between align-items-center pt-2 border-top small"
                          >
                            <span
                              className="badge bg-light text-dark border"
                            >
                              {repo.language}
                            </span>

                            <span
                              className="text-muted"
                            >
                              Stars: {repo.stargazers_count}
                            </span>

                            <a
                              href={repo.html_url}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-sm btn-outline-dark py-0"
                            >
                              View ↗
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p
                    className="text-muted small"
                  >
                    No public repositories found for this username.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Projects & Teams */}
        {activeTab === "projects" && (
          <div>
            <div
              className="d-flex justify-content-between align-items-center mb-3"
            >
              <h5
                className="fw-bold text-primary mb-0"
              >
                Showcase Projects
              </h5>

              <Link
                to="/projects"
                className="btn btn-primary-custom btn-sm"
              >
                Create Project
              </Link>
            </div>

            {projects.length > 0 ? (
              <div
                className="row g-3"
              >
                {projects.map((p) => (
                  <div
                    key={p._id}
                    className="col-md-6"
                  >
                    <ProjectCard
                      project={p}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="card border shadow-sm rounded-3 p-4 bg-white text-center"
              >
                <p
                  className="text-muted mb-3"
                >
                  You have not created any projects yet.
                </p>

                <Link
                  to="/projects"
                  className="btn btn-primary-custom btn-sm align-self-center"
                >
                  Create Project
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Edit Settings */}
        {activeTab === "edit" && (
          <div
            className="card border shadow-sm rounded-3 p-4 bg-white"
          >
            <h5
              className="fw-bold text-primary mb-3"
            >
              Edit Profile Settings
            </h5>

            <form
              onSubmit={handleProfileUpdate}
            >
              <div
                className="row g-3 mb-3"
              >
                <div
                  className="col-md-6"
                >
                  <label
                    className="form-label fw-semibold small"
                  >
                    Full Name
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div
                  className="col-md-6"
                >
                  <label
                    className="form-label fw-semibold small"
                  >
                    Primary Role
                  </label>

                  <select
                    className="form-select"
                    value={formData.primaryRole}
                    onChange={(e) => setFormData({ ...formData, primaryRole: e.target.value })}
                  >
                    <option
                      value="Frontend Developer"
                    >
                      Frontend Developer
                    </option>

                    <option
                      value="Backend Developer"
                    >
                      Backend Developer
                    </option>

                    <option
                      value="Full Stack Developer"
                    >
                      Full Stack Developer
                    </option>

                    <option
                      value="ML Developer"
                    >
                      ML Developer
                    </option>

                    <option
                      value="UI/UX Designer"
                    >
                      UI/UX Designer
                    </option>

                    <option
                      value="Database Developer"
                    >
                      Database Developer
                    </option>
                  </select>
                </div>
              </div>

              <div
                className="row g-3 mb-3"
              >
                <div
                  className="col-md-4"
                >
                  <label
                    className="form-label fw-semibold small"
                  >
                    College / University
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    value={formData.college}
                    onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                  />
                </div>

                <div
                  className="col-md-4"
                >
                  <label
                    className="form-label fw-semibold small"
                  >
                    Course / Major
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    value={formData.course}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  />
                </div>

                <div
                  className="col-md-4"
                >
                  <label
                    className="form-label fw-semibold small"
                  >
                    Year of Study
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  />
                </div>
              </div>

              <div
                className="mb-3"
              >
                <label
                  className="form-label fw-semibold small"
                >
                  Bio / About
                </label>

                <textarea
                  className="form-control"
                  rows="3"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Share a short bio with other students..."
                >
                </textarea>
              </div>

              <div
                className="row g-3 mb-4"
              >
                <div
                  className="col-md-6"
                >
                  <label
                    className="form-label fw-semibold small"
                  >
                    GitHub Username
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. devasri"
                    value={formData.githubUsername}
                    onChange={(e) => setFormData({ ...formData, githubUsername: e.target.value })}
                  />
                </div>

                <div
                  className="col-md-6"
                >
                  <label
                    className="form-label fw-semibold small"
                  >
                    LinkedIn URL
                  </label>

                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://linkedin.com/in/..."
                    value={formData.linkedinUrl}
                    onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary-custom fw-semibold px-4"
              >
                Save Changes
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
