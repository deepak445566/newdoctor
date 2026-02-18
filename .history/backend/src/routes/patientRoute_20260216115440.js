import express from 'express';
import authAdmin from '../middleware/authMiddleware.js';
import {
  addPatient,
  getAllPatients,
  getUpcomingAppointments,
  updatePatientVisit,
  getPatientById,
  sendWhatsAppMessage
} from '../controllers/patientController.js';

const Patientrouter = express.Router();

// All routes require admin authentication
Patientrouter.use(authAdmin);

Patientrouter.post('/add', addPatient);
Patientrouter.get('/all', getAllPatients);
Patientrouter.get('/upcoming', getUpcomingAppointments);
Patientrouter.get('/:id', getPatientById);
Patientrouter.put('/visit/:id', updatePatientVisit);
Patientrouter.post('/send-whatsapp', sendWhatsAppMessage);

export default Parouter;