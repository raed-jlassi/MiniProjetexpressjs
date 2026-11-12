import Utilisateur from '../database/models/Utilisateur.js';
import { signToken } from '../utils/jwt.js';

// السيرفيس هذا مسؤول على اللوجيك الكل متاع الأوتنتيكاسيون (Inscription & Connexion)

// 1. فونكسيون باش نسجلو مستعمل جديد في السيستام (Register)
export const registerService = async ({ nom, login, motDePasse, role }) => {
  // نثبتو كان فما مستعمل عندو نفس اللوجين مسجل من قبل
  const utilisateurExiste = await Utilisateur.findOne({ login });
  if (utilisateurExiste) {
    throw new Error('هذا اللوجين مستعمل من قبل، اختار لوجين آخر');
  }

  // نصنعو كونت جديد، والمودباس باش يتشفر أوتوماتيك بالميدلوير pre-save متاع المودال
  const nouvelUtilisateur = await Utilisateur.create({
    nom,
    login,
    motDePasse,
    role: role || 'user',
  });

  // نصنعو التوكن JWT الخاص بالمستعمل الجديد
  const token = await signToken({
    id: nouvelUtilisateur._id.toString(),
    login: nouvelUtilisateur.login,
    role: nouvelUtilisateur.role,
  });

  return {
    utilisateur: nouvelUtilisateur,
    token,
  };
};

// 2. فونكسيون باش المستعمل يحل الكونت متاعو (Login)
export const loginService = async (login, motDePasse) => {
  // نثبتو اللي كتب اللوجين والمودباس الزوز
  if (!login || !motDePasse) {
    throw new Error('لازم تحط اللوجين والمودباس الزوز');
  }

  // نلوجو عالمستعمل في قاعدة البيانات باللوجين متاعو
  const utilisateur = await Utilisateur.findOne({ login });
  if (!utilisateur) {
    throw new Error('اللوجين ولا المودباس غالط، ثبت روحك');
  }

  // نثبتو في المودباس بالفونكسيون اللي زدناها في المودال verifierMotDePasse
  const motDePasseCorrect = await utilisateur.verifierMotDePasse(motDePasse);
  if (!motDePasseCorrect) {
    throw new Error('اللوجين ولا المودباس غالط، ثبت روحك');
  }

  // كان كل شي صحيح، نصنعولو توكن جديد
  const token = await signToken({
    id: utilisateur._id.toString(),
    login: utilisateur.login,
    role: utilisateur.role,
  });

  return {
    utilisateur,
    token,
  };
};

