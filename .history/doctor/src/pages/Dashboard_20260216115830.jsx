import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAdmin } from '../context/AdminContext';
import { FiUsers, FiUserPlus, FiCalendar, FiLogOut } from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { admin, logout } = useAdmin();
  const [upcomingPatients, setUpcomingPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpcomingAppointments();
  }, []);

  const fetchUpcomingAppointments = async () => {
    try {
      const response = await axios.get('/patients/upcoming');
      if (response.data.success) {
        setUpcomingPatients(response.data.patients);
      }
    } catch (error) {
      toast.error('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const sendWhatsAppReminder = async (patient) => {
    try {
      const message = `Dear ${patient.name}, this is a reminder for your dental appointment on ${format(new Date(patient.nextAppointmentDate), 'dd/MM/yyyy')}. Please visit us on time. Thank you!`;
      
      const response = await axios.post('/patients/send-whatsapp', {
        phoneNo: patient.phoneNo,
        message
      });

      if (response.data.success) {
        window.open(response.data.whatsappUrl, '_blank');
      }
    } catch (error) {
      toast.error('Failed to send WhatsApp message');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-800">Dental Clinic Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {admin?.email}</span>
              <button
                onClick={logout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <FiLogOut className="mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Quick Actions */}
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Link
              to="/add-patient"
              className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
            >
              <div className="flex-shrink-0">
                <FiUserPlus className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">Add New Patient</p>
                <p className="text-sm text-gray-500">Register a new patient</p>
              </div>
            </Link>

            <Link
              to="/all-patients"
              className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
            >
              <div className="flex-shrink-0">
                <FiUsers className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">View All Patients</p>
                <p className="text-sm text-gray-500">See all registered patients</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="px-4 sm:px-0">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                <FiCalendar className="mr-2 text-blue-500" />
                Upcoming Appointments (Next 10 Days)
              </h3>
            </div>
            <div className="border-t border-gray-200">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                </div>
              ) : upcomingPatients.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {upcomingPatients.map((patient) => (
                    <li key={patient._id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <Link to={`/patient/${patient._id}`} className="block">
                            <p className="text-sm font-medium text-blue-600 truncate">
                              {patient.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              Dr. {patient.doctorName} - {patient.disease}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Next: {format(new Date(patient.nextAppointmentDate), 'dd/MM/yyyy')}
                            </p>
                          </Link>
                        </div>
                        <button
                          onClick={() => sendWhatsAppReminder(patient)}
                          className="ml-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          Send Reminder
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No upcoming appointments in the next 10 days
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;