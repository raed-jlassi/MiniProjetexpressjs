import mongoose from 'mongoose';

// الشيمـا (Schema) متاع البروجي (Projet / Project)
const projetSchema = new mongoose.Schema(
  {
    // اسم البروجي (لازم يكون موجود ومطلوب)
    nom: {
      type: String,
      required: [true, 'Le nom du projet est requis'],
      trim: true,
      alias: 'nomProjet',
    },
    // تفاصيل ووصف عـ البروجي
    description: {
      type: String,
      trim: true,
      default: '',
    },
    // مولى البروجي (الـ ID متاع المستعمل اللي عملو)
    proprietaire: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Utilisateur',
      required: [true, 'Le propriétaire du projet (ID utilisateur) est requis'],
      alias: 'propriétaire',
    },
    // الحالة متاع البروجي: en cours (يخدم)، terminé (حاضر)، ولا en pause (واقف)
    statut: {
      type: String,
      enum: {
        values: ['en cours', 'terminé', 'en pause'],
        message: 'Le statut doit être "en cours", "terminé" ou "en pause"',
      },
      default: 'en cours',
      set: (val) => {
        if (typeof val === 'string') {
          const v = val.trim().toLowerCase();
          // كان كتبها termine من غير accent نريڨلوها
          if (v === 'termine') return 'terminé';
          return v;
        }
        return val;
      },
      alias: 'status',
    },
    // وقتاش تصنع البروجي
    dateCreation: {
      type: Date,
      default: Date.now,
      alias: 'createdAt',
    },
  },
  {
    timestamps: { createdAt: false, updatedAt: 'dateModification' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Projet = mongoose.models.Projet || mongoose.model('Projet', projetSchema);

// نسجلو الاسم البديل 'Project' في المونغوز
if (!mongoose.models.Project) {
  mongoose.models.Project = Projet;
}

export default Projet;
