const express = require('express');
const upload = require('../middleware/uploadMiddleware');
const {
    registerController,
    verifyOtpController,
    loginController,
    forgotPasswordController,
    resetPasswordWithOtpController,
    getAllDoctorsController,
    getDoctorByIdController,
     getUserProfileController, 
    updateUserProfileController,
    doctorSlotsController,
    resendOtpController,
    getDoctorDetailsForBooking
} = require('../controllers/userCtrl');
const { protect } = require('../middleware/authMiddleware');

// Router object
const router = express.Router();

// --- AUTHENTICATION ROUTES ---
// POST || Register a new user (sends OTP)
router.post('/register', registerController);

// POST || Verify OTP and log in user
router.post('/verify-otp', verifyOtpController);

// POST || Login user
router.post('/login', loginController);

// POST || Forgot Password
router.post('/forgot-password', forgotPasswordController);

// PATCH || Reset Password
router.post('/reset-password-otp', resetPasswordWithOtpController);

// --- DOCTOR LISTING ROUTES (Public) ---
// GET || Get all doctors
router.get('/getAllDoctors', getAllDoctorsController);

// GET || Get single doctor by ID
router.get('/getDoctorById/:doctorId', getDoctorByIdController);

router.put('/profile', protect, upload.single('profilePicture'), updateUserProfileController);



// --- PROTECTED TEST ROUTE ---
// GET || Get User Profile
// We'll create the controller for this later, but we can protect the route now
router.get('/profile', protect, (req, res) => {
    res.status(200).send({
        success: true,
        message: 'Profile data',
        data: req.user // req.user is attached by the 'protect' middleware
    });
});

// GET || Get user profile data
router.get('/profile', protect, getUserProfileController);

// PUT || Update user profile data
router.put('/profile', protect, updateUserProfileController);

// --- NEW: Get Doctor Slots Route (Protected) ---
router.post('/doctor-slots', protect, doctorSlotsController);

// --- NEW: Resend OTP Route ---
router.post('/resend-otp', resendOtpController);

// --- NEW: Get Full Doctor Details Route (Can be public) ---
router.get('/doctor-details/:doctorId', getDoctorDetailsForBooking);



module.exports = router;
