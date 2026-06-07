const db = require('../config/db');

const getProfile = async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      `SELECT
         u.id          AS user_id,
         u.name,
         u.email,
         d.id          AS doctor_id,
         d.specialty,
         d.fee,
         d.available_days
       FROM users u
       LEFT JOIN doctors d ON d.user_id = u.id
       WHERE u.id = ?`,
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.status(200).json({ profile: rows[0] });

  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};
  
const updateProfile = async (req, res) => {
  const { specialty, fee, available_days } = req.body;
  const user_id = req.user.id;

  if (!specialty || !fee || !available_days) {
    return res.status(400).json({
      error: 'specialty, fee and available_days are required'
    });
  }

  try {
    
    const [existing] = await db.promise().query(
      'SELECT id FROM doctors WHERE user_id = ?',
      [user_id]
    );

    if (existing.length === 0) {
      
      await db.promise().query(
        `INSERT INTO doctors (user_id, specialty, fee, available_days)
         VALUES (?, ?, ?, ?)`,
        [user_id, specialty, fee, available_days]
      );
    } else {
      
      await db.promise().query(
        `UPDATE doctors
         SET specialty = ?, fee = ?, available_days = ?
         WHERE user_id = ?`,
        [specialty, fee, available_days, user_id]
      );
    }

    res.status(200).json({ message: 'Doctor profile updated successfully' });

    } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

const createPrescription = async (req, res) => {
  const { appointment_id, doctor_notes, medicines } = req.body;
  const user_id = req.user.id;

  if (!appointment_id || !doctor_notes || !medicines) {
    return res.status(400).json({
      error: 'appointment_id, doctor_notes and medicines are required'
    });
  }

  if (!Array.isArray(medicines)) {
    return res.status(400).json({
      error: 'medicines must be an array e.g. ["Paracetamol 500mg", "Amoxicillin 250mg"]'
    });
  }

  try {
    
    const [doctorRows] = await db.promise().query(
      'SELECT id FROM doctors WHERE user_id = ?',
      [user_id]
    );

    if (doctorRows.length === 0) {
      return res.status(400).json({ error: 'Doctor profile not found' });
    }

    const doctor_id = doctorRows[0].id;

    const [apptRows] = await db.promise().query(
      `SELECT id, status FROM appointments
       WHERE id = ? AND doctor_id = ?`,
      [appointment_id, doctor_id]
    );

    if (apptRows.length === 0) {
      return res.status(404).json({
        error: 'Appointment not found or you are not assigned to it'
      });
    }
    
    if (apptRows[0].status !== 'done') {
      return res.status(400).json({
        error: 'Prescription can only be written for appointments with status done'
      });
    }
    
    const [existing] = await db.promise().query(
      'SELECT id FROM prescriptions WHERE appointment_id = ?',
      [appointment_id]
    );

     if (existing.length > 0) {
      return res.status(409).json({
        error: 'A prescription already exists for this appointment'
      });
    }

    const medicinesJSON = JSON.stringify(medicines);

    await db.promise().query(
      `INSERT INTO prescriptions (appointment_id, doctor_notes, medicines)
       VALUES (?, ?, ?)`,
      [appointment_id, doctor_notes, medicinesJSON]
    );

    res.status(201).json({ message: 'Prescription created successfully' });

  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

const getPrescription = async (req, res) => {
  const { appointmentId } = req.params;
  const user_id  = req.user.id;
  const userRole = req.user.role;

  try {
    let authorized = false;

    if (userRole === 'doctor') {
      
      const [rows] = await db.promise().query(
        `SELECT a.id FROM appointments a
         JOIN doctors d ON d.id = a.doctor_id
         WHERE a.id = ? AND d.user_id = ?`,
        [appointmentId, user_id]
      );
      authorized = rows.length > 0;

    } else if (userRole === 'patient') {
      const [rows] = await db.promise().query(
        `SELECT a.id FROM appointments a
         JOIN patients p ON p.id = a.patient_id
         WHERE a.id = ? AND p.user_id = ?`,
        [appointmentId, user_id]
      );
      authorized = rows.length > 0;
    }

    if (!authorized) {
      return res.status(403).json({
        error: 'You are not authorized to view this prescription'
      });
    }

    const [rows] = await db.promise().query(
      `SELECT
         pr.id,
         pr.appointment_id,
         pr.doctor_notes,
         pr.medicines,
         pr.created_at,
         u.name  AS doctor_name,
         d.specialty
       FROM prescriptions pr
       JOIN appointments a  ON a.id  = pr.appointment_id
       JOIN doctors d       ON d.id  = a.doctor_id
       JOIN users u         ON u.id  = d.user_id
       WHERE pr.appointment_id = ?`,
      [appointmentId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    const prescription = rows[0];

    prescription.medicines = JSON.parse(prescription.medicines);

    res.status(200).json({ prescription });

  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  createPrescription,
  getPrescription
};