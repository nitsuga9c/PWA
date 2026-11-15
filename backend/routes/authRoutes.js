const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Registrar usuario o admin
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    const emailExists = await User.findOne({ email });
    if (emailExists) return res.status(400).json({ message: 'El correo ya existe.' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ name, email, password: hashedPassword, role: role || 'user' });
    const savedUser = await newUser.save();
    
    res.status(201).json({ message: 'Usuario creado exitosamente', userId: savedUser._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login (para Admin y Usuario normal)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Credenciales incorrectas.' });

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(400).json({ message: 'Credenciales incorrectas.' });

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );

    res.json({ token, role: user.role, name: user.name });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;