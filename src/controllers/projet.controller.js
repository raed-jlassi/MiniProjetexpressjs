import {
  creerProjetService,
  obtenirProjetsService,
  obtenirProjetParIdService,
  modifierProjetService,
  supprimerProjetService,
} from '../services/projet.service.js';
import { obtenirTachesService } from '../services/tache.service.js';

// الكونترولور هذا يستقبل الـ requêtes متاع البروجيات ويرجع الـ réponses

// 1. صنعان بروجي جديد
export const creer = async (req, res) => {
  try {
    const { nom, description, statut } = req.body;
    const proprietaireId = req.utilisateur._id;

    const nouveauProjet = await creerProjetService({
      nom,
      description,
      statut,
      proprietaireId,
    });

    return res.status(201).json({
      succes: true,
      message: 'تم صنع البروجي بنجاح',
      donnees: nouveauProjet,
    });
  } catch (error) {
    return res.status(400).json({
      succes: false,
      message: error.message,
    });
  }
};

// 2. جلب ليستة البروجيات مع البحث والترتيب
export const lister = async (req, res) => {
  try {
    const { search, recherche, statut, tri, sortBy, ordre, order } = req.query;

    const projets = await obtenirProjetsService({
      utilisateur: req.utilisateur,
      recherche: search || recherche,
      statut,
      tri: tri || sortBy || 'dateCreation',
      ordre: ordre || order || 'desc',
    });

    return res.status(200).json({
      succes: true,
      total: projets.length,
      donnees: projets,
    });
  } catch (error) {
    return res.status(500).json({
      succes: false,
      message: error.message,
    });
  }
};

// 3. جلب بروجي واحد بالـ ID
export const obtenirParId = async (req, res) => {
  try {
    const { id } = req.params;
    const projet = await obtenirProjetParIdService(id, req.utilisateur);

    return res.status(200).json({
      succes: true,
      donnees: projet,
    });
  } catch (error) {
    const codeHttp = error.statutHttp || 400;
    return res.status(codeHttp).json({
      succes: false,
      message: error.message,
    });
  }
};

// 4. تعديل بروجي
export const modifier = async (req, res) => {
  try {
    const { id } = req.params;
    const projetModifie = await modifierProjetService(id, req.body);

    return res.status(200).json({
      succes: true,
      message: 'تم تعديل البروجي بنجاح',
      donnees: projetModifie,
    });
  } catch (error) {
    return res.status(400).json({
      succes: false,
      message: error.message,
    });
  }
};

// 5. فسخ بروجي
export const supprimer = async (req, res) => {
  try {
    const { id } = req.params;
    await supprimerProjetService(id);

    return res.status(200).json({
      succes: true,
      message: 'تم فسخ البروجي والتاشات التابعة ليه الكل بنجاح',
    });
  } catch (error) {
    return res.status(400).json({
      succes: false,
      message: error.message,
    });
  }
};

// 6. جلب التاشات التابعة لبروجي معين
export const obtenirTachesDuProjet = async (req, res) => {
  try {
    const { id } = req.params;
    const { search, recherche, statut, tri, ordre } = req.query;

    // نتأكدو أولاً اللي المستعمل عندو الحق يدخل للبروجي
    await obtenirProjetParIdService(id, req.utilisateur);

    // نجيبو التاشات التابعة ليه
    const taches = await obtenirTachesService({
      utilisateur: req.utilisateur,
      projetId: id,
      recherche: search || recherche,
      statut,
      tri,
      ordre,
    });

    return res.status(200).json({
      succes: true,
      total: taches.length,
      donnees: taches,
    });
  } catch (error) {
    const codeHttp = error.statutHttp || 400;
    return res.status(codeHttp).json({
      succes: false,
      message: error.message,
    });
  }
};

