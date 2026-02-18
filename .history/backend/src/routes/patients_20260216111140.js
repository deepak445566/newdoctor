const express = require('express');
const router = express.Router();

const Patient = require('../models/Patient');
const authMiddleware = require('../middleware/authMiddleware');

// Add new patient
router.post('/', authMiddleware, async (req, res) => {
    try {
        const patient = new Patient(req.body);
        await patient.save();
        res.status(201).json({ message: 'Patient added successfully', patient });
    } catch (error) {
        res.status(500).json({ message: 'Error adding patient', error: error.message });
    }
});

// Get all patients
router.get('/', authM, async (req, res) => {
    try {
        const patients = await Patient.find().sort({ createdAt: -1 });
        res.json(patients);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching patients', error: error.message });
    }
});

// Get patient by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }
        res.json(patient);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching patient', error: error.message });
    }
});

// Update patient
router.put('/:id', auth, async (req, res) => {
    try {
        const patient = await Patient.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json({ message: 'Patient updated successfully', patient });
    } catch (error) {
        res.status(500).json({ message: 'Error updating patient', error: error.message });
    }
});

// Mark treatment as completed
router.patch('/:id/complete', auth, async (req, res) => {
    try {
        const patient = await Patient.findByIdAndUpdate(
            req.params.id,
            { isCompleted: true },
            { new: true }
        );
        res.json({ message: 'Treatment completed', patient });
    } catch (error) {
        res.status(500).json({ message: 'Error updating patient', error: error.message });
    }
});

// Get upcoming appointments (next 10 days)
router.get('/appointments/upcoming', auth, async (req, res) => {
    try {
        const today = new Date();
        const nextTenDays = new Date();
        nextTenDays.setDate(today.getDate() + 10);

        const upcomingAppointments = await Patient.find({
            nextAppointmentDate: {
                $gte: today,
                $lte: nextTenDays
            }
        }).sort({ nextAppointmentDate: 1 });

        res.json(upcomingAppointments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching appointments', error: error.message });
    }
});

module.exports = router;