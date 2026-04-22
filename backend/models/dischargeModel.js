const mongoose = require("mongoose");

const dischargeSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    admissionDate: {
      type: Date,
      required: true,
    },
    dischargeDate: {
      type: Date,
      default: Date.now,
    },
    diagnosis: {
      type: String,
      required: true,
    },
    treatmentGiven: {
      type: String, 
    },
    summary: {
      type: String, 
      required: true,
    },
    followUpDate: {
      type: Date,
    },
    instructions: {
      type: String, 
    },
  },
  { timestamps: true }
);

const dischargeModel = mongoose.model("dischargeSummaries", dischargeSchema);
module.exports = dischargeModel;