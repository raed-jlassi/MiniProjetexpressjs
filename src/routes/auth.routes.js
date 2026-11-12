import express from 'express';
import { register, login } from '../controllers/auth.controller.js';

const router = express.Router();

// 1. روت تسجيل مستعمل جديد: POST /api/auth/register
router.post('/register', register);

// 2. روت تسجيل الدخول: POST /api/auth/login
router.post('/login', login);

export default router;

