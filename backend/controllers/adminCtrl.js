const userModel = require('../models/userModel');
const appointmentModel = require('../models/appointmentModel');
const bcrypt = require('bcryptjs');

// Get all users
const getAllUsersController = async (req, res) => {
    try {
        const users = await userModel.find({ role: 'patient' });
        res.status(200).send({
            success: true,
            message: 'Patients data fetched successfully',
            data: users,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({ success: false, message: 'Error fetching patients' });
    }
};

// Get all doctors
// In appointy-backend/controllers/adminCtrl.js

const getAllDoctorsController = async (req, res) => {
    try {
        // Find all users with the role 'doctor' and send the full object
        const doctors = await userModel.find({ role: 'doctor' });
        
        res.status(200).send({
            success: true,
            message: 'Doctors data fetched successfully',
            data: doctors,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({ success: false, message: 'Error fetching doctors' });
    }
};

// Change account status (Approve Doctor)
// const changeAccountStatusController = async (req, res) => {
    // try {
    //     const { doctorId, status } = req.body;
    //     const doctor = await userModel.findByIdAndUpdate(doctorId, { status });
        
    //     // Notify the user about the status change
    //     const user = await userModel.findOne({ _id: doctor.userId }); // Assuming doctor model has userId ref
    //     user.notification.push({
    //         type: 'doctor-account-request-updated',
    //         message: `Your doctor account request has been ${status}`,
    //         onClickPath: '/notification'
    //     });
    //     await user.save();

    //     res.status(201).send({
    //         success: true,
    //         message: 'Account status updated successfully',
    //         data: doctor,
    //     });
    // } catch (error) {
    //     console.log(error);
    //     res.status(500).send({ success: false, message: 'Error in changing account status' });
    // }
// };
// --- NEW: Get All Appointments Controller ---
// In appointy-backend/controllers/adminCtrl.js
const getAllAppointmentsController = async (req, res) => {
    try {
        // This .sort({ createdAt: -1 }) is the crucial part
        const appointments = await appointmentModel.find().sort({ createdAt: -1 });

        res.status(200).send({
            success: true,
            message: 'All appointments fetched successfully',
            data: appointments,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({ success: false, message: 'Error fetching appointments' });
    }
};

// --- NEW: Update Admin Profile Controller ---
// In appointy-backend/controllers/adminCtrl.js

const updateAdminProfileController = async (req, res) => {
    try {
        const { name, phone, email } = req.body;
        const user = await userModel.findById(req.user._id);

        if (!user) {
            return res.status(404).send({ success: false, message: 'User not found' });
        }

        // Update text fields
        user.name = name || user.name;
        user.phone = phone || user.phone;
        user.email = email || user.email;

        // Correctly update the 'profilePicture' field
        if (req.file) {
            user.profilePicture = req.file.path; 
        }
        
        const updatedUser = await user.save();
        
        updatedUser.password = undefined; 
        res.status(200).send({ success: true, message: 'Profile updated successfully!', data: updatedUser });

    } catch (error) {
        console.error("Error updating admin profile:", error); 
        res.status(500).send({ success: false, message: 'Error updating profile' });
    }
};



// --- NEW: Change Admin Password Controller ---
const changeAdminPasswordController = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const user = await userModel.findById(req.user._id);

        // Check if old password matches
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).send({ success: false, message: 'Incorrect old password.' });
        }

        // Hash and save the new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.status(200).send({ success: true, message: 'Password changed successfully!' });
    } catch (error) {
        console.log(error);
        res.status(500).send({ success: false, message: 'Error changing password.' });
    }
};
// In appointy-backend/controllers/adminCtrl.js

// In appointy-backend/controllers/adminCtrl.js
// appointy-backend/controllers/adminCtrl.js

// In appointy-backend/controllers/adminCtrl.js

const addDoctorController = async (req, res) => {
    try {
        const { 
            doctorId, // <-- Add doctorId here
            name, email, password, phone, gender, dob,
            specialty, qualifications, experience, fees, address, bio,
            availableDays, startTime1, endTime1, startTime2, endTime2 
        } = req.body;

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).send({ success: false, message: 'A user with this email already exists.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newDoctor = new userModel({
            doctorId,
            name, email, password: hashedPassword, phone, gender, dob,
            role: 'doctor',
            status: 'approved',
            isVerified: true,
            available: true,
            specialty, qualifications, address, bio,
            experience: Number(experience),
            fees: Number(fees),
            availableDays: availableDays ? availableDays.split(',') : [], 
            timings: [
                { start: startTime1, end: endTime1 },
                { start: startTime2, end: endTime2 }
            ],
            profilePicture: req.file ? req.file.path : '' 
        });

        await newDoctor.save();
        res.status(201).send({ success: true, message: 'Doctor account created successfully!' });

    } catch (error) {
        console.error("!!! CRITICAL ERROR in addDoctorController:", error); 
        res.status(500).send({ success: false, message: 'Error while adding doctor. Check server logs for details.' });
    }
};
// --- NEW: Get All Payments (Appointments) Controller ---
const getAllPaymentsController = async (req, res) => {
    try {
        // Fetch all appointments, as they contain the payment data
        const appointments = await appointmentModel.find({});
        res.status(200).send({
            success: true,
            message: 'All payments fetched successfully',
            data: appointments,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({ success: false, message: 'Error fetching payments' });
    }
};

module.exports = { 
    getAllUsersController,
    getAllDoctorsController,
    // changeAccountStatusController,
    getAllAppointmentsController,
    updateAdminProfileController,
    changeAdminPasswordController,
    addDoctorController,
    getAllPaymentsController

};
