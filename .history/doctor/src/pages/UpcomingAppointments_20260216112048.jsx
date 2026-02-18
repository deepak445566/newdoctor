import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, differenceInDays } from 'date-fns';
import toast from 'react-hot-toast';


function UpcomingAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpcomingAppointments();
  }, []);

  const fetchUpcomingAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/patients/appointments/upcoming', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Sort by nearest date first
      const sorted = response.data.sort((a, b) => 
        new Date(a.nextAppointmentDate) - new Date(b.nextAppointmentDate)
      );
      
      setAppointments(sorted);
    } catch (error) {
      toast.error('Error fetching appointments');
    } finally {
      setLoading(false);
    }
  };

  const sendReminder = (patient) => {
    const phoneNumber = patient.whatsappNumber || patient.phoneNo;
    const daysLeft = differenceInDays(new Date(patient.nextAppointmentDate), new Date());
    
    let message = '';
    if (daysLeft === 0) {
      message = `Dear ${patient.name}, this is a reminder for your dental appointment TODAY. Please visit us at your scheduled time.`;
    } else if (daysLeft === 1) {
      message = `Dear ${patient.name}, this is a reminder for your dental appointment TOMORROW. We look forward to seeing you!`;
    } else {
      message = `Dear ${patient.name}, this is a reminder that your dental appointment is in ${daysLeft} days. Please don't forget!`;
    }

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="upcoming-appointments">
      <nav className="navbar">
        <h2>Upcoming Appointments (Next 10 Days)</h2>
        <div className="nav-links">
          <button onClick={() => window.history.back()}>Back</button>
        </div>
      </nav>

      <div className="appointments-container">
        {appointments.length === 0 ? (
          <div className="no-appointments">
            <h3>No upcoming appointments in the next 10 days</h3>
          </div>
        ) : (
          <div className="appointments-list">
            {appointments.map(appointment => {
              const daysLeft = differenceInDays(new Date(appointment.nextAppointmentDate), new Date());
              
              return (
                <div key={appointment._id} className={`appointment-card ${daysLeft <= 1 ? 'urgent' : ''}`}>
                  <div className="appointment-header">
                    <h3>{appointment.name}</h3>
                    <span className="days-badge">
                      {daysLeft === 0 ? 'Today' : 
                       daysLeft === 1 ? 'Tomorrow' : 
                       `${daysLeft} days left`}
                    </span>
                  </div>
                  
                  <div className="appointment-details">
                    <p><strong>Phone:</strong> {appointment.phoneNo}</p>
                    <p><strong>Disease:</strong> {appointment.disease}</p>
                    <p><strong>Appointment Date:</strong> {format(new Date(appointment.nextAppointmentDate), 'dd/MM/yyyy')}</p>
                  </div>
                  
                  <div className="appointment-actions">
                    <button 
                      onClick={() => sendReminder(appointment)}
                      className="btn-whatsapp"
                    >
                      Send WhatsApp Reminder
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default UpcomingAppointments;