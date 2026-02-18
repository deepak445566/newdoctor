import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { 
  FiArrowLeft, FiCalendar, FiPhone, FiUser, FiMapPin, 
  FiClock, FiSend, FiEdit2, FiFileText, FiHeart, 
  FiActivity, FiChevronDown, FiChevronUp, FiPlus,
  FiMail, FiDownload, FiShare2, FiMoreVertical, FiDollarSign,
  FiCreditCard, FiTrendingUp, FiTrendingDown
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
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [visits, setVisits] = useState([]);
  const [paymentSummary, setPaymentSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showVisitForm, setShowVisitForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [expandedVisit, setExpandedVisit] = useState(null);
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

  useEffect(() => {
    fetchPatientDetails();
  }, [id]);

  const fetchPatientDetails = async () => {
    try {
      const response = await axios.get(`/patients/${id}`);
      if (response.data.success) {
        setPatient(response.data.patient);
        setVisits(response.data.visits || []);
        setPaymentSummary(response.data.paymentSummary);
      }
    } catch (error) {
      toast.error('Failed to fetch patient details');
      navigate('/all-patients');
    } finally {
      setLoading(false);
    }
  };

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

Payment Summary:
💰 Total Amount: ₹${patient?.totalAmount}
💵 Paid Amount: ₹${patient?.paidAmount}
💸 Rest Amount: ₹${patient?.restAmount}

Your oral health is always our top priority. If you have any questions or concerns, please feel free to reach out anytime.

Wishing you a healthy and confident smile!

Warm regards,
Dr. ${patient?.doctorName}`;
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-10 w-10 bg-blue-600 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading patient details...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center bg-white p-12 rounded-2xl shadow-xl">
          <div className="text-gray-400 mb-4">
            <HiOutlineUserGroup className="w-20 h-20 mx-auto" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Patient Not Found</h3>
          <p className="text-gray-500 mb-6">The patient you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/all-patients"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all transform hover:scale-105"
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/all-patients"
            className="group inline-flex items-center text-gray-600 hover:text-blue-600 transition-all"
          >
            <div className="bg-white p-2 rounded-xl shadow-sm group-hover:shadow-md transition-all">
              <FiArrowLeft className="w-5 h-5" />
            </div>
            <span className="ml-3 font-medium">Back to Dashboard</span>
          </Link>
        </div>

        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6 transform transition-all hover:shadow-2xl">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-lg">
                <FiUser className="w-12 h-12 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white">{patient.name}</h1>
                <div className="flex items-center mt-2 text-blue-100 space-x-4">
                  <span className="flex items-center">
                    <FiCalendar className="mr-2 w-4 h-4" />
                    Patient ID: {id.slice(-6).toUpperCase()}
                  </span>
                  <span className="flex items-center">
                    <FiUser className="mr-2 w-4 h-4" />
                    Age: {calculateAge(patient.dateOfBirth)} years
                  </span>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => sendWhatsAppMessage('thankyou')}
                  className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all transform hover:scale-105 flex items-center shadow-lg"
                >
                  <FiSend className="mr-2" />
                  Thank You
                </button>
                <button
                  onClick={() => sendWhatsAppMessage('reminder')}
                  className="px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-all transform hover:scale-105 flex items-center shadow-lg"
                >
                  <FiCalendar className="mr-2" />
                  Reminder
                </button>
                {patient.restAmount > 0 && (
                  <button
                    onClick={() => sendWhatsAppMessage('payment_reminder')}
                    className="px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all transform hover:scale-105 flex items-center shadow-lg"
                  >
                    <FiDollarSign className="mr-2" />
                    Payment Reminder
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-5 divide-x divide-gray-100 bg-gray-50 px-6 py-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{visits.length}</p>
              <p className="text-sm text-gray-500">Total Visits</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                ₹{patient.paidAmount || 0}
              </p>
              <p className="text-sm text-gray-500">Paid Amount</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                ₹{patient.restAmount || 0}
              </p>
              <p className="text-sm text-gray-500">Rest Amount</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {patient.nextAppointmentDate ? format(new Date(patient.nextAppointmentDate), 'dd MMM') : 'N/A'}
              </p>
              <p className="text-sm text-gray-500">Next Visit</p>
            </div>
            <div className="text-center">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(patient.paymentStatus)}`}>
                {getPaymentStatusText(patient.paymentStatus)}
              </span>
              <p className="text-sm text-gray-500 mt-1">Payment Status</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-6 font-medium text-sm border-b-2 transition-all flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Information Tab */}
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Personal Information */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FiUser className="mr-2 text-blue-600" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number</label>
                      <p className="mt-1 text-gray-900 flex items-center">
                        <FiPhone className="mr-2 text-gray-400" />
                        {patient.phoneNo}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</label>
                      <p className="mt-1 text-gray-900 flex items-center">
                        <FiMail className="mr-2 text-gray-400" />
                        {patient.email || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Date of Birth</label>
                      <p className="mt-1 text-gray-900">
                        {format(new Date(patient.dateOfBirth), 'dd MMMM yyyy')}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Age</label>
                      <p className="mt-1 text-gray-900">{calculateAge(patient.dateOfBirth)} years</p>
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Address</label>
                      <p className="mt-1 text-gray-900 flex items-start">
                        <FiMapPin className="mr-2 text-gray-400 mt-1 flex-shrink-0" />
                        {patient.address}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FiHeart className="mr-2 text-red-500" />
                    Medical Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Doctor</label>
                      <p className="mt-1 text-lg font-medium text-blue-600">Dr. {patient.doctorName}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Disease/Condition</label>
                      <div className="mt-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                          {patient.disease}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Current Prescription</label>
                      <p className="mt-2 p-4 bg-gray-50 rounded-xl text-gray-700 border border-gray-200">
                        {patient.prescription}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Quick Actions & Payment Summary */}
              <div className="space-y-6">
                {/* Payment Summary Card */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <HiOutlineCurrencyRupee className="mr-2 text-green-600" />
                    Payment Summary
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
                      <span className="text-sm font-medium text-gray-600">Total Amount</span>
                      <span className="text-xl font-bold text-blue-600">₹{patient.totalAmount || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
                      <span className="text-sm font-medium text-gray-600">Paid Amount</span>
                      <span className="text-xl font-bold text-green-600">₹{patient.paidAmount || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-xl">
                      <span className="text-sm font-medium text-gray-600">Rest Amount</span>
                      <span className="text-xl font-bold text-orange-600">₹{patient.restAmount || 0}</span>
                    </div>
                    <div className="mt-4">
                      <button
                        onClick={() => setShowPaymentForm(true)}
                        className="w-full px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all flex items-center justify-center"
                      >
                        <HiOutlineCash className="mr-2" />
                        Record Payment
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => setShowVisitForm(!showVisitForm)}
                      className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center"
                    >
                      <FiPlus className="mr-2" />
                      Record New Visit
                    </button>
                    <button className="w-full px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all flex items-center justify-center">
                      <FiCalendar className="mr-2" />
                      Schedule Appointment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Payment History</h3>
                <button
                  onClick={() => setShowPaymentForm(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all flex items-center text-sm"
                >
                  <FiPlus className="mr-2" />
                  New Payment
                </button>
              </div>

              {visits.filter(v => v.amountPaid > 0).length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {visits.filter(v => v.amountPaid > 0).map((visit, index) => (
                    <div key={index} className="p-6 hover:bg-gray-50 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="bg-green-100 p-3 rounded-xl">
                            <HiOutlineCurrencyRupee className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              Payment of ₹{visit.amountPaid}
                            </p>
                            <p className="text-sm text-gray-500">
                              {format(new Date(visit.visitDate), 'EEEE, dd MMMM yyyy')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            visit.paymentMethod === 'cash' ? 'bg-green-100 text-green-800' :
                            visit.paymentMethod === 'card' ? 'bg-blue-100 text-blue-800' :
                            visit.paymentMethod === 'upi' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {visit.paymentMethod?.toUpperCase()}
                          </span>
                          <button
                            onClick={() => setExpandedVisit(expandedVisit === `payment-${index}` ? null : `payment-${index}`)}
                            className="p-2 hover:bg-gray-200 rounded-full transition-all"
                          >
                            {expandedVisit === `payment-${index}` ? (
                              <FiChevronUp className="w-5 h-5 text-gray-500" />
                            ) : (
                              <FiChevronDown className="w-5 h-5 text-gray-500" />
                            )}
                          </button>
                        </div>
                      </div>

                      {expandedVisit === `payment-${index}` && (
                        <div className="mt-4 ml-16 space-y-3">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Treatment:</p>
                            <p className="mt-1 text-gray-600">{visit.treatment}</p>
                          </div>
                          {visit.notes && (
                            <div>
                              <p className="text-sm font-medium text-gray-700">Notes:</p>
                              <p className="mt-1 text-gray-600">{visit.notes}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <HiOutlineCurrencyRupee className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No Payment History</h3>
                  <p className="text-gray-500 mb-4">No payments have been recorded for this patient yet.</p>
                  <button
                    onClick={() => setShowPaymentForm(true)}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all"
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
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Visit History</h3>
                <button
                  onClick={() => setShowVisitForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all flex items-center text-sm"
                >
                  <FiPlus className="mr-2" />
                  New Visit
                </button>
              </div>

              {visits.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {visits.map((visit, index) => (
                    <div key={index} className="p-6 hover:bg-gray-50 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="bg-blue-100 p-3 rounded-xl">
                            <FiCalendar className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {format(new Date(visit.visitDate), 'EEEE, dd MMMM yyyy')}
                            </p>
                            <p className="text-sm text-gray-500">Visit #{visits.length - index}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {visit.amountPaid > 0 && (
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                              ₹{visit.amountPaid} paid
                            </span>
                          )}
                          <button
                            onClick={() => setExpandedVisit(expandedVisit === index ? null : index)}
                            className="p-2 hover:bg-gray-200 rounded-full transition-all"
                          >
                            {expandedVisit === index ? (
                              <FiChevronUp className="w-5 h-5 text-gray-500" />
                            ) : (
                              <FiChevronDown className="w-5 h-5 text-gray-500" />
                            )}
                          </button>
                        </div>
                      </div>

                      {expandedVisit === index && (
                        <div className="mt-4 ml-16 space-y-3">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Treatment Given:</p>
                            <p className="mt-1 p-3 bg-gray-50 rounded-lg text-gray-600">{visit.treatment}</p>
                          </div>
                          {visit.notes && (
                            <div>
                              <p className="text-sm font-medium text-gray-700">Notes:</p>
                              <p className="mt-1 text-gray-600">{visit.notes}</p>
                            </div>
                          )}
                          {visit.prescription && (
                            <div>
                              <p className="text-sm font-medium text-gray-700">Prescription:</p>
                              <p className="mt-1 text-gray-600">{visit.prescription}</p>
                            </div>
                          )}
                          {visit.nextAppointmentDate && (
                            <div className="flex items-center text-sm text-green-600">
                              <FiCalendar className="mr-2" />
                              Next Appointment: {format(new Date(visit.nextAppointmentDate), 'dd MMMM yyyy')}
                            </div>
                          )}
                          {visit.amountPaid > 0 && (
                            <div className="flex items-center text-sm text-green-600">
                              <HiOutlineCurrencyRupee className="mr-2" />
                              Payment: ₹{visit.amountPaid} ({visit.paymentMethod})
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FiClock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No Visit History</h3>
                  <p className="text-gray-500 mb-4">No visits have been recorded for this patient yet.</p>
                  <button
                    onClick={() => setShowVisitForm(true)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"
                  >
                    <FiPlus className="mr-2" />
                    Record First Visit
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Visit Form Modal */}
        {showVisitForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 transform transition-all">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">Record New Visit</h3>
                <button
                  onClick={() => setShowVisitForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-all"
                >
                  <FiChevronDown className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <form onSubmit={handleVisitSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Treatment Given *
                  </label>
                  <textarea
                    value={visitData.treatment}
                    onChange={(e) => setVisitData({...visitData, treatment: e.target.value})}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Describe the treatment provided..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prescription
                  </label>
                  <textarea
                    value={visitData.prescription}
                    onChange={(e) => setVisitData({...visitData, prescription: e.target.value})}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Enter prescription details..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    value={visitData.notes}
                    onChange={(e) => setVisitData({...visitData, notes: e.target.value})}
                    rows="2"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Any additional observations or notes..."
                  />
                </div>
                
                {/* Payment Section in Visit Form */}
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-md font-medium text-gray-800 mb-3">Payment Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Amount Paid (₹)
                      </label>
                      <input
                        type="number"
                        value={visitData.amountPaid}
                        onChange={(e) => setVisitData({...visitData, amountPaid: e.target.value})}
                        min="0"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Method
                      </label>
                      <select
                        value={visitData.paymentMethod}
                        onChange={(e) => setVisitData({...visitData, paymentMethod: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Next Appointment Date
                  </label>
                  <input
                    type="date"
                    value={visitData.nextAppointmentDate}
                    onChange={(e) => setVisitData({...visitData, nextAppointmentDate: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowVisitForm(false)}
                    className="px-6 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all transform hover:scale-105"
                  >
                    Save Visit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Payment Form Modal */}
        {showPaymentForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 transform transition-all">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">Record Payment</h3>
                <button
                  onClick={() => setShowPaymentForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-all"
                >
                  <FiChevronDown className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <form onSubmit={handlePaymentSubmit} className="p-6 space-y-4">
                <div className="bg-blue-50 p-4 rounded-xl mb-4">
                  <p className="text-sm text-blue-800">
                    <span className="font-bold">Pending Amount: </span>
                    ₹{patient.restAmount || 0}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount Paid (₹) *
                  </label>
                  <input
                    type="number"
                    value={paymentData.amountPaid}
                    onChange={(e) => setPaymentData({...paymentData, amountPaid: e.target.value})}
                    min="1"
                    max={patient.restAmount}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    placeholder="Enter amount"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method *
                  </label>
                  <select
                    value={paymentData.paymentMethod}
                    onChange={(e) => setPaymentData({...paymentData, paymentMethod: e.target.value})}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={paymentData.notes}
                    onChange={(e) => setPaymentData({...paymentData, notes: e.target.value})}
                    rows="2"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    placeholder="Any notes about this payment..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPaymentForm(false)}
                    className="px-6 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all transform hover:scale-105"
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