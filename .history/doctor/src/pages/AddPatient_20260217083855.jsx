import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const AddPatient = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [registrationNo, setRegistrationNo] = useState(''); // Auto-generated registration number
  const [formData, setFormData] = useState({
    name: '',
    phoneNo: '',
    address: '',
    dateOfBirth: '',
    doctorName: '',
    prescription: '',
    disease: '',
    nextAppointmentDate: '',
    totalAmount: '',
    restAmount: ''
  });

  const [amountError, setAmountError] = useState('');

  // Generate preview registration number (for display only)
  const getPreviewRegNo = () => {
    const chars = '0123456789';
    let preview = '';
    for (let i = 0; i < 10; i++) {
      preview += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return preview;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // For amount fields, ensure only numbers are entered
    if (name === 'totalAmount' || name === 'restAmount') {
      // Allow empty string or numbers only
      if (value === '' || /^\d+$/.test(value)) {
        setFormData({
          ...formData,
          [name]: value
        });
        
        // Validate amounts
        if (name === 'totalAmount' && formData.restAmount) {
          const total = Number(value);
          const rest = Number(formData.restAmount);
          if (rest > total) {
            setAmountError('Rest amount cannot be greater than total amount');
          } else {
            setAmountError('');
          }
        } else if (name === 'restAmount' && formData.totalAmount) {
          const rest = Number(value);
          const total = Number(formData.totalAmount);
          if (rest > total) {
            setAmountError('Rest amount cannot be greater than total amount');
          } else {
            setAmountError('');
          }
        }
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate amounts
    const total = Number(formData.totalAmount);
    const rest = Number(formData.restAmount);
    
    if (rest > total) {
      toast.error('Rest amount cannot be greater than total amount');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/patients/add', {
        ...formData,
        totalAmount: total,
        restAmount: rest
      });
      
      if (response.data.success) {
        // Save the actual registration number from response
        setRegistrationNo(response.data.patient.registrationNo);
        toast.success(`Patient added successfully! Registration No: ${response.data.patient.registrationNo}`);
        navigate('/all-patients');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add patient');
    } finally {
      setLoading(false);
    }
  };

  // Calculate paid amount
  const calculatePaidAmount = () => {
    const total = Number(formData.totalAmount) || 0;
    const rest = Number(formData.restAmount) || 0;
    return total - rest;
  };

  // Determine payment status
  const getPaymentStatus = () => {
    const total = Number(formData.totalAmount) || 0;
    const rest = Number(formData.restAmount) || 0;
    
    if (total === 0) return 'pending';
    if (rest === 0) return 'paid';
    if (rest < total) return 'partial';
    return 'pending';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-4 sm:py-6 md:py-8">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Header with responsive design */}
        <div className="mb-6 sm:mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-3 sm:mb-4 group text-sm sm:text-base"
          >
            <span className="mr-1 sm:mr-2 group-hover:-translate-x-1 transition-transform">←</span>
            <span className="hidden xs:inline">Back to Dashboard</span>
            <span className="xs:hidden">Back</span>
          </Link>
          
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg">
              <span className="text-2xl sm:text-3xl">➕</span>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Add New Patient</h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
                <span className="hidden xs:inline">Fill in the patient details below</span>
                <span className="xs:hidden">Enter patient information</span>
              </p>
            </div>
          </div>
        </div>

     

        {/* Main Form Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden border border-indigo-50">
          <form onSubmit={handleSubmit} className="p-4 sm:p-5 md:p-6 lg:p-8">
            {/* Personal Information Section */}
            <div className="mb-6 sm:mb-8">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                <span className="text-xl sm:text-2xl mr-2">👤</span>
                <span>Personal Information</span>
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                {/* Name Field */}
                <div className="group">
                  <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm sm:text-base">👤</span>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="pl-8 sm:pl-10 block w-full border border-gray-300 rounded-lg sm:rounded-xl shadow-sm py-2 sm:py-3 px-2 sm:px-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-blue-300"
                    />
                  </div>
                </div>

                {/* Phone Number Field */}
                <div className="group">
                  <label htmlFor="phoneNo" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm sm:text-base">📞</span>
                    <input
                      type="tel"
                      name="phoneNo"
                      id="phoneNo"
                      required
                      value={formData.phoneNo}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className="pl-8 sm:pl-10 block w-full border border-gray-300 rounded-lg sm:rounded-xl shadow-sm py-2 sm:py-3 px-2 sm:px-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-blue-300"
                    />
                  </div>
                </div>

                {/* Date of Birth Field */}
                <div className="group">
                  <label htmlFor="dateOfBirth" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm sm:text-base">🎂</span>
                    <input
                      type="date"
                      name="dateOfBirth"
                      id="dateOfBirth"
                      required
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="pl-8 sm:pl-10 block w-full border border-gray-300 rounded-lg sm:rounded-xl shadow-sm py-2 sm:py-3 px-2 sm:px-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-blue-300"
                    />
                  </div>
                </div>

                {/* Address Field - Full width */}
                <div className="sm:col-span-2">
                  <label htmlFor="address" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 sm:top-3 text-gray-400 text-sm sm:text-base">📍</span>
                    <textarea
                      name="address"
                      id="address"
                      rows="2"
                      required
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter full address"
                      className="pl-8 sm:pl-10 block w-full border border-gray-300 rounded-lg sm:rounded-xl shadow-sm py-2 sm:py-3 px-2 sm:px-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-blue-300"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Medical Information Section */}
            <div className="mb-6 sm:mb-8">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                <span className="text-xl sm:text-2xl mr-2">🏥</span>
                <span>Medical Information</span>
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                {/* Doctor Name Field */}
                <div className="group">
                  <label htmlFor="doctorName" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Doctor Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm sm:text-base">👨‍⚕️</span>
                    <input
                      type="text"
                      name="doctorName"
                      id="doctorName"
                      required
                      value={formData.doctorName}
                      onChange={handleChange}
                      placeholder="Dr. Smith"
                      className="pl-8 sm:pl-10 block w-full border border-gray-300 rounded-lg sm:rounded-xl shadow-sm py-2 sm:py-3 px-2 sm:px-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-blue-300"
                    />
                  </div>
                </div>

                {/* Disease Field */}
                <div className="group">
                  <label htmlFor="disease" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Disease/Problem <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm sm:text-base">🦷</span>
                    <input
                      type="text"
                      name="disease"
                      id="disease"
                      required
                      value={formData.disease}
                      onChange={handleChange}
                      placeholder="Toothache, Cavity, etc."
                      className="pl-8 sm:pl-10 block w-full border border-gray-300 rounded-lg sm:rounded-xl shadow-sm py-2 sm:py-3 px-2 sm:px-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-blue-300"
                    />
                  </div>
                </div>

                {/* Prescription Field - Full width */}
                <div className="sm:col-span-2">
                  <label htmlFor="prescription" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Prescription <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 sm:top-3 text-gray-400 text-sm sm:text-base">💊</span>
                    <textarea
                      name="prescription"
                      id="prescription"
                      rows="3"
                      required
                      value={formData.prescription}
                      onChange={handleChange}
                      placeholder="Enter prescription details, medications, etc."
                      className="pl-8 sm:pl-10 block w-full border border-gray-300 rounded-lg sm:rounded-xl shadow-sm py-2 sm:py-3 px-2 sm:px-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-blue-300"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information Section */}
            <div className="mb-6 sm:mb-8">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                <span className="text-xl sm:text-2xl mr-2">💰</span>
                <span>Payment Details</span>
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                {/* Total Amount Field */}
                <div className="group">
                  <label htmlFor="totalAmount" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Total Amount (₹) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm sm:text-base">💵</span>
                    <input
                      type="text"
                      name="totalAmount"
                      id="totalAmount"
                      required
                      value={formData.totalAmount}
                      onChange={handleChange}
                      placeholder="5000"
                      className="pl-8 sm:pl-10 block w-full border border-gray-300 rounded-lg sm:rounded-xl shadow-sm py-2 sm:py-3 px-2 sm:px-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-blue-300"
                    />
                  </div>
                </div>

                {/* Rest Amount Field */}
                <div className="group">
                  <label htmlFor="restAmount" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Rest Amount (₹) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm sm:text-base">💸</span>
                    <input
                      type="text"
                      name="restAmount"
                      id="restAmount"
                      required
                      value={formData.restAmount}
                      onChange={handleChange}
                      placeholder="2000"
                      className="pl-8 sm:pl-10 block w-full border border-gray-300 rounded-lg sm:rounded-xl shadow-sm py-2 sm:py-3 px-2 sm:px-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-blue-300"
                    />
                  </div>
                </div>

                {/* Amount Error Message */}
                {amountError && (
                  <div className="sm:col-span-2">
                    <p className="text-xs sm:text-sm text-red-600 bg-red-50 rounded-lg p-2">
                      ⚠️ {amountError}
                    </p>
                  </div>
                )}

                {/* Payment Summary */}
                {(formData.totalAmount || formData.restAmount) && !amountError && (
                  <div className="sm:col-span-2 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                    <h3 className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Payment Summary</h3>
                    <div className="grid grid-cols-1 xs:grid-cols-3 gap-2 sm:gap-3">
                      <div className="bg-white rounded-lg p-2 text-center">
                        <p className="text-[10px] sm:text-xs text-gray-500">Total Amount</p>
                        <p className="text-sm sm:text-base font-bold text-gray-900">₹{Number(formData.totalAmount) || 0}</p>
                      </div>
                      <div className="bg-white rounded-lg p-2 text-center">
                        <p className="text-[10px] sm:text-xs text-gray-500">Paid Amount</p>
                        <p className="text-sm sm:text-base font-bold text-green-600">₹{calculatePaidAmount()}</p>
                      </div>
                      <div className="bg-white rounded-lg p-2 text-center">
                        <p className="text-[10px] sm:text-xs text-gray-500">Rest Amount</p>
                        <p className="text-sm sm:text-base font-bold text-orange-600">₹{Number(formData.restAmount) || 0}</p>
                      </div>
                    </div>
                    <div className="mt-2 flex justify-center">
                      <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium
                        ${getPaymentStatus() === 'paid' ? 'bg-green-100 text-green-800' : 
                          getPaymentStatus() === 'partial' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-gray-100 text-gray-800'}`}>
                        {getPaymentStatus() === 'paid' ? '✅ Paid' : 
                         getPaymentStatus() === 'partial' ? '⚠️ Partial Payment' : 
                         '⏳ Pending'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Appointment Section */}
            <div className="mb-6 sm:mb-8">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                <span className="text-xl sm:text-2xl mr-2">📅</span>
                <span>Appointment Details</span>
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                {/* Next Appointment Date Field */}
                <div className="group">
                  <label htmlFor="nextAppointmentDate" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Next Appointment Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm sm:text-base">📆</span>
                    <input
                      type="date"
                      name="nextAppointmentDate"
                      id="nextAppointmentDate"
                      required
                      value={formData.nextAppointmentDate}
                      onChange={handleChange}
                      className="pl-8 sm:pl-10 block w-full border border-gray-300 rounded-lg sm:rounded-xl shadow-sm py-2 sm:py-3 px-2 sm:px-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-blue-300"
                    />
                  </div>
                </div>

                {/* Helper Text - Responsive */}
                <div className="bg-blue-50 rounded-lg sm:rounded-xl p-3 sm:p-4 flex items-start space-x-2 sm:space-x-3">
                  <span className="text-xl sm:text-2xl flex-shrink-0">💡</span>
                  <div className="text-xs sm:text-sm text-blue-800">
                    <p className="font-medium mb-0.5 sm:mb-1">Quick Tip</p>
                    <p className="hidden xs:block">Make sure to enter accurate contact information for WhatsApp notifications.</p>
                    <p className="xs:hidden">Accurate contact info for WhatsApp.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions - Responsive */}
            <div className="flex flex-col-reverse xs:flex-row items-center justify-end gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-200">
              <Link
                to="/"
                className="w-full xs:w-auto px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all text-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading || amountError !== ''}
                className="w-full xs:w-auto inline-flex items-center justify-center px-4 sm:px-6 md:px-8 py-2 sm:py-3 border border-transparent text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all"
              >
                <span className="mr-1 sm:mr-2">{loading ? '⏳' : '💾'}</span>
                <span className="hidden xs:inline">{loading ? 'Saving Patient...' : 'Save Patient'}</span>
                <span className="xs:hidden">{loading ? 'Saving...' : 'Save'}</span>
              </button>
            </div>

            {/* Required Fields Note */}
            <p className="text-xs text-gray-400 mt-3 sm:mt-4 text-right">
              <span className="text-red-500">*</span> Required fields
            </p>
          </form>
        </div>

        {/* Info Cards - Responsive Grid */}
        <div className="mt-4 sm:mt-6 grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
          <div className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 shadow-sm border border-green-100">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <span className="text-xl sm:text-2xl">✅</span>
              <div>
                <p className="text-xs text-gray-500">WhatsApp Ready</p>
                <p className="text-xs sm:text-sm font-medium text-gray-700 truncate">Auto-notifications</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 shadow-sm border border-blue-100">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <span className="text-xl sm:text-2xl">🔔</span>
              <div>
                <p className="text-xs text-gray-500">Reminders</p>
                <p className="text-xs sm:text-sm font-medium text-gray-700 truncate">Appointment alerts</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 shadow-sm border border-purple-100 xs:col-span-2 sm:col-span-1">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <span className="text-xl sm:text-2xl">🔢</span>
              <div>
                <p className="text-xs text-gray-500">Unique ID</p>
                <p className="text-xs sm:text-sm font-medium text-gray-700 truncate">10-digit registration</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPatient;