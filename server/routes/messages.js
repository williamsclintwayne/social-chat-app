const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); // Required import
const Message = require('../models/Message');
const User = require('../models/User');

// Get all messages
router.get('/', async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: -1 }).limit(50);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
    try {
      const userId = new mongoose.Types.ObjectId(req.body.userId);
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const message = new Message({
        text: req.body.text.trim(),
        userId: userId,
        sender: user.username
      });
  
      await message.save();
      res.status(201).json(message);
    } catch (err) {
      console.error('Message save error:', err);
      res.status(400).json({ error: 'Invalid message data' });
    }
  });

module.exports = router;