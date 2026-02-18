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
  const [filterType, setFilterType] = useState('all'); // all, pending-payments, paid, overdue
  const [searchByRegNo, setSearchByRegNo] = useState(''); // New state for registration number search
  const patientsPerPage = 8;

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    // Filter patients based on search term, registration number, and filter type
    let filtered = patients.filter(patient => {
      // Search by name/phone/disease/doctor
      const matchesGeneralSearch = 
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phoneNo.includes(searchTerm) ||
        patient.disease.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.doctorName.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Search by registration number
      const matchesRegNo = searchByRegNo === '' || 
        patient.registrationNo?.includes(searchByRegNo);

      if (!matchesGeneralSearch || !matchesRegNo) return false;

      // Type filter
      switch(filterType) {
        case 'pending-payments':
          return patient.restAmount > 0;
        case 'paid':
          return patient.paymentStatus === 'paid';
        case 'overdue':
          return isPast(new Date(patient.nextAppointmentDate));
        default:
          return true;
      }
    });

    // Sort patients: Past appointments first, then by date, then by pending payments
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

      // If both are past or both are future, sort by payment status (pending first)
      if (a.restAmount > 0 && b.restAmount === 0) return -1;
      if (a.restAmount === 0 && b.restAmount > 0) return 1;

      // Then sort by date (closest first)
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
  }, [searchTerm, searchByRegNo, patients, currentPage, filterType]);

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
          
          if (a.restAmount > 0 && b.restAmount === 0) return -1;
          if (a.restAmount === 0 && b.restAmount > 0) return 1;
          
          return dateA - dateB;
        });
        
        setDisplayedPatients(sorted.slice(0, patientsPerPage));
      }
    } catch (error) {
       console.error(error);
      toast.error('Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  const sendThankYouMessage = async (patient) => {
    try {
      const message = `Dear ${patient.name}, thank you for visiting our dental clinic. We appreciate your trust in us. Your registration number is ${patient.registrationNo}. For any questions, please contact us. Thanks & Regards, Dr. ${patient.doctorName} https://share.google/NA6nTqi4xdKEzdFJI`;

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

  const sendPaymentReminder = async (patient) => {
    try {
      const message = `Dear ${patient.name},

This is a friendly reminder about your pending payment of ₹${patient.restAmount} for dental treatment.

📋 Registration No: ${patient.registrationNo || 'N/A'}
💳 Payment Details:
• Total Treatment Cost: ₹${patient.totalAmount}
• Amount Paid: ₹${patient.paidAmount}
• Pending Amount: ₹${patient.restAmount}

Please clear the dues at your earliest convenience. You can make the payment via:
💵 Cash
💳 Card
📱 UPI

Thank you for your cooperation!

Warm regards,
Dr. ${patient.doctorName}`;

      const response = await axios.post('/patients/send-whatsapp', {
        phoneNo: patient.phoneNo,
        message
      });

      if (response.data.success) {
        window.open(response.data.whatsappUrl, '_blank');
        toast.success('Payment reminder sent!');
      }
    } catch (error) {
      toast.error('Failed to send payment reminder');
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

  // Get payment status badge
  const getPaymentStatusBadge = (patient) => {
    if (patient.paymentStatus === 'paid') {
      return {
        color: 'bg-green-100 text-green-700',
        text: 'Paid',
        icon: '✅'
      };
    } else if (patient.paymentStatus === 'partial') {
      return {
        color: 'bg-yellow-100 text-yellow-700',
        text: 'Partial',
        icon: '⚠️'
      };
    } else {
      return {
        color: 'bg-red-100 text-red-700',
        text: 'Pending',
        icon: '⏳'
      };
    }
  };

  // Format registration number for display
  const formatRegNo = (regNo) => {
    if (!regNo) return 'N/A';
    // Add space after every 3 digits for better readability
    return regNo.replace(/(\d{3})(?=\d)/g, '$1 ');
  };

  const filteredPatients = (() => {
    let filtered = patients.filter(patient => {
      // Search by name/phone/disease/doctor
      const matchesGeneralSearch = 
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phoneNo.includes(searchTerm) ||
        patient.disease.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.doctorName.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Search by registration number
      const matchesRegNo = searchByRegNo === '' || 
        patient.registrationNo?.includes(searchByRegNo);

      if (!matchesGeneralSearch || !matchesRegNo) return false;

      // Type filter
      switch(filterType) {
        case 'pending-payments':
          return patient.restAmount > 0;
        case 'paid':
          return patient.paymentStatus === 'paid';
        case 'overdue':
          return isPast(new Date(patient.nextAppointmentDate));
        default:
          return true;
      }
    });

    // Sort: Past first, pending payments first, then by date
    filtered.sort((a, b) => {
      const dateA = new Date(a.nextAppointmentDate);
      const dateB = new Date(b.nextAppointmentDate);
      const now = new Date();

      const aIsPast = dateA < now;
      const bIsPast = dateB < now;

      if (aIsPast && !bIsPast) return -1;
      if (!aIsPast && bIsPast) return 1;

      if (a.restAmount > 0 && b.restAmount === 0) return -1;
      if (a.restAmount === 0 && b.restAmount > 0) return 1;

      return dateA - dateB;
    });

    return filtered;
  })();

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

  // Calculate stats
  const totalPatients = patients.length;
  const totalPendingPayments = patients.filter(p => p.restAmount > 0).length;
  const totalOverdue = patients.filter(p => isPast(new Date(p.nextAppointmentDate))).length;
  const totalPaidAmount = patients.reduce((sum, p) => sum + (p.paidAmount || 0), 0);
  const totalPendingAmount = patients.reduce((sum, p) => sum + (p.restAmount || 0), 0);

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

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-500">
              <p className="text-sm text-gray-500 mb-1">Total Patients</p>
              <p className="text-2xl font-bold text-gray-900">{totalPatients}</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-yellow-500">
              <p className="text-sm text-gray-500 mb-1">Pending Payments</p>
              <p className="text-2xl font-bold text-gray-900">{totalPendingPayments}</p>
              <p className="text-xs text-yellow-600 mt-1">₹{totalPendingAmount}</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-500">
              <p className="text-sm text-gray-500 mb-1">Total Paid</p>
              <p className="text-2xl font-bold text-gray-900">₹{totalPaidAmount}</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-red-500">
              <p className="text-sm text-gray-500 mb-1">Overdue</p>
              <p className="text-2xl font-bold text-gray-900">{totalOverdue}</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-purple-500">
              <p className="text-sm text-gray-500 mb-1">Collection Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalPatients > 0 ? Math.round((totalPaidAmount / (totalPaidAmount + totalPendingAmount)) * 100) : 0}%
              </p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => {
                setFilterType('all');
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filterType === 'all'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              All Patients
            </button>
            <button
              onClick={() => {
                setFilterType('pending-payments');
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filterType === 'pending-payments'
                  ? 'bg-yellow-600 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              ⏳ Pending Payments ({totalPendingPayments})
            </button>
            <button
              onClick={() => {
                setFilterType('paid');
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filterType === 'paid'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              ✅ Paid
            </button>
            <button
              onClick={() => {
                setFilterType('overdue');
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filterType === 'overdue'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              ⚠️ Overdue ({totalOverdue})
            </button>
          </div>

          {/* Search Bars */}
          <div className="space-y-3">
            {/* General Search */}
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

            {/* Registration Number Search */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔢</span>
              <input
                type="text"
                placeholder="Search by registration number..."
                value={searchByRegNo}
                onChange={(e) => {
                  setSearchByRegNo(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold text-blue-600">{displayedPatients.length}</span> of{' '}
            <span className="font-semibold text-blue-600">{filteredPatients.length}</span> patients
          </p>
          <div className="flex items-center space-x-3 text-xs text-gray-500">
            <span className="flex items-center"><span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>Overdue first</span>
            <span className="flex items-center"><span className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></span>Pending payment</span>
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
                const paymentStatus = getPaymentStatusBadge(patient);
                
                return (
                  <div
                    key={patient._id}
                    className={`group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden ${
                      isPastAppointment ? 'border-l-4 border-red-500' : ''
                    } ${patient.restAmount > 0 ? 'ring-1 ring-yellow-200' : ''}`}
                  >
                    {/* Card Header with Gradient */}
                    <div className={`relative h-20 bg-gradient-to-r ${
                      isPastAppointment 
                        ? 'from-red-500 to-orange-500' 
                        : patient.restAmount > 0
                        ? 'from-yellow-500 to-orange-500'
                        : 'from-blue-500 to-purple-600'
                    } p-4`}>
                      <div className="absolute -bottom-8 left-4">
                        <div className="w-16 h-16 bg-white rounded-xl shadow-lg flex items-center justify-center transform group-hover:scale-110 transition-transform">
                          <span className="text-3xl">👤</span>
                        </div>
                      </div>
                      <div className="absolute top-2 right-2 flex gap-1">
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
                        
                        {/* Registration Number Display */}
                        <div className="mb-2 bg-purple-50 rounded-lg p-2 border border-purple-100">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-purple-600 font-medium">Reg No:</span>
                            <span className="text-sm font-mono font-bold text-purple-800">
                              {(patient.registrationNo)}
                            </span>
                          </div>
                        </div>
                        
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

                        {/* Status Badges */}
                        <div className="flex flex-wrap gap-2 mb-2">
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${status.color}`}>
                            <span className="mr-1">{status.icon}</span>
                            {status.text}
                          </div>
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${paymentStatus.color}`}>
                            <span className="mr-1">{paymentStatus.icon}</span>
                            {paymentStatus.text}
                          </div>
                        </div>

                        {/* Payment Info */}
                        {patient.totalAmount > 0 && (
                          <div className="mt-2 space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Total:</span>
                              <span className="font-medium">₹{patient.totalAmount}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Paid:</span>
                              <span className="font-medium text-green-600">₹{patient.paidAmount || 0}</span>
                            </div>
                            {patient.restAmount > 0 && (
                              <div className="flex justify-between">
                                <span className="text-gray-500">Pending:</span>
                                <span className="font-medium text-red-600">₹{patient.restAmount}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </Link>

                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                        <button
                          onClick={() => sendThankYouMessage(patient)}
                          className="flex-1 flex items-center justify-center px-3 py-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors text-sm font-medium"
                        >
                          💬 Thank
                        </button>
                        {patient.restAmount > 0 && (
                          <button
                            onClick={() => sendPaymentReminder(patient)}
                            className="flex-1 flex items-center justify-center px-3 py-2 bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-100 transition-colors text-sm font-medium"
                          >
                            💰 Remind
                          </button>
                        )}
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
              {searchTerm || searchByRegNo
                ? `No results matching "${searchTerm}${searchByRegNo ? ' with reg: ' + searchByRegNo : ''}"` 
                : filterType !== 'all'
                ? `No patients with ${filterType.replace('-', ' ')}`
                : "Start by adding your first patient"}
            </p>
            {!searchTerm && !searchByRegNo && filterType === 'all' && (
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