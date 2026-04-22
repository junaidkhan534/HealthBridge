const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

const http = require('http');
const { Server } = require('socket.io');



dotenv.config();

const initScheduler = require('./utils/reminderService');

// Connect to MongoDB
connectDB();

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json()); 

// SOCKET.IO SETUP 
//  Create an HTTP server from the Express app
const server = http.createServer(app);

// Initialize Socket.io with CORS allowing your React frontend
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Update if your frontend runs on a different port
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Share the 'io' instance with your Express controllers
app.set('socketio', io);

// Handle live connections
io.on('connection', (socket) => {
  console.log('A user connected via WebSocket:', socket.id);

  // When a doctor logs in, they join a private room using their MongoDB User ID
  socket.on('joinDoctorRoom', (doctorId) => {
    socket.join(doctorId);
    console.log(` Doctor ${doctorId} joined their private notification room`);
  });

  socket.on('joinPatientRoom', (patientId) => { 
    socket.join(patientId);
    console.log(` Patient ${patientId} joined their private notification room`);
    });

  socket.on('disconnect', () => {
    console.log(' User disconnected:', socket.id);
  });
});

// Simple route for testing
app.get('/', (req, res) => {
    res.send('<h1>Welcome to Backend API</h1>');
});

// API Routes
app.use('/api/v1/user', require('./routes/userRoutes'));
app.use('/api/v1/appointment', require('./routes/appointmentRoutes'));
app.use('/api/v1/admin', require('./routes/adminRoutes'));
app.use('/api/v1/doctor', require('./routes/doctorRoutes'));
app.use('/api/v1/payment', require('./routes/paymentRoutes'));


// This starts the daily check for follow-up reminders
initScheduler();


const PORT = process.env.PORT || 8080;


server.listen(PORT, () => {
    console.log(` Server & WebSockets are running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});