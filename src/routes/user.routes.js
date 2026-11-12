import express from 'express';
import {
  getProfile,
  getAllUsers,
  getUserById,
  deleteUser,
} from '../controllers/user.controller.js';
import { authentifier, autoriserRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

// كل الروتات لهنا تستحق المستعمل يكون مكنكتي (Token valide)
router.use(authentifier);

// 1. نجيبو بروفيل المستعمل المكنكتي: GET /api/users/profile
router.get('/profile', getProfile);

// 2. نجيبو ليستة المستعملين الكل (خاصة بالـ manager فقط): GET /api/users
router.get('/', autoriserRoles('manager'), getAllUsers);

// 3. نجيبو مستعمل معين بالـ ID: GET /api/users/:id
router.get('/:id', getUserById);

// 4. نفسخو مستعمل (خاصة بالـ manager فقط): DELETE /api/users/:id
router.delete('/:id', autoriserRoles('manager'), deleteUser);

export default router;

