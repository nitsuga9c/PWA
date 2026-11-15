const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  codigoArticulo: { type: String, required: true, unique: true },
  descripcion: { type: String, required: true },
  formula: { type: String },
  laboratorio: { type: String },
  precioPublico: { type: Number, required: true },
  precioNeto: { type: Number, required: true },
  codigoDeBarras: { type: String },
  existenciasTotal: { type: Number, default: 0 },
  categoria: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }
});

module.exports = mongoose.model('Medicine', medicineSchema);