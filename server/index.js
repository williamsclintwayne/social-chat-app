require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const { Server } = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);

// This is the Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// This is the database connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.log('MongoDB connection error: ', err));

// This is the socket.io connection setup
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000', // This is the URL of the frontend
        methods: ['GET', 'POST']
    }
});

io.on('connection', (socket) => {
    console.log('User connected: ', socket.id);

    socket.on('sendMessage', (message) => {
        io.emit('receiveMessage', message);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected: ', socket.id);
    });
});

// This is the routes

app.use('/api/auth', require('./routes/auth'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));