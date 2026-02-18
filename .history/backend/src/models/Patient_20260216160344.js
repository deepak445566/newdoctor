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
  // New payment fields
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

// Virtual for calculating paid amount (totalAmount - restAmount)
patientSchema.virtual('calculatedPaidAmount').get(function() {
  return this.totalAmount - this.restAmount;
});

// Pre-save middleware to update payment status
patientSchema.pre('save', function(next) {
  if (this.restAmount === 0) {
    this.paymentStatus = 'paid';
  } else if (this.restAmount < this.totalAmount) {
    this.paymentStatus = 'partial';
  } else {
    this.paymentStatus = 'pending';
  }
  
  // Update paid amount
  this.paidAmount = this.totalAmount - this.restAmount;
  
  next();
});

const Patient = mongoose.model('Patient', patientSchema);
export default Patient;