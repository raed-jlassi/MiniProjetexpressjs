import express from 'express';
import {
  creer,
  lister,
  obtenirParId,
  modifier,
  assigner,
  supprimer,
} from '../controllers/tache.controller.js';
import { authentifier, autoriserRoles } from '../middlewares/auth.middleware.js';
import {
  verifierStatutTache,
  verifierAffectationTache,
} from '../middlewares/tache.middleware.js';

const router = express.Router();

// لازم المستعمل يكون مكنكتي (Token valide) للروتات هذي الكل
router.use(authentifier);

// 1. صنعان تاش جديدة مربوطة ببروجي: POST /api/taches
// الميدلوير يثبت في الـ statut (todo, doing, done) وفي تعيين المستعمل (كان manager كهو عندو الحق)
router.post('/', verifierStatutTache, verifierAffectationTache, creer);

// 2. جلب التاشات مع الفلترة، البحث والترتيب: GET /api/taches
router.get('/', lister);

// 3. جلب تاش واحدة بالـ ID: GET /api/taches/:id
router.get('/:id', obtenirParId);

// 4. تعديل تاش: PUT /api/taches/:id
router.put('/:id', verifierStatutTache, verifierAffectationTache, modifier);

// 5. روت خاص بالـ manager باش يعين تاش لمستعمل: PATCH /api/taches/:id/assigner
router.patch('/:id/assigner', autoriserRoles('manager'), assigner);

// 6. فسخ تاش: DELETE /api/taches/:id
router.delete('/:id', supprimer);

export default router;

