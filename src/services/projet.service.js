import Projet from '../database/models/Projet.js';
import Tache from '../database/models/Tache.js';

// السيرفيس هذا مسؤول على اللوجيك الكل متاع إدارة البروجيات (Gestion des projets)

// 1. صنعان بروجي جديد (ينجم يصنعو أي مستعمل مكنكتي سواء user ولا manager)
export const creerProjetService = async ({ nom, description, statut, proprietaireId }) => {
  if (!nom) {
    throw new Error('اسم البروجي إجباري، لازم تحط اسم');
  }

  const nouveauProjet = await Projet.create({
    nom,
    description: description || '',
    statut: statut || 'en cours',
    proprietaire: proprietaireId,
  });

  return nouveauProjet;
};

// 2. جلب البروجيات مع عمليات البحث (Recherche) والترتيب (Tri)
// القانون: كان الـ manager كهو يشوف بروجيات الناس الكل، المستعمل العادي يشوف كان بروجياتو
export const obtenirProjetsService = async ({ utilisateur, recherche, statut, tri = 'dateCreation', ordre = 'desc' }) => {
  // نبنيو الفلتر (Query)
  const filtres = {};

  // القانون الأول: كان ماهوش manager، ما يشوف كان البروجيات اللي صنعهم هو بيدو
  if (utilisateur.role !== 'manager') {
    filtres.proprietaire = utilisateur._id;
  }

  // البحث بكلمة مفتاحية في اسم البروجي ولا في الـ description
  if (recherche) {
    filtres.$or = [
      { nom: { $regex: recherche, $options: 'i' } },
      { description: { $regex: recherche, $options: 'i' } },
    ];
  }

  // الفلترة بالحالة (en cours, terminé, en pause)
  if (statut) {
    filtres.statut = statut;
  }

  // الترتيب (Tri): نحددو الحقل واتجاه الترتيب (تصاعدي 1 ولا تنازلي -1)
  const directionTri = ordre.toLowerCase() === 'asc' ? 1 : -1;
  const optionsTri = { [tri]: directionTri };

  // نجيبو البروجيات مع تفاصيل المستعمل مولى البروجي
  const projets = await Projet.find(filtres)
    .populate('proprietaire', 'nom login role')
    .sort(optionsTri);

  return projets;
};

// 3. جلب بروجي واحد بالـ ID متاعو مع التثبت من الصلاحيات
export const obtenirProjetParIdService = async (projetId, utilisateur) => {
  const projet = await Projet.findById(projetId).populate('proprietaire', 'nom login role');
  if (!projet) {
    throw new Error('البروجي هذا ما لقيناهوش في الداتابايز');
  }

  // التثبت: كان موش manager وموش هو مولى البروجي، ما عندوش الحق يشوفو
  if (utilisateur.role !== 'manager' && !projet.proprietaire._id.equals(utilisateur._id)) {
    const erreur = new Error('ما عندكش الحق تشوف هذا البروجي، خاص بمستعمل آخر');
    erreur.statutHttp = 403;
    throw erreur;
  }

  return projet;
};

// 4. تعديل بروجي
export const modifierProjetService = async (projetId, donnees) => {
  const champsAutorises = {};
  if (donnees.nom) champsAutorises.nom = donnees.nom;
  if (donnees.description !== undefined) champsAutorises.description = donnees.description;
  if (donnees.statut) champsAutorises.statut = donnees.statut;

  const projetModifie = await Projet.findByIdAndUpdate(
    projetId,
    champsAutorises,
    { new: true, runValidators: true }
  ).populate('proprietaire', 'nom login role');

  return projetModifie;
};

// 5. فسخ بروجي مع التاشات التابعة ليه الكل (Nettoyage automatique)
export const supprimerProjetService = async (projetId) => {
  const projetSupprime = await Projet.findByIdAndDelete(projetId);
  if (!projetSupprime) {
    throw new Error('البروجي هذا ما لقيناهوش باش نفسخوه');
  }

  // نفسخو زادة التاشات الكل اللي مربوطين بالبروجي هذا
  await Tache.deleteMany({ projet: projetId });

  return projetSupprime;
};

