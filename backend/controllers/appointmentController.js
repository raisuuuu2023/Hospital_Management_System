const db = require('../config/db');

const bookAppointment = async (req, res) => {
  const { doctor_id, date, time } = req.body;
  const user_id = req.user.id;
  
  // Validate required fields (time is optional)
  if (!doctor_id || !date) {
    return res.status(400).json({ error: 'doctor_id and date are required' });
  }

  // Validate date is not in the past
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const appointmentDate = new Date(date);
  if (isNaN(appointmentDate.getTime())) {
    return res.status(400).json({ error: 'Invalid date format' });
  }
  if (appointmentDate < today) {
    return res.status(400).json({ error: 'Appointment date cannot be in the past' });
  }

  try {
    // Ensure patient profile exists
    let [patientRows] = await db.promise().query(
      'SELECT id FROM patients WHERE user_id = ?',
      [user_id]
    );
    
    // Create patient profile if not exists
    if (patientRows.length === 0) {
      await db.promise().query(
        'INSERT INTO patients (user_id) VALUES (?)',
        [user_id]
      );
      [patientRows] = await db.promise().query(
        'SELECT id FROM patients WHERE user_id = ?',
        [user_id]
      );
      console.log('Created new patient profile for user:', user_id);
    }

    const patient_id = patientRows[0].id;

    // Verify doctor exists
    const [doctorRows] = await db.promise().query(
      'SELECT d.id, u.name FROM doctors d JOIN users u ON u.id = d.user_id WHERE d.id = ?',
      [doctor_id]
    );

    if (doctorRows.length === 0) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    
    // Insert appointment - time will be NULL if not provided
    const [result] = await db.promise().query(
      `INSERT INTO appointments (patient_id, doctor_id, date, time, status) 
       VALUES (?, ?, ?, ?, 'pending')`,
      [patient_id, doctor_id, date, time || null]
    );
    
    console.log('Appointment booked successfully. ID:', result.insertId);
    
    res.status(201).json({
      message: 'Appointment request submitted successfully! The doctor will confirm your appointment time.',
      appointment_id: result.insertId
    });

  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).json({ 
      error: 'Failed to book appointment. Please try again.'
    });
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
    console.error('Error fetching appointments:', err);
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
    console.error('Error fetching doctor appointments:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

const updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const user_id = req.user.id;

  const allowed = ['confirmed', 'done', 'cancelled'];
  if (!allowed.includes(status)) {
    return res.status(400).json({
      error: "Status must be 'confirmed', 'done', or 'cancelled'"
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
    console.error('Error updating status:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

module.exports = {
  bookAppointment,
  getMyAppointments,
  getDoctorAppointments,
  updateStatus
};