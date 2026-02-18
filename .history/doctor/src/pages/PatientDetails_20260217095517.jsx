import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { useCallback } from 'react';
import { 
  FiArrowLeft, FiCalendar, FiPhone, FiUser, FiMapPin, 
  FiClock, FiSend, FiEdit2, FiFileText, FiHeart, 
  FiActivity, FiChevronDown, FiChevronUp, FiPlus,
  FiMail, FiDownload, FiShare2, FiMoreVertical, FiDollarSign,
  FiCreditCard, FiTrendingUp, FiTrendingDown, FiMenu
} from 'react-icons/fi';
import { 
  HiOutlineIdentification, HiOutlineClipboardList, 
  HiOutlineCalendar, HiOutlineUserGroup, HiOutlineCurrencyRupee,
  HiOutlineCash, HiOutlineCreditCard, HiOutlineRefresh,
  HiOutlineReceiptTax
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const PatientDetails = () => {
  const { id } = useParams();
 
  const [patient, setPatient] = useState(null);
  const [visits, setVisits] = useState([]);
 
  const [loading, setLoading] = useState(true);
  const [showVisitForm, setShowVisitForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [expandedVisit, setExpandedVisit] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [visitData, setVisitData] = useState({
    treatment: '',
    notes: '',
    prescription: '',
    nextAppointmentDate: '',
    amountPaid: '',
    paymentMethod: 'cash'
  });
  const [paymentData, setPaymentData] = useState({
    amountPaid: '',
    paymentMethod: 'cash',
    notes: ''
  });

  const fetchPatientDetails = useCallback(async () => {
    try {
      const response = await axios.get(`/patients/${id}`);
      if (response.data.success) {
        setPatient(response.data.patient);
        setVisits(response.data.visits || []);
      }
    } catch (error) {
      console.log(error);
      toast.error('Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPatientDetails();
  }, [fetchPatientDetails]);

  const handleVisitSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`/patients/visit/${id}`, {
        ...visitData,
        amountPaid: visitData.amountPaid ? Number(visitData.amountPaid) : 0
      });
      if (response.data.success) {
        toast.success('Visit recorded successfully');
        setShowVisitForm(false);
        setVisitData({ 
          treatment: '', 
          notes: '', 
          prescription: '',
          nextAppointmentDate: '', 
          amountPaid: '', 
          paymentMethod: 'cash' 
        });
        fetchPatientDetails();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record visit');
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`/patients/payment/${id}`, paymentData);
      if (response.data.success) {
        toast.success('Payment recorded successfully');
        setShowPaymentForm(false);
        setPaymentData({ amountPaid: '', paymentMethod: 'cash', notes: '' });
        fetchPatientDetails();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record payment');
    }
  };

  const sendWhatsAppMessage = async (type) => {
    let message = '';
    let subject = '';
    
    if (type === 'thankyou') {
      subject = 'Thank You for Your Visit';
      message = `Dear ${patient?.name},

Thank you for visiting our dental clinic today. We truly appreciate the trust you place in us and hope you're feeling comfortable and well.
Your oral health is always our top priority. If you have any query or concerns, please feel free to reach out anytime.

Wishing you a healthy and confident smile!

Warm regards,
Dr. ${patient?.doctorName} https://share.google/NA6nTqi4xdKEzdFJI`;
    } 
    else if (type === 'reminder') {
      subject = 'Appointment Reminder';
      message = `Dear ${patient?.name},

This is a gentle reminder of your upcoming dental appointment on ${format(new Date(patient?.nextAppointmentDate), 'EEEE, dd MMMM yyyy')}.

💰 Pending Amount: ₹${patient?.restAmount}

Kindly plan to arrive 10 minutes early for a smooth check-in process.

If you need to reschedule or have any queries, we are just a call away.

Looking forward to seeing you soon!

Warm regards,
Dr. ${patient?.doctorName}`;
    } else if (type === 'payment_reminder') {
      subject = 'Payment Reminder';
      message = `Dear ${patient?.name},

This is a reminder regarding your pending payment of ₹${patient?.restAmount} for dental treatment.

Total Amount: ₹${patient?.totalAmount}
Paid Amount: ₹${patient?.paidAmount}
Pending Amount: ₹${patient?.restAmount}

Please clear the dues at your earliest convenience. You can make the payment via cash, card, or UPI at our clinic.

Thank you for your cooperation!

Warm regards,
Dr. ${patient?.doctorName}`;
    }

    try {
      const response = await axios.post('/patients/send-whatsapp', {
        phoneNo: patient?.phoneNo,
        message
      });

      if (response.data.success) {
        window.open(response.data.whatsappUrl, '_blank');
        toast.success(`${subject} message prepared!`);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to send WhatsApp message');
    }
  };

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getPaymentStatusColor = (status) => {
    switch(status) {
      case 'paid': return 'text-green-600 bg-green-100';
      case 'partial': return 'text-yellow-600 bg-yellow-100';
      case 'pending': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPaymentStatusText = (status) => {
    switch(status) {
      case 'paid': return '✅ Paid';
      case 'partial': return '⚠️ Partial';
      case 'pending': return '⏳ Pending';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 sm:h-20 w-16 sm:w-20 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-8 sm:h-10 w-8 sm:w-10 bg-blue-600 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="mt-4 text-gray-600 font-medium text-sm sm:text-base">Loading patient details...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-6 sm:p-8 md:p-12 rounded-2xl shadow-xl max-w-md w-full mx-4">
          <div className="text-gray-400 mb-4">
            <HiOutlineUserGroup className="w-16 sm:w-20 h-16 sm:h-20 mx-auto" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Patient Not Found</h3>
          <p className="text-sm sm:text-base text-gray-500 mb-6">The patient you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/all-patients"
            className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all transform hover:scale-105 text-sm sm:text-base"
          >
            <FiArrowLeft className="mr-2" />
            Back to Patients
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'info', label: 'Information', icon: HiOutlineIdentification },
    { id: 'payments', label: 'Payments', icon: HiOutlineCurrencyRupee },
    { id: 'visits', label: 'Visit History', icon: HiOutlineCalendar },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-4 sm:py-6 md:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Navigation */}
        <div className="mb-4 sm:mb-6 flex items-center justify-between">
          <Link
            to="/all-patients"
            className="group inline-flex items-center text-gray-600 hover:text-blue-600 transition-all"
          >
            <div className="bg-white p-1.5 sm:p-2 rounded-xl shadow-sm group-hover:shadow-md transition-all">
              <FiArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="ml-2 sm:ml-3 font-medium text-sm sm:text-base hidden xs:inline">Back to Dashboard</span>
          </Link>
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="lg:hidden p-2 bg-white rounded-xl shadow-sm"
          >
            <FiMenu className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Header Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden mb-4 sm:mb-6 transform transition-all hover:shadow-2xl">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 sm:px-6 py-4 sm:py-6 md:py-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="bg-white/20 p-3 sm:p-4 rounded-xl sm:rounded-2xl backdrop-blur-lg">
                <FiUser className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white break-words">{patient.name}</h1>
                <div className="flex flex-col xs:flex-row items-start xs:items-center mt-1 sm:mt-2 text-blue-100 space-y-1 xs:space-y-0 xs:space-x-4 text-xs sm:text-sm">
                  <span className="flex items-center">
                    <FiCalendar className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4" />
                    ID: {id.slice(-6).toUpperCase()}
                  </span>
                  <span className="flex items-center">
                    <FiUser className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4" />
                    Age: {calculateAge(patient.dateOfBirth)} years
                  </span>
                </div>
              </div>
              
              {/* Desktop Action Buttons */}
              <div className="hidden lg:flex space-x-3">
                <button
                  onClick={() => sendWhatsAppMessage('thankyou')}
                  className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all transform hover:scale-105 flex items-center shadow-lg text-sm"
                >
                  <FiSend className="mr-2" />
                  Thank You
                </button>
                <button
                  onClick={() => sendWhatsAppMessage('reminder')}
                  className="px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-all transform hover:scale-105 flex items-center shadow-lg text-sm"
                >
                  <FiCalendar className="mr-2" />
                  Reminder
                </button>
                {patient.restAmount > 0 && (
                  <button
                    onClick={() => sendWhatsAppMessage('payment_reminder')}
                    className="px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all transform hover:scale-105 flex items-center shadow-lg text-sm"
                  >
                    <FiDollarSign className="mr-2" />
                    Payment Reminder
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Action Buttons (Collapsible) */}
          {showMobileMenu && (
            <div className="lg:hidden p-4 bg-gray-50 border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => {
                    sendWhatsAppMessage('thankyou');
                    setShowMobileMenu(false);
                  }}
                  className="px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all flex items-center justify-center shadow-lg text-sm"
                >
                  <FiSend className="mr-2" />
                  Thank You
                </button>
                <button
                  onClick={() => {
                    sendWhatsAppMessage('reminder');
                    setShowMobileMenu(false);
                  }}
                  className="px-4 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-all flex items-center justify-center shadow-lg text-sm"
                >
                  <FiCalendar className="mr-2" />
                  Reminder
                </button>
                {patient.restAmount > 0 && (
                  <button
                    onClick={() => {
                      sendWhatsAppMessage('payment_reminder');
                      setShowMobileMenu(false);
                    }}
                    className="px-4 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all flex items-center justify-center shadow-lg text-sm"
                  >
                    <FiDollarSign className="mr-2" />
                    Payment Reminder
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Quick Stats - Responsive Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 divide-y-0 bg-gray-50 px-3 sm:px-4 md:px-6 py-3 sm:py-4">
            <div className="text-center">
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600">{visits.length}</p>
              <p className="text-xs sm:text-sm text-gray-500">Visits</p>
            </div>
            <div className="text-center">
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">
                ₹{patient.paidAmount || 0}
              </p>
              <p className="text-xs sm:text-sm text-gray-500">Paid</p>
            </div>
            <div className="text-center">
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-orange-600">
                ₹{patient.restAmount || 0}
              </p>
              <p className="text-xs sm:text-sm text-gray-500">Rest</p>
            </div>
            <div className="text-center">
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-purple-600">
                {patient.nextAppointmentDate ? format(new Date(patient.nextAppointmentDate), 'dd MMM') : 'N/A'}
              </p>
              <p className="text-xs sm:text-sm text-gray-500">Next</p>
            </div>
            <div className="text-center col-span-2 sm:col-span-1">
              <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(patient.paymentStatus)}`}>
                {getPaymentStatusText(patient.paymentStatus)}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs - Scrollable on Mobile */}
        <div className="bg-white rounded-xl shadow-lg mb-4 sm:mb-6 overflow-x-auto">
          <div className="border-b border-gray-200 min-w-max">
            <nav className="flex px-2 sm:px-4 md:px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 sm:py-4 px-3 sm:px-4 md:px-6 font-medium text-xs sm:text-sm border-b-2 transition-all flex items-center space-x-1 sm:space-x-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-4 sm:space-y-6">
          {/* Information Tab */}
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Personal Information */}
              <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
                    <FiUser className="mr-2 text-blue-600 w-4 h-4 sm:w-5 sm:h-5" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</label>
                      <p className="mt-1 text-sm sm:text-base text-gray-900 flex items-center break-all">
                        <FiPhone className="mr-2 text-gray-400 flex-shrink-0 w-4 h-4" />
                        {patient.phoneNo}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</label>
                      <p className="mt-1 text-sm sm:text-base text-gray-900 flex items-center break-all">
                        <FiMail className="mr-2 text-gray-400 flex-shrink-0 w-4 h-4" />
                        {patient.email || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">DOB</label>
                      <p className="mt-1 text-sm sm:text-base text-gray-900">
                        {format(new Date(patient.dateOfBirth), 'dd MMM yyyy')}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Age</label>
                      <p className="mt-1 text-sm sm:text-base text-gray-900">{calculateAge(patient.dateOfBirth)} years</p>
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Address</label>
                      <p className="mt-1 text-sm sm:text-base text-gray-900 flex items-start">
                        <FiMapPin className="mr-2 text-gray-400 mt-1 flex-shrink-0 w-4 h-4" />
                        <span className="break-words">{patient.address}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
                    <FiHeart className="mr-2 text-red-500 w-4 h-4 sm:w-5 sm:h-5" />
                    Medical Information
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</label>
                      <p className="mt-1 text-sm sm:text-base font-medium text-blue-600">Dr. {patient.doctorName}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</label>
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-red-100 text-red-800">
                          {patient.disease}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Prescription</label>
                      <p className="mt-2 p-3 sm:p-4 bg-gray-50 rounded-xl text-sm sm:text-base text-gray-700 border border-gray-200 break-words">
                        {patient.prescription}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Quick Actions & Payment Summary */}
              <div className="space-y-4 sm:space-y-6">
                {/* Payment Summary Card */}
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
                    <HiOutlineCurrencyRupee className="mr-2 text-green-600 w-4 h-4 sm:w-5 sm:h-5" />
                    Payment Summary
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex justify-between items-center p-2 sm:p-3 bg-blue-50 rounded-xl">
                      <span className="text-xs sm:text-sm font-medium text-gray-600">Total</span>
                      <span className="text-base sm:text-lg md:text-xl font-bold text-blue-600">₹{patient.totalAmount || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 sm:p-3 bg-green-50 rounded-xl">
                      <span className="text-xs sm:text-sm font-medium text-gray-600">Paid</span>
                      <span className="text-base sm:text-lg md:text-xl font-bold text-green-600">₹{patient.paidAmount || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 sm:p-3 bg-orange-50 rounded-xl">
                      <span className="text-xs sm:text-sm font-medium text-gray-600">Rest</span>
                      <span className="text-base sm:text-lg md:text-xl font-bold text-orange-600">₹{patient.restAmount || 0}</span>
                    </div>
                    <div className="mt-3 sm:mt-4">
                      <button
                        onClick={() => setShowPaymentForm(true)}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all flex items-center justify-center text-sm sm:text-base"
                      >
                        <HiOutlineCash className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                        Record Payment
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => setShowVisitForm(!showVisitForm)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center text-sm sm:text-base"
                    >
                      <FiPlus className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                      Record New Visit
                    </button>
                    <button className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all flex items-center justify-center text-sm sm:text-base">
                      <FiCalendar className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                      Schedule Appointment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">Payment History</h3>
                <button
                  onClick={() => setShowPaymentForm(true)}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all flex items-center justify-center text-sm"
                >
                  <FiPlus className="mr-2" />
                  New Payment
                </button>
              </div>

              {visits.filter(v => v.amountPaid > 0).length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {visits.filter(v => v.amountPaid > 0).map((visit, index) => (
                    <div key={index} className="p-4 sm:p-6 hover:bg-gray-50 transition-all">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
                          <div className="bg-green-100 p-2 sm:p-3 rounded-xl flex-shrink-0">
                            <HiOutlineCurrencyRupee className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-sm sm:text-base text-gray-900">
                              Payment of ₹{visit.amountPaid}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500">
                              {format(new Date(visit.visitDate), 'dd MMM yyyy')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end space-x-3 w-full sm:w-auto">
                          <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                            visit.paymentMethod === 'cash' ? 'bg-green-100 text-green-800' :
                            visit.paymentMethod === 'card' ? 'bg-blue-100 text-blue-800' :
                            visit.paymentMethod === 'upi' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {visit.paymentMethod?.toUpperCase()}
                          </span>
                          <button
                            onClick={() => setExpandedVisit(expandedVisit === `payment-${index}` ? null : `payment-${index}`)}
                            className="p-1 sm:p-2 hover:bg-gray-200 rounded-full transition-all"
                          >
                            {expandedVisit === `payment-${index}` ? (
                              <FiChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                            ) : (
                              <FiChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                            )}
                          </button>
                        </div>
                      </div>

                      {expandedVisit === `payment-${index}` && (
                        <div className="mt-3 sm:mt-4 ml-8 sm:ml-16 space-y-2 sm:space-y-3">
                          <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-700">Treatment:</p>
                            <p className="mt-1 text-sm sm:text-base text-gray-600 break-words">{visit.treatment}</p>
                          </div>
                          {visit.notes && (
                            <div>
                              <p className="text-xs sm:text-sm font-medium text-gray-700">Notes:</p>
                              <p className="mt-1 text-sm sm:text-base text-gray-600 break-words">{visit.notes}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12 px-4">
                  <HiOutlineCurrencyRupee className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-gray-700 mb-2">No Payment History</h3>
                  <p className="text-sm sm:text-base text-gray-500 mb-4">No payments have been recorded for this patient yet.</p>
                  <button
                    onClick={() => setShowPaymentForm(true)}
                    className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all text-sm sm:text-base"
                  >
                    <FiPlus className="mr-2" />
                    Record First Payment
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Visit History Tab */}
          {activeTab === 'visits' && (
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">Visit History</h3>
                <button
                  onClick={() => setShowVisitForm(true)}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center text-sm"
                >
                  <FiPlus className="mr-2" />
                  New Visit
                </button>
              </div>

              {visits.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {visits.map((visit, index) => (
                    <div key={index} className="p-4 sm:p-6 hover:bg-gray-50 transition-all">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
                          <div className="bg-blue-100 p-2 sm:p-3 rounded-xl flex-shrink-0">
                            <FiCalendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-sm sm:text-base text-gray-900">
                              {format(new Date(visit.visitDate), 'dd MMM yyyy')}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500">Visit #{visits.length - index}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end space-x-3 w-full sm:w-auto">
                          {visit.amountPaid > 0 && (
                            <span className="px-2 sm:px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                              ₹{visit.amountPaid}
                            </span>
                          )}
                          <button
                            onClick={() => setExpandedVisit(expandedVisit === index ? null : index)}
                            className="p-1 sm:p-2 hover:bg-gray-200 rounded-full transition-all"
                          >
                            {expandedVisit === index ? (
                              <FiChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                            ) : (
                              <FiChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                            )}
                          </button>
                        </div>
                      </div>

                      {expandedVisit === index && (
                        <div className="mt-3 sm:mt-4 ml-8 sm:ml-16 space-y-2 sm:space-y-3">
                          <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-700">Treatment:</p>
                            <p className="mt-1 p-2 sm:p-3 bg-gray-50 rounded-lg text-sm sm:text-base text-gray-600 break-words">{visit.treatment}</p>
                          </div>
                          {visit.notes && (
                            <div>
                              <p className="text-xs sm:text-sm font-medium text-gray-700">Notes:</p>
                              <p className="mt-1 text-sm sm:text-base text-gray-600 break-words">{visit.notes}</p>
                            </div>
                          )}
                          {visit.prescription && (
                            <div>
                              <p className="text-xs sm:text-sm font-medium text-gray-700">Prescription:</p>
                              <p className="mt-1 text-sm sm:text-base text-gray-600 break-words">{visit.prescription}</p>
                            </div>
                          )}
                          {visit.nextAppointmentDate && (
                            <div className="flex items-center text-xs sm:text-sm text-green-600">
                              <FiCalendar className="mr-2 flex-shrink-0" />
                              <span className="break-words">Next: {format(new Date(visit.nextAppointmentDate), 'dd MMM yyyy')}</span>
                            </div>
                          )}
                          {visit.amountPaid > 0 && (
                            <div className="flex items-center text-xs sm:text-sm text-green-600">
                              <HiOutlineCurrencyRupee className="mr-2 flex-shrink-0" />
                              <span className="break-words">Payment: ₹{visit.amountPaid} ({visit.paymentMethod})</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12 px-4">
                  <FiClock className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-gray-700 mb-2">No Visit History</h3>
                  <p className="text-sm sm:text-base text-gray-500 mb-4">No visits have been recorded for this patient yet.</p>
                  <button
                    onClick={() => setShowVisitForm(true)}
                    className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all text-sm sm:text-base"
                  >
                    <FiPlus className="mr-2" />
                    Record First Visit
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Visit Form Modal - Responsive */}
        {showVisitForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-lg w-full mx-auto max-h-[90vh] overflow-y-auto">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800">Record New Visit</h3>
                <button
                  onClick={() => setShowVisitForm(false)}
                  className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-all"
                >
                  <FiChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                </button>
              </div>
              <form onSubmit={handleVisitSubmit} className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Treatment Given *
                  </label>
                  <textarea
                    value={visitData.treatment}
                    onChange={(e) => setVisitData({...visitData, treatment: e.target.value})}
                    rows="3"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Describe the treatment provided..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Prescription
                  </label>
                  <textarea
                    value={visitData.prescription}
                    onChange={(e) => setVisitData({...visitData, prescription: e.target.value})}
                    rows="2"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Enter prescription details..."
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    value={visitData.notes}
                    onChange={(e) => setVisitData({...visitData, notes: e.target.value})}
                    rows="2"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Any additional observations or notes..."
                  />
                </div>
                
                {/* Payment Section in Visit Form */}
                <div className="border-t border-gray-200 pt-3 sm:pt-4">
                  <h4 className="text-sm sm:text-md font-medium text-gray-800 mb-2 sm:mb-3">Payment Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Amount (₹)
                      </label>
                      <input
                        type="number"
                        value={visitData.amountPaid}
                        onChange={(e) => setVisitData({...visitData, amountPaid: e.target.value})}
                        min="0"
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Method
                      </label>
                      <select
                        value={visitData.paymentMethod}
                        onChange={(e) => setVisitData({...visitData, paymentMethod: e.target.value})}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      >
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                        <option value="upi">UPI</option>
                        <option value="bank_transfer">Bank Transfer</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Next Appointment
                  </label>
                  <input
                    type="date"
                    value={visitData.nextAppointmentDate}
                    onChange={(e) => setVisitData({...visitData, nextAppointmentDate: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-3 sm:pt-4">
                  <button
                    type="button"
                    onClick={() => setShowVisitForm(false)}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 border border-gray-300 rounded-lg sm:rounded-xl text-sm sm:text-base text-gray-700 hover:bg-gray-50 transition-all order-2 sm:order-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg sm:rounded-xl hover:bg-blue-700 transition-all transform hover:scale-105 text-sm sm:text-base order-1 sm:order-2"
                  >
                    Save Visit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Payment Form Modal - Responsive */}
        {showPaymentForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-lg w-full mx-auto">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800">Record Payment</h3>
                <button
                  onClick={() => setShowPaymentForm(false)}
                  className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-all"
                >
                  <FiChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                </button>
              </div>
              <form onSubmit={handlePaymentSubmit} className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                <div className="bg-blue-50 p-3 sm:p-4 rounded-lg sm:rounded-xl mb-3 sm:mb-4">
                  <p className="text-xs sm:text-sm text-blue-800">
                    <span className="font-bold">Pending Amount: </span>
                    ₹{patient.restAmount || 0}
                  </p>
                </div>
                
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Amount Paid (₹) *
                  </label>
                  <input
                    type="number"
                    value={paymentData.amountPaid}
                    onChange={(e) => setPaymentData({...paymentData, amountPaid: e.target.value})}
                    min="1"
                    max={patient.restAmount}
                    required
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    placeholder="Enter amount"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Payment Method *
                  </label>
                  <select
                    value={paymentData.paymentMethod}
                    onChange={(e) => setPaymentData({...paymentData, paymentMethod: e.target.value})}
                    required
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={paymentData.notes}
                    onChange={(e) => setPaymentData({...paymentData, notes: e.target.value})}
                    rows="2"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    placeholder="Any notes about this payment..."
                  />
                </div>

                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-3 sm:pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPaymentForm(false)}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 border border-gray-300 rounded-lg sm:rounded-xl text-sm sm:text-base text-gray-700 hover:bg-gray-50 transition-all order-2 sm:order-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-green-600 text-white rounded-lg sm:rounded-xl hover:bg-green-700 transition-all transform hover:scale-105 text-sm sm:text-base order-1 sm:order-2"
                  >
                    Record Payment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDetails;