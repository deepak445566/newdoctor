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
Prouter.use(authAdmin);

Prouter.post('/add', addPatient);
Prouter.get('/all', getAllPatients);
Prouter.get('/upcoming', getUpcomingAppointments);
Prouter.get('/:id', getPatientById);
Prouter.put('/visit/:id', updatePatientVisit);
Prouter.post('/send-whatsapp', sendWhatsAppMessage);

export default router;