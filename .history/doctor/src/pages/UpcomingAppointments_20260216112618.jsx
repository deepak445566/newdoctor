import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, differenceInDays } from 'date-fns';
import toast from 'react-hot-toast';
import { Calendar, Phone, MessageCircle, AlertCircle } from 'lucide-react';

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-800">Upcoming Appointments</h1>
            <button
              onClick={() => window.history.back()}
              className="text-gray-600 hover:text-gray-800"
            >
              ← Back
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {appointments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-800 mb-2">No Upcoming Appointments</h3>
            <p className="text-gray-600">There are no appointments scheduled in the next 10 days.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {appointments.map(appointment => {
              const daysLeft = differenceInDays(new Date(appointment.nextAppointmentDate), new Date());
              const isUrgent = daysLeft <= 1;
              
              return (
                <div
                  key={appointment._id}
                  className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow ${
                    isUrgent ? 'border-l-4 border-red-500' : ''
                  }`}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{appointment.name}</h3>
                        <p className="text-sm text-gray-600">{appointment.disease}</p>
                      </div>
                      {isUrgent && (
                        <span className="bg-red-100 text-red-600 text-xs font-medium px-2 py-1 rounded-full flex items-center">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Urgent
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        {appointment.phoneNo}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {format(new Date(appointment.nextAppointmentDate), 'dd MMMM yyyy')}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className={`text-sm font-medium ${
                        daysLeft === 0 ? 'text-red-600' :
                        daysLeft === 1 ? 'text-orange-600' :
                        'text-green-600'
                      }`}>
                        {daysLeft === 0 ? 'Today' :
                         daysLeft === 1 ? 'Tomorrow' :
                         `${daysLeft} days left`}
                      </span>
                      
                      <button
                        onClick={() => sendReminder(appointment)}
                        className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Remind</span>
                      </button>
                    </div>
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