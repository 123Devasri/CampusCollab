import React, { useState } from "react";
import "./Project.css";

function Project() {
  const projects = [
    {
      id: 1,
      title: "Smart Attendance System",
      tech: "React, Firebase",
      members: "Frontend Developer",
      description: "Develop a smart attendance tracking application."
    },
    {
      id: 2,
      title: "AI Chatbot",
      tech: "React, Python",
      members: "Python Developer",
      description: "Create an AI chatbot for college enquiries."
    },
    {
      id: 3,
      title: "Campus Event Manager",
      tech: "React, Node.js",
      members: "Full Stack Developer",
      description: "Manage college events and registrations."
    }
  ];

  const [search, setSearch] = useState("");

  const filteredProjects = projects.filter((project) =>
    project.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="project-container">
      <h1>Project Collaboration Board</h1>

      <input
        type="text"
        placeholder="Search Project..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-box"
      />

      <div className="project-grid">
        {filteredProjects.map((project) => (
          <div className="project-card" key={project.id}>
            <h2>{project.title}</h2>
            <p><strong>Tech Stack:</strong> {project.tech}</p>
            <p><strong>Looking For:</strong> {project.members}</p>
            <p>{project.description}</p>

            <button>Join Project</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Project;