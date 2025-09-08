// appointy-backend/models/userModel.js

const mongoose = require('mongoose');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: { type: String, required: [true, 'Name is required'] },
    email: { 
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address",
        ], 
    },
    password: { 
        type: String,
        required: [true, 'Password is required'],
        minlength: [5, "Password must be at least 6 characters long"],
     },
    role: { type: String, enum: ['patient', 'doctor', 'admin'], default: 'patient' },
    patientId: { 
        type: String, 
        unique: true, 
        sparse: true
    },

    available: { type: Boolean, default: true },
    // Verification & Reset
    isVerified: { type: Boolean, default: false },
    otp: String,
    otpExpires: Date,
    // passwordResetToken: String,
    // passwordResetExpires: Date,
    
    // Common Profile Fields
    profilePicture: { type: String, default: '' },
    phone: { type: String },
    address: { type: String },
    dob: { type: String },
    gender: { 
        type: String, 
        enum: ['male', 'female', 'other', 'Male', 'Female', 'Other'],
        required: false,
        default: null
    },
    bloodGroup: { 
        type: String,
        enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"],
        required: false, // allow skipping
        default: null  
     },

    
    // Doctor-specific fields
    
    doctorId: { type: String, unique: true, sparse: true }, // sparse allows null values to not violate unique rule
    specialty: { type: String },
    qualifications: { type: String },
    experience: { type: Number }, // Must be a Number
    fees: { type: Number },       // Must be a Number
    bio: { type: String },
    availableDays: [
      {
        type: String,
        enum: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
      },
    ],
timings: {
    type: [{
        start: { type: String },
        end: { type: String }
    }],
    default: []
},
   
    // timings: {
    //     type: [{
    //         start: { type: String },
    //         end: { type: String }
    //     }],
    //     default: []
    // },
    // status: { type: String, default: 'approved' },

    // Admin-specific field
    isAdmin: { type: Boolean, default: false },
    notification: { type: Array, default: [] },
    seennotification: { type: Array, default: [] }
}, { timestamps: true });

// Pre-save hook to update isAdmin based on role
userSchema.pre('save', function (next) {
    if (this.isModified('role') && this.role === 'admin') {
        this.isAdmin = true;
    }
    next();
});

// Method to generate OTP
userSchema.methods.createOtp = function() {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.otp = otp;
    this.otpExpires = Date.now() + 10 * 60 * 1000;
    return otp;
};

const userModel = mongoose.model('users', userSchema);
module.exports = userModel;
