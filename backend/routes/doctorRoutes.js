const express = require('express');
const { protect, isDoctor } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); // Make sure to import this

const {
    getDoctorAppointmentsController,
    updateAppointmentStatusController,
    getMyPatientsController,
    updateAvailabilityController,
    getDoctorProfileController,
    updateDoctorProfileController
} = require('../controllers/doctorCtrl');

const router = express.Router();

// GET || Get doctor's appointments
router.get('/getDoctorAppointments', protect, isDoctor, getDoctorAppointmentsController);

// POST || Update appointment status
router.post('/updateAppointmentStatus', protect, isDoctor, updateAppointmentStatusController);

// --- NEW: Get My Patients Route (Protected) ---
router.get('/get-my-patients', protect, isDoctor, getMyPatientsController);

// --- NEW: Update Availability Route (Protected) ---
router.post('/update-availability', protect, isDoctor, updateAvailabilityController);

// GET || Get doctor profile
router.get('/profile', protect, isDoctor, getDoctorProfileController);

// PUT || Update doctor profile
router.put('/profile', protect, isDoctor, upload.single('profilePicture'), updateDoctorProfileController);




module.exports = router;