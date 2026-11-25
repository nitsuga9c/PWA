const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Category = require('./models/Category');
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const medicineRoutes = require('./routes/medicineRoutes');

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/medicines', medicineRoutes);

const CATEGORIAS_BASE = [
  { name: 'General', description: 'Medicamentos y productos de uso general' },
  { name: 'Analgésicos y Antiinflamatorios', description: 'Alivio del dolor e inflamación' },
  { name: 'Antibióticos', description: 'Tratamientos antibacterianos' },
  { name: 'Gastrointestinales', description: 'Salud digestiva y estomacal' },
  { name: 'Respiratorios y Antigripales', description: 'Vías respiratorias, tos y resfriado' },
  { name: 'Cardiovasculares y Metabólicos', description: 'Presión arterial, circulación y metabolismo' },
  { name: 'Dermatológicos', description: 'Cuidado y tratamiento de la piel' },
  { name: 'Vitaminas y Suplementos', description: 'Complementos vitamínicos y nutricionales' },
  { name: 'Material de Curación', description: 'Gasas, vendas, antisépticos y curación' },
];

async function seedCategories() {
  for (const cat of CATEGORIAS_BASE) {
    await Category.updateOne(
      { name: cat.name },
      { $setOnInsert: cat },
      { upsert: true }
    );
  }
}

const PORT = process.env.PORT || 5000;

// Conexión a Mongo y encendido del servidor
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Conectado a la base de datos MongoDB');
    await seedCategories();
    app.listen(PORT, () => {
      console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error('Error al conectar a MongoDB:', err));