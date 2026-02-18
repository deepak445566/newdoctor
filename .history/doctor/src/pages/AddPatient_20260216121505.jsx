import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const AddPatient = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phoneNo: '',
    address: '',
    dateOfBirth: '',
    doctorName: '',
    prescription: '',
    disease: '',
    nextAppointmentDate: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('/patients/add', formData);
      if (response.data.success) {
        toast.success('Patient added successfully!');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with decorative elements */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 group"
          >
            <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span>
            <span className="text-sm font-medium">Back to Dashboard</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-4 shadow-lg">
              <span className="text-3xl">➕</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Add New Patient</h1>
              <p className="text-gray-600 mt-1">Fill in the patient details below</p>
            </div>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-indigo-50">
          {/* Progress Steps */}
         

          <form onSubmit={handleSubmit} className="p-8">
            {/* Personal Information Section */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="text-2xl mr-2">👤</span>
                Personal Information
              </h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Name Field */}
                <div className="group">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">👤</span>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="pl-10 block w-full border border-gray-300 rounded-xl shadow-sm py-3 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-blue-300"
                    />
                  </div>
                </div>

                {/* Phone Number Field */}
                <div className="group">
                  <label htmlFor="phoneNo" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">📞</span>
                    <input
                      type="tel"
                      name="phoneNo"
                      id="phoneNo"
                      required
                      value={formData.phoneNo}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className="pl-10 block w-full border border-gray-300 rounded-xl shadow-sm py-3 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-blue-300"
                    />
                  </div>
                </div>

                {/* Date of Birth Field */}
                <div className="group">
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🎂</span>
                    <input
                      type="date"
                      name="dateOfBirth"
                      id="dateOfBirth"
                      required
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="pl-10 block w-full border border-gray-300 rounded-xl shadow-sm py-3 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-blue-300"
                    />
                  </div>
                </div>

                {/* Address Field - Full width */}
                <div className="sm:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-400">📍</span>
                    <textarea
                      name="address"
                      id="address"
                      rows="3"
                      required
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter full address"
                      className="pl-10 block w-full border border-gray-300 rounded-xl shadow-sm py-3 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-blue-300"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Medical Information Section */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="text-2xl mr-2">🏥</span>
                Medical Information
              </h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Doctor Name Field */}
                <div className="group">
                  <label htmlFor="doctorName" className="block text-sm font-medium text-gray-700 mb-1">
                    Doctor Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">👨‍⚕️</span>
                    <input
                      type="text"
                      name="doctorName"
                      id="doctorName"
                      required
                      value={formData.doctorName}
                      onChange={handleChange}
                      placeholder="Dr. Smith"
                      className="pl-10 block w-full border border-gray-300 rounded-xl shadow-sm py-3 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-blue-300"
                    />
                  </div>
                </div>

                {/* Disease Field */}
                <div className="group">
                  <label htmlFor="disease" className="block text-sm font-medium text-gray-700 mb-1">
                    Disease/Problem <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🦷</span>
                    <input
                      type="text"
                      name="disease"
                      id="disease"
                      required
                      value={formData.disease}
                      onChange={handleChange}
                      placeholder="Toothache, Cavity, etc."
                      className="pl-10 block w-full border border-gray-300 rounded-xl shadow-sm py-3 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-blue-300"
                    />
                  </div>
                </div>

                {/* Prescription Field - Full width */}
                <div className="sm:col-span-2">
                  <label htmlFor="prescription" className="block text-sm font-medium text-gray-700 mb-1">
                    Prescription <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-400">💊</span>
                    <textarea
                      name="prescription"
                      id="prescription"
                      rows="4"
                      required
                      value={formData.prescription}
                      onChange={handleChange}
                      placeholder="Enter prescription details, medications, etc."
                      className="pl-10 block w-full border border-gray-300 rounded-xl shadow-sm py-3 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-blue-300"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Appointment Section */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="text-2xl mr-2">📅</span>
                Appointment Details
              </h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Next Appointment Date Field */}
                <div className="group">
                  <label htmlFor="nextAppointmentDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Next Appointment Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">📆</span>
                    <input
                      type="date"
                      name="nextAppointmentDate"
                      id="nextAppointmentDate"
                      required
                      value={formData.nextAppointmentDate}
                      onChange={handleChange}
                      className="pl-10 block w-full border border-gray-300 rounded-xl shadow-sm py-3 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-blue-300"
                    />
                  </div>
                </div>

                {/* Helper Text */}
                <div className="bg-blue-50 rounded-xl p-4 flex items-start space-x-3">
                  <span className="text-2xl">💡</span>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Quick Tip</p>
                    <p>Make sure to enter accurate contact information for WhatsApp notifications.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <Link
                to="/"
                className="px-6 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-8 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all"
              >
                <span className="mr-2">{loading ? '⏳' : '💾'}</span>
                {loading ? 'Saving Patient...' : 'Save Patient'}
              </button>
            </div>

            {/* Required Fields Note */}
            <p className="text-xs text-gray-400 mt-4 text-right">
              <span className="text-red-500">*</span> Required fields
            </p>
          </form>
        </div>

        {/* Info Cards */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-green-100">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">✅</span>
              <div>
                <p className="text-xs text-gray-500">WhatsApp Ready</p>
                <p className="text-sm font-medium text-gray-700">Auto-notifications</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-100">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🔔</span>
              <div>
                <p className="text-xs text-gray-500">Reminders</p>
                <p className="text-sm font-medium text-gray-700">Appointment alerts</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-purple-100">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📋</span>
              <div>
                <p className="text-xs text-gray-500">Records</p>
                <p className="text-sm font-medium text-gray-700">Digital prescription</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPatient;