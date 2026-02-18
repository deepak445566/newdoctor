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

// Virtual for calculated paid amount (optional, since we store it directly)
patientSchema.virtual('calculatedPaidAmount').get(function() {
  return this.totalAmount - this.restAmount;
});

// Pre-save middleware to update payment status and paid amount
patientSchema.pre('save', function(next) {
  try {
    // Update paid amount based on total and rest
    this.paidAmount = this.totalAmount - this.restAmount;
    
    // Update payment status based on amounts
    if (this.restAmount === 0) {
      this.paymentStatus = 'paid';
    } else if (this.restAmount < this.totalAmount) {
      this.paymentStatus = 'partial';
    } else {
      this.paymentStatus = 'pending';
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-update middleware for findOneAndUpdate operations
patientSchema.pre('findOneAndUpdate', function(next) {
  try {
    const update = this.getUpdate();
    
    // If updating totalAmount or restAmount, recalculate payment status
    if (update.totalAmount !== undefined || update.restAmount !== undefined) {
      const total = update.totalAmount !== undefined ? update.totalAmount : this.totalAmount;
      const rest = update.restAmount !== undefined ? update.restAmount : this.restAmount;
      
      if (rest === 0) {
        update.paymentStatus = 'paid';
      } else if (rest < total) {
        update.paymentStatus = 'partial';
      } else {
        update.paymentStatus = 'pending';
      }
      
      update.paidAmount = total - rest;
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

const Patient = mongoose.model('Patient', patientSchema);
export default Patient;