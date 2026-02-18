import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { FiArrowLeft, FiCalendar, FiPhone, FiUser, FiMapPin, FiClock, FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast';

const PatientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showVisitForm, setShowVisitForm] = useState(false);
  const [visitData, setVisitData] = useState({
    treatment: '',
    notes: '',
    nextAppointmentDate: ''
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
      const response = await axios.put(`/patients/visit/${id}`, visitData);
      if (response.data.success) {
        toast.success('Visit updated successfully');
        setShowVisitForm(false);
        fetchPatientDetails();
      }
    } catch (error) {
      toast.error('Failed to update visit');
    }
  };

  const sendWhatsAppMessage = async (type) => {
    let message = '';
    
    if (type === 'thankyou') {
      message = `Dear ${patient.name}, thank you for visiting our dental clinic today. We hope you're feeling better! For any queries, please contact us.`;
    } else if (type === 'reminder') {
      message = `Dear ${patient.name}, this is a reminder for your dental appointment on ${format(new Date(patient.nextAppointmentDate), 'dd/MM/yyyy')}. Please visit us on time. Thank you!`;
    }

    try {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Patient not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/all-patients"
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <FiArrowLeft className="mr-2" />
            Back to Patients
          </Link>
        </div>

        {/* Patient Info Card */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Patient Information
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Personal details and medical information.
              </p>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => sendWhatsAppMessage('thankyou')}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                <FiSend className="mr-2" />
                Thank You
              </button>
              <button
                onClick={() => sendWhatsAppMessage('reminder')}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <FiCalendar className="mr-2" />
                Send Reminder
              </button>
            </div>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <FiUser className="mr-2" /> Full name
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {patient.name}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <FiPhone className="mr-2" /> Phone number
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {patient.phoneNo}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <FiMapPin className="mr-2" /> Address
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {patient.address}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {format(new Date(patient.dateOfBirth), 'dd/MM/yyyy')}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Doctor</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  Dr. {patient.doctorName}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Disease</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {patient.disease}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Prescription</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {patient.prescription}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Date of Joining</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {format(new Date(patient.dateOfJoining), 'dd/MM/yyyy')}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Next Appointment</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {format(new Date(patient.nextAppointmentDate), 'dd/MM/yyyy')}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Last Visit</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {format(new Date(patient.lastVisitDate), 'dd/MM/yyyy')}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Update Visit Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowVisitForm(!showVisitForm)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <FiClock className="mr-2" />
            {showVisitForm ? 'Cancel' : 'Record New Visit'}
          </button>
        </div>

        {/* Visit Form */}
        {showVisitForm && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Record New Visit
              </h3>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <form onSubmit={handleVisitSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Treatment Given
                  </label>
                  <textarea
                    value={visitData.treatment}
                    onChange={(e) => setVisitData({...visitData, treatment: e.target.value})}
                    rows="3"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Notes
                  </label>
                  <textarea
                    value={visitData.notes}
                    onChange={(e) => setVisitData({...visitData, notes: e.target.value})}
                    rows="2"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Next Appointment Date
                  </label>
                  <input
                    type="date"
                    value={visitData.nextAppointmentDate}
                    onChange={(e) => setVisitData({...visitData, nextAppointmentDate: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                  >
                    Save Visit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Visit History */}
        {visits.length > 0 && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Visit History
              </h3>
            </div>
            <div className="border-t border-gray-200">
              <ul className="divide-y divide-gray-200">
                {visits.map((visit, index) => (
                  <li key={index} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-600">
                          {format(new Date(visit.visitDate), 'dd/MM/yyyy')}
                        </p>
                        <p className="mt-1 text-sm text-gray-600">
                          <span className="font-medium">Treatment:</span> {visit.treatment}
                        </p>
                        {visit.notes && (
                          <p className="mt-1 text-sm text-gray-500">
                            <span className="font-medium">Notes:</span> {visit.notes}
                          </p>
                        )}
                        {visit.nextAppointmentDate && (
                          <p className="mt-1 text-sm text-gray-500">
                            <span className="font-medium">Next:</span>{' '}
                            {format(new Date(visit.nextAppointmentDate), 'dd/MM/yyyy')}
                          </p>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDetails;