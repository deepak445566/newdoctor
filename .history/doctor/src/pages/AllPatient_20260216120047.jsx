import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { FiSearch, FiUser, FiPhone, FiCalendar, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';

const AllPatients = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    const filtered = patients.filter(patient =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phoneNo.includes(searchTerm) ||
      patient.disease.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPatients(filtered);
  }, [searchTerm, patients]);

  const fetchPatients = async () => {
    try {
      const response = await axios.get('/patients/all');
      if (response.data.success) {
        setPatients(response.data.patients);
        setFilteredPatients(response.data.patients);
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
      }
    } catch (error) {
      toast.error('Failed to send WhatsApp message');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link
                to="/"
                className="mr-4 inline-flex items-center text-gray-600 hover:text-gray-900"
              >
                <FiArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">All Patients</h1>
            </div>
            <Link
              to="/add-patient"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Add New Patient
            </Link>
          </div>

          {/* Search Bar */}
          <div className="mt-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name, phone, or disease..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Patients List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        ) : filteredPatients.length > 0 ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredPatients.map((patient) => (
                <li key={patient._id} className="hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <Link to={`/patient/${patient._id}`} className="block">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <FiUser className="h-5 w-5 text-gray-400" />
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-blue-600 truncate">
                                {patient.name}
                              </p>
                              <div className="mt-1 flex items-center text-sm text-gray-500">
                                <FiPhone className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                <span>{patient.phoneNo}</span>
                                <span className="mx-2">•</span>
                                <FiCalendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                <span>Next: {format(new Date(patient.nextAppointmentDate), 'dd/MM/yyyy')}</span>
                              </div>
                              <p className="mt-1 text-sm text-gray-600">
                                <span className="font-medium">Disease:</span> {patient.disease}
                              </p>
                              <p className="mt-1 text-sm text-gray-600">
                                <span className="font-medium">Doctor:</span> {patient.doctorName}
                              </p>
                            </div>
                          </div>
                        </Link>
                      </div>
                      <div className="ml-4 flex-shrink-0 space-x-2">
                        <button
                          onClick={() => sendThankYouMessage(patient)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          Thank You
                        </button>
                        <Link
                          to={`/patient/${patient._id}`}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No patients found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllPatient;