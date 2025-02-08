const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mongoose = require('mongoose');

// This is where we will register a user
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({username, email, password: hashedPassword});
        await user.save();

        console.log('Created user:', user); // Add this

        res.status(201).json({message: 'User created'});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

// This is where we will login a user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({email});

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({message: 'Invalid credentials'});
        }

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });

        console.log('Generated token:', token); // Add this
        console.log('Sending response with token'); // Add this

        res.json({token});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

router.get('/me', async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: 'Authorization token required' });
      }
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      res.json({
        id: user._id,
        username: user.username,
        email: user.email
      });
    } catch (err) {
      console.error('ME endpoint error:', err);
      res.status(401).json({ error: 'Invalid token' });
    }
  });

module.exports = router;