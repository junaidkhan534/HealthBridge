const mongoose = require("mongoose");

const inPatientSchema = new mongoose.Schema({
  appointmentId: { 
    type: String, 
    required: true,
    unique: true
  },
  patientId: { 
    type: String, 
    required: true 
  },
  patientObj: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'users'
  },
  
  //  Step 0: Admission Data 
  wardType: { type: String },
  bedNumber: { type: String },
  admissionDate: { type: String },
  triage: { type: String },
  bp: { type: String },
  pulse: { type: String },
  spo2: { type: String },
  chiefComplaint: { type: String },
  
  // Step 1: Care Plan Data 
  investigations: { type: String },
  dailyProgress: { type: String },
  
  // Step 2: Discharge Data 
  dischargeDate: { type: String },
  diagnosis: { type: String },
  summary: { type: String },
  treatmentGiven: { type: String },
  instructions: { type: String },
  followUpDate: { type: Date },
  isReminded: { 
    type: Boolean, 
    default: false 
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: false
 },
  
  // Tracks which step the doctor is currently on
  currentStage: { type: Number, default: 0 },
  
}, { timestamps: true });

const inPatientModel = mongoose.model("inpatient", inPatientSchema);
module.exports = inPatientModel;