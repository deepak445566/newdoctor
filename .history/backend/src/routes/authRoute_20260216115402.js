import express from 'express';
import { adminLogin, checkAdminAuth, adminLogout } from '../controllers/authController.js';

const Userrouter = express.Router();

Userrouter.post('/login', adminLogin);
Userrouter.get('/check-auth', checkAdminAuth);
Userrouter.post('/logout', adminLogout);

export default router;