const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    doctorInfo: { type: String, required: true },
    userInfo: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    status: {
        type: String,
        enum: ['pending', 'approved', 'cancelled', 'completed'],
        default: 'pending',
    },
    payment: {
        type: String,
        enum: ['Online', 'Cash'],
        default: 'Cash',
    },
    fees: {
        type: Number,
        required: true,
    }
}, { timestamps: true });

const appointmentModel = mongoose.model('appointments', appointmentSchema);
module.exports = appointmentModel;




// const mongoose = require('mongoose');

// const appointmentSchema = new mongoose.Schema({
//     userId: { // Patient's ID
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'users',
//         required: true,
//     },
//     doctorId: { // Doctor's ID
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'users',
//         required: true,
//     },
//     doctorInfo: {
//         type: String, // Store doctor's name for easy display
//         required: true,
//     },
//     userInfo: {
//         type: String, // Store patient's name for easy display
//         required: true,
//     },
//     date: {
//         type: String,
//         required: true,
//     },
//     time: {
//         type: String,
//         required: true,
//     },
//     status: {
//         type: String,
//         enum: ['pending', 'approved', 'cancelled', 'completed'],
//         default: 'pending',
//     },
//     payment: {
//         type: String,
//         enum: ['Cash', 'stripe', 'razorpay', 'Paid'],
//         default: 'Cash',
//     }
// }, { timestamps: true });

// const appointmentModel = mongoose.model('appointments', appointmentSchema);
// module.exports = appointmentModel;
