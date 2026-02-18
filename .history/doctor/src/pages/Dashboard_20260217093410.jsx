import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAdmin } from '../context/AdminContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { admin, logout } = useAdmin();
  const [upcomingPatients, setUpcomingPatients] = useState([]);
  const [displayedPatients, setDisplayedPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpcomingAppointments();
  }, []);

  const fetchUpcomingAppointments = async () => {
    try {
      const response = await axios.get('/patients/upcoming');
      if (response.data.success) {
        setUpcomingPatients(response.data.patients);
        // Only show first 4 patients
        setDisplayedPatients(response.data.patients.slice(0, 4));
      }
    } catch (error) {
      console.log(error)
      toast.error('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const sendWhatsAppReminder = async (patient) => {
    try {
  const message = `Dear ${patient.name} ,

This is a gentle reminder about your upcoming dental appointment  scheduled on ${format(new Date(patient.nextAppointmentDate), 'dd/MM/yyyy')} .

Kindly make sure to visit us on time. If you need to reschedule or have any query, please feel free to contact us .

Thank you, and we look forward to seeing you! https://share.google/NA6nTqi4xdKEzdFJI `;

      
      const response = await axios.post('/patients/send-whatsapp', {
        phoneNo: patient.phoneNo,
        message
      });

      if (response.data.success) {
        window.open(response.data.whatsappUrl, '_blank');
        toast.success('Reminder sent!');
      }
    } catch (error) {
      toast.error('Failed to send WhatsApp message');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo with animation */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-400 rounded-lg blur opacity-50 animate-pulse"></div>
                <div className="relative w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center transform hover:rotate-6 transition-transform">
                  <span className="text-lg sm:text-xl text-white transform -rotate-6">🦷</span>
                </div>
              </div>
              <div>
                <h1 className="text-base sm:text-lg md:text-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  DentalCare
                </h1>
                <p className="text-[10px] sm:text-xs text-gray-500 hidden xs:block">Admin Dashboard</p>
              </div>
            </div>

            {/* Right section */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="hidden md:flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-1.5 rounded-full border border-blue-100">
                <span className="text-base animate-wave">👋</span>
                <span className="text-sm text-gray-700">
                  Welcome, <span className="font-semibold text-blue-600">{admin?.email?.split('@')[0]}</span>
                </span>
              </div>

              <button
                onClick={logout}
                className="group relative inline-flex items-center px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white rounded-full text-xs sm:text-sm font-medium shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                <span className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                <span className="mr-1 sm:mr-2 text-sm sm:text-base">🚪</span>
                <span className="hidden xs:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Welcome Card - Mobile */}
        <div className="md:hidden mb-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Welcome back,</p>
              <p className="text-base font-semibold">{admin?.email?.split('@')[0]}</p>
            </div>
            <div className="text-3xl animate-bounce">👋</div>
          </div>
          <div className="mt-2 flex items-center text-xs opacity-80">
            <span className="mr-2">📅</span>
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </div>
        </div>

        {/* Stats Cards */}
        

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Link
            to="/add-patient"
            className="group relative bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            <div className="relative p-4 sm:p-5 md:p-6 flex items-center space-x-3 sm:space-x-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                <span className="text-2xl sm:text-3xl md:text-4xl">➕</span>
              </div>
              <div className="flex-1 text-white">
                <h3 className="text-base sm:text-lg md:text-xl font-bold mb-1">Add New Patient</h3>
                <p className="text-xs sm:text-sm opacity-90 hidden xs:block">Register a new patient to the clinic</p>
                <div className="mt-2 flex items-center text-xs sm:text-sm font-medium">
                  <span>Get Started</span>
                  <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span>
                </div>
              </div>
            </div>
          </Link>

          <Link
            to="/all-patients"
            className="group relative bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            <div className="relative p-4 sm:p-5 md:p-6 flex items-center space-x-3 sm:space-x-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                <span className="text-2xl sm:text-3xl md:text-4xl">👥</span>
              </div>
              <div className="flex-1 text-white">
                <h3 className="text-base sm:text-lg md:text-xl font-bold mb-1">View All Patients</h3>
                <p className="text-xs sm:text-sm opacity-90 hidden xs:block">See all registered patients and their details</p>
                <div className="mt-2 flex items-center text-xs sm:text-sm font-medium">
                  <span>Browse Records</span>
                  <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Upcoming Appointments - Only 4 shown */}
        <div className="relative">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">📅</span>
              </div>
              <div>
                <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">Upcoming Appointments</h2>
                <p className="text-xs text-gray-500">Next 10 days • Showing {Math.min(4, upcomingPatients.length)} of {upcomingPatients.length}</p>
              </div>
            </div>
            {upcomingPatients.length > 4 && (
              <Link 
                to="/all-patients" 
                className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center bg-blue-50 px-3 py-1.5 rounded-full"
              >
                View all {upcomingPatients.length}
                <span className="ml-1">→</span>
              </Link>
            )}
          </div>

          {/* Timeline - Only 4 items */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl overflow-hidden border border-white/20">
            {loading ? (
              <div className="text-center py-8 sm:py-12">
                <div className="inline-block relative">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
                <p className="mt-3 text-xs sm:text-sm text-gray-500">Loading schedule...</p>
              </div>
            ) : displayedPatients.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {displayedPatients.map((patient) => {
                  const appointmentDate = new Date(patient.nextAppointmentDate);
                  const isToday = format(appointmentDate, 'dd/MM/yyyy') === format(new Date(), 'dd/MM/yyyy');
                  const isTomorrow = format(appointmentDate, 'dd/MM/yyyy') === format(new Date(Date.now() + 86400000), 'dd/MM/yyyy');
                  
                  return (
                    <div key={patient._id} className="relative group hover:bg-blue-50/50 transition-colors">
                      {/* Timeline dot */}
                      <div className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 w-2 h-2">
                        <div className={`absolute inset-0 rounded-full animate-ping ${isToday ? 'bg-green-400' : 'bg-blue-400'}`}></div>
                        <div className={`relative w-2 h-2 rounded-full ${isToday ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                      </div>

                      <div className="ml-8 sm:ml-12 p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <Link to={`/patient/${patient._id}`} className="flex-1">
                            <div className="flex items-start space-x-2 sm:space-x-3">
                              <div className="flex-shrink-0">
                                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-base sm:text-lg ${
                                  isToday ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                                }`}>
                                  👤
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h4 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                                    {patient.name}
                                  </h4>
                                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                                    Dr. {patient.doctorName}
                                  </span>
                                  {isToday && (
                                    <span className="px-2 py-0.5 bg-green-100 text-green-600 text-xs rounded-full animate-pulse">
                                      Today
                                    </span>
                                  )}
                                  {isTomorrow && (
                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">
                                      Tomorrow
                                    </span>
                                  )}
                                </div>
                                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                                  <span className="flex items-center">
                                    <span className="mr-1">🏥</span>
                                    {patient.disease}
                                  </span>
                                  <span className="flex items-center">
                                    <span className="mr-1">📞</span>
                                    {patient.phoneNo}
                                  </span>
                                </div>
                                <div className="mt-2 flex items-center space-x-2">
                                  <span className={`text-xs px-2 py-0.5 rounded-full flex items-center w-fit ${
                                    isToday ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                                  }`}>
                                    <span className="mr-1">⏰</span>
                                    {isToday ? 'Today' : format(appointmentDate, 'EEEE, dd MMM')}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Link>
                          
                          <div className="flex items-center space-x-2 sm:pl-4">
                            <button
                              onClick={() => sendWhatsAppReminder(patient)}
                              className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg text-xs sm:text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap"
                            >
                              <span className="mr-1 sm:mr-2">💬</span>
                              <span className="hidden xs:inline">Remind</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <div className="inline-block p-3 sm:p-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full mb-3">
                  <span className="text-3xl sm:text-4xl">📆</span>
                </div>
                <p className="text-sm sm:text-base text-gray-600 font-medium">No upcoming appointments</p>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">Next 10 days are clear</p>
                <Link 
                  to="/add-patient" 
                  className="inline-flex items-center mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs sm:text-sm font-medium hover:bg-blue-100 transition-colors"
                >
                  <span className="mr-1">➕</span>
                  Add new patient
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Tips */}
        <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-white/60 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20 hover:bg-white/80 transition-colors">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">💡</span>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-900">Quick Tip</p>
                <p className="text-xs text-gray-500">Use WhatsApp for quick reminders</p>
              </div>
            </div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20 hover:bg-white/80 transition-colors">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">⚡</span>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-900">Shortcut</p>
                <p className="text-xs text-gray-500">Click patient card for details</p>
              </div>
            </div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20 hover:bg-white/80 transition-colors">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">🔔</span>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-900">Reminder</p>
                <p className="text-xs text-gray-500">Send reminders 1 day before</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(20deg); }
          75% { transform: rotate(-15deg); }
        }
        .animate-wave {
          animation: wave 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;