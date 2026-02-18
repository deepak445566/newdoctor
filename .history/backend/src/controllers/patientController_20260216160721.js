import Patient from '../models/Patient.js';
import Visit from '../models/Visit.js';

// Add new patient
export const addPatient = async (req, res) => {
  try {
    const {
      name,
      phoneNo,
      address,
      dateOfBirth,
      doctorName,
      prescription,
      disease,
      nextAppointmentDate,
      totalAmount,
      restAmount
    } = req.body;

    // Validation
    if (!name || !phoneNo || !address || !dateOfBirth || !doctorName || !prescription || !disease || !nextAppointmentDate || totalAmount === undefined || restAmount === undefined) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields"
      });
    }

    // Validate amounts
    if (totalAmount < 0 || restAmount < 0) {
      return res.status(400).json({
        success: false,
        message: "Amount fields cannot be negative"
      });
    }

    if (restAmount > totalAmount) {
      return res.status(400).json({
        success: false,
        message: "Rest amount cannot be greater than total amount"
      });
    }

    // Calculate payment status
    let paymentStatus = 'pending';
    if (restAmount === 0) {
      paymentStatus = 'paid';
    } else if (restAmount < totalAmount) {
      paymentStatus = 'partial';
    }

    const paidAmount = totalAmount - restAmount;

    const newPatient = new Patient({
      name,
      phoneNo,
      address,
      dateOfBirth,
      doctorName,
      prescription,
      disease,
      nextAppointmentDate: new Date(nextAppointmentDate),
      dateOfJoining: new Date(),
      totalAmount: Number(totalAmount),
      restAmount: Number(restAmount),
      paidAmount,
      paymentStatus
    });

    await newPatient.save();

    // Create initial visit record with payment info if any amount was paid
    if (paidAmount > 0) {
      const initialVisit = new Visit({
        patientId: newPatient._id,
        treatment: "Initial consultation",
        notes: "First visit - Payment received",
        prescription: prescription,
        nextAppointmentDate: new Date(nextAppointmentDate),
        amountPaid: paidAmount,
        paymentMethod: 'cash',
        paymentStatus: 'completed'
      });
      await initialVisit.save();
    }

    res.status(201).json({
      success: true,
      message: "Patient added successfully",
      patient: newPatient
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all patients
export const getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      patients
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get upcoming appointments (patients with next appointment date approaching)
export const getUpcomingAppointments = async (req, res) => {
  try {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 10); // Next 10 days

    const upcomingPatients = await Patient.find({
      nextAppointmentDate: {
        $gte: today,
        $lte: nextWeek
      },
      treatmentStatus: 'ongoing'
    }).sort({ nextAppointmentDate: 1 });

    res.json({
      success: true,
      patients: upcomingPatients
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update patient visit
export const updatePatientVisit = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      treatment, 
      notes, 
      prescription,
      nextAppointmentDate, 
      amountPaid,
      paymentMethod 
    } = req.body;

    const patient = await Patient.findById(id);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found"
      });
    }

    // Update payment if amount paid is provided
    let newRestAmount = patient.restAmount;
    let newPaidAmount = patient.paidAmount;
    let paymentStatus = patient.paymentStatus;

    if (amountPaid && amountPaid > 0) {
      newRestAmount = patient.restAmount - Number(amountPaid);
      if (newRestAmount < 0) {
        return res.status(400).json({
          success: false,
          message: "Amount paid cannot exceed rest amount"
        });
      }
      
      newPaidAmount = patient.totalAmount - newRestAmount;
      
      // Update payment status
      if (newRestAmount === 0) {
        paymentStatus = 'paid';
      } else if (newRestAmount < patient.totalAmount) {
        paymentStatus = 'partial';
      }

      // Update patient payment fields
      patient.restAmount = newRestAmount;
      patient.paidAmount = newPaidAmount;
      patient.paymentStatus = paymentStatus;
    }

    // Create visit record
    const visit = new Visit({
      patientId: id,
      treatment: treatment || patient.prescription,
      notes,
      prescription: prescription || patient.prescription,
      nextAppointmentDate: nextAppointmentDate ? new Date(nextAppointmentDate) : patient.nextAppointmentDate,
      amountPaid: amountPaid || 0,
      paymentMethod: paymentMethod || 'cash',
      paymentStatus: amountPaid > 0 ? 'completed' : 'pending'
    });
    await visit.save();

    // Update patient
    patient.lastVisitDate = new Date();
    if (nextAppointmentDate) {
      patient.nextAppointmentDate = new Date(nextAppointmentDate);
    }
    if (prescription) {
      patient.prescription = prescription;
    }
    await patient.save();

    res.json({
      success: true,
      message: "Visit updated successfully",
      patient,
      visit
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get patient by ID with visit history
export const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findById(id);
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found"
      });
    }

    // Get visit history with payment details
    const visits = await Visit.find({ patientId: id }).sort({ visitDate: -1 });

    // Calculate payment summary
    const totalPaid = visits.reduce((sum, visit) => sum + (visit.amountPaid || 0), 0);
    const paymentSummary = {
      totalAmount: patient.totalAmount,
      totalPaid: totalPaid,
      restAmount: patient.totalAmount - totalPaid,
      paymentStatus: patient.paymentStatus
    };

    res.json({
      success: true,
      patient,
      visits,
      paymentSummary
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send WhatsApp message
export const sendWhatsAppMessage = async (req, res) => {
  try {
    const { phoneNo, message } = req.body;
    
    // Format phone number (remove any special characters)
    const formattedPhone = phoneNo.replace(/\D/g, '');
    
    // Generate WhatsApp URL
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    
    res.json({
      success: true,
      whatsappUrl
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update payment for patient
export const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amountPaid, paymentMethod, notes } = req.body;

    const patient = await Patient.findById(id);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found"
      });
    }

    if (!amountPaid || amountPaid <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount paid must be greater than 0"
      });
    }

    const newRestAmount = patient.restAmount - amountPaid;
    if (newRestAmount < 0) {
      return res.status(400).json({
        success: false,
        message: "Amount paid cannot exceed rest amount"
      });
    }

    // Update patient payment fields
    patient.restAmount = newRestAmount;
    patient.paidAmount = patient.totalAmount - newRestAmount;
    
    // Update payment status
    if (newRestAmount === 0) {
      patient.paymentStatus = 'paid';
    } else if (newRestAmount < patient.totalAmount) {
      patient.paymentStatus = 'partial';
    }

    await patient.save();

    // Create a payment record in visits
    const paymentVisit = new Visit({
      patientId: id,
      treatment: "Payment Update",
      notes: notes || `Payment received: ₹${amountPaid}`,
      amountPaid: amountPaid,
      paymentMethod: paymentMethod || 'cash',
      paymentStatus: 'completed'
    });
    await paymentVisit.save();

    res.json({
      success: true,
      message: "Payment updated successfully",
      patient,
      payment: paymentVisit
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get payment history for a patient
export const getPaymentHistory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const patient = await Patient.findById(id);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found"
      });
    }

    // Get all visits with payments
    const payments = await Visit.find({ 
      patientId: id,
      amountPaid: { $gt: 0 }
    }).sort({ visitDate: -1 });

    const paymentHistory = {
      patientInfo: {
        name: patient.name,
        phoneNo: patient.phoneNo,
        totalAmount: patient.totalAmount,
        paidAmount: patient.paidAmount,
        restAmount: patient.restAmount,
        paymentStatus: patient.paymentStatus
      },
      payments: payments.map(p => ({
        date: p.visitDate,
        amount: p.amountPaid,
        method: p.paymentMethod,
        notes: p.notes,
        treatment: p.treatment
      }))
    };

    res.json({
      success: true,
      paymentHistory
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get patients with pending payments
export const getPendingPayments = async (req, res) => {
  try {
    const patients = await Patient.find({
      restAmount: { $gt: 0 },
      treatmentStatus: 'ongoing'
    }).sort({ restAmount: -1 });

    res.json({
      success: true,
      patients
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};