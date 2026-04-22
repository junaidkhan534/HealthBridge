const userModel = require('../models/userModel');
const appointmentModel = require('../models/appointmentModel');
const wardModel = require('../models/wardModel');
const bcrypt = require('bcryptjs');

// Get all users/patient
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
const getAllDoctorsController = async (req, res) => {
    try {
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


// Get All Appointments Controller 
const getAllAppointmentsController = async (req, res) => {
    try {
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

// Update Admin Profile
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


// For to add new doctor
const addDoctorController = async (req, res) => {
    try {
        const { 
            doctorId,
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
// Get All Payments Info
const getAllPaymentsController = async (req, res) => {
    try {
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

// FOR ADDING NEW WARD
const addWardController = async (req, res) => {
    try {
        const { name, totalBeds } = req.body;
        
        // Check if ward already exists
        const existingWard = await wardModel.findOne({ name });
        if (existingWard) {
            return res.status(200).send({ success: false, message: "Ward already exists" });
        }

        // Auto-generate beds
        const beds = Array.from({ length: totalBeds }, (_, i) => ({
            bedNumber: `${name.substring(0, 3).toUpperCase()}-${i + 1}`,
            status: 'available'
        }));

        const newWard = new wardModel({ name, totalBeds, beds });
        await newWard.save();

        res.status(201).send({
            success: true,
            message: "Ward Created Successfully",
        });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

// GET ALL WARDS
const getAllWardsController = async (req, res) => {
    try {
        const wards = await wardModel.find({});
        res.status(200).send({
            success: true,
            data: wards
        });
    } catch (error) {
        res.status(500).send({ success: false, message: "Error fetching wards" });
    }
};

// For update bed status
const updateBedStatusController = async (req, res) => {
    try {
        const { wardId, bedId, status } = req.body;

        const updatedWard = await wardModel.findOneAndUpdate(
            { _id: wardId, "beds._id": bedId },
            { 
                $set: { "beds.$.status": status } 
            },
            { new: true }
        );

        if (!updatedWard) {
            return res.status(404).send({
                success: false,
                message: "Ward or Bed not found"
            });
        }

        res.status(200).send({
            success: true,
            message: `Bed status updated to ${status}`,
            data: updatedWard
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error while updating bed status",
            error: error.message
        });
    }
};

module.exports = { 
    getAllUsersController,
    getAllDoctorsController,
    getAllAppointmentsController,
    updateAdminProfileController,
    addDoctorController,
    getAllPaymentsController,
    addWardController,
    getAllWardsController,
    updateBedStatusController
};
