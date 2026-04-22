const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
{
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
  doctorInfo: { type: String, required: true },
  userInfo: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },

  status: {
    type: String,
    enum: [
      "pending",
      "approved",
      "cancelled",
      "completed",
      "admitted",
      "discharged"
    ],
    default: "pending",
  },

  payment: {
    type: String,
    enum: ["Online", "Cash"],
    default: "Cash",
  },

  fees: { type: Number, required: true },

  wardType: { type: String, default: "" },
  bedNumber: { type: String, default: "" },

  admissionDate: { type: Date },
  dischargeDate: { type: Date },

  vitalsAtAdmission: {
    temp: { type: String, default: "" },
    bp: { type: String, default: "" },
    spO2: { type: String, default: "" },
  },


  initialDiagnosis: { type: String, default: "" },

  treatmentNotes: [
    {
      note: String,
      addedAt: { type: Date, default: Date.now }
    }
  ],

  dischargeSummary: {
    finalDiagnosis: { type: String, default: "" },
    treatmentGiven: { type: String, default: "" },
    medicines: [{ type: String }],
    advice: { type: String, default: "" },
    preparedAt: { type: Date }
  }

},
{ timestamps: true }
);

module.exports = mongoose.model("appointments", appointmentSchema);
