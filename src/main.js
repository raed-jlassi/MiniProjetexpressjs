import express from 'express';
import dotenv from 'dotenv';
import connectmongo from './database/database.js';

// نستوردو الروتات الكل متاع التطبيق
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import projetRoutes from './routes/projet.routes.js';
import tacheRoutes from './routes/tache.routes.js';

// نقراو المتغيرات من الـ .env
dotenv.config();

const app = express();

// نقبلو البيانات اللي تجينا بصيغة JSON
app.use(express.json());

// روت ترحيبي بسيط باش نثبتو السيرفر يخدم ولا لا
app.get('/', (req, res) => {
  res.json({ message: 'السيرفر يخدم مريڨل 🚀' });
});

// نربطو الروتات في التطبيق (Routes)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projets', projetRoutes);
app.use('/api/taches', tacheRoutes);

// نلانسيو السيرفر بعد ما نكنكتيو على قاعدة البيانات MongoDB
const PORT = process.env.PORT || 3000;

const start = async () => {
  await connectmongo();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

start();
