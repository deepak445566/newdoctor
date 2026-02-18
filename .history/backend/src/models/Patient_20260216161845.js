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
  // Payment fields
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  restAmount: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  paidAmount: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'paid'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for sorting upcoming appointments
patientSchema.index({ nextAppointmentDate: 1 });

// Virtual for calculated paid amount (optional)
patientSchema.virtual('calculatedPaidAmount').get(function() {
  return this.totalAmount - this.restAmount;
});

// Remove all middleware - calculations will be done in controllers
// No pre('save') or pre('findOneAndUpdate') hooks

const Patient = mongoose.model('Patient', patientSchema);
export default Patient;