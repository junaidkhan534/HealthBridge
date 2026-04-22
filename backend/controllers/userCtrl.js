const userModel = require('../models/userModel');
const appointmentModel = require('../models/appointmentModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/email'); 
const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);


// Register
const registerController = async (req, res) => {
    let newUser;
    try {
        const { name, contact, password } = req.body;

        // Identify Input Type
        const isEmail = contact.includes('@');
        const isPhone = /^[6-9]\d{9}$/.test(contact);

        if (!isEmail && !isPhone) {
            return res.status(400).send({
                success: false,
                message: 'Please enter a valid Email or 10-digit Phone Number',
            });
        }

        // Check for Existing User 
        const existingUser = await userModel.findOne({ 
            $or: [{ email: contact }, { phone: contact }] 
        });

        if (existingUser) {
            return res.status(400).send({
                success: false,
                message: 'Account with this Email or Phone already exists',
            });
        }

        // Security & ID Generation
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const patientId = `PT-${Date.now().toString().slice(-6)}`;

        // Create & Save User
        newUser = new userModel({
            name,
            password: hashedPassword,
            role: 'patient',
            patientId: patientId,
            [isEmail ? 'email' : 'phone']: contact 
        });

        const otp = newUser.createOtp();
        await newUser.save();

        // OTP 
        if (isEmail) {
            await sendEmail({
                email: newUser.email,
                subject: 'HealthBridge Verification OTP',
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;">
                        <h2>HealthBridge Verification</h2>
                        <p>Hi ${name}, Your OTP for account verification is:</p>
                        <h1 style="letter-spacing: 5px;">${otp}</h1>
                    </div>
                `,
            });
        } else {
            try {
                await client.messages.create({
                    body: `Your HealthBridge verification code is: ${otp}. Valid for 10 minutes.`,
                    from: process.env.TWILIO_PHONE_NUMBER,
                    to: `+91${contact}`
                });
                console.log(`✅ Twilio OTP sent to +91${contact}`);
            } catch (twilioError) {
                console.warn(`TWILIO FAIL-SAFE: Number +91${contact} is likely unverified.`);
                console.warn(`FOR DEMO, USE THIS OTP: ${otp}`);
            }
        }

        res.status(201).send({
            success: true,
            message: `OTP sent successfully to ${contact}.`,
        });

    } catch (error) {
        if (newUser && newUser._id) {
            await userModel.findByIdAndDelete(newUser._id);
        }

        console.error("Registration Error:", error);
        res.status(500).send({
            success: false,
            message: `Registration failed: ${error.message}`,
        });
    }
};

const verifyOtpController = async (req, res) => {
    try {
        const { contact, otp } = req.body;

        const user = await userModel.findOne({
            $or: [{ email: contact }, { phone: contact }],
            otp,
            otpExpires: { $gt: Date.now() }
        });

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
        
        // Create JWT token for immediate login
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: '1d',
        });

        res.status(200).send({
            success: true,
            message: 'Account verified successfully! You are now logged in.',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone, 
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


// Login Controller
const loginController = async (req, res) => {
    try {
        const { contact, password } = req.body;

        //  Find user by Email OR Phone
        const user = await userModel.findOne({
            $or: [{ email: contact }, { phone: contact }]
        });

        if (!user) {
            return res.status(404).send({ 
                success: false, 
                message: 'Account not found!' 
            });
        }
        
        //  Check if user is verified
        if (!user.isVerified) {
            return res.status(401).send({ 
                success: false, 
                message: 'Account not verified. Please verify your account to login.' 
            });
        }

        //  Compare Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send({ 
                success: false, 
                message: 'Incorrect password!' 
            });
        }

        //  Generate Token
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: '1d',
        });

        // Send Response
        res.status(200).send({
            success: true,
            message: 'Login successful!',
            token,
            user: { 
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                isAdmin: user.isAdmin,
                address: user.address,
                dob: user.dob,
                gender: user.gender,
                bloodGroup: user.bloodGroup,
                profilePicture: user.profilePicture,
                patientId: user.patientId,
                doctorId: user.doctorId,
                bio: user.bio,
                available: user.available,
                availableDays: user.availableDays,
                timings: user.timings,
                specialty: user.specialty,
                notification: user.notification,
                seennotification: user.seennotification
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

// Forgot Password  
const forgotPasswordController = async (req, res) => {
    try {
        const { contact } = req.body;

        // Find user by Email OR Phone
        const user = await userModel.findOne({
            $or: [{ email: contact }, { phone: contact }]
        });

        if (!user) {
            return res.status(404).send({ 
                success: false, 
                message: 'Account with this contact detail does not exist.' 
            });
        }

        // Generate and save OTP 
        const otp = user.createOtp();
        await user.save({ validateBeforeSave: false });

        //  Determine if contact is email or phone for delivery
        const isEmail = contact.includes('@');

        if (isEmail) {
            // Send OTP via Email
            const emailHtml = `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Password Reset Request</h2>
                    <p>Hi ${user.name},</p>
                    <p>Your One-Time Password (OTP) for password reset is:</p>
                    <h1 style="letter-spacing: 5px;">${otp}</h1>
                    <p>This code is valid for 10 minutes.</p>
                </div>
            `;

            await sendEmail({
                email: user.email,
                subject: 'HealthBridge Password Reset OTP',
                html: emailHtml,
            });
        } else {
            // Send OTP via Twilio
            try {
                await client.messages.create({
                    body: `Your HealthBridge password reset code is: ${otp}. Valid for 10 minutes.`,
                    from: process.env.TWILIO_PHONE_NUMBER,
                    to: `+91${user.phone}`
                });
            } catch (twilioError) {
                console.warn(`TWILIO FORGOT-PASSWORD FAIL: +91${user.phone}`);
                console.warn(`FOR DEMO, USE THIS RESET OTP: ${otp}`);
            }
        }

        res.status(200).send({
            success: true,
            message: `A password reset OTP has been sent to your registered ${isEmail ? 'email' : 'phone number'}.`,
        });

    } catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(500).send({ 
            success: false, 
            message: 'Error sending password reset OTP.' 
        });
    }
};

// Reset Password Controller
const resetPasswordWithOtpController = async (req, res) => {
    try {

        const { contact, otp, password } = req.body;

        const user = await userModel.findOne({
            $or: [{ email: contact }, { phone: contact }],
            otp,
            otpExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).send({ 
                success: false, 
                message: 'OTP is invalid or has expired.' 
            });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        
        user.isVerified = true; 
        
        // Clear OTP fields
        user.otp = undefined;
        user.otpExpires = undefined;
        
        await user.save();

        res.status(200).send({
            success: true,
            message: 'Password has been reset successfully!',
        });

    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).send({ 
            success: false, 
            message: 'Error resetting password.' 
        });
    }
};

// Get All Doctors
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

// Get Single Doctor by ID 
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
// Get User Profile
const getUserProfileController = async (req, res) => {
    try {
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

// Update User Profile Controller
const updateUserProfileController = async (req, res) => {
    try {
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
            status: { $ne: 'cancelled' }
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
        const { contact } = req.body;

        // Find user by Email OR Phone
        const user = await userModel.findOne({
            $or: [{ email: contact }, { phone: contact }]
        });

        if (!user) {
            return res.status(404).send({
                success: false,
                message: 'Account not found!'
            });
        }

        // Generate new OTP and update expiry
        const otp = user.createOtp();
        await user.save({ validateBeforeSave: false });

        // Delivery Logic
        const isEmail = contact.includes('@');
        if (isEmail) {
            await sendEmail({
                email: user.email,
                subject: 'HealthBridge Resend OTP',
                html: `<h1>Your new OTP is: ${otp}</h1>`
            });
        } else {
            try {
                await client.messages.create({
                    body: `Your new HealthBridge OTP is: ${otp}`,
                    from: process.env.TWILIO_PHONE_NUMBER,
                    to: `+91${user.phone}`
                });
            } catch (twilioErr) {
                console.warn(`Resend OTP Fallback: ${otp}`);
            }
        }

        res.status(200).send({
            success: true,
            message: 'OTP has been resent successfully!'
        });

    } catch (error) {
        console.error("Resend OTP Error:", error);
        res.status(500).send({
            success: false,
            message: 'Internal Server Error while resending OTP'
        });
    }
};

// Get Full Doctor Details for Booking Page
const getDoctorDetailsForBooking = async (req, res) => {
    try {
        const doctor = await userModel.findById(req.params.doctorId);
        if (!doctor) {
            return res.status(404).send({ success: false, message: 'Doctor not found' });
        }

        // Find appointments that are NOT cancelled
        const appointments = await appointmentModel.find({
            doctorId: req.params.doctorId,
            status: { $ne: 'cancelled' }
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

const deleteAllNotificationController = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.body.userId });
    
    const notifications = user.notification;
    const seenNotifications = user.seennotification;
    seenNotifications.push(...notifications);

    user.notification = [];
    user.seennotification = seenNotifications;

    const updatedUser = await user.save();
    
    updatedUser.password = undefined;

    res.status(200).send({
      success: true,
      message: "All notifications marked as read",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in marking all as read",
      error,
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
    deleteAllNotificationController
};
