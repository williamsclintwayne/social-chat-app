const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    text: {
      type: String,
      required: [true, 'Message text is required'],
      minlength: [1, 'Message cannot be empty'],
      maxlength: [500, 'Message too long (max 500 characters)']
    },
    sender: {
      type: String,
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
});

module.exports = mongoose.model('Message', messageSchema);