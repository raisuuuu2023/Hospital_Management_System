const db = require('../config/db');

const bookAppointment = async (req, res) => {
  const { doctor_id, date, time } = req.body;
  const user_id = req.user.id;
  
  if (!doctor_id || !date || !time) {
    return res.status(400).json({ error: 'doctor_id, date and time are required' });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const appointmentDate = new Date(date);
  if (appointmentDate < today) {
    return res.status(400).json({ error: 'Appointment date cannot be in the past' });
  }

  try {
    const [patientRows] = await db.promise().query(
      'SELECT id FROM patients WHERE user_id = ?',
      [user_id]
    );


  if (patientRows.length === 0) {
      return res.status(400).json({
        error: 'Patient profile not found. Please update your profile first.'
      });
    }

  const patient_id = patientRows[0].id;

    const [doctorRows] = await db.promise().query(
      'SELECT id FROM doctors WHERE id = ?',
      [doctor_id]
    );

   if (doctorRows.length === 0) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    
    const [duplicate] = await db.promise().query(
      `SELECT id FROM appointments
       WHERE doctor_id = ? AND date = ? AND time = ? AND status != 'done'`,
      [doctor_id, date, time]
    );

    if (duplicate.length > 0) {
      return res.status(409).json({
        error: 'This time slot is already booked. Please choose another time.'
      });
    }

    const [result] = await db.promise().query(
      `INSERT INTO appointments (patient_id, doctor_id, date, time, status)
       VALUES (?, ?, ?, ?, 'pending')`,
      [patient_id, doctor_id, date, time]
    );
    
    res.status(201).json({
      message: 'Appointment booked successfully',
      appointment_id: result.insertId
    });

    } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

const getMyAppointments = async (req, res) => {
  const user_id = req.user.id;

  try {
    const [patientRows] = await db.promise().query(
      'SELECT id FROM patients WHERE user_id = ?',
      [user_id]
    );

    if (patientRows.length === 0) {
      return res.status(200).json({ appointments: [] });
    }
    
    const patient_id = patientRows[0].id;

    const [rows] = await db.promise().query(
      `SELECT
         a.id           AS appointment_id,
         a.date,
         a.time,
         a.status,
         d.id           AS doctor_id,
         u.name         AS doctor_name,
         d.specialty,
         d.fee
       FROM appointments a
       JOIN doctors d ON d.id = a.doctor_id
       JOIN users   u ON u.id = d.user_id
       WHERE a.patient_id = ?
       ORDER BY a.date DESC, a.time DESC`,
      [patient_id]
    );
    res.status(200).json({ appointments: rows });

    } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

const getDoctorAppointments = async (req, res) => {
  const user_id = req.user.id;

  try {
    const [doctorRows] = await db.promise().query(
      'SELECT id FROM doctors WHERE user_id = ?',
      [user_id]
    );

    if (doctorRows.length === 0) {
      return res.status(400).json({ error: 'Doctor profile not found' });
    }

    const doctor_id = doctorRows[0].id;

    const [rows] = await db.promise().query(
      `SELECT
         a.id           AS appointment_id,
         a.date,
         a.time,
         a.status,
         p.id           AS patient_id,
         u.name         AS patient_name,
         u.email        AS patient_email,
         p.phone        AS patient_phone,
         p.blood_group
       FROM appointments a
       JOIN patients p ON p.id = a.patient_id
       JOIN users    u ON u.id = p.user_id
       WHERE a.doctor_id = ?
       ORDER BY a.date ASC, a.time ASC`,
      [doctor_id]
    );

    res.status(200).json({ appointments: rows });

    } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

const updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const user_id = req.user.id;

  const allowed = ['confirmed', 'done'];
  if (!allowed.includes(status)) {
    return res.status(400).json({
      error: "Status must be 'confirmed' or 'done'"
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
      'SELECT id FROM appointments WHERE id = ? AND doctor_id = ?',
      [id, doctor_id]
    );

    if (apptRows.length === 0) {
      return res.status(404).json({
        error: 'Appointment not found or you are not authorized to update it'
      });
    }

    await db.promise().query(
      'UPDATE appointments SET status = ? WHERE id = ?',
      [status, id]
    );

    res.status(200).json({
      message: `Appointment status updated to '${status}'`
    });

  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

module.exports = {
  bookAppointment,
  getMyAppointments,
  getDoctorAppointments,
  updateStatus
};
