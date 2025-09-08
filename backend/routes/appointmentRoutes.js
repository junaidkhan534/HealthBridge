const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { 
    bookAppointmentController,
    userAppointmentsController,
    checkAvailabilityController,
    cancelAppointmentController
  } = require('../controllers/appointmentCtrl');

const router = express.Router();

// POST || Book a new appointment
router.post('/book-appointment', protect, bookAppointmentController);

// GET || Get all appointments for a user
router.get('/user-appointments', protect, userAppointmentsController);

// --- NEW: Check Availability Route (Protected) ---
router.post('/check-availability', protect, checkAvailabilityController);

// --- NEW: Cancel Appointment Route (Protected) ---
router.post('/cancel-appointment', protect, cancelAppointmentController);


module.exports = router;
