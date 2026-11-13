import Projet from '../database/models/Projet.js';

// ميدلوير باش نثبتو بيه في ملكية البروجي (Owner ولا Manager)
// المستعمل العادي ينجم يبدل ولا يفسخ كان البروجي اللي عملو بيدو
// الـ Manager عندو الصلاحية الكاملة على البروجيات الكل
export const verifierAccesProjet = async (req, res, next) => {
  try {
    const { id } = req.params;

    // نلوجو عـ البروجي في قاعدة البيانات
    const projet = await Projet.findById(id);
    if (!projet) {
      return res.status(404).json({
        succes: false,
        message: 'البروجي هذا ما لقيناهوش في الداتابايز',
      });
    }

    // كان المستعمل manager عندو الحق يتعدى طول
    if (req.utilisateur.role === 'manager') {
      req.projet = projet;
      return next();
    }

    // كان مستعمل عادي، نثبتو كان هو مولى البروجي (propriétaire)
    if (!projet.proprietaire.equals(req.utilisateur._id)) {
      return res.status(403).json({
        succes: false,
        message: 'ما عندكش الحق تبدل ولا تفسخ بروجي موش متاعك، كان مولاه ولا الـ manager ينجم',
      });
    }

    // نسجلو البروجي في الـ req باش ما نعاودوش نلوجو عليه مرة أخرى
    req.projet = projet;
    next();
  } catch (error) {
    return res.status(400).json({
      succes: false,
      message: 'الـ ID متاع البروجي موش صحيح',
    });
  }
};

