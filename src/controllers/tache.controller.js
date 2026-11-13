import {
  creerTacheService,
  obtenirTachesService,
  obtenirTacheParIdService,
  modifierTacheService,
  assignerTacheService,
  supprimerTacheService,
} from '../services/tache.service.js';

// الكونترولور هذا يستقبل الـ requêtes متاع التاشات ويرجع الـ réponses

// 1. صنعان تاش جديدة
export const creer = async (req, res) => {
  try {
    const { titre, description, statut, deadline, projet, projetId, utilisateurAssigne, assigneA } =
      req.body;

    const nouvelleTache = await creerTacheService({
      titre,
      description,
      statut,
      deadline,
      projetId: projet || projetId,
      utilisateurAssigne: utilisateurAssigne || assigneA,
      utilisateurConnecte: req.utilisateur,
    });

    return res.status(201).json({
      succes: true,
      message: 'تم صنع التاش بنجاح',
      donnees: nouvelleTache,
    });
  } catch (error) {
    const codeHttp = error.statutHttp || 400;
    return res.status(codeHttp).json({
      succes: false,
      message: error.message,
    });
  }
};

// 2. جلب ليستة التاشات مع الفلترة، البحث والترتيب
export const lister = async (req, res) => {
  try {
    const {
      projet,
      projetId,
      search,
      recherche,
      statut,
      utilisateurAssigne,
      assigneA,
      tri,
      sortBy,
      ordre,
      order,
    } = req.query;

    const taches = await obtenirTachesService({
      utilisateur: req.utilisateur,
      projetId: projet || projetId,
      recherche: search || recherche,
      statut,
      utilisateurAssigne: utilisateurAssigne || assigneA,
      tri: tri || sortBy || 'dateCreation',
      ordre: ordre || order || 'desc',
    });

    return res.status(200).json({
      succes: true,
      total: taches.length,
      donnees: taches,
    });
  } catch (error) {
    return res.status(500).json({
      succes: false,
      message: error.message,
    });
  }
};

// 3. جلب تاش بالـ ID
export const obtenirParId = async (req, res) => {
  try {
    const { id } = req.params;
    const tache = await obtenirTacheParIdService(id);

    return res.status(200).json({
      succes: true,
      donnees: tache,
    });
  } catch (error) {
    const codeHttp = error.statutHttp || 400;
    return res.status(codeHttp).json({
      succes: false,
      message: error.message,
    });
  }
};

// 4. تعديل تاش
export const modifier = async (req, res) => {
  try {
    const { id } = req.params;
    const tacheModifiee = await modifierTacheService(id, req.body, req.utilisateur);

    return res.status(200).json({
      succes: true,
      message: 'تم تعديل التاش بنجاح',
      donnees: tacheModifiee,
    });
  } catch (error) {
    const codeHttp = error.statutHttp || 400;
    return res.status(codeHttp).json({
      succes: false,
      message: error.message,
    });
  }
};

// 5. تعيين تاش لمستعمل (خاصة بالـ Manager فقط)
export const assigner = async (req, res) => {
  try {
    const { id } = req.params;
    const { utilisateurId, assigneA } = req.body;

    const idUtilisateurFinal = utilisateurId || assigneA;
    if (!idUtilisateurFinal) {
      return res.status(400).json({
        succes: false,
        message: 'لازم تبعث الـ ID متاع المستعمل اللي تحب تعينلو التاش',
      });
    }

    const tacheModifiee = await assignerTacheService(id, idUtilisateurFinal);

    return res.status(200).json({
      succes: true,
      message: 'تم تعيين التاش للمستعمل بنجاح',
      donnees: tacheModifiee,
    });
  } catch (error) {
    const codeHttp = error.statutHttp || 400;
    return res.status(codeHttp).json({
      succes: false,
      message: error.message,
    });
  }
};

// 6. فسخ تاش
export const supprimer = async (req, res) => {
  try {
    const { id } = req.params;
    await supprimerTacheService(id);

    return res.status(200).json({
      succes: true,
      message: 'تم فسخ التاش بنجاح',
    });
  } catch (error) {
    const codeHttp = error.statutHttp || 400;
    return res.status(codeHttp).json({
      succes: false,
      message: error.message,
    });
  }
};

