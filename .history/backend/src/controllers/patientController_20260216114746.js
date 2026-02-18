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
      nextAppointmentDate
    } = req.body;

    // Validation
    if (!name || !phoneNo || !address || !dateOfBirth || !doctorName || !prescription || !disease || !nextAppointmentDate) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields"
      });
    }

    const newPatient = new Patient({
      name,
      phoneNo,
      address,
      dateOfBirth,
      doctorName,
      prescription,
      disease,
      nextAppointmentDate: new Date(nextAppointmentDate),
      dateOfJoining: new Date()
    });

    await newPatient.save();

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
    const { treatment, notes, nextAppointmentDate } = req.body;

    const patient = await Patient.findById(id);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found"
      });
    }

    // Create visit record
    const visit = new Visit({
      patientId: id,
      treatment: treatment || patient.prescription,
      notes,
      nextAppointmentDate: nextAppointmentDate ? new Date(nextAppointmentDate) : patient.nextAppointmentDate
    });
    await visit.save();

    // Update patient
    patient.lastVisitDate = new Date();
    if (nextAppointmentDate) {
      patient.nextAppointmentDate = new Date(nextAppointmentDate);
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

// Get patient by ID
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

    // Get visit history
    const visits = await Visit.find({ patientId: id }).sort({ visitDate: -1 });

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