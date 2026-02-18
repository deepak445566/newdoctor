import express from 'express';
import {
  addPatient,
  getAllPatients,
  getUpcomingAppointments,
  updatePatientVisit,
  getPatientById,
  sendWhatsAppMessage,
  updatePayment,
  getPaymentHistory,
  getPendingPayments
} from '../controllers/patientController.js';

const router = express.Router();

// Patient routes
router.post('/add', addPatient);
router.get('/all', getAllPatients);
router.get('/upcoming', getUpcomingAppointments);
router.get('/pending-payments', getPendingPayments);
router.get('/:id', getPatientById);
router.get('/:id/payments', getPaymentHistory);
router.put('/visit/:id', updatePatientVisit);
router.put('/payment/:id', updatePayment);
router.post('/send-whatsapp', sendWhatsAppMessage);

export default router;