const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { 
    bookAppointmentController,
    userAppointmentsController,
    checkAvailabilityController,
    cancelAppointmentController
  } = require('../controllers/appointmentCtrl');

const router = express.Router();

// Book a new appointment
router.post('/book-appointment', protect, bookAppointmentController);

// Get all appointments for a user
router.get('/user-appointments', protect, userAppointmentsController);

// Check Availability
router.post('/check-availability', protect, checkAvailabilityController);

// Cancel Appointment 
router.post('/cancel-appointment', protect, cancelAppointmentController);


module.exports = router;
