const express = require('express');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { getAllUsersController,
        getAllDoctorsController,
        getAllAppointmentsController,
        updateAdminProfileController,
        addDoctorController,
        getAllPaymentsController,
        addWardController, getAllWardsController,
        updateBedStatusController
    } = require('../controllers/adminCtrl');

const router = express.Router();

// GET || Get all users
router.get('/getAllUsers', protect, isAdmin, getAllUsersController);

// GET || Get all doctors
router.get('/getAllDoctors', protect, isAdmin, getAllDoctorsController);

// Get all appointment
router.get('/getAllAppointments', protect, isAdmin, getAllAppointmentsController);

// PUT || Update profile info
router.put('/profile', protect, isAdmin, upload.single('profilePicture'), updateAdminProfileController);

// Add Doctor 
router.post('/add-doctor', protect, isAdmin, upload.single('profilePicture'), addDoctorController);

// Get All Payments Info
router.get('/getAllPayments', protect, isAdmin, getAllPaymentsController);

// Add Ward
router.post('/add-ward', protect, isAdmin, addWardController);

// Get All Ward Info
router.get('/get-all-wards', protect, getAllWardsController);

// Update bed Status
router.post('/update-bed-status', protect, isAdmin, updateBedStatusController);


module.exports = router;