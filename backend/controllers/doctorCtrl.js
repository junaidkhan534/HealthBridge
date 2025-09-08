const appointmentModel = require('../models/appointmentModel');
const userModel = require('../models/userModel');
const moment = require('moment');

// Get appointments for a specific doctor
const getDoctorAppointmentsController = async (req, res) => {
    try {
        const doctorId = req.user._id;

        // Find all appointments for the current doctor and populate the patient's details
        const appointments = await appointmentModel.find({ doctorId }).populate('userId');

        // Manually add patient age and blood group to each appointment object
        const appointmentsWithDetails = appointments.map(appt => {
            let patientAge = 'N/A';
            if (appt.userId && appt.userId.dob) {
                patientAge = moment().diff(moment(appt.userId.dob, 'YYYY-MM-DD'), 'years');
            }
            
            return {
                // Keep all original appointment fields
                ...appt._doc, 
                // Add the new fields
                patientAge: patientAge,
                patientBloodGroup: appt.userId ? appt.userId.bloodGroup : 'N/A',
                patientId: appt.userId ? appt.userId.patientId : 'N/A'
            };
        });

        res.status(200).send({
            success: true,
            message: 'Doctor appointments fetched successfully',
            data: appointmentsWithDetails,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({ success: false, message: 'Error fetching doctor appointments' });
    }
};


// Update appointment status
const updateAppointmentStatusController = async (req, res) => {
    try {
        const { appointmentId, status } = req.body;
        const appointment = await appointmentModel.findByIdAndUpdate(appointmentId, { status });
        // You could add a notification to the user here as well
        res.status(200).send({
            success: true,
            message: 'Appointment status updated successfully',
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({ success: false, message: 'Error updating appointment status' });
    }
};
const getMyPatientsController = async (req, res) => {
    try {
        const doctorId = req.user._id;

        // Find all appointments for the current doctor
        const appointments = await appointmentModel.find({ doctorId });

        // Get a unique list of patient IDs from the appointments
        const patientIds = [...new Set(appointments.map(appt => appt.userId))];

        // Find all user documents that match the patient IDs
        const patients = await userModel.find({ _id: { $in: patientIds } }).select('-password');

        res.status(200).send({
            success: true,
            message: 'Your patients have been fetched successfully.',
            data: patients,
        });

    } catch (error) {
        console.error("Error in getMyPatientsController:", error);
        res.status(500).send({
            success: false,
            message: 'Error fetching patients.',
        });
    }
};
// --- NEW: Update Doctor Availability Controller ---
const updateAvailabilityController = async (req, res) => {
    try {
        const doctorId = req.user._id;
        const { available, availableDays, timings } = req.body;

        const doctor = await userModel.findById(doctorId);
        if (!doctor) {
            return res.status(404).send({ success: false, message: 'Doctor not found' });
        }

        // Update the fields
        doctor.available = available;
        doctor.availableDays = availableDays;
        doctor.timings = timings;

        await doctor.save();

        res.status(200).send({
            success: true,
            message: 'Your availability has been updated successfully.',
            data: doctor,
        });

    } catch (error) {
        console.error("Error in updateAvailabilityController:", error);
        res.status(500).send({
            success: false,
            message: 'Error updating availability.',
        });
    }
};
// --- NEW: Get Doctor Profile Controller ---
const getDoctorProfileController = async (req, res) => {
    try {
        // req.user._id is available from the 'protect' middleware
        const doctor = await userModel.findById(req.user._id).select('-password');
        if (!doctor) {
            return res.status(404).send({ success: false, message: 'Doctor not found' });
        }
        res.status(200).send({ success: true, data: doctor });
    } catch (error) {
        console.log(error);
        res.status(500).send({ success: false, message: 'Error fetching profile' });
    }
};

// --- NEW: Update Doctor Profile Controller ---
const updateDoctorProfileController = async (req, res) => {
    try {
        const doctor = await userModel.findById(req.user._id);
        if (!doctor) {
            return res.status(404).send({ success: false, message: 'Doctor not found' });
        }

        // Update all fields from the form
        const { name, email, phone, address, specialty, qualifications, experience, fees, bio } = req.body;
        doctor.name = name || doctor.name;
        doctor.email = email || doctor.email;
        doctor.phone = phone || doctor.phone;
        doctor.address = address || doctor.address;
        doctor.specialty = specialty || doctor.specialty;
        doctor.qualifications = qualifications || doctor.qualifications;
        doctor.experience = experience || doctor.experience;
        doctor.fees = fees || doctor.fees;
        doctor.bio = bio || doctor.bio;

        // Handle profile picture upload
        if (req.file) {
            doctor.profilePicture = req.file.path;
        }
        
        const updatedDoctor = await doctor.save(); // Corrected from user.save() to doctor.save()
        updatedDoctor.password = undefined;
        res.status(200).send({ 
            success: true, 
            message: 'Profile updated successfully!',
            data: updatedDoctor 
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({ success: false, message: 'Error updating profile' });
    }
};



module.exports = { 
    getDoctorAppointmentsController,
    updateAppointmentStatusController,
    getMyPatientsController,
    updateAvailabilityController,
    getDoctorProfileController,
    updateDoctorProfileController,
};
