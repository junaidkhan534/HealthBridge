const appointmentModel = require('../models/appointmentModel');
const userModel = require('../models/userModel');

// Book Appointment Controller;
const bookAppointmentController = async (req, res) => {
    try {
        const { doctorId, date, time, payment } = req.body; 
        const userId = req.user._id; // from 'protect' middleware

        // Fetch doctor and user info
        const doctor = await userModel.findById(doctorId);
        const user = await userModel.findById(userId);

        if (!doctor || !user) {
            return res.status(404).send({ success: false, message: 'Doctor or User not found' });
        }

        // --- Availability Check ---
        const existingAppointment = await appointmentModel.findOne({
            doctorId,
            date,
            time,
            status: { $ne: 'cancelled' } // ignore cancelled appointments
        });

        if (existingAppointment) {
            return res.status(400).send({
                success: false,
                message: 'This time slot is already booked. Please select another.',
            });
        }

        // Create appointment
        const newAppointment = new appointmentModel({
            userId,
            doctorId,
            doctorInfo: doctor.name,
            userInfo: user.name,
            date,
            time,
            payment,
            status: "pending", // 👈 better to keep default as pending
            fees: doctor.fees
        });

        await newAppointment.save();

        // --- START: Notification Logic ---
        const adminUsers = await userModel.find({ role: 'admin' });

        const notification = {
            type: 'new-appointment-request',
            message: `A new appointment has been booked by ${user.name} with Dr. ${doctor.name}`,
            onClickPath: '/admin/appointments'
        };

        for (const admin of adminUsers) {
            admin.notification.push(notification);
            await admin.save();
        }
        // --- END: Notification Logic ---

        res.status(201).send({
            success: true,
            message: 'Appointment booked successfully!',
        });
    } catch (error) {
        console.error("Error in bookAppointmentController:", error);
        res.status(500).send({
            success: false,
            message: 'Error while booking appointment',
        });
    }
};

// const bookAppointmentController = async (req, res) => {
//     try {
//         const { doctorId, date, time, payment } = req.body; 
//         const userId = req.user._id; // from 'protect' middleware

//         // Fetch doctor and user info for easy display
//         const doctor = await userModel.findById(doctorId);
//         const user = await userModel.findById(userId);

//         if (!doctor || !user) {
//             return res.status(404).send({ success: false, message: 'Doctor or User not found' });
//         }

//         const newAppointment = new appointmentModel({
//             userId,
//             doctorId,
//             doctorInfo: doctor.name,
//             userInfo: user.name,
//             date,
//             time,
//             payment
//         });

//         await newAppointment.save();

//          // --- START: Notification Logic ---
//         // Find all admin users to send them a notification
//         const adminUsers = await userModel.find({ role: 'admin' });

//         // Create the notification object
//         const notification = {
//             type: 'new-appointment-request',
//             message: `A new appointment has been booked by ${user.name} with Dr. ${doctor.name}`,
//             onClickPath: '/admin/appointments' // The page to navigate to when clicked
//         };

//         // Push the notification to each admin's notification array
//         for (const admin of adminUsers) {
//             admin.notification.push(notification);
//             await admin.save(); // Save each admin document with the new notification
//         }
//         // --- END: Notification Logic ---

//         res.status(201).send({
//             success: true,
//             message: 'Appointment booked successfully!',
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).send({
//             success: false,
//             message: 'Error while booking appointment',
//         });
//     }
// };

// Get User Appointments Controller
const userAppointmentsController = async (req, res) => {
    try {
        const appointments = await appointmentModel.find({ userId: req.user._id });
        res.status(200).send({
            success: true,
            message: 'User appointments fetched successfully',
            data: appointments,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: 'Error fetching user appointments',
            error,
        });
    }
};
const checkAvailabilityController = async (req, res) => {
    try {
        const { doctorId, date, time } = req.body;

        // Find an appointment that matches AND is NOT cancelled
        const existingAppointment = await appointmentModel.findOne({
            doctorId,
            date,
            time,
            status: { $ne: 'cancelled' } // <-- THIS IS THE FIX
        });

        if (existingAppointment) {
            // If an active appointment is found, the slot is not available
            return res.status(200).send({
                success: false,
                message: 'This time slot is already booked.'
            });
        }

        // If no active appointment is found, the slot is available
        res.status(200).send({
            success: true,
            message: 'Time slot is available for booking.'
        });

    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: 'Error checking availability',
        });
    }
};
const cancelAppointmentController = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const userId = req.user._id;

        const appointment = await appointmentModel.findById(appointmentId);

        if (!appointment) {
            return res.status(404).send({ success: false, message: 'Appointment not found' });
        }

        if (appointment.userId.toString() !== userId.toString()) {
            return res.status(403).send({ success: false, message: 'Unauthorized action' });
        }
        
        appointment.status = 'cancelled';
        await appointment.save();

        res.status(200).send({
            success: true,
            message: 'Appointment cancelled successfully!',
        });
    } catch (error) {
        console.error("Error in cancelAppointmentController:", error);
        res.status(500).send({
            success: false,
            message: 'Error while cancelling appointment',
        });
    }
};

module.exports = {
    bookAppointmentController,
    userAppointmentsController,
    checkAvailabilityController,
    cancelAppointmentController
};
