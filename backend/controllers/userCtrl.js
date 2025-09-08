const userModel = require('../models/userModel');
const appointmentModel = require('../models/appointmentModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/email'); // Import email utility


// Register Controller - Now sends OTP
const registerController = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).send({
                success: false,
                message: 'User with this email already exists',
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // --- START: Patient ID Generation ---
        // Generate a unique patient ID (e.g., PT-123456)
        const patientId = `PT-${Date.now().toString().slice(-6)}`;
        // --- END: Patient ID Generation ---
        console.log(patientId);
        const newUser = new userModel({
            name,
            email,
            password: hashedPassword,
            role: 'patient',
            patientId: patientId // Save the new ID
        });

        // Generate and save OTP
        const otp = newUser.createOtp();
        await newUser.save();

        // Send OTP to user's email
        const message = `<p>Hi ${name},</p>
                         <p>Your One-Time Password (OTP) is:</p>
                         <h2><strong>${otp}</strong></h2>`;

        await sendEmail({
            email: newUser.email,
            subject: 'Your HealthBridge Verification OTP',
            html: message,
        });

        res.status(201).send({
            success: true,
            message: `OTP sent successfully to ${newUser.email}. Please verify your account.`,
        });

    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: `Error in Register Controller: ${error.message}`,
        });
    }
};

// Verify OTP Controller
const verifyOtpController = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await userModel.findOne({ email, otp, otpExpires: { $gt: Date.now() } });

        if (!user) {
            return res.status(400).send({
                success: false,
                message: 'Invalid or expired OTP. Please try again.',
            });
        }

        // OTP is correct, verify the user
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();
        
        // Create JWT token for immediate login after verification
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: '1d',
        });

        res.status(200).send({
            success: true,
            message: 'Email verified successfully! You are now logged in.',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });

    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: `Error in OTP Verification: ${error.message}`,
        });
    }
};


// Login Controller - Now checks for verification
const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(404).send({ success: false, message: 'Email not found!' });
            
        }
        
        // Check if user is verified
        if (!user.isVerified) {
            return res.status(401).send({ success: false, message: 'Please Verify your Email by Reseting the Password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send({ success: false, message: 'Incorrect password!' });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: '1d',
        });

        res.status(200).send({
            success: true,
            message: 'Login successful!',
            token,
            user: { id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isAdmin: user.isAdmin,
                    phone:user.phone,
                    address: user.address,
                    dob: user.dob,
                    gender: user.gender,
                    bloodGroup: user.bloodGroup,
                    profilePicture:user.profilePicture,
                    patientId: user.patientId,
                    doctorId: user.doctorId,
                    bio: user.bio,
                    available: user.available,
                    availableDays: user.availableDays,
                    timings: user.timings
                 },
        });

    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: `Error in Login Controller: ${error.message}`,
        });
    }
};

// --- PASSWORD RESET CONTROLLERS ---

// Forgot Password Controller
const forgotPasswordController = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).send({ success: false, message: 'Account with this email does not exist.' });
        }

        // Generate and save OTP
        const otp = user.createOtp();
        await user.save({ validateBeforeSave: false });
        console.log(otp);

        // Send OTP to user's email
        const message = `<p>Hi ${user.name},</p>
                         <p>You requested a password reset. Your One-Time Password (OTP) is:</p>
                         <h2><strong>${otp}</strong></h2>`;

        await sendEmail({
            email: user.email,
            subject: 'Your HealthBridge Password Reset OTP',
            html: message,
        });

        res.status(200).send({
            success: true,
            message: 'If an account with this email exists, a password reset OTP has been sent.',
        });

    } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, message: 'Error sending password reset OTP.' });
    }
};

// Reset Password Controller
const resetPasswordWithOtpController = async (req, res) => {
    try {
        const { email, otp, password } = req.body;

        // 1) Find user by email, OTP, and check if OTP is still valid
        const user = await userModel.findOne({
            email,
            otp,
            otpExpires: { $gt: Date.now() },
        });

        // 2) If no user is found, the OTP is invalid or expired
        if (!user) {
            return res.status(400).send({ success: false, message: 'OTP is invalid or has expired.' });
        }

        // 3) If OTP is valid, set the new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.status(200).send({
            success: true,
            message: 'Password has been reset successfully!',
        });

    } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, message: 'Error resetting password.' });
    }
};

// Add these functions to your existing userCtrl.js file

// Get All Doctors Controller
const getAllDoctorsController = async (req, res) => {
    try {
        // Find all users with the role 'doctor'
        const doctors = await userModel.find({ role: 'doctor' }).select('-password');
        res.status(200).send({
            success: true,
            message: 'Doctors list fetched successfully',
            data: doctors,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: 'Error while fetching doctors list',
            error,
        });
    }
};

// Get Single Doctor by ID Controller
const getDoctorByIdController = async (req, res) => {
    try {
        const doctor = await userModel.findById(req.params.doctorId).select('-password');
        if (!doctor) {
            return res.status(404).send({
                success: false,
                message: 'Doctor not found',
            });
        }
        res.status(200).send({
            success: true,
            message: 'Doctor info fetched successfully',
            data: doctor,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: 'Error in fetching doctor info',
            error,
        });
    }
};
// --- NEW: Get User Profile Controller ---
const getUserProfileController = async (req, res) => {
    try {
        // req.user is attached by our 'protect' middleware
        const user = await userModel.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).send({ success: false, message: 'User not found' });
        }
        res.status(200).send({ success: true, data: user });
    } catch (error) {
        console.log(error);
        res.status(500).send({ success: false, message: 'Error fetching profile' });
    }
};

// --- NEW: Update User Profile Controller ---
const updateUserProfileController = async (req, res) => {
    try {
        // Get all fields from the form data
        const { name, email, phone, address, dob, gender, bloodGroup } = req.body;
        const user = await userModel.findById(req.user._id);

        if (!user) {
            return res.status(404).send({ success: false, message: 'User not found' });
        }

        // Update all fields
        user.name = name || user.name;
        user.email = email || user.email;
        user.phone = phone || user.phone;
        user.address = address || user.address;
        user.dob = dob || user.dob;
        user.gender = gender || user.gender;
        user.bloodGroup = bloodGroup || user.bloodGroup;

        // If a new photo was uploaded, update the profilePicture with the Cloudinary URL
        if (req.file) {
            user.profilePicture = req.file.path; 
        }
        
        const updatedUser = await user.save();
        
        updatedUser.password = undefined; 
        res.status(200).send({ 
            success: true, 
            message: 'Profile updated successfully!',
            data: updatedUser 
        });
    } catch (error) {
        console.error("Error updating user profile:", error);
        res.status(500).send({ success: false, message: 'Error updating profile' });
    }
};
// In appointy-backend/controllers/userCtrl.js

// In appointy-backend/controllers/userCtrl.js

const doctorSlotsController = async (req, res) => {
    try {
        const { doctorId, date } = req.body;

        const doctor = await userModel.findById(doctorId);
        if (!doctor) {
            return res.status(404).send({ success: false, message: 'Doctor not found' });
        }

        // Find appointments that are NOT cancelled
        const appointments = await appointmentModel.find({
            doctorId,
            date,
            status: { $ne: 'cancelled' } // <-- This is the crucial fix
        });

        const bookedSlots = appointments.map(appt => appt.time);

        res.status(200).send({
            success: true,
            message: 'Doctor availability fetched successfully',
            data: {
                timings: doctor.timings,
                bookedSlots: bookedSlots
            },
        });

    } catch (error) {
        console.error("Error in doctorSlotsController:", error);
        res.status(500).send({
            success: false,
            message: 'Error fetching doctor availability',
        });
    }
};

const resendOtpController = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await userModel.findOne({ email });

        if (!user) {
            // To prevent attackers from checking which emails are registered,
            // we send a generic success message even if the user is not found.
            return res.status(200).send({
                success: true,
                message: 'If an account with this email exists, a new OTP has been sent.'
            });
        }

        // Generate a new OTP and save it to the user's document
        const otp = user.createOtp();
        await user.save({ validateBeforeSave: false });

        // Send the new OTP to the user's email
        const message = `<p>Hi ${user.name},</p><p>Your new One-Time Password (OTP) is: <strong>${otp}</strong></p>`;

        await sendEmail({
            email: user.email,
            subject: 'Your New HealthBridge Verification OTP',
            html: message,
        });

        res.status(200).send({
            success: true,
            message: 'A new OTP has been sent to your email.',
        });

    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: 'Error resending OTP',
        });
    }
};

// --- NEW: Get Full Doctor Details for Booking Page ---
// In appointy-backend/controllers/userCtrl.js

const getDoctorDetailsForBooking = async (req, res) => {
    try {
        const doctor = await userModel.findById(req.params.doctorId);
        if (!doctor) {
            return res.status(404).send({ success: false, message: 'Doctor not found' });
        }

        // Find appointments that are NOT cancelled
        const appointments = await appointmentModel.find({
            doctorId: req.params.doctorId,
            status: { $ne: 'cancelled' } // <-- This is the crucial fix
        });

        const bookedSlots = appointments.map(appt => ({
            date: appt.date,
            time: appt.time
        }));

        res.status(200).send({
            success: true,
            message: 'Doctor details fetched successfully',
            data: {
                doctorProfile: doctor,
                bookedSlots: bookedSlots
            },
        });

    } catch (error) {
        console.error("Error in getDoctorDetailsForBooking:", error);
        res.status(500).send({
            success: false,
            message: 'Error fetching doctor details',
        });
    }
};

module.exports = { 
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
};
