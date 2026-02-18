import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, UserPlus, Calendar, LogOut, Activity } from 'lucide-react';

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <a className="w-8 h-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-800">DentalClinic</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">{user.email}</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Welcome back!</h1>
          <p className="text-gray-600 mt-2">Manage your dental clinic efficiently</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-primary-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Patients</p>
                <p className="text-3xl font-bold text-gray-800">150</p>
              </div>
              <Users className="w-12 h-12 text-primary-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Today's Appointments</p>
                <p className="text-3xl font-bold text-gray-800">8</p>
              </div>
              <Calendar className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Upcoming (10 days)</p>
                <p className="text-3xl font-bold text-gray-800">24</p>
              </div>
              <Activity className="w-12 h-12 text-yellow-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/add-patient" className="group">
            <div className="bg-white rounded-xl shadow-md p-8 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary-200 transition-colors">
                <UserPlus className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Add New Patient</h3>
              <p className="text-gray-600">Register a new patient with complete details</p>
            </div>
          </Link>

          <Link to="/all-patients" className="group">
            <div className="bg-white rounded-xl shadow-md p-8 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">All Patients</h3>
              <p className="text-gray-600">View and manage all registered patients</p>
            </div>
          </Link>

          <Link to="/upcoming" className="group">
            <div className="bg-white rounded-xl shadow-md p-8 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:bg-yellow-200 transition-colors">
                <Calendar className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Upcoming Appointments</h3>
              <p className="text-gray-600">Check patients with appointments in next 10 days</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;