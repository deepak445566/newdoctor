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
Patientrouterrouter.use(authAdmin);

Patientrouterrouter.post('/add', addPatient);
Patientrouterrouter.get('/all', getAllPatients);
Patientrouterrouter.get('/upcoming', getUpcomingAppointments);
Patientrouterrouter.get('/:id', getPatientById);
Patientrouterrouter.put('/visit/:id', updatePatientVisit);
Patientrouterrouter.post('/send-whatsapp', sendWhatsAppMessage);

export default router;