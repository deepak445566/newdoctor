import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import './AllPatients.css';

function AllPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/patients', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPatients(response.data);
    } catch (error) {
      toast.error('Error fetching patients');
    } finally {
      setLoading(false);
    }
  };

  const sendWhatsAppMessage = async (patient, messageType) => {
    const phoneNumber = patient.whatsappNumber || patient.phoneNo;
    
    let message = '';
    if (messageType === 'thankyou') {
      message = `Thank you for visiting Dental Clinic! We hope you feel better soon. For any queries, please contact us.`;
    } else if (messageType === 'reminder') {
      message = `Dear ${patient.name}, this is a reminder for your dental appointment tomorrow. Please visit us at your scheduled time.`;
    }

    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Open WhatsApp with pre-filled message
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
  };

  const markAsCompleted = async (patientId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:5000/api/patients/${patientId}/complete`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Treatment marked as completed');
      fetchPatients(); // Refresh list
    } catch (error) {
      toast.error('Error updating patient');
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phoneNo.includes(searchTerm)
  );

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="all-patients">
      <nav className="navbar">
        <h2>All Patients</h2>
        <div className="nav-links">
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </nav>

      <div className="patients-table-container">
        <table className="patients-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Disease</th>
              <th>Last Visit</th>
              <th>Next Appointment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map(patient => (
              <tr key={patient._id} className={patient.isCompleted ? 'completed' : ''}>
                <td>{patient.name}</td>
                <td>{patient.phoneNo}</td>
                <td>{patient.disease}</td>
                <td>{format(new Date(patient.lastVisitDate), 'dd/MM/yyyy')}</td>
                <td>
                  {patient.nextAppointmentDate 
                    ? format(new Date(patient.nextAppointmentDate), 'dd/MM/yyyy')
                    : 'Not scheduled'}
                </td>
                <td className="actions">
                  {!patient.isCompleted && (
                    <>
                      <button 
                        onClick={() => sendWhatsAppMessage(patient, 'thankyou')}
                        className="btn-whatsapp"
                        title="Send Thank You message"
                      >
                        WhatsApp Thanks
                      </button>
                      <button 
                        onClick={() => markAsCompleted(patient._id)}
                        className="btn-complete"
                      >
                        Complete
                      </button>
                    </>
                  )}
                  {patient.nextAppointmentDate && (
                    <button 
                      onClick={() => sendWhatsAppMessage(patient, 'reminder')}
                      className="btn-reminder"
                      title="Send Appointment Reminder"
                    >
                      Remind
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AllPatients;