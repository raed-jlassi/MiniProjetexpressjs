import Tache from '../database/models/Tache.js';
import Projet from '../database/models/Projet.js';
import Utilisateur from '../database/models/Utilisateur.js';

// السيرفيس هذا مسؤول على اللوجيك الكل متاع إدارة التاشات (Gestion des tâches)

// 1. صنعان تاش جديدة مربوطة ببروجي
// القوانين:
// - كل تاش لازم تكون مربوطة ببروجي موجود
// - أي مستعمل مكنكتي عندو الحق يصنع تاش
// - الحالة ما تخرجش على: todo - doing - done
// - كان الـ manager كهو ينجم يعين تاش لمستعمل
export const creerTacheService = async ({
  titre,
  description,
  statut = 'todo',
  deadline,
  projetId,
  utilisateurAssigne,
  utilisateurConnecte,
}) => {
  if (!titre) {
    throw new Error('عنوان التاش إجباري، لازم تحط titre');
  }

  if (!projetId) {
    throw new Error('لازم تعطي الـ ID متاع البروجي اللي تابعة ليه التاش');
  }

  // نثبتو كان البروجي موجود أصلاً في الداتابايز
  const projetExiste = await Projet.findById(projetId);
  if (!projetExiste) {
    const err = new Error('البروجي المرتبط بالتاش ما فماش في الداتابايز');
    err.statutHttp = 404;
    throw err;
  }

  // التثبت في حالة التاش (Statut)
  const statutsAutorises = ['todo', 'doing', 'done'];
  const statutFinal = statut.trim().toLowerCase();
  if (!statutsAutorises.includes(statutFinal)) {
    const err = new Error('الحالة متاع التاش غالطة، يلزم تكون حصرية بين : todo - doing - done');
    err.statutHttp = 400;
    throw err;
  }

  // التثبت في التعيين (Affectation): كان الـ manager كهو عندو الحق يعين مستعمل
  let assigneA = null;
  if (utilisateurAssigne) {
    if (utilisateurConnecte.role !== 'manager') {
      const err = new Error('ممنوع: كان الـ manager عندو الحق يعين تاش لمستعمل معين');
      err.statutHttp = 403;
      throw err;
    }

    // نثبتو كان المستعمل المعين موجود في الداتابايز
    const userTrouve = await Utilisateur.findById(utilisateurAssigne);
    if (!userTrouve) {
      const err = new Error('المستعمل اللي تحب تعينلو التاش ما فماش في السيستام');
      err.statutHttp = 404;
      throw err;
    }
    assigneA = userTrouve._id;
  }

  // نصنعو التاش ونسجلوها
  const nouvelleTache = await Tache.create({
    titre,
    description: description || '',
    statut: statutFinal,
    deadline: deadline || null,
    projet: projetExiste._id,
    utilisateurAssigne: assigneA,
  });

  return await nouvelleTache.populate([
    { path: 'projet', select: 'nom statut proprietaire' },
    { path: 'utilisateurAssigne', select: 'nom login role' },
  ]);
};

// 2. جلب التاشات مع الفلترة، البحث والترتيب
export const obtenirTachesService = async ({
  utilisateur,
  projetId,
  recherche,
  statut,
  utilisateurAssigne,
  tri = 'dateCreation',
  ordre = 'desc',
}) => {
  const filtres = {};

  // كان حددنا بروجي معين نفلترو بيه
  if (projetId) {
    filtres.projet = projetId;
  }

  // القانون: المستعمل العادي ما يشوف كان تاشات بروجياتو ولا التاشات المعينة ليه شخصياً
  // الـ Manager يشوف التاشات الكل
  if (utilisateur.role !== 'manager' && !projetId) {
    const mesProjets = await Projet.find({ proprietaire: utilisateur._id }).select('_id');
    const mesProjetsIds = mesProjets.map((p) => p._id);

    filtres.$or = [
      { projet: { $in: mesProjetsIds } },
      { utilisateurAssigne: utilisateur._id },
    ];
  }

  // البحث بكلمة مفتاحية في العنوان ولا الوصف متاع التاش
  if (recherche) {
    const conditionRecherche = [
      { titre: { $regex: recherche, $options: 'i' } },
      { description: { $regex: recherche, $options: 'i' } },
    ];

    if (filtres.$or) {
      filtres.$and = [{ $or: filtres.$or }, { $or: conditionRecherche }];
      delete filtres.$or;
    } else {
      filtres.$or = conditionRecherche;
    }
  }

  // فلترة بالحالة (todo, doing, done)
  if (statut) {
    filtres.statut = statut.toLowerCase();
  }

  // فلترة بالمستعمل المعين
  if (utilisateurAssigne) {
    filtres.utilisateurAssigne = utilisateurAssigne;
  }

  // الترتيب (Tri)
  const directionTri = ordre.toLowerCase() === 'asc' ? 1 : -1;
  const optionsTri = { [tri]: directionTri };

  const taches = await Tache.find(filtres)
    .populate('projet', 'nom statut proprietaire')
    .populate('utilisateurAssigne', 'nom login role')
    .sort(optionsTri);

  return taches;
};

// 3. جلب تاش بالـ ID متاعها
export const obtenirTacheParIdService = async (tacheId) => {
  const tache = await Tache.findById(tacheId)
    .populate('projet', 'nom statut proprietaire')
    .populate('utilisateurAssigne', 'nom login role');

  if (!tache) {
    const err = new Error('التاش هذي ما لقيناهاش في الداتابايز');
    err.statutHttp = 404;
    throw err;
  }

  return tache;
};

// 4. تعديل تاش
export const modifierTacheService = async (tacheId, donnees, utilisateur) => {
  const tache = await Tache.findById(tacheId);
  if (!tache) {
    const err = new Error('التاش هذي ما لقيناهاش باش نبدلوها');
    err.statutHttp = 404;
    throw err;
  }

  const modifications = {};
  if (donnees.titre) modifications.titre = donnees.titre;
  if (donnees.description !== undefined) modifications.description = donnees.description;
  if (donnees.deadline !== undefined) modifications.deadline = donnees.deadline;

  // تثبت من الـ statut كان تبدل
  if (donnees.statut) {
    const statutNettoye = donnees.statut.trim().toLowerCase();
    const statutsAutorises = ['todo', 'doing', 'done'];
    if (!statutsAutorises.includes(statutNettoye)) {
      const err = new Error('الحالة متاع التاش غالطة، يلزم تكون حصرية بين : todo - doing - done');
      err.statutHttp = 400;
      throw err;
    }
    modifications.statut = statutNettoye;
  }

  // تثبت من تعيين المستعمل: كان الـ manager كهو ينجم يبدلو
  if (donnees.utilisateurAssigne !== undefined || donnees.assigneA !== undefined) {
    const nouveauUserAssigne = donnees.utilisateurAssigne || donnees.assigneA;

    if (utilisateur.role !== 'manager') {
      const err = new Error('ممنوع: كان الـ manager عندو الحق يعين ولا يبدل المستعمل المعين للتاش');
      err.statutHttp = 403;
      throw err;
    }

    if (nouveauUserAssigne) {
      const userTrouve = await Utilisateur.findById(nouveauUserAssigne);
      if (!userTrouve) {
        const err = new Error('المستعمل اللي تحب تعينلو التاش ما فماش في السيستام');
        err.statutHttp = 404;
        throw err;
      }
      modifications.utilisateurAssigne = userTrouve._id;
    } else {
      // تنحية التعيين
      modifications.utilisateurAssigne = null;
    }
  }

  const tacheModifiee = await Tache.findByIdAndUpdate(tacheId, modifications, {
    new: true,
    runValidators: true,
  })
    .populate('projet', 'nom statut proprietaire')
    .populate('utilisateurAssigne', 'nom login role');

  return tacheModifiee;
};

// 5. فونكسيون خاصة بالـ manager لتعيين تاش لمستعمل (Affectation)
export const assignerTacheService = async (tacheId, utilisateurId) => {
  const user = await Utilisateur.findById(utilisateurId);
  if (!user) {
    const err = new Error('المستعمل المطلوب تعيين التاش ليه ما فماش');
    err.statutHttp = 404;
    throw err;
  }

  const tache = await Tache.findByIdAndUpdate(
    tacheId,
    { utilisateurAssigne: user._id },
    { new: true }
  )
    .populate('projet', 'nom statut proprietaire')
    .populate('utilisateurAssigne', 'nom login role');

  if (!tache) {
    const err = new Error('التاش المطلوبة ما لقيناهاش');
    err.statutHttp = 404;
    throw err;
  }

  return tache;
};

// 6. فسخ تاش
export const supprimerTacheService = async (tacheId) => {
  const tacheSupprimee = await Tache.findByIdAndDelete(tacheId);
  if (!tacheSupprimee) {
    const err = new Error('التاش هذي ما لقيناهاش باش نفسخوها');
    err.statutHttp = 404;
    throw err;
  }

  return tacheSupprimee;
};

