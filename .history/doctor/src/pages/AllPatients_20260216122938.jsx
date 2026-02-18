import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
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
    const filtered = patients.filter(patient =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phoneNo.includes(searchTerm) ||
      patient.disease.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.doctorName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
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
        setDisplayedPatients(response.data.patients.slice(0, patientsPerPage));
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

  // Pagination calculations
  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phoneNo.includes(searchTerm) ||
    patient.disease.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.doctorName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          {/* Navigation Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center space-x-3">
              <Link
                to="/"
                className="group relative flex items-center text-gray-600 hover:text-gray-900 bg-white/80 backdrop-blur-sm rounded-full px-3 sm:px-4 py-2 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative mr-1 sm:mr-2 group-hover:-translate-x-1 transition-transform text-white">←</span>
                <span className="relative hidden xs:inline text-white">Dashboard</span>
              </Link>
              
              <div className="flex items-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg blur opacity-50 animate-pulse"></div>
                  <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center transform hover:rotate-6 transition-transform">
                    <span className="text-xl sm:text-2xl text-white">👥</span>
                  </div>
                </div>
                <div className="ml-3">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Patient Directory
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Total {patients.length} patients • Showing page {currentPage} of {totalPages}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Add Patient Button */}
            <Link
              to="/add-patient"
              className="group relative inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <span className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
              <span className="relative mr-2 group-hover:scale-110 transition-transform text-lg">➕</span>
              <span className="relative hidden xs:inline">Add New Patient</span>
              <span className="relative xs:hidden">Add</span>
            </Link>
          </div>

          {/* Search Bar Only - No Filters */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
              <input
                type="text"
                placeholder="Search by name, phone, disease, or doctor..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Showing <span className="font-semibold text-blue-600">{displayedPatients.length}</span> of{' '}
              <span className="font-semibold text-blue-600">{filteredPatients.length}</span> patients
              {searchTerm && <span> for "<span className="font-semibold">{searchTerm}</span>"</span>}
            </span>
          </div>
        </div>

        {/* Patients Grid */}
        {loading ? (
          <div className="text-center py-12 sm:py-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg">
            <div className="relative inline-block">
              <div className="w-12 h-12 sm:w-14 sm:h-14 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <p className="mt-3 text-sm text-gray-500">Loading patient records...</p>
          </div>
        ) : displayedPatients.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {displayedPatients.map((patient) => {
                const appointmentDate = new Date(patient.nextAppointmentDate);
                const isToday = format(appointmentDate, 'dd/MM/yyyy') === format(new Date(), 'dd/MM/yyyy');
                const isPast = appointmentDate < new Date();
                
                return (
                  <div
                    key={patient._id}
                    className="group relative bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
                  >
                    {/* Status Indicator */}
                    <div className={`absolute top-0 left-0 w-1 h-full ${
                      isToday ? 'bg-green-500' : isPast ? 'bg-gray-400' : 'bg-blue-500'
                    }`}></div>
                    
                    {/* Card Header */}
                    <div className="relative h-20 sm:h-24 bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white">
                          #{patient._id.slice(-4)}
                        </span>
                      </div>
                      <div className="absolute -bottom-8 left-4">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-xl shadow-xl flex items-center justify-center transform group-hover:scale-110 transition-transform">
                          <span className="text-2xl sm:text-3xl">👤</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="pt-10 p-4">
                      <Link to={`/patient/${patient._id}`}>
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                          {patient.name}
                        </h3>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-xs sm:text-sm text-gray-600">
                            <span className="w-6">📞</span>
                            <span className="truncate">{patient.phoneNo}</span>
                          </div>
                          <div className="flex items-center text-xs sm:text-sm text-gray-600">
                            <span className="w-6">👨‍⚕️</span>
                            <span className="truncate">Dr. {patient.doctorName}</span>
                          </div>
                          <div className="flex items-center text-xs sm:text-sm text-gray-600">
                            <span className="w-6">🦷</span>
                            <span className="truncate">{patient.disease}</span>
                          </div>
                        </div>

                        {/* Appointment Badge */}
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          isToday 
                            ? 'bg-green-100 text-green-700 animate-pulse' 
                            : isPast 
                              ? 'bg-gray-100 text-gray-600'
                              : 'bg-blue-100 text-blue-700'
                        }`}>
                          <span className="mr-1">📅</span>
                          {isToday ? 'Today' : format(appointmentDate, 'dd MMM yyyy')}
                        </div>
                      </Link>

                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                        <button
                          onClick={() => sendThankYouMessage(patient)}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-xs sm:text-sm font-medium"
                        >
                          <span>💬</span>
                          <span className="hidden xs:inline">Thank</span>
                        </button>
                        <Link
                          to={`/patient/${patient._id}`}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-xs sm:text-sm font-medium"
                        >
                          <span>👁️</span>
                          <span className="hidden xs:inline">View</span>
                        </Link>
                      </div>
                    </div>

                    {/* Prescription Preview */}
                    <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500 border-t border-gray-100">
                      <span className="truncate block">
                        📋 {patient.prescription.substring(0, 30)}...
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg px-4 sm:px-6 py-3">
                <p className="text-xs sm:text-sm text-gray-600 order-2 sm:order-1">
                  Page <span className="font-semibold text-blue-600">{currentPage}</span> of{' '}
                  <span className="font-semibold text-blue-600">{totalPages}</span>
                  {' '}• Showing {displayedPatients.length} patients
                </p>
                
                <div className="flex gap-1 sm:gap-2 order-1 sm:order-2">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center border border-gray-200 rounded-lg transition-all text-sm ${
                      currentPage === 1 
                        ? 'opacity-50 cursor-not-allowed bg-gray-50' 
                        : 'hover:bg-gray-50 hover:shadow-md'
                    }`}
                  >
                    ←
                  </button>
                  
                  {/* Page Numbers */}
                  {[...Array(Math.min(5, totalPages))].map((_, index) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = index + 1;
                    } else if (currentPage <= 3) {
                      pageNum = index + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + index;
                    } else {
                      pageNum = currentPage - 2 + index;
                    }
                    
                    return (
                      <button
                        key={index}
                        onClick={() => paginate(pageNum)}
                        className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg text-sm transition-all ${
                          currentPage === pageNum
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                            : 'border border-gray-200 hover:bg-gray-50 hover:shadow-md'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center border border-gray-200 rounded-lg transition-all text-sm ${
                      currentPage === totalPages 
                        ? 'opacity-50 cursor-not-allowed bg-gray-50' 
                        : 'hover:bg-gray-50 hover:shadow-md'
                    }`}
                  >
                    →
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          // Empty State
          <div className="text-center py-12 sm:py-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg">
            <div className="inline-block p-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full mb-4">
              <span className="text-4xl sm:text-5xl">🔍</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No patients found</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
              {searchTerm 
                ? `We couldn't find any patients matching "${searchTerm}".` 
                : "No patients have been added yet."}
            </p>
            <Link
              to="/add-patient"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
            >
              <span className="mr-2">➕</span>
              Add New Patient
            </Link>
          </div>
        )}
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
      `}</style>
    </div>
  );
};

export default AllPatients;