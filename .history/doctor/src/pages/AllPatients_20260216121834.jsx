import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const AllPatients = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    todayAppointments: 0,
    upcoming: 0
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    const filtered = patients.filter(patient =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phoneNo.includes(searchTerm) ||
      patient.disease.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.doctorName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPatients(filtered);
  }, [searchTerm, patients]);

  const fetchPatients = async () => {
    try {
      const response = await axios.get('/patients/all');
      if (response.data.success) {
        setPatients(response.data.patients);
        setFilteredPatients(response.data.patients);
        
        const today = new Date().toDateString();
        const upcomingCount = response.data.patients.filter(p => 
          new Date(p.nextAppointmentDate) > new Date()
        ).length;
        
        setStats({
          total: response.data.patients.length,
          todayAppointments: response.data.patients.filter(p => 
            new Date(p.nextAppointmentDate).toDateString() === today
          ).length,
          upcoming: upcomingCount
        });
      }
    } catch (error) {
      toast.error('Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  const sendThankYouMessage = async (patient) => {
    try {
      const message = `Dear ${patient.name}, thank you for visiting our dental clinic. We hope you're feeling better! For any queries, please contact us.`;
      
      const response = await axios.post('/patients/send-whatsapp', {
        phoneNo: patient.phoneNo,
        message
      });

      if (response.data.success) {
        window.open(response.data.whatsappUrl, '_blank');
        toast.success('WhatsApp opened successfully!');
      }
    } catch (error) {
      toast.error('Failed to send WhatsApp message');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-4 sm:py-6 md:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Header with responsive design */}
        <div className="mb-6 sm:mb-8">
          {/* Top Navigation - Responsive */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center space-x-3">
              <Link
                to="/"
                className="group flex items-center text-gray-600 hover:text-gray-900 bg-white rounded-full px-3 sm:px-4 py-2 shadow-sm hover:shadow transition-all text-sm sm:text-base"
              >
                <span className="mr-1 sm:mr-2 group-hover:-translate-x-1 transition-transform">←</span>
                <span className="hidden xs:inline">Back</span>
              </Link>
              <div className="flex items-center">
                <span className="text-2xl sm:text-3xl mr-2 sm:mr-3">👥</span>
                <div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                    Patient Directory
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                    Manage and view all patient records
                  </p>
                </div>
              </div>
            </div>
            
            {/* Add Patient Button - Responsive */}
            <Link
              to="/add-patient"
              className="group inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all whitespace-nowrap"
            >
              <span className="mr-1 sm:mr-2 group-hover:scale-110 transition-transform text-base sm:text-lg">➕</span>
              <span className="hidden xs:inline">Add Patient</span>
              <span className="xs:hidden">Add</span>
            </Link>
          </div>

          {/* Stats Cards - Responsive Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-6">
            <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4 md:p-5 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-0.5 sm:mb-1">Total</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <span className="text-xl sm:text-2xl md:text-3xl">📊</span>
              </div>
            </div>
            <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4 md:p-5 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-0.5 sm:mb-1">Today</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{stats.todayAppointments}</p>
                </div>
                <span className="text-xl sm:text-2xl md:text-3xl">📅</span>
              </div>
            </div>
            <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4 md:p-5 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-0.5 sm:mb-1">Upcoming</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{stats.upcoming}</p>
                </div>
                <span className="text-xl sm:text-2xl md:text-3xl">⏰</span>
              </div>
            </div>
            <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4 md:p-5 border-l-4 border-amber-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-0.5 sm:mb-1">Showing</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{filteredPatients.length}</p>
                </div>
                <span className="text-xl sm:text-2xl md:text-3xl">👤</span>
              </div>
            </div>
          </div>

          {/* Search Bar with Filters - Responsive */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base sm:text-lg">🔍</span>
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              
              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="sm:hidden flex items-center justify-center px-4 py-2 border border-gray-200 rounded-lg bg-white"
              >
                <span className="mr-2">🔧</span>
                Filters
              </button>

              {/* Desktop Filters */}
              <div className="hidden sm:flex gap-2">
                <select className="px-3 sm:px-4 py-2 sm:py-3 text-sm border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option>All Status</option>
                  <option>Active</option>
                  <option>Completed</option>
                  <option>Follow-up</option>
                </select>
                <button className="px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-colors">
                  <span className="text-lg">📅</span>
                </button>
              </div>
            </div>
            
            {/* Mobile Filters - Expandable */}
            {showFilters && (
              <div className="sm:hidden mt-3 space-y-3">
                <select className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option>All Status</option>
                  <option>Active</option>
                  <option>Completed</option>
                  <option>Follow-up</option>
                </select>
                <div className="flex gap-2">
                  <button className="flex-1 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="mr-1">📅</span> Today
                  </button>
                  <button className="flex-1 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="mr-1">📆</span> Week
                  </button>
                </div>
              </div>
            )}

         
          </div>
        </div>

        {/* Results Info - Responsive */}
        <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <p className="text-xs sm:text-sm text-gray-600">
            <span className="font-semibold">{filteredPatients.length}</span> patients found
            {searchTerm && <span> for "<span className="text-blue-600">{searchTerm}</span>"</span>}
          </p>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">Sort by:</span>
            <select className="text-xs sm:text-sm border border-gray-200 rounded-lg px-2 py-1 bg-white flex-1 sm:flex-none">
              <option>Recent</option>
              <option>Name</option>
              <option>Next Appointment</option>
            </select>
          </div>
        </div>

        {/* Patients List - Responsive Grid */}
        {loading ? (
          <div className="text-center py-8 sm:py-12 md:py-16 bg-white rounded-xl sm:rounded-2xl shadow-md">
            <div className="inline-block animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-3 sm:border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-gray-500">Loading patients...</p>
          </div>
        ) : filteredPatients.length > 0 ? (
          <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            {filteredPatients.map((patient) => (
              <div
                key={patient._id}
                className="bg-white rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                {/* Card Header with Status - Responsive */}
                <div className="relative h-16 sm:h-20 md:h-24 bg-gradient-to-r from-blue-600 to-indigo-600 p-3 sm:p-4">
                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                    <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white">
                      #{patient._id.slice(-4)}
                    </span>
                  </div>
                  <div className="absolute -bottom-6 sm:-bottom-8 left-3 sm:left-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg flex items-center justify-center">
                      <span className="text-xl sm:text-2xl md:text-3xl">👤</span>
                    </div>
                  </div>
                </div>

                {/* Card Body - Responsive */}
                <div className="pt-8 sm:pt-10 p-3 sm:p-4">
                  <Link to={`/patient/${patient._id}`} className="block">
                    <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors truncate">
                      {patient.name}
                    </h3>
                    
                    <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4">
                      <div className="flex items-center text-xs sm:text-sm text-gray-600">
                        <span className="w-5 sm:w-6 text-sm sm:text-base">📞</span>
                        <span className="truncate">{patient.phoneNo}</span>
                      </div>
                      <div className="flex items-center text-xs sm:text-sm text-gray-600">
                        <span className="w-5 sm:w-6 text-sm sm:text-base">👨‍⚕️</span>
                        <span className="truncate">Dr. {patient.doctorName}</span>
                      </div>
                      <div className="flex items-center text-xs sm:text-sm text-gray-600">
                        <span className="w-5 sm:w-6 text-sm sm:text-base">🦷</span>
                        <span className="truncate">{patient.disease}</span>
                      </div>
                      <div className="flex items-center text-xs sm:text-sm text-gray-600">
                        <span className="w-5 sm:w-6 text-sm sm:text-base">📅</span>
                        <span className="truncate">{format(new Date(patient.nextAppointmentDate), 'dd MMM yyyy')}</span>
                      </div>
                    </div>
                  </Link>

                  {/* Action Buttons - Responsive */}
                  <div className="flex flex-col xs:flex-row gap-2 mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100">
                    <button
                      onClick={() => sendThankYouMessage(patient)}
                      className="flex-1 inline-flex items-center justify-center px-2 sm:px-3 py-1.5 sm:py-2 bg-green-50 text-green-600 rounded-lg sm:rounded-xl hover:bg-green-100 transition-colors text-xs sm:text-sm font-medium"
                    >
                      <span className="mr-1 text-sm">💬</span>
                      <span className="hidden xs:inline">Thank You</span>
                      <span className="xs:hidden">Thanks</span>
                    </button>
                    <Link
                      to={`/patient/${patient._id}`}
                      className="flex-1 inline-flex items-center justify-center px-2 sm:px-3 py-1.5 sm:py-2 bg-blue-50 text-blue-600 rounded-lg sm:rounded-xl hover:bg-blue-100 transition-colors text-xs sm:text-sm font-medium"
                    >
                      <span className="mr-1 text-sm">👁️</span>
                      <span className="hidden xs:inline">Details</span>
                      <span className="xs:hidden">View</span>
                    </Link>
                  </div>
                </div>

                {/* Card Footer - Responsive */}
                <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-50 text-xs text-gray-500 flex items-center justify-between">
                  <span className="truncate max-w-[120px] xs:max-w-[150px] sm:max-w-[180px]">
                    📋 {patient.prescription.substring(0, 20)}...
                  </span>
                  <span className="text-blue-600 text-xs">→</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State - Responsive */
          <div className="text-center py-8 sm:py-12 md:py-16 bg-white rounded-xl sm:rounded-2xl shadow-md px-4">
            <div className="inline-block p-3 sm:p-4 bg-gray-100 rounded-full mb-3 sm:mb-4">
              <span className="text-3xl sm:text-4xl md:text-5xl">🔍</span>
            </div>
            <h3 className="text-base sm:text-lg md:text-xl font-medium text-gray-900 mb-1">No patients found</h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">Try adjusting your search or add a new patient</p>
            <Link
              to="/add-patient"
              className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md text-sm sm:text-base"
            >
              <span className="mr-1 sm:mr-2 text-base sm:text-lg">➕</span>
              Add New Patient
            </Link>
          </div>
        )}

        {/* Pagination - Responsive */}
        {filteredPatients.length > 0 && (
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-lg sm:rounded-xl shadow-md px-4 sm:px-6 py-3">
            <p className="text-xs sm:text-sm text-gray-600 order-2 sm:order-1">
              Showing <span className="font-medium">1</span> to{' '}
              <span className="font-medium">{Math.min(10, filteredPatients.length)}</span> of{' '}
              <span className="font-medium">{filteredPatients.length}</span>
            </p>
            <div className="flex gap-1 sm:gap-2 order-1 sm:order-2">
              <button className="px-2 sm:px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                ←
              </button>
              <button className="px-2 sm:px-3 py-1 bg-blue-600 text-white rounded-lg text-sm">1</button>
              <button className="px-2 sm:px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm hidden xs:inline">
                2
              </button>
              <button className="px-2 sm:px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm hidden xs:inline">
                3
              </button>
              <button className="px-2 sm:px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllPatients;