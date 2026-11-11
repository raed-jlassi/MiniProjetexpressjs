import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// الشيمـا (Schema) متاع المستعمل (Utilisateur / User)
const utilisateurSchema = new mongoose.Schema(
  {
    // اسم المستعمل (لازم يكون موجود)
    nom: {
      type: String,
      required: [true, 'Le nom est requis'],
      trim: true,
    },
    // اللوجين متاع الكونت (لازم يكون فريد وما يتعاودش)
    login: {
      type: String,
      required: [true, 'Le login est requis'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    // المودباس (مشفر ومحمي)
    motDePasse: {
      type: String,
      required: [true, 'Le mot de passe est requis'],
      minlength: [4, 'Le mot de passe doit contenir au moins 4 caractères'],
      alias: 'password',
    },
    // الرول متاع المستعمل: يا إما مستعمل عادي (user) ولا شاف (manager)
    role: {
      type: String,
      enum: {
        values: ['user', 'manager'],
        message: 'Le rôle doit être "user" ou "manager"',
      },
      default: 'user',
      alias: 'rôle',
    },
    // تاريخ وقتاش تصنع الكونت (par défaut تاريخ اللحظة هذي)
    dateCreation: {
      type: Date,
      default: Date.now,
      alias: 'createdAt',
    },
  },
  {
    timestamps: { createdAt: false, updatedAt: 'dateModification' },
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        // نحيو المودباس وقت نرجعو الداتا في الـ JSON باش ما يظهرش لحد
        delete ret.motDePasse;
        delete ret.password;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// ميدلوير (pre-save) يتعدى قبل ما نسجلو في الداتابايز باش يشفر المودباس بـ bcrypt
utilisateurSchema.pre('save', async function () {
  // كان المودباس ما تبدلش، نتعداو طول
  if (!this.isModified('motDePasse')) return;

  // كان المودباس ديجا مشفر بـ bcrypt ما نعاودوش نشفروه مرة أخرى
  if (/^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(this.motDePasse)) return;

  const salt = await bcrypt.genSalt(10);
  this.motDePasse = await bcrypt.hash(this.motDePasse, salt);
});

// فونكسيون نثبتو بيها المودباس صحيح ولا غالط وقت اللي يجي يدخل (login)
utilisateurSchema.methods.verifierMotDePasse = async function (candidatMotDePasse) {
  return bcrypt.compare(candidatMotDePasse, this.motDePasse);
};

// نفس الفونكسيون بالأنقليزي باش تسهل الخدمة
utilisateurSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.motDePasse);
};

const Utilisateur =
  mongoose.models.Utilisateur || mongoose.model('Utilisateur', utilisateurSchema);

// نسجلو الاسم البديل 'User' باش كان عيطنالو هكاك يلقاه طول
if (!mongoose.models.User) {
  mongoose.models.User = Utilisateur;
}

export default Utilisateur;
