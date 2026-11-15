const router = require('express').Router();
const Medicine = require('../models/Medicine');
const { verifyAdmin } = require('../middleware/authMiddleware');

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
    const newMedicine = new Medicine(req.body);
    const saved = await newMedicine.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. ACTUALIZAR (PUT) - Solo Admin
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const updated = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true });
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