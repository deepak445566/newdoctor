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