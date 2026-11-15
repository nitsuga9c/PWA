const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

// Reemplaza por la URL de tu base de datos si no está en el .env
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/farmacia_db';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' }
});

const User = mongoose.model('User', userSchema);

async function createAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Conectado a MongoDB...');

    // Eliminar si ya existe para evitar duplicados
    await User.deleteOne({ email: 'admin@farmacia.com' });

    // Encriptar la contraseña "123456"
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);

    const admin = new User({
      name: 'Administrador Principal',
      email: 'admin@farmacia.com',
      password: hashedPassword,
      role: 'admin'
    });

    await admin.save();
    console.log('Usuario Administrador creado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('Error al crear administrador:', error);
    process.exit(1);
  }
}

createAdmin();