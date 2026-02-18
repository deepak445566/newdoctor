import React from 'react';
import { Link } from 'react-router-dom';


function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="dashboard">
      <nav className="navbar">
        <h2>Dental Clinic Management</h2>
        <div className="nav-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/add-patient">Add Patient</Link>
          <Link to="/all-patients">All Patients</Link>
          <Link to="/upcoming">Upcoming Appointments</Link>
          <button onClick={() => {
            localStorage.clear();
            window.location.href = '/login';
          }}>Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">
        <h1>Welcome, {user.email}</h1>
        
        <div className="cards-container">
          <Link to="/add-patient" className="card">
            <h3>Add New Patient</h3>
            <p>Register a new patient in the system</p>
          </Link>

          <Link to="/all-patients" className="card">
            <h3>View All Patients</h3>
            <p>See all registered patients and their details</p>
          </Link>

          <Link to="/upcoming" className="card">
            <h3>Upcoming Appointments</h3>
            <p>Check patients with appointments in next 10 days</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;