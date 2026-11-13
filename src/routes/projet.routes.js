import express from 'express';
import {
  creer,
  lister,
  obtenirParId,
  modifier,
  supprimer,
  obtenirTachesDuProjet,
} from '../controllers/projet.controller.js';
import { authentifier } from '../middlewares/auth.middleware.js';
import { verifierAccesProjet } from '../middlewares/projet.middleware.js';

const router = express.Router();

// لازم المستعمل يكون مكنكتي (Token valide) في الروتات هذي الكل
router.use(authentifier);

// 1. صنعان بروجي جديد (user ولا manager): POST /api/projets
router.post('/', creer);

// 2. جلب البروجيات مع الفلترة والترتيب والبحث: GET /api/projets
// (الـ manager يشوف البروجيات الكل، والـ user يشوف كان بروجياتو)
router.get('/', lister);

// 3. جلب بروجي واحد بالـ ID: GET /api/projets/:id
router.get('/:id', obtenirParId);

// 4. جلب التاشات التابعة لبروجي معين: GET /api/projets/:id/taches
router.get('/:id/taches', obtenirTachesDuProjet);

// 5. تعديل بروجي (كان مولاه ولا manager): PUT /api/projets/:id
router.put('/:id', verifierAccesProjet, modifier);

// 6. فسخ بروجي مع تاشاتو الكل (كان مولاه ولا manager): DELETE /api/projets/:id
router.delete('/:id', verifierAccesProjet, supprimer);

export default router;

