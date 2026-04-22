const express = require('express');
const { protect, isDoctor } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const {
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
} = require('../controllers/doctorCtrl');
const { searchDoctorsWithAI } = require('../controllers/aiController');



const router = express.Router();

// Get doctor appointments
router.get('/getDoctorAppointments', protect, isDoctor, getDoctorAppointmentsController);

//  Update appointment status
router.post('/updateAppointmentStatus', protect, isDoctor, updateAppointmentStatusController);

// Get My Patients
router.get('/get-my-patients', protect, isDoctor, getMyPatientsController);

// Update Availability Route
router.post('/update-availability', protect, isDoctor, updateAvailabilityController);

// Get doctor profile
router.get('/profile', protect, isDoctor, getDoctorProfileController);

// Update doctor profile
router.put('/profile', protect, isDoctor, upload.single('profilePicture'), updateDoctorProfileController);

// Create Prescription (Out-Patient)
router.post('/create-prescription', protect, isDoctor, createPrescriptionController);

// Create Discharge Summary (In-Patient)
router.post('/create-discharge-summary', protect, isDoctor, createDischargeSummaryController);

// Update In-Patient Data
router.post("/save-inpatient-data", protect, isDoctor, saveInPatientDataController);

// Get Patient Case History
router.get("/patient-history/:patientId", protect, getPatientHistoryController);

// get in- patient 
router.get("/get-all-ipd-records", protect, getAllIpdRecordsController);

router.post("/ai-search", searchDoctorsWithAI);


module.exports = router;