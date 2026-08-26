import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../services/api";
import LoadingState from "../components/LoadingState";
import SkillBadge from "../components/SkillBadge";
import ProjectCard from "../components/ProjectCard";

function StudentProfile() {
  const { id } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [githubRepos, setGithubRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/profile/${id}`);
        setProfileData(res.data);

        if (res.data.user?.githubUsername) {
          try {
            const repoRes = await API.get(`/github/repos/${res.data.user.githubUsername}`);
            setGithubRepos(repoRes.data);
          } catch (repoErr) {
            console.error("GitHub repo fetch error:", repoErr);
          }
        }
      } catch (err) {
        console.error("Student profile error:", err);
        setError("Could not load student profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentProfile();
  }, [id]);

  if (loading) {
    return <LoadingState message="Loading student profile..." />;
  }

  if (error || !profileData) {
    return (
      <div
        className="container py-5 text-center"
      >
        <div
          className="alert alert-danger"
        >
          {error || "Student profile not found."}
        </div>

        <Link
          to="/teammates"
          className="btn btn-primary-custom"
        >
          Back to Teammates
        </Link>
      </div>
    );
  }

  const { user, teams, projects } = profileData;

  return (
    <div
      className="student-profile-page py-4"
    >
      <div
        className="container"
      >
        {/* Profile Card */}
        <div
          className="card border shadow-sm rounded-3 p-4 bg-white mb-4"
        >
          <div
            className="d-flex flex-column flex-md-row align-items-center gap-4"
          >
            <div
              className="avatar-circle avatar-large shadow-sm"
            >
              {user.name ? user.name.charAt(0).toUpperCase() : "S"}
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
                  {user.name}
                </h3>

                <span
                  className="badge bg-primary-subtle text-primary border"
                >
                  {user.primaryRole || "Student Developer"}
                </span>
              </div>

              <p
                className="text-muted mb-2"
              >
                {user.college} • {user.course} ({user.year})
              </p>

              {user.bio && (
                <p
                  className="text-secondary small mb-3"
                  style={{ maxWidth: "680px" }}
                >
                  {user.bio}
                </p>
              )}

              {/* Direct Contact Email & External Links */}
              <div
                className="d-flex flex-wrap justify-content-center justify-content-md-start gap-2"
              >
                {user.email && (
                  <a
                    href={`mailto:${user.email}`}
                    className="btn btn-primary-custom btn-sm"
                  >
                    Email: {user.email}
                  </a>
                )}

                {user.githubUsername && (
                  <a
                    href={`https://github.com/${user.githubUsername}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline-dark btn-sm"
                  >
                    github.com/{user.githubUsername} ↗
                  </a>
                )}

                {user.linkedinUrl && (
                  <a
                    href={user.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline-primary btn-sm"
                  >
                    LinkedIn Profile ↗
                  </a>
                )}
              </div>
            </div>

            <div
              className="text-center text-md-end"
            >
              <Link
                to="/teammates"
                className="btn btn-outline-secondary btn-sm"
              >
                Back to Students
              </Link>
            </div>
          </div>
        </div>

        {/* Technology Stack & Teams */}
        <div
          className="row g-4 mb-4"
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
                className="d-flex flex-wrap gap-1"
              >
                {user.skills && user.skills.length > 0 ? (
                  user.skills.map((skill, idx) => (
                    <SkillBadge
                      key={idx}
                      name={skill}
                    />
                  ))
                ) : (
                  <p
                    className="text-muted small"
                  >
                    No skills listed.
                  </p>
                )}
              </div>
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
                Hackathon Squads
              </h5>

              {teams && teams.length > 0 ? (
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
                          {t.hackathon?.name || "Hackathon Team"}
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
                  Not in any teams currently.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* GitHub Repositories Showcase */}
        {githubRepos.length > 0 && (
          <div
            className="card border shadow-sm rounded-3 p-4 bg-white mb-4"
          >
            <h5
              className="fw-bold text-primary mb-3"
            >
              Public GitHub Repositories
            </h5>

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
                      {repo.name}
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
          </div>
        )}

        {/* Student Projects */}
        {projects && projects.length > 0 && (
          <div>
            <h5
              className="fw-bold text-primary mb-3"
            >
              Showcase Projects
            </h5>

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
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentProfile;
