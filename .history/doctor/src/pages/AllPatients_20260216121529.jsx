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
        
        // Calculate stats
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with stats */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="group flex items-center text-gray-600 hover:text-gray-900 bg-white rounded-full px-4 py-2 shadow-sm hover:shadow transition-all"
              >
                <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span>
                <span className="text-sm font-medium">Back</span>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <span className="text-3xl mr-3">👥</span>
                  Patient Directory
                </h1>
                <p className="text-gray-600 mt-1">Manage and view all patient records</p>
              </div>
            </div>
            <Link
              to="/add-patient"
              className="group inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all"
            >
              <span className="mr-2 group-hover:scale-110 transition-transform">➕</span>
              Add New Patient
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Patients</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <span className="text-3xl">📊</span>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Today's Appointments</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.todayAppointments}</p>
                </div>
                <span className="text-3xl">📅</span>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Upcoming</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.upcoming}</p>
                </div>
                <span className="text-3xl">⏰</span>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-amber-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Now</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredPatients.length}</p>
                </div>
                <span className="text-3xl">👤</span>
              </div>
            </div>
          </div>

          {/* Search Bar with Filters */}
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                <input
                  type="text"
                  placeholder="Search by name, phone, disease, or doctor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <div className="flex gap-2">
                <select className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option>All Status</option>
                  <option>Active</option>
                  <option>Completed</option>
                  <option>Follow-up</option>
                </select>
                <button className="px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                  <span>📅</span>
                </button>
              </div>
            </div>
            
            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-xs text-gray-500 mr-2">Quick filters:</span>
              <button className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs hover:bg-blue-100 transition-colors">
                Today
              </button>
              <button className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs hover:bg-green-100 transition-colors">
                This Week
              </button>
              <button className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-xs hover:bg-purple-100 transition-colors">
                Follow-up
              </button>
              <button className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-xs hover:bg-amber-100 transition-colors">
                New Patients
              </button>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">{filteredPatients.length}</span> patients found
            {searchTerm && <span> for "<span className="text-blue-600">{searchTerm}</span>"</span>}
          </p>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Sort by:</span>
            <select className="text-sm border border-gray-200 rounded-lg px-2 py-1 bg-white">
              <option>Recent</option>
              <option>Name</option>
              <option>Next Appointment</option>
            </select>
          </div>
        </div>

        {/* Patients List */}
        {loading ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-md">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-3 text-gray-500">Loading patients...</p>
          </div>
        ) : filteredPatients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPatients.map((patient) => (
              <div
                key={patient._id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                {/* Card Header with Status */}
                <div className="relative h-24 bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white">
                      ID: {patient._id.slice(-6)}
                    </span>
                  </div>
                  <div className="absolute -bottom-8 left-4">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center">
                      <span className="text-3xl">👤</span>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="pt-10 p-4">
                  <Link to={`/patient/${patient._id}`} className="block">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                      {patient.name}
                    </h3>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="w-6">📞</span>
                        <span>{patient.phoneNo}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="w-6">👨‍⚕️</span>
                        <span>Dr. {patient.doctorName}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="w-6">🦷</span>
                        <span className="truncate">{patient.disease}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="w-6">📅</span>
                        <span>Next: {format(new Date(patient.nextAppointmentDate), 'dd MMM yyyy')}</span>
                      </div>
                    </div>
                  </Link>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => sendThankYouMessage(patient)}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors text-sm font-medium"
                    >
                      <span className="mr-1">💬</span>
                      Thank You
                    </button>
                    <Link
                      to={`/patient/${patient._id}`}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors text-sm font-medium"
                    >
                      <span className="mr-1">👁️</span>
                      Details
                    </Link>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500 flex items-center justify-between">
                  <span>📋 {patient.prescription.substring(0, 30)}...</span>
                  <span className="text-blue-600">→</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl shadow-md">
            <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
              <span className="text-5xl">🔍</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No patients found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search or add a new patient</p>
            <Link
              to="/add-patient"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md"
            >
              <span className="mr-2">➕</span>
              Add New Patient
            </Link>
          </div>
        )}

        {/* Pagination */}
        {filteredPatients.length > 0 && (
          <div className="mt-8 flex items-center justify-between bg-white rounded-xl shadow-md px-6 py-3">
            <p className="text-sm text-gray-600">
              Showing <span className="font-medium">1</span> to{' '}
              <span className="font-medium">{Math.min(10, filteredPatients.length)}</span> of{' '}
              <span className="font-medium">{filteredPatients.length}</span> results
            </p>
            <div className="flex gap-2">
              <button className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                ←
              </button>
              <button className="px-3 py-1 bg-blue-600 text-white rounded-lg">1</button>
              <button className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                2
              </button>
              <button className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                3
              </button>
              <button className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
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