import mongoose from 'mongoose';

const visitSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  visitDate: {
    type: Date,
    default: Date.now
  },
  treatment: {
    type: String,
    required: true
  },
  notes: {
    type: String
  },
  prescription: {
    type: String
  },
  nextAppointmentDate: {
    type: Date
  },
  // Payment fields for this visit
  amountPaid: {
    type: Number,
    default: 0,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi', 'bank_transfer', 'other'],
    default: 'cash'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'completed'
  }
});

const Visit = mongoose.model('Visit', visitSchema);
export default Visit;