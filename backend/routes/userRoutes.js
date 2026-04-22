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
    getDoctorDetailsForBooking,
    deleteAllNotificationController
} = require('../controllers/userCtrl');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Register a new user
router.post('/register', registerController);

// Verify OTP and log in user
router.post('/verify-otp', verifyOtpController);

// Login user
router.post('/login', loginController);

// Forgot Password
router.post('/forgot-password', forgotPasswordController);

// Reset Password
router.post('/reset-password-otp', resetPasswordWithOtpController);

// Get all doctors
router.get('/getAllDoctors', getAllDoctorsController);

// Get single doctor by ID
router.get('/getDoctorById/:doctorId', getDoctorByIdController);

// Update Profile
router.put('/profile', protect, upload.single('profilePicture'), updateUserProfileController);

// Get User Profile
router.get('/profile', protect, (req, res) => {
    res.status(200).send({
        success: true,
        message: 'Profile data',
        data: req.user 
    });
});

// Get user profile data
router.get('/profile', protect, getUserProfileController);

// Update user profile data
router.put('/profile', protect, updateUserProfileController);

// Get Doctor Slots 
router.post('/doctor-slots', protect, doctorSlotsController);

// Resend OTP Route 
router.post('/resend-otp', resendOtpController);

// Get Full Doctor Details
router.get('/doctor-details/:doctorId', getDoctorDetailsForBooking);

// For Notification
router.post("/get-all-notification", protect, deleteAllNotificationController);


module.exports = router;
