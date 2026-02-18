import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAdmin } from '../context/AdminContext';
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg border-b border-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl mr-2">🦷</span>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                DentalCare Admin
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full">
                <span className="text-sm text-gray-600">Welcome,</span>
                <span className="text-sm font-semibold text-blue-700">{admin?.email}</span>
              </div>
              <button
                onClick={logout}
                className="inline-flex items-center px-4 py-2 border border-red-200 text-sm font-medium rounded-full text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <span className="mr-2">🚪</span>
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        {/* Quick Actions */}
        <div className="px-4 sm:px-0 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <span className="text-2xl mr-2">⚡</span>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Link
              to="/add-patient"
              className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <div className="relative px-6 py-8">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="text-3xl">➕</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">Add New Patient</h3>
                    <p className="text-gray-600">Register a new patient to the clinic</p>
                    <div className="mt-3 flex items-center text-blue-600 font-medium">
                      <span>Get Started</span>
                      <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            <Link
              to="/all-patients"
              className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <div className="relative px-6 py-8">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="text-3xl">👥</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">View All Patients</h3>
                    <p className="text-gray-600">See all registered patients and their details</p>
                    <div className="mt-3 flex items-center text-green-600 font-medium">
                      <span>Browse Records</span>
                      <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="px-4 sm:px-0">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-indigo-50">
            {/* Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-blue-600 to-indigo-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">📅</span>
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      Upcoming Appointments
                    </h3>
                    <p className="text-blue-100 text-sm mt-1">
                      Next 10 days schedule
                    </p>
                  </div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <span className="text-white font-semibold">{upcomingPatients.length}</span>
                  <span className="text-blue-100 ml-1">pending</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="divide-y divide-gray-100">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                  <p className="mt-2 text-gray-500">Loading appointments...</p>
                </div>
              ) : upcomingPatients.length > 0 ? (
                upcomingPatients.map((patient, index) => (
                  <div key={patient._id} className="px-6 py-4 hover:bg-gray-50 transition-colors group">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <Link to={`/patient/${patient._id}`} className="block">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                                <span className="text-lg">👤</span>
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <h4 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                  {patient.name}
                                </h4>
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                                  Dr. {patient.doctorName}
                                </span>
                              </div>
                              <div className="mt-1 flex items-center space-x-4 text-sm">
                                <span className="text-gray-600 flex items-center">
                                  <span className="mr-1">🏥</span>
                                  {patient.disease}
                                </span>
                                <span className="text-gray-400">•</span>
                                <span className="text-gray-600 flex items-center">
                                  <span className="mr-1">📞</span>
                                  {patient.phoneNo}
                                </span>
                              </div>
                              <div className="mt-2 flex items-center space-x-2">
                                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full flex items-center">
                                  <span className="mr-1">⏰</span>
                                  Next: {format(new Date(patient.nextAppointmentDate), 'dd MMM yyyy')}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </div>
                      <button
                        onClick={() => sendWhatsAppReminder(patient)}
                        className="ml-4 inline-flex items-center px-4 py-2 border border-green-200 text-sm font-medium rounded-full text-white bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        <span className="mr-2">💬</span>
                        Send Reminder
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="inline-block p-4 bg-gray-100 rounded-full mb-3">
                    <span className="text-4xl">📆</span>
                  </div>
                  <p className="text-gray-600 font-medium">No upcoming appointments</p>
                  <p className="text-gray-400 text-sm mt-1">Next 10 days are clear</p>
                </div>
              )}
            </div>

            {/* Footer */}
            {upcomingPatients.length > 0 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 flex items-center">
                    <span className="mr-1">📊</span>
                    Showing {upcomingPatients.length} upcoming appointment{upcomingPatients.length > 1 ? 's' : ''}
                  </span>
                  <Link 
                    to="/all-patients" 
                    className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
                  >
                    View all patients
                    <span className="ml-1">→</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Section */}
        <div className="px-4 sm:px-0 mt-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Appointments</p>
                  <p className="text-2xl font-bold text-gray-900">{upcomingPatients.length}</p>
                </div>
                <span className="text-3xl">📋</span>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Todays Date</p>
                  <p className="text-lg font-semibold text-gray-900">{format(new Date(), 'dd MMM yyyy')}</p>
                </div>
                <span className="text-3xl">📌</span>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Quick Action</p>
                  <Link to="/add-patient" className="text-purple-600 hover:text-purple-700 font-medium flex items-center">
                    Add New Patient
                    <span className="ml-1">→</span>
                  </Link>
                </div>
                <span className="text-3xl">⚡</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;