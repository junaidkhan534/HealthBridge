const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // To parse JSON bodies

// Simple route for testing
app.get('/', (req, res) => {
    res.send('<h1>Welcome to Appointy Backend API</h1>');
});

// API Routes
app.use('/api/v1/user', require('./routes/userRoutes'));
app.use('/api/v1/appointment', require('./routes/appointmentRoutes'));
app.use('/api/v1/admin', require('./routes/adminRoutes'));
app.use('/api/v1/doctor', require('./routes/doctorRoutes'));
app.use('/api/v1/payment', require('./routes/paymentRoutes'));




// Port
const PORT = process.env.PORT || 8080;

// Start server
app.listen(PORT, () => {
    console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
