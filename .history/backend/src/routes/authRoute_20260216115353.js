import express from 'express';
import { adminLogin, checkAdminAuth, adminLogout } from '../controllers/authController.js';

const Userrouter = express.Router();

router.post('/login', adminLogin);
router.get('/check-auth', checkAdminAuth);
router.post('/logout', adminLogout);

export default router;