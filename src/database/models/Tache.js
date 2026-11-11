import mongoose from 'mongoose';

// الشيمـا (Schema) متاع التاش (Tâche / Task)
const tacheSchema = new mongoose.Schema(
  {
    // عنوان التاش (لازم يكون موجود ومطلوب)
    titre: {
      type: String,
      required: [true, 'Le titre de la tâche est requis'],
      trim: true,
      alias: 'title',
    },
    // تفسير وتفاصيل عـ التاش
    description: {
      type: String,
      trim: true,
      default: '',
    },
    // حالة التاش: todo (مازالت)، doing (قاعد يخدم فيها)، done (كملت)
    statut: {
      type: String,
      enum: {
        values: ['todo', 'doing', 'done'],
        message: 'Le statut doit être "todo", "doing" ou "done"',
      },
      default: 'todo',
      lowercase: true,
      trim: true,
      alias: 'status',
    },
    // الديدلاين متاع التاش وقتاش يلزم تحضر (Deadline)
    deadline: {
      type: Date,
      alias: 'dateEcheance',
    },
    // البروجي التابعة ليه التاش هذي (الـ ID متاع البروجي)
    projet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Projet',
      required: [true, 'Le projet associé (ID) est requis'],
      alias: 'projetAssocie',
    },
    // شكون المستعمل اللي باش يخدم التاش هذي (الـ ID متاعو)
    utilisateurAssigne: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Utilisateur',
      default: null,
      alias: 'assigneA',
    },
    // وقتاش تصنعت التاش
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

const Tache = mongoose.models.Tache || mongoose.model('Tache', tacheSchema);

// نسجلو الاسم البديل 'Task' في المونغوز
if (!mongoose.models.Task) {
  mongoose.models.Task = Tache;
}

export default Tache;
