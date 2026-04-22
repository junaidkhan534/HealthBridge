const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users", 
      required: true,
    },
    patientObj: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'users',
    required: true
  },
    patientId: {
      type: String,
      required: true,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "appointments",
      required: true,
    },
    medicines: [
      {
        name: { type: String, required: true },
        dosage: { type: String, required: true }, 
        duration: { type: String, required: true }, 
        instructions: { type: String },
      },
    ],
    diagnosis: {
      type: String,
      required: true,
    },
    followUpDate: {
      type: Date,
    },
    isReminded: {
      type: Boolean,
      default: false, 
    },
  },
  { timestamps: true }
);

const prescriptionModel = mongoose.model("prescriptions", prescriptionSchema);
module.exports = prescriptionModel;