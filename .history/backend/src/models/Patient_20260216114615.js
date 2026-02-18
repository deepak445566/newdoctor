import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phoneNo: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  doctorName: {
    type: String,
    required: true,
    trim: true
  },
  prescription: {
    type: String,
    required: true,
    trim: true
  },
  disease: {
    type: String,
    required: true,
    trim: true
  },
  dateOfJoining: {
    type: Date,
    default: Date.now
  },
  nextAppointmentDate: {
    type: Date,
    required: true
  },
  lastVisitDate: {
    type: Date,
    default: Date.now
  },
  treatmentStatus: {
    type: String,
    enum: ['ongoing', 'completed', 'cancelled'],
    default: 'ongoing'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for sorting upcoming appointments
patientSchema.index({ nextAppointmentDate: 1 });

const Patient = mongoose.model('Patient', patientSchema);
export default Patient;