const mongoose = require('mongoose');

const wardSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true 
    },
    totalBeds: { type: Number, default: 0 },
    beds: [{
        bedNumber: { type: String, required: true },
        status: { 
            type: String, 
            enum: ['available', 'occupied', 'maintenance'], 
            default: 'available' 
        }
    }]
}, { timestamps: true });

module.exports = mongoose.model('wards', wardSchema);