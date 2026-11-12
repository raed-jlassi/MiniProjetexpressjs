import { verifyToken } from '../utils/jwt.js';
import Utilisateur from '../database/models/Utilisateur.js';

// ميدلوير لحماية الـ routes اللي لازمها مستعمل مسجل ومكنكتي (Token valide)
export const authentifier = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // نثبتو كان الـ Header Authorization موجود ويبدا بكلمة Bearer
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        succes: false,
        message: 'ما تنجمش تدخل، لازمك تبعث التوكن متاعك (Bearer <token>)',
      });
    }

    // نقصو كلمة "Bearer " وناخذو التوكن صافي
    const token = authHeader.split(' ')[1];

    // نثبتو في صحة التوكن
    const payload = await verifyToken(token);

    // نلوجو عالمستعمل في قاعدة البيانات بالـ ID اللي مخبي في التوكن
    const utilisateur = await Utilisateur.findById(payload.id);
    if (!utilisateur) {
      return res.status(401).json({
        succes: false,
        message: 'المستعمل مولى هذا التوكن ما عادش موجود في السيستام',
      });
    }

    // نسجلو المستعمل في الـ request باش الفونكسيونات اللي بعدو ينجمو يستعملوه
    req.utilisateur = utilisateur;
    req.user = utilisateur;

    // نتعداو للخدمة اللي بعدها
    next();
  } catch (error) {
    return res.status(401).json({
      succes: false,
      message: 'التوكن غالط ولا وفات صلوحيتو، عاود سجل دخولك من جديد',
    });
  }
};

// ميدلوير إضافي لتحديد الصلاحيات بالرول (مثلا: كان manager كهو عندو الحق يدخل)
export const autoriserRoles = (...rolesAutorises) => {
  return (req, res, next) => {
    if (!req.utilisateur || !rolesAutorises.includes(req.utilisateur.role)) {
      return res.status(403).json({
        succes: false,
        message: 'ما عندكش الصلاحيات الكافية باش تعمل هذي العملية',
      });
    }
    next();
  };
};

