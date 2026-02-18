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
  const [showPastOnly, setShowPastOnly] = useState(false);
  const patientsPerPage = 10;

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    // First filter by search term
    let filtered = patients.filter(patient =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phoneNo.includes(searchTerm) ||
      patient.disease.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.doctorName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Then filter by past appointments if toggle is on
    if (showPastOnly) {
      filtered = filtered.filter(patient => 
        new Date(patient.nextAppointmentDate) < new Date()
      );
    }
    
    // Paginate filtered results
    const indexOfLastPatient = currentPage * patientsPerPage;
    const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
    setDisplayedPatients(filtered.slice(indexOfFirstPatient, indexOfLastPatient));
    
    // Reset to page 1 if no results on current page
    if (filtered.length > 0 && displayedPatients.length === 0) {
      setCurrentPage(1);
    }
  }, [searchTerm, patients, currentPage, showPastOnly]);

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

  // Filtered patients for pagination
  const getFilteredPatients = () => {
    let filtered = patients.filter(patient =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phoneNo.includes(searchTerm) ||
      patient.disease.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.doctorName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (showPastOnly) {
      filtered = filtered.filter(patient => 
        new Date(patient.nextAppointmentDate) < new Date()
      );
    }
    return filtered;
  };

  const filteredPatients = getFilteredPatients();
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);
  const pastAppointmentsCount = patients.filter(patient => 
    new Date(patient.nextAppointmentDate) < new Date()
  ).length;

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Dashboard
            </Link>
            <h1 className="text-2xl font-light text-gray-900">
              Patients
            </h1>
          </div>
          
          <Link
            to="/add-patient"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            + New Patient
          </Link>
        </div>

        {/* Search and Filter Button */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Past Appointments Button */}
          <button
            onClick={() => {
              setShowPastOnly(!showPastOnly);
              setCurrentPage(1);
            }}
            className={`flex items-center justify-between w-full sm:w-auto px-4 py-2 rounded-lg transition-colors ${
              showPastOnly 
                ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center space-x-2">
              <span>⏰</span>
              <span className="text-sm font-medium">Past Appointments</span>
            </div>
            <span className={`ml-3 text-xs px-2 py-0.5 rounded-full ${
              showPastOnly 
                ? 'bg-amber-200 text-amber-800' 
                : 'bg-gray-200 text-gray-700'
            }`}>
              {pastAppointmentsCount}
            </span>
          </button>
        </div>

        {/* Results Summary */}
        <div className="mb-4 text-sm text-gray-500">
          Showing {displayedPatients.length} of {filteredPatients.length} patients
          {showPastOnly && " (past appointments)"}
        </div>

        {/* Patients Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-2 text-sm text-gray-500">Loading...</p>
          </div>
        ) : displayedPatients.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayedPatients.map((patient) => {
                const appointmentDate = new Date(patient.nextAppointmentDate);
                const isPast = appointmentDate < new Date();
                
                return (
                  <div
                    key={patient._id}
                    className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow overflow-hidden"
                  >
                    {/* Card Header */}
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{patient.name}</h3>
                          <p className="text-xs text-gray-500 mt-0.5">ID: {patient._id.slice(-4)}</p>
                        </div>
                        {isPast && (
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                            Past
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Patient Details */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-center text-sm">
                        <span className="w-16 text-gray-500">Phone</span>
                        <span className="text-gray-900">{patient.phoneNo}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="w-16 text-gray-500">Doctor</span>
                        <span className="text-gray-900">Dr. {patient.doctorName}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="w-16 text-gray-500">Problem</span>
                        <span className="text-gray-900 truncate">{patient.disease}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="w-16 text-gray-500">Next</span>
                        <span className={`${isPast ? 'text-amber-600' : 'text-blue-600'}`}>
                          {format(appointmentDate, 'dd MMM yyyy')}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-2">
                      <button
                        onClick={() => sendThankYouMessage(patient)}
                        className="flex-1 px-3 py-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors text-sm"
                      >
                        💬 Thank
                      </button>
                      <Link
                        to={`/patient/${patient._id}`}
                        className="flex-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors text-sm text-center"
                      >
                        👁️ View
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded border ${
                      currentPage === 1 
                        ? 'border-gray-200 text-gray-400 cursor-not-allowed' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
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
                        className={`px-3 py-1 rounded ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded border ${
                      currentPage === totalPages 
                        ? 'border-gray-200 text-gray-400 cursor-not-allowed' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    →
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No patients found</h3>
            <p className="text-sm text-gray-500 mb-4">
              {searchTerm 
                ? `No results for "${searchTerm}"` 
                : showPastOnly 
                  ? "No past appointments found"
                  : "No patients added yet"}
            </p>
            {!searchTerm && !showPastOnly && (
              <Link
                to="/add-patient"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                + Add your first patient
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllPatients;