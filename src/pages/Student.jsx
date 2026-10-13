import React, { useState } from "react";
import "./Student.css";

function Student() {
  const [search, setSearch] = useState("");

  const students = [
    {
      id: 1,
      name: "Deva Sri",
      department: "Computer Science",
      year: "III Year",
      skills: "React, Node.js",
      status: "Available"
    },
    {
      id: 2,
      name: "Mala",
      department: "Information Technology",
      year: "II Year",
      skills: "Python, AI",
      status: "Busy"
    },
    {
      id: 3,
      name: "Arjun",
      department: "Software Systems",
      year: "IV Year",
      skills: "Flutter, Firebase",
      status: "Available"
    }
  ];

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(search.toLowerCase())
  );

  const connectStudent = (name) => {
    alert(`Connection request sent to ${name}`);
  };

  return (
    <div className="student-container">
      <h1>Student Hub</h1>

      <input
        type="text"
        placeholder="Search Student..."
        className="search-box"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="student-grid">
        {filteredStudents.map((student) => (
          <div className="student-card" key={student.id}>
            <div className="avatar">
              {student.name.charAt(0)}
            </div>

            <h2>{student.name}</h2>

            <p><strong>Department:</strong> {student.department}</p>
            <p><strong>Year:</strong> {student.year}</p>
            <p><strong>Skills:</strong> {student.skills}</p>

            <p>
              <strong>Status:</strong>
              <span
                className={
                  student.status === "Available"
                    ? "available"
                    : "busy"
                }
              >
                {" "}{student.status}
              </span>
            </p>

            <button onClick={() => connectStudent(student.name)}>
              Connect
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Student;