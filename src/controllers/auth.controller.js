import { registerService, loginService } from '../services/auth.service.js';

// الكونترولور هذا يستقبل الـ requêtes متاع الـ Auth ويرجع الـ réponses المناسبة

// 1. تسجيل مستعمل جديد (Register)
export const register = async (req, res) => {
  try {
    const { nom, login, motDePasse, password, role } = req.body;

    // نقبلو motDePasse ولا password الزوز
    const mdp = motDePasse || password;

    const resultat = await registerService({
      nom,
      login,
      motDePasse: mdp,
      role,
    });

    return res.status(201).json({
      succes: true,
      message: 'تم تسجيل المستعمل بنجاح',
      donnees: resultat,
    });
  } catch (error) {
    return res.status(400).json({
      succes: false,
      message: error.message,
    });
  }
};

// 2. تسجيل الدخول (Login)
export const login = async (req, res) => {
  try {
    const { login, motDePasse, password } = req.body;

    // نقبلو motDePasse ولا password الزوز
    const mdp = motDePasse || password;

    const resultat = await loginService(login, mdp);

    return res.status(200).json({
      succes: true,
      message: 'تم تسجيل الدخول بنجاح، مرحبـا بيك!',
      donnees: resultat,
    });
  } catch (error) {
    return res.status(401).json({
      succes: false,
      message: error.message,
    });
  }
};

