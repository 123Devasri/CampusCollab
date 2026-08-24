import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";


function Navbar() {
  return (

    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow">
      <div className="container">

        <Link className="navbar-brand fw-bold fs-3" to="/">
          CampusCollab
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">

          <ul className="navbar-nav ms-auto align-items-lg-center">

            <li className="nav-item">
              <Link className="nav-link" to="/">
                Home
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/projects">
                Projects
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/hackathons">
                Hackathons
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/students">
                Students
              </Link>
            </li>

            <li className="nav-item ms-lg-3">
              <Link className="btn btn-outline-light" to="/login">
                Login
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;