import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AddPatient from './pages/AddPatient';
import AllPatients from './pages/AllPatients';
import PatientDetails from './pages/PatientDetails';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
 
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Toaster position="top-right" />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/add-patient" element={<PrivateRoute><AddPatient /></PrivateRoute>} />
            <Route path="/all-patients" element={<PrivateRoute><AllPatients /></PrivateRoute>} />
            <Route path="/patient/:id" element={<PrivateRoute><PatientDetails /></PrivateRoute>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
  
  );
}

export default App;