import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import './AddPatient.css';

function AddPatient() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phoneNo: '',
    address: '',
    dateOfBirth: '',
    doctorPrescription: '',
    disease: '',
    nextAppointmentDate: '',
    whatsappNumber: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/patients', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Patient added successfully!');
      navigate('/all-patients');
    } catch (error) {
      toast.error('Error adding patient');
    }
  };

  return (
    <div className="add-patient">
      <nav className="navbar">
        <h2>Add New Patient</h2>
        <div className="nav-links">
          <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
        </div>
      </nav>

      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Patient Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                name="phoneNo"
                value={formData.phoneNo}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>WhatsApp Number</label>
              <input
                type="tel"
                name="whatsappNumber"
                value={formData.whatsappNumber}
                onChange={handleChange}
                placeholder="For WhatsApp messages"
              />
            </div>

            <div className="form-group">
              <label>Address *</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Date of Birth *</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Doctor's Prescription *</label>
              <textarea
                name="doctorPrescription"
                value={formData.doctorPrescription}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Disease/Condition *</label>
              <input
                type="text"
                name="disease"
                value={formData.disease}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Next Appointment Date</label>
              <input
                type="date"
                name="nextAppointmentDate"
                value={formData.nextAppointmentDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <button type="submit" className="submit-btn">Add Patient</button>
        </form>
      </div>
    </div>
  );
}

export default AddPatient;