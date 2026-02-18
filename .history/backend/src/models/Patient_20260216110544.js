const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phoneNo: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    doctorPrescription: {
        type: String,
        required: true
    },
    disease: {
        type: String,
        required: true
    },
    dateOfJoining: {
        type: Date,
        default: Date.now
    },
    lastVisitDate: {
        type: Date,
        default: Date.now
    },
    nextAppointmentDate: {
        type: Date
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    whatsappNumber: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);