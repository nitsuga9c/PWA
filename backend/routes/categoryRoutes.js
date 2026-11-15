const router = require('express').Router();
const Category = require('../models/Category');
const { verifyAdmin } = require('../middleware/authMiddleware');

// Ver categorías (Público)
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear categoría (Solo Admin)
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const newCategory = new Category(req.body);
    const savedCategory = await newCategory.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;