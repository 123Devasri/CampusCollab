import React, { useState } from "react";
import "./Hackathon.css";

function Hackathon() {
  const [search, setSearch] = useState("");

  const hackathons = [
    {
      id: 1,
      name: "Hack the Future",
      date: "20 Aug 2026",
      mode: "Online",
      prize: "₹50,000",
      theme: "Artificial Intelligence"
    },
    {
      id: 2,
      name: "Code Sprint",
      date: "05 Sep 2026",
      mode: "Offline",
      prize: "₹30,000",
      theme: "Web Development"
    },
    {
      id: 3,
      name: "InnovateX",
      date: "18 Sep 2026",
      mode: "Hybrid",
      prize: "₹1,00,000",
      theme: "Smart City Solutions"
    }
  ];

  const filteredHackathons = hackathons.filter((hackathon) =>
    hackathon.name.toLowerCase().includes(search.toLowerCase())
  );

  const registerHackathon = (name) => {
    alert(`Successfully registered for ${name}!`);
  };

  return (
    <div className="hackathon-container">
      <h1>Upcoming Hackathons</h1>

      <input
        type="text"
        placeholder="Search Hackathon..."
        className="search-box"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="hackathon-grid">
        {filteredHackathons.map((hackathon) => (
          <div className="hackathon-card" key={hackathon.id}>
            <h2>{hackathon.name}</h2>

            <p><strong>Date:</strong> {hackathon.date}</p>
            <p><strong>Mode:</strong> {hackathon.mode}</p>
            <p><strong>Theme:</strong> {hackathon.theme}</p>
            <p><strong>Prize Pool:</strong> {hackathon.prize}</p>

            <button
              onClick={() => registerHackathon(hackathon.name)}
            >
              Register
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Hackathon;