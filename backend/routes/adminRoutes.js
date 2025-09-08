const express = require('express');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); // <-- ADD THIS LINE
const { getAllUsersController,
        getAllDoctorsController,
        // changeAccountStatusController,
        getAllAppointmentsController,
        updateAdminProfileController,
        changeAdminPasswordController,
        addDoctorController,
        getAllPaymentsController
    } = require('../controllers/adminCtrl');

const router = express.Router();

// GET || Get all users
router.get('/getAllUsers', protect, isAdmin, getAllUsersController);

// GET || Get all doctors
router.get('/getAllDoctors', protect, isAdmin, getAllDoctorsController);

// POST || Change account status
// router.post('/changeAccountStatus', protect, isAdmin, changeAccountStatusController);

router.get('/getAllAppointments', protect, isAdmin, getAllAppointmentsController);

// --- NEW: Admin Profile Routes ---
// PUT || Update profile info (handles file upload with 'upload.single')
router.put('/profile', protect, isAdmin, upload.single('profilePicture'), updateAdminProfileController);

// POST || Change password
router.post('/change-password', protect, isAdmin, changeAdminPasswordController);

// --- NEW: Add Doctor Route (Protected) ---
// This route now correctly handles the file and text fields
router.post('/add-doctor', protect, isAdmin, upload.single('profilePicture'), addDoctorController);

// --- NEW: Get All Payments Route (Protected) ---
router.get('/getAllPayments', protect, isAdmin, getAllPaymentsController);



module.exports = router;