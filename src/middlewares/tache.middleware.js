// ميدلوير باش نثبتو بيه في حالة التاش (Statut)
// القانون: الحالة لازم تكون حصرية بين : todo - doing - done
export const verifierStatutTache = (req, res, next) => {
  const statut = req.body.statut || req.body.status;

  // كان ما حطش statut نتعداو، خاطر الـ default هو "todo"
  if (!statut) {
    return next();
  }

  const statutNettoye = statut.trim().toLowerCase();
  const statutsAutorises = ['todo', 'doing', 'done'];

  if (!statutsAutorises.includes(statutNettoye)) {
    return res.status(400).json({
      succes: false,
      message: 'الحالة متاع التاش غالطة، يلزم تكون حصرية بين : todo - doing - done',
    });
  }

  // نرجعو الـ statut منقح ونظيف
  req.body.statut = statutNettoye;
  next();
};

// ميدلوير يمنع المستعمل العادي من تعيين تاش لمستعمل
// القانون: كان الـ Manager كهو عندو الحق يعين تاش (affecter une tâche) لمستعمل
export const verifierAffectationTache = (req, res, next) => {
  const utilisateurAssigne = req.body.utilisateurAssigne || req.body.assigneA;

  // كان في الـ body فما مستعمل معين، والمستعمل الحالي موش manager نرجعولو 403
  if (utilisateurAssigne && req.utilisateur.role !== 'manager') {
    return res.status(403).json({
      succes: false,
      message: 'ممنوع: كان الـ manager عندو الحق يعين تاش لمستعمل معين',
    });
  }

  next();
};

