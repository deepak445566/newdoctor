import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { 
  FiArrowLeft, FiCalendar, FiPhone, FiUser, FiMapPin, 
  FiClock, FiSend, FiEdit2, FiFileText, FiHeart, 
  FiActivity, FiChevronDown, FiChevronUp, FiPlus,
  FiMail, FiDownload, FiShare2, FiMoreVertical
} from 'react-icons/fi';
import { 
  HiOutlineIdentification, HiOutlineClipboardList, 
  HiOutlineCalendar, HiOutlineUserGroup 
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const PatientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showVisitForm, setShowVisitForm] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [expandedVisit, setExpandedVisit] = useState(null);
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
        toast.success('Visit recorded successfully');
        setShowVisitForm(false);
        setVisitData({ treatment: '', notes: '', nextAppointmentDate: '' });
        fetchPatientDetails();
      }
    } catch (error) {
      toast.error('Failed to record visit');
    }
  };

  const sendWhatsAppMessage = async (type) => {
    let message = '';
    let subject = '';
    
   if (type === 'thankyou') {
  subject = 'Thank You for Your Visit';
  message = `Dear ${patient.name} 😊,

Thank you for visiting our dental clinic today 🦷. We truly appreciate the trust you place in us and hope you're feeling comfortable and well.

Your oral health is always our top priority. If you have any questions or concerns, please feel free to reach out anytime 📞.

Wishing you a healthy and confident smile! 

Warm regards,
Dr. ${patient.doctorName}`;
} 
else if (type === 'reminder') {
  subject = 'Appointment Reminder';
  message = `Dear ${patient.name} ,

This is a gentle reminder of your upcoming dental appointment on ${format(new Date(patient.nextAppointmentDate), 'EEEE, dd MMMM yyyy')} .

Kindly plan to arrive 10 minutes early for a smooth check-in process.

If you need to reschedule or have any queries, we are just a call away .

Looking forward to seeing you soon! 

Warm regards,
Dr. ${patient.doctorName}`;
}


    try {
      const response = await axios.post('/patients/send-whatsapp', {
        phoneNo: patient.phoneNo,
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
    { id: 'medical', label: 'Medical History', icon: HiOutlineClipboardList },
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
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 divide-x divide-gray-100 bg-gray-50 px-6 py-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{visits.length}</p>
              <p className="text-sm text-gray-500">Total Visits</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {patient.nextAppointmentDate ? format(new Date(patient.nextAppointmentDate), 'dd MMM') : 'N/A'}
              </p>
              <p className="text-sm text-gray-500">Next Visit</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {patient.lastVisitDate ? format(new Date(patient.lastVisitDate), 'dd MMM') : 'N/A'}
              </p>
              <p className="text-sm text-gray-500">Last Visit</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{patient.disease.split(' ').length}</p>
              <p className="text-sm text-gray-500">Conditions</p>
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

              {/* Right Column - Quick Actions & Timeline */}
              <div className="space-y-6">
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
                    <button className="w-full px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all flex items-center justify-center">
                      <FiCalendar className="mr-2" />
                      Schedule Appointment
                    </button>
                    <button className="w-full px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all flex items-center justify-center">
                      <FiFileText className="mr-2" />
                      Generate Report
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Patient Timeline</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <FiUser className="w-4 h-4 text-green-600" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Patient Registered</p>
                        <p className="text-xs text-gray-500">{format(new Date(patient.dateOfJoining), 'dd MMM yyyy')}</p>
                      </div>
                    </div>
                    {visits.slice(0, 3).map((visit, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <FiClock className="w-4 h-4 text-blue-600" />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Visit {visits.length - index}</p>
                          <p className="text-xs text-gray-500">{format(new Date(visit.visitDate), 'dd MMM yyyy')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
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
                          {visit.nextAppointmentDate && (
                            <div className="flex items-center text-sm text-green-600">
                              <FiCalendar className="mr-2" />
                              Next Appointment: {format(new Date(visit.nextAppointmentDate), 'dd MMMM yyyy')}
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

          {/* Medical History Tab */}
          {activeTab === 'medical' && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FiActivity className="mr-2 text-blue-600" />
                Medical History
              </h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Current Conditions</h4>
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-red-800">{patient.disease}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Treatment History</h4>
                  <div className="space-y-3">
                    {visits.map((visit, index) => (
                      <div key={index} className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm font-medium text-gray-800">{format(new Date(visit.visitDate), 'dd MMM yyyy')}</p>
                        <p className="text-sm text-gray-600 mt-1">{visit.treatment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
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
                    Additional Notes
                  </label>
                  <textarea
                    value={visitData.notes}
                    onChange={(e) => setVisitData({...visitData, notes: e.target.value})}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Any additional observations or notes..."
                  />
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
      </div>
    </div>
  );
};

export default PatientDetails;