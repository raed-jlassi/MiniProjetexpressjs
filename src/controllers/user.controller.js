import Utilisateur from '../database/models/Utilisateur.js';

// الكونترولور هذا خاص بالعمليات متاع المستعملين (Users)

// 1. نجيبو بروفيل المستعمل المكنكتي حالياً
export const getProfile = async (req, res) => {
  try {
    // المستعمل ديجا محطوط في req.utilisateur مالـ auth.middleware
    return res.status(200).json({
      succes: true,
      donnees: req.utilisateur,
    });
  } catch (error) {
    return res.status(500).json({
      succes: false,
      message: 'صار خطأ في السيرفر وقت جلب البروفيل',
    });
  }
};

// 2. نجيبو ليستة المستعملين الكل (تصلح للـ manager)
export const getAllUsers = async (req, res) => {
  try {
    const utilisateurs = await Utilisateur.find();
    return res.status(200).json({
      succes: true,
      total: utilisateurs.length,
      donnees: utilisateurs,
    });
  } catch (error) {
    return res.status(500).json({
      succes: false,
      message: 'صار خطأ في السيرفر وقت جلب المستعملين',
    });
  }
};

// 3. نجيبو مستعمل معين بالـ ID متاعو
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const utilisateur = await Utilisateur.findById(id);

    if (!utilisateur) {
      return res.status(404).json({
        succes: false,
        message: 'المستعمل هذا ما فماش في الداتابايز',
      });
    }

    return res.status(200).json({
      succes: true,
      donnees: utilisateur,
    });
  } catch (error) {
    return res.status(400).json({
      succes: false,
      message: 'الـ ID المبعوث موش صحيح',
    });
  }
};

// 4. نفسخو مستعمل بالـ ID
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const utilisateurSupprime = await Utilisateur.findByIdAndDelete(id);

    if (!utilisateurSupprime) {
      return res.status(404).json({
        succes: false,
        message: 'المستعمل هذا ما لقيناهوش باش نفسخوه',
      });
    }

    return res.status(200).json({
      succes: true,
      message: 'تم فسخ المستعمل بنجاح',
    });
  } catch (error) {
    return res.status(500).json({
      succes: false,
      message: 'صار خطأ وقت فسخ المستعمل',
    });
  }
};

