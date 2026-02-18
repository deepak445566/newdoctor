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
  }
});

const Visit = mongoose.model('Visit', visitSchema);
export default Visit;