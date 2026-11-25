const router = require('express').Router();
const mongoose = require('mongoose');
const Medicine = require('../models/Medicine');
const Category = require('../models/Category');
const { verifyAdmin } = require('../middleware/authMiddleware');

async function resolverCategoriaId(valorCategoria) {
  const nombreLimpio =
    typeof valorCategoria === 'string' && valorCategoria.trim()
      ? valorCategoria.trim()
      : 'General';

  if (mongoose.Types.ObjectId.isValid(nombreLimpio)) {
    const porId = await Category.findById(nombreLimpio);
    if (porId) return porId._id;
  }

  let categoriaDoc = await Category.findOne({ name: nombreLimpio });
  if (!categoriaDoc) {
    categoriaDoc = await Category.create({
      name: nombreLimpio,
      description: `Categoría ${nombreLimpio}`,
    });
  }

  return categoriaDoc._id;
}

// 1. LEER (GET) - Cualquier usuario puede ver el catálogo
router.get('/', async (req, res) => {
  try {
    const medicines = await Medicine.find().populate('categoria', 'name');
    res.json(medicines);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. CREAR (POST) - Solo Admin
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const payload = { ...req.body };
    if ('categoria' in payload || !payload.categoria) {
      payload.categoria = await resolverCategoriaId(payload.categoria);
    }

    const newMedicine = new Medicine(payload);
    const saved = await newMedicine.save();
    const populated = await saved.populate('categoria', 'name');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. ACTUALIZAR (PUT) - Solo Admin
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const payload = { ...req.body };
    if ('categoria' in payload) {
      payload.categoria = await resolverCategoriaId(payload.categoria);
    }

    const updated = await Medicine.findByIdAndUpdate(req.params.id, payload, { new: true })
      .populate('categoria', 'name');

    if (!updated) {
      return res.status(404).json({ message: 'Medicamento no encontrado en la base de datos' });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. ELIMINAR (DELETE) - Solo Admin
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const deletedMedicine = await Medicine.findByIdAndDelete(req.params.id);

    if (!deletedMedicine) {
      return res.status(404).json({ message: 'Medicamento no encontrado en la base de datos' });
    }

    res.json({ message: 'Medicamento eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;