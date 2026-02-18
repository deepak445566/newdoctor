import Patient from '../models/Patient.js';
import Visit from '../models/Visit.js';

// ============= HELPER FUNCTIONS =============

// Helper function to generate 10-digit random unique registration number
const generateRegistrationNo = async () => {
  let registrationNo;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 20; // Prevent infinite loop
  
  while (!isUnique && attempts < maxAttempts) {
    // Generate 10 random digits
    registrationNo = '';
    for (let i = 0; i < 10; i++) {
      registrationNo += Math.floor(Math.random() * 10).toString();
    }
    
    // Check if registration number already exists
    const existingPatient = await Patient.findOne({ registrationNo });
    if (!existingPatient) {
      isUnique = true;
    }
    attempts++;
  }
  
  if (!isUnique) {
    // Fallback: Use timestamp if random generation fails
    registrationNo = Date.now().toString().slice(-10);
  }
  
  return registrationNo;
};

// Alternative 1: With prefix (PAT + 7 digits = 10 total)
const generateRegNoWithPrefix = async () => {
  let registrationNo;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 20;
  
  while (!isUnique && attempts < maxAttempts) {
    const prefix = 'PAT';
    let digits = '';
    for (let i = 0; i < 7; i++) {
      digits += Math.floor(Math.random() * 10).toString();
    }
    registrationNo = `${prefix}${digits}`; // PAT1234567
    
    const existingPatient = await Patient.findOne({ registrationNo });
    if (!existingPatient) {
      isUnique = true;
    }
    attempts++;
  }
  
  return registrationNo;
};

// Alternative 2: Timestamp based (last 10 digits of timestamp)
const generateTimestampRegNo = async () => {
  const timestamp = Date.now().toString();
  const registrationNo = timestamp.slice(-10); // Last 10 digits
  
  // Check if exists (rare case)
  const existingPatient = await Patient.findOne({ registrationNo });
  if (existingPatient) {
    // If exists, add random number at the end
    return registrationNo.slice(0, 8) + Math.floor(Math.random() * 100).toString().padStart(2, '0');
  }
  
  return registrationNo;
};

// Alternative 3: Combination (2 letters + 8 digits)
const generateMixedRegNo = async () => {
  let registrationNo;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 20;
  
  while (!isUnique && attempts < maxAttempts) {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    
    // Add 2 random letters
    for (let i = 0; i < 2; i++) {
      result += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    
    // Add 8 random digits
    for (let i = 0; i < 8; i++) {
      result += Math.floor(Math.random() * 10).toString();
    }
    
    registrationNo = result; // AB12345678
    
    const existingPatient = await Patient.findOne({ registrationNo });
    if (!existingPatient) {
      isUnique = true;
    }
    attempts++;
  }
  
  return registrationNo;
};

// Helper function to calculate payment status
const calculatePaymentStatus = (totalAmount, restAmount) => {
  if (restAmount === 0) {
    return 'paid';
  } else if (restAmount < totalAmount) {
    return 'partial';
  } else {
    return 'pending';
  }
};

// Helper function to calculate paid amount
const calculatePaidAmount = (totalAmount, restAmount) => {
  return Number(totalAmount) - Number(restAmount);
};

// ============= MAIN CONTROLLER FUNCTIONS =============

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
      totalAmount = 0,
      restAmount = 0
    } = req.body;

    // Validation
    if (!name || !phoneNo || !address || !dateOfBirth || !doctorName || !prescription || !disease || !nextAppointmentDate) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields"
      });
    }

    // Convert to numbers
    const total = Number(totalAmount);
    const rest = Number(restAmount);

    // Validate amounts
    if (total < 0 || rest < 0) {
      return res.status(400).json({
        success: false,
        message: "Amount fields cannot be negative"
      });
    }

    if (rest > total) {
      return res.status(400).json({
        success: false,
        message: "Rest amount cannot be greater than total amount"
      });
    }

    // Generate unique 10-digit registration number
    // You can use any of the above functions
    const registrationNo = await generateRegistrationNo();
    // const registrationNo = await generateRegNoWithPrefix();
    // const registrationNo = await generateTimestampRegNo();
    // const registrationNo = await generateMixedRegNo();

    // Calculate payment fields
    const paidAmount = calculatePaidAmount(total, rest);
    const paymentStatus = calculatePaymentStatus(total, rest);

    const newPatient = new Patient({
      registrationNo,
      name,
      phoneNo,
      address,
      dateOfBirth,
      doctorName,
      prescription,
      disease,
      nextAppointmentDate: new Date(nextAppointmentDate),
      dateOfJoining: new Date(),
      totalAmount: total,
      restAmount: rest,
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
    const totalPaidFromVisits = visits.reduce((sum, visit) => sum + (visit.amountPaid || 0), 0);
    
    const paymentSummary = {
      totalAmount: patient.totalAmount,
      totalPaid: patient.paidAmount,
      restAmount: patient.restAmount,
      paymentStatus: patient.paymentStatus,
      totalPaidFromVisits: totalPaidFromVisits
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

// Get patient by registration number
export const getPatientByRegNo = async (req, res) => {
  try {
    const { regNo } = req.params;
    
    const patient = await Patient.findOne({ registrationNo: regNo });
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found with this registration number"
      });
    }

    // Get visit history
    const visits = await Visit.find({ patientId: patient._id }).sort({ visitDate: -1 });

    res.json({
      success: true,
      patient,
      visits
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Search patients by registration number (partial match)
export const searchPatientsByRegNo = async (req, res) => {
  try {
    const { query } = req.query;
    
    const patients = await Patient.find({
      registrationNo: { $regex: query, $options: 'i' }
    }).limit(10);

    res.json({
      success: true,
      patients
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get upcoming appointments
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
    if (amountPaid && amountPaid > 0) {
      const paid = Number(amountPaid);
      const newRestAmount = patient.restAmount - paid;
      
      if (newRestAmount < 0) {
        return res.status(400).json({
          success: false,
          message: "Amount paid cannot exceed rest amount"
        });
      }
      
      // Calculate new payment fields
      const newPaidAmount = patient.paidAmount + paid;
      const newPaymentStatus = calculatePaymentStatus(patient.totalAmount, newRestAmount);

      // Update patient payment fields
      patient.restAmount = newRestAmount;
      patient.paidAmount = newPaidAmount;
      patient.paymentStatus = newPaymentStatus;
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

    const paid = Number(amountPaid);
    
    if (!paid || paid <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount paid must be greater than 0"
      });
    }

    const newRestAmount = patient.restAmount - paid;
    if (newRestAmount < 0) {
      return res.status(400).json({
        success: false,
        message: "Amount paid cannot exceed rest amount"
      });
    }

    // Calculate new payment fields
    const newPaidAmount = patient.paidAmount + paid;
    const newPaymentStatus = calculatePaymentStatus(patient.totalAmount, newRestAmount);

    // Update patient payment fields
    patient.restAmount = newRestAmount;
    patient.paidAmount = newPaidAmount;
    patient.paymentStatus = newPaymentStatus;

    await patient.save();

    // Create a payment record in visits
    const paymentVisit = new Visit({
      patientId: id,
      treatment: "Payment Update",
      notes: notes || `Payment received: ₹${paid}`,
      amountPaid: paid,
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
        registrationNo: patient.registrationNo,
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

// Bulk update payments (for multiple patients)
export const bulkUpdatePayments = async (req, res) => {
  try {
    const { payments } = req.body; // Array of { patientId, amountPaid, paymentMethod }
    
    const results = [];
    
    for (const payment of payments) {
      const patient = await Patient.findById(payment.patientId);
      
      if (patient) {
        const paid = Number(payment.amountPaid);
        const newRestAmount = patient.restAmount - paid;
        
        if (newRestAmount >= 0) {
          // Calculate new payment fields
          const newPaidAmount = patient.paidAmount + paid;
          const newPaymentStatus = calculatePaymentStatus(patient.totalAmount, newRestAmount);

          // Update patient
          patient.restAmount = newRestAmount;
          patient.paidAmount = newPaidAmount;
          patient.paymentStatus = newPaymentStatus;
          
          await patient.save();
          
          // Create visit record
          const paymentVisit = new Visit({
            patientId: patient._id,
            treatment: "Bulk Payment Update",
            notes: payment.notes || `Payment received: ₹${paid}`,
            amountPaid: paid,
            paymentMethod: payment.paymentMethod || 'cash',
            paymentStatus: 'completed'
          });
          await paymentVisit.save();
          
          results.push({
            patientId: patient._id,
            name: patient.name,
            registrationNo: patient.registrationNo,
            success: true,
            newRestAmount
          });
        } else {
          results.push({
            patientId: patient._id,
            name: patient.name,
            registrationNo: patient.registrationNo,
            success: false,
            error: "Amount exceeds rest amount"
          });
        }
      }
    }
    
    res.json({
      success: true,
      message: "Bulk payment update completed",
      results
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};