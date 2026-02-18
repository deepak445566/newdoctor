import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { format, isPast, isToday, isTomorrow, differenceInDays } from 'date-fns';
import toast from 'react-hot-toast';

const AllPatients = () => {
  const [patients, setPatients] = useState([]);
  const [displayedPatients, setDisplayedPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const patientsPerPage = 10;

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    // Filter patients based on search term
    let filtered = patients.filter(patient =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phoneNo.includes(searchTerm) ||
      patient.disease.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.doctorName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort patients: Past appointments first, then by date
    filtered.sort((a, b) => {
      const dateA = new Date(a.nextAppointmentDate);
      const dateB = new Date(b.nextAppointmentDate);
      const now = new Date();

      // Check if past
      const aIsPast = dateA < now;
      const bIsPast = dateB < now;

      // If one is past and other is not, past comes first
      if (aIsPast && !bIsPast) return -1;
      if (!aIsPast && bIsPast) return 1;

      // If both are past or both are future, sort by date (closest first)
      return dateA - dateB;
    });
    
    // Paginate filtered results
    const indexOfLastPatient = currentPage * patientsPerPage;
    const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
    setDisplayedPatients(filtered.slice(indexOfFirstPatient, indexOfLastPatient));
    
    // Reset to page 1 if no results on current page
    if (filtered.length > 0 && displayedPatients.length === 0) {
      setCurrentPage(1);
    }
  }, [searchTerm, patients, currentPage]);

  const fetchPatients = async () => {
    try {
      const response = await axios.get('/patients/all');
      if (response.data.success) {
        setPatients(response.data.patients);
        
        // Sort initially
        const sorted = [...response.data.patients].sort((a, b) => {
          const dateA = new Date(a.nextAppointmentDate);
          const dateB = new Date(b.nextAppointmentDate);
          const now = new Date();

          const aIsPast = dateA < now;
          const bIsPast = dateB < now;

          if (aIsPast && !bIsPast) return -1;
          if (!aIsPast && bIsPast) return 1;
          return dateA - dateB;
        });
        
        setDisplayedPatients(sorted.slice(0, patientsPerPage));
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

  // Get status badge color and text
  const getAppointmentStatus = (date) => {
    const appointmentDate = new Date(date);
    const now = new Date();

    if (appointmentDate < now) {
      return {
        color: 'bg-red-100 text-red-700 border-red-200',
        text: 'Overdue',
        icon: '⚠️'
      };
    } else if (isToday(appointmentDate)) {
      return {
        color: 'bg-green-100 text-green-700 border-green-200',
        text: 'Today',
        icon: '🔔'
      };
    } else if (isTomorrow(appointmentDate)) {
      return {
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        text: 'Tomorrow',
        icon: '⏰'
      };
    } else if (differenceInDays(appointmentDate, now) <= 3) {
      return {
        color: 'bg-amber-100 text-amber-700 border-amber-200',
        text: `${differenceInDays(appointmentDate, now)} days left`,
        icon: '📅'
      };
    } else {
      return {
        color: 'bg-gray-100 text-gray-700 border-gray-200',
        text: format(appointmentDate, 'dd MMM'),
        icon: '📆'
      };
    }
  };

  // Filtered patients for pagination
  const getFilteredPatients = () => {
    let filtered = patients.filter(patient =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phoneNo.includes(searchTerm) ||
      patient.disease.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.doctorName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort: Past first, then by date
    filtered.sort((a, b) => {
      const dateA = new Date(a.nextAppointmentDate);
      const dateB = new Date(b.nextAppointmentDate);
      const now = new Date();

      const aIsPast = dateA < now;
      const bIsPast = dateB < now;

      if (aIsPast && !bIsPast) return -1;
      if (!aIsPast && bIsPast) return 1;
      return dateA - dateB;
    });

    return filtered;
  };

  const filteredPatients = getFilteredPatients();
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);
  
  const pastCount = patients.filter(p => new Date(p.nextAppointmentDate) < new Date()).length;
  const todayCount = patients.filter(p => isToday(new Date(p.nextAppointmentDate))).length;
  const upcomingCount = patients.filter(p => new Date(p.nextAppointmentDate) > new Date()).length;

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Stats */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="group flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span>
                Dashboard
              </Link>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Patients
              </h1>
            </div>
            
            <Link
              to="/add-patient"
              className="group relative px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <span className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
              <span className="relative flex items-center">
                <span className="mr-2 text-lg">➕</span>
                New Patient
              </span>
            </Link>
          </div>

         

          {/* Search Bar */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
            <input
              type="text"
              placeholder="Search by name, phone, disease, or doctor..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold text-blue-600">{displayedPatients.length}</span> of{' '}
            <span className="font-semibold text-blue-600">{filteredPatients.length}</span> patients
          </p>
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            <span>Overdue first</span>
          </div>
        </div>

        {/* Patients Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block relative">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <p className="mt-3 text-gray-500">Loading patients...</p>
          </div>
        ) : displayedPatients.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {displayedPatients.map((patient) => {
                const appointmentDate = new Date(patient.nextAppointmentDate);
                const isPastAppointment = appointmentDate < new Date();
                const status = getAppointmentStatus(patient.nextAppointmentDate);
                
                return (
                  <div
                    key={patient._id}
                    className={`group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden ${
                      isPastAppointment ? 'border-l-4 border-red-500' : ''
                    }`}
                  >
                    {/* Card Header with Gradient */}
                    <div className={`relative h-20 bg-gradient-to-r ${
                      isPastAppointment 
                        ? 'from-red-500 to-orange-500' 
                        : 'from-blue-500 to-purple-600'
                    } p-4`}>
                      <div className="absolute -bottom-8 left-4">
                        <div className="w-16 h-16 bg-white rounded-xl shadow-lg flex items-center justify-center transform group-hover:scale-110 transition-transform">
                          <span className="text-3xl">👤</span>
                        </div>
                      </div>
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-xs text-white">
                          #{patient._id.slice(-4)}
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="pt-10 p-4">
                      <Link to={`/patient/${patient._id}`}>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                          {patient.name}
                        </h3>
                        
                        <div className="space-y-2 mb-3">
                          <div className="flex items-center text-sm">
                            <span className="w-8 text-gray-400">📞</span>
                            <span className="text-gray-600">{patient.phoneNo}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <span className="w-8 text-gray-400">👨‍⚕️</span>
                            <span className="text-gray-600">Dr. {patient.doctorName}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <span className="w-8 text-gray-400">🦷</span>
                            <span className="text-gray-600 truncate">{patient.disease}</span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${status.color}`}>
                          <span className="mr-1">{status.icon}</span>
                          {status.text}
                        </div>
                      </Link>

                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                        <button
                          onClick={() => sendThankYouMessage(patient)}
                          className="flex-1 flex items-center justify-center px-3 py-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors text-sm font-medium"
                        >
                          💬 Thank
                        </button>
                        <Link
                          to={`/patient/${patient._id}`}
                          className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors text-sm font-medium"
                        >
                          👁️ View
                        </Link>
                      </div>
                    </div>

                    {/* Prescription Preview */}
                    <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500 border-t border-gray-100">
                      📋 {patient.prescription.substring(0, 30)}...
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between bg-white rounded-xl shadow-sm px-6 py-3">
                <p className="text-sm text-gray-600">
                  Page <span className="font-semibold text-blue-600">{currentPage}</span> of{' '}
                  <span className="font-semibold text-blue-600">{totalPages}</span>
                </p>
                
                <div className="flex gap-2">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all ${
                      currentPage === 1 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    ←
                  </button>
                  
                  {[...Array(Math.min(3, totalPages))].map((_, index) => {
                    let pageNum;
                    if (totalPages <= 3) {
                      pageNum = index + 1;
                    } else if (currentPage === 1) {
                      pageNum = index + 1;
                    } else if (currentPage === totalPages) {
                      pageNum = totalPages - 2 + index;
                    } else {
                      pageNum = currentPage - 1 + index;
                    }
                    
                    return (
                      <button
                        key={index}
                        onClick={() => paginate(pageNum)}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm transition-all ${
                          currentPage === pageNum
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all ${
                      currentPage === totalPages 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    →
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
            <div className="inline-block p-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mb-4">
              <span className="text-5xl">🔍</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No patients found</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {searchTerm 
                ? `No results matching "${searchTerm}"` 
                : "Start by adding your first patient"}
            </p>
            {!searchTerm && (
              <Link
                to="/add-patient"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
              >
                <span className="mr-2">➕</span>
                Add New Patient
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllPatients;