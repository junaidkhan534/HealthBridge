const mongoose = require('mongoose'); 
const appointmentModel = require('../models/appointmentModel');
const inPatientModel = require("../models/inPatientModel");
const userModel = require('../models/userModel');
const prescriptionModel = require('../models/prescriptionModel');
const dischargeModel = require('../models/dischargeModel');
const wardModel = require('../models/wardModel');
const moment = require('moment');

// Get appointments 
const getDoctorAppointmentsController = async (req, res) => {
    try {
        const doctorId = req.user._id;

        const appointments = await appointmentModel.find({ doctorId }).populate('userId');

        const appointmentsWithDetails = appointments.map(appt => {
            let patientAge = 'N/A';
            if (appt.userId && appt.userId.dob) {
                patientAge = moment().diff(moment(appt.userId.dob, 'YYYY-MM-DD'), 'years');
            }
            
            return {
                ...appt._doc, 
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
        const { appointmentId, status, cancelMessage } = req.body;
        
        // Update the appointment status
        const appointment = await appointmentModel.findByIdAndUpdate(
            appointmentId, 
            { status }, 
            { new: true }
        );

        if (!appointment) {
            return res.status(404).send({ success: false, message: 'Appointment not found' });
        }

        const patientId = appointment.userId.toString(); 
        const doctorName = appointment.doctorInfo;

        // Create the notification message
        const notifMessage = status === 'approved' 
            ? `Your appointment with Dr. ${doctorName} has been APPROVED!`
            : `Appointment Cancelled by Dr. ${doctorName}. Reason: ${cancelMessage}`;

        const updatedUser = await userModel.findByIdAndUpdate(
            patientId,
            {
                $push: {
                    notification: {
                        type: 'appointment-status',
                        message: notifMessage,
                        onClickPath: '/appointments',
                        createdAt: new Date()
                    }
                }
            },
            { new: true } 
        );

        const io = req.app.get('socketio');
        if (io) {
            io.to(patientId).emit('appointmentStatusUpdated', {
                message: notifMessage,
                updatedUser: updatedUser 
            });
        }

        res.status(200).send({ 
            success: true, 
            message: `Appointment ${status} successfully`,
            data: appointment 
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({ success: false, message: 'Error updating status', error });
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
// Update Doctor Availability 
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

// Get Doctor Profile Controller 
const getDoctorProfileController = async (req, res) => {
    try {
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

// Update Doctor Profile
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
        
        const updatedDoctor = await doctor.save(); 
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

// For creating Prescription
const createPrescriptionController = async (req, res) => {
    try {
        const { appointmentId, patientId, medicines, diagnosis, followUpDate } = req.body;
        
        console.log("Creating Prescription for Data:", req.body);

        // Validate Appointment ID
        if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
            return res.status(400).send({ success: false, message: "Invalid Appointment ID" });
        }

        let finalPatientId = patientId;
        let actualMongoObjectId = null; 

        if (!patientId || patientId === "N/A" || patientId === "undefined") {
            const appointment = await appointmentModel.findById(appointmentId);
            if (appointment && appointment.userId) {
                finalPatientId = appointment.userId;
                actualMongoObjectId = appointment.userId;
            } else {
                return res.status(400).send({ success: false, message: "Invalid Patient ID and could not resolve from Appointment." });
            }
        } else {
            const patientRecord = await userModel.findOne({ patientId: finalPatientId });
            
            if (!patientRecord) {
                return res.status(404).send({ success: false, message: "Patient not found in database." });
            }
            
            actualMongoObjectId = patientRecord._id; 
        }
        
        // 3. Save both IDs to the Prescription
        const newPrescription = new prescriptionModel({
            doctorId: req.user._id, 
            patientId: finalPatientId,         
            patientObj: actualMongoObjectId,     
            appointmentId,
            medicines,
            diagnosis,
            followUpDate
        });

        await newPrescription.save();

        // Automatically mark the appointment as completed
        await appointmentModel.findByIdAndUpdate(appointmentId, { status: "completed" });

        res.status(201).send({ success: true, message: "Prescription created & Appointment completed" });
    } catch (error) {
        console.error("Backend Error in createPrescription:", error);
        res.status(500).send({ success: false, message: "Error creating prescription", error: error.message });
    }
};

// // for discharge
const createDischargeSummaryController = async (req, res) => {
    try {
        const { 
            appointmentId,
            patientId, 
            admissionDate, 
            diagnosis, 
            treatmentGiven, 
            summary, 
            followUpDate, 
            instructions 
        } = req.body;

        // Save the Discharge Summary Record
        const newDischarge = new dischargeModel({
            doctorId: req.body.userId, 
            patientId,
            admissionDate,
            diagnosis,
            treatmentGiven,
            summary,
            followUpDate,
            instructions
        });
        await newDischarge.save();

        await appointmentModel.findByIdAndUpdate(appointmentId, {
            status: "Discharged",
            dischargeDate: new Date() 
        });

        res.status(201).send({ 
            success: true, 
            message: "Discharge Summary Saved & Patient Discharged Successfully" 
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({ 
            success: false, 
            message: "Error creating discharge summary", 
            error 
        });
    }
};

// for addmision
const saveInPatientDataController = async (req, res) => {
  try {
    const { appointmentId, patientId, completeAppointment, ...restData } = req.body;

    // Verify if the Discharge Summary is completely prepared
    const hasDischargeDate = !!restData.dischargeDate;
    const hasDiagnosis = !!restData.diagnosis && restData.diagnosis.trim() !== "";
    const hasSummary = !!restData.summary && restData.summary.trim() !== "";

    const isDischargeFinal = hasDischargeDate && hasDiagnosis && hasSummary;
    
    // Set the stage: If valid discharge, it's Stage 2. Otherwise, keep current stage.
    const newStage = isDischargeFinal ? 2 : (restData.currentStage || 0);

    // Smart Lookup for Patient
    let actualMongoObjectId = null;
    if (patientId) {
        const patientRecord = await userModel.findOne({ patientId: patientId });
        if (patientRecord) {
            actualMongoObjectId = patientRecord._id; 
        }
    }

    // Combine the data 
    const ipdData = {
        ...restData,
        patientId: patientId, 
        patientObj: actualMongoObjectId,
        currentStage: newStage,    
        doctorId: req.user._id        
    };

    // Save to Database
    const savedRecord = await inPatientModel.findOneAndUpdate(
      { appointmentId: appointmentId },
      { $set: ipdData },
      { new: true, upsert: true }
    );

    if (completeAppointment || newStage === 2) {
        await appointmentModel.findByIdAndUpdate(
            appointmentId, 
            { status: "completed" }
        );
    }

    // WARD & BED UPDATE LOGIC 
    if (restData.wardType && restData.bedNumber) {
        const targetStatus = (newStage === 2) ? "available" : "occupied";

        await wardModel.findOneAndUpdate(
            { 
                name: restData.wardType, 
                "beds.bedNumber": restData.bedNumber 
            },
            { 
                $set: { "beds.$.status": targetStatus } 
            }
        );
        
        console.log(`Bed ${restData.bedNumber} in ${restData.wardType} updated to ${targetStatus}`);
    }

    res.status(200).send({
      success: true,
      message: newStage === 2 ? "Discharge Summary Verified & Patient Discharged" : "Clinical data saved successfully",
      data: savedRecord
    });

  } catch (error) {
    console.log("Error saving IPD data:", error);
    res.status(500).send({
      success: false,
      message: "Error while saving inpatient data",
      error: error.message
    });
  }
};

// Patient history
const getPatientHistoryController = async (req, res) => {
  try {
    const { patientId } = req.params;

    let profileQuery = { patientId: patientId }; 

    if (mongoose.Types.ObjectId.isValid(patientId)) {
        profileQuery = { $or: [{ _id: patientId }, { patientId: patientId }] };
    }

    const patientProfile = await userModel.findOne(profileQuery).select("name age gender email phone dob").lean(); 

    // Fetch IPD & OPD History
    const ipdRecords = await inPatientModel.find({ patientId: patientId }).lean();
    const opdRecords = await prescriptionModel.find({ patientId: patientId }).lean();

    const combinedHistory = [
      ...ipdRecords.map(record => ({ ...record, recordType: 'IPD', sortDate: record.createdAt })),
      ...opdRecords.map(record => ({ ...record, recordType: 'OPD', sortDate: record.createdAt }))
    ];

    combinedHistory.sort((a, b) => new Date(b.sortDate) - new Date(a.sortDate));

    // Send data to frontend
    res.status(200).send({
      success: true,
      message: "Patient case history fetched successfully",
      data: combinedHistory,
      patientProfile: patientProfile || {} 
    });
  } catch (error) {
    console.error("Error fetching patient history:", error);
    res.status(500).send({
      success: false,
      message: "Error fetching patient history",
      error: error.message,
    });
  }
};


const getAllIpdRecordsController = async (req, res) => {
  try {
    const records = await inPatientModel.find({ doctorId: req.user._id })
      .populate('patientObj', 'name phone email gender dob bloodGroup profilePic') 
      .sort({ admissionDate: -1 }); 

    res.status(200).send({
      success: true,
      message: "IPD Records fetched successfully",
      data: records
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error fetching IPD records",
      error
    });
  }
};

module.exports = { 
    getDoctorAppointmentsController,
    updateAppointmentStatusController,
    getMyPatientsController,
    updateAvailabilityController,
    getDoctorProfileController,
    updateDoctorProfileController,
    createPrescriptionController,    
    createDischargeSummaryController,
    saveInPatientDataController,
    getPatientHistoryController,
    getAllIpdRecordsController
};
