const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// This is where we will register a user
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({username, email, password: hashedPassword});
        await user.save();

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

        res.json({token});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

module.exports = router;