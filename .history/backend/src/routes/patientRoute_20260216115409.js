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

const Prouter = express.Router();

// All routes require admin authentication
router.use(authAdmin);

router.post('/add', addPatient);
router.get('/all', getAllPatients);
router.get('/upcoming', getUpcomingAppointments);
router.get('/:id', getPatientById);
router.put('/visit/:id', updatePatientVisit);
router.post('/send-whatsapp', sendWhatsAppMessage);

export default router;