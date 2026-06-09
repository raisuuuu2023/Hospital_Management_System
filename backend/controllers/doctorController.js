const db = require('../config/db');

// Helper function to get existing columns
const getTableColumns = async (tableName) => {
  try {
    const [columns] = await db.promise().query('SHOW COLUMNS FROM ??', [tableName]);
    return columns.map(col => col.Field);
  } catch (err) {
    console.error(`Error getting columns for ${tableName}:`, err);
    return [];
  }
};

// Helper function to format currency
const formatCurrency = (amount) => {
  return amount ? parseFloat(amount).toFixed(2) : 0;
};

// Get doctor profile
const getProfile = async (req, res) => {
  const user_id = req.user.id;
  
  try {
    // Get existing columns in doctors table
    const existingColumns = await getTableColumns('doctors');
    
    // Base fields that always exist
    let selectFields = `
      u.id AS user_id,
      u.name,
      u.email,
      u.role,
      COALESCE(d.id, 0) AS doctor_id,
      COALESCE(d.specialty, '') AS specialty,
      COALESCE(d.fee, 0) AS fee,
      COALESCE(d.available_days, '') AS available_days
    `;
    
    // Add optional fields if they exist
    const optionalFields = ['license', 'bio', 'address', 'clinic_hours', 'phone'];
    optionalFields.forEach(field => {
      if (existingColumns.includes(field)) {
        selectFields += `, COALESCE(d.${field}, '') AS ${field}`;
      }
    });
    
    const [rows] = await db.promise().query(
      `SELECT ${selectFields}
       FROM users u
       LEFT JOIN doctors d ON d.user_id = u.id
       WHERE u.id = ? AND u.role = 'doctor'`,
      [user_id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Doctor profile not found' });
    }
    
    // Format the response
    const profile = rows[0];
    if (profile.fee) {
      profile.fee = formatCurrency(profile.fee);
    }
    
    res.status(200).json({ profile });
  } catch (err) {
    console.error('Error fetching doctor profile:', err);
    res.status(500).json({ error: 'Failed to fetch doctor profile', details: err.message });
  }
};

// Update doctor profile
const updateProfile = async (req, res) => {
  const user_id = req.user.id;
  const { 
    name, 
    phone, 
    specialty, 
    fee, 
    available_days, 
    clinic_hours, 
    license, 
    bio, 
    address 
  } = req.body;
  
  // Validate required fields
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  
  try {
    // Update user name
    await db.promise().query(
      'UPDATE users SET name = ? WHERE id = ?',
      [name, user_id]
    );
    
    // Get existing columns
    const existingColumns = await getTableColumns('doctors');
    
    // Check if doctor profile exists
    const [existing] = await db.promise().query(
      'SELECT id FROM doctors WHERE user_id = ?',
      [user_id]
    );
    
    if (existing.length === 0) {
      // Create doctor profile - only include columns that exist
      const fields = ['user_id'];
      const values = [user_id];
      
      // Add fields that are provided
      if (specialty) {
        fields.push('specialty');
        values.push(specialty);
      }
      if (fee) {
        fields.push('fee');
        values.push(fee);
      }
      if (available_days) {
        fields.push('available_days');
        values.push(available_days);
      }
      if (existingColumns.includes('clinic_hours') && clinic_hours) {
        fields.push('clinic_hours');
        values.push(clinic_hours);
      }
      if (existingColumns.includes('license') && license) {
        fields.push('license');
        values.push(license);
      }
      if (existingColumns.includes('bio') && bio) {
        fields.push('bio');
        values.push(bio);
      }
      if (existingColumns.includes('address') && address) {
        fields.push('address');
        values.push(address);
      }
      if (existingColumns.includes('phone') && phone) {
        fields.push('phone');
        values.push(phone);
      }
      
      const placeholders = fields.map(() => '?').join(', ');
      await db.promise().query(
        `INSERT INTO doctors (${fields.join(', ')}) VALUES (${placeholders})`,
        values
      );
    } else {
      // Update existing profile - only update columns that exist
      const updates = [];
      const values = [];
      
      if (specialty !== undefined) {
        updates.push('specialty = ?');
        values.push(specialty || null);
      }
      if (fee !== undefined) {
        updates.push('fee = ?');
        values.push(fee || 0);
      }
      if (available_days !== undefined) {
        updates.push('available_days = ?');
        values.push(available_days || null);
      }
      if (existingColumns.includes('clinic_hours')) {
        updates.push('clinic_hours = ?');
        values.push(clinic_hours || null);
      }
      if (existingColumns.includes('license')) {
        updates.push('license = ?');
        values.push(license || null);
      }
      if (existingColumns.includes('bio')) {
        updates.push('bio = ?');
        values.push(bio || null);
      }
      if (existingColumns.includes('address')) {
        updates.push('address = ?');
        values.push(address || null);
      }
      if (existingColumns.includes('phone')) {
        updates.push('phone = ?');
        values.push(phone || null);
      }
      
      if (updates.length > 0) {
        values.push(user_id);
        await db.promise().query(
          `UPDATE doctors SET ${updates.join(', ')} WHERE user_id = ?`,
          values
        );
      }
    }
    
    res.status(200).json({ 
      message: 'Profile updated successfully',
      profile: {
        name,
        phone,
        specialty,
        fee,
        available_days,
        clinic_hours,
        license,
        bio,
        address
      }
    });
  } catch (err) {
    console.error('Error updating doctor profile:', err);
    res.status(500).json({ error: 'Failed to update profile', details: err.message });
  }
};

// Get doctor's patients
const getMyPatients = async (req, res) => {
  const user_id = req.user.id;
  
  try {
    // Get doctor_id
    const [doctorRows] = await db.promise().query(
      'SELECT id FROM doctors WHERE user_id = ?',
      [user_id]
    );
    
    if (doctorRows.length === 0) {
      return res.status(400).json({ error: 'Doctor profile not found' });
    }
    
    const doctor_id = doctorRows[0].id;
    
    // Get all unique patients who have appointments with this doctor
    const [rows] = await db.promise().query(
      `SELECT 
         p.id AS patient_id,
         u.name,
         u.email,
         COALESCE(p.phone, '') AS phone,
         COALESCE(p.blood_group, '') AS blood_group,
         p.dob,
         COALESCE(p.address, '') AS address,
         COALESCE(p.sex, '') AS sex,
         COALESCE(p.age, 0) AS age,
         COUNT(a.id) AS total_visits,
         MAX(a.date) AS last_visit
       FROM appointments a
       JOIN patients p ON p.id = a.patient_id
       JOIN users u ON u.id = p.user_id
       WHERE a.doctor_id = ? AND a.status != 'cancelled'
       GROUP BY p.id, u.name, u.email, p.phone, p.blood_group, p.dob, p.address, p.sex, p.age
       ORDER BY last_visit DESC`,
      [doctor_id]
    );
    
    res.status(200).json({ patients: rows });
  } catch (err) {
    console.error('Error fetching patients:', err);
    res.status(500).json({ error: 'Failed to fetch patients', details: err.message });
  }
};

// Get patient history
const getPatientHistory = async (req, res) => {
  const { id } = req.params; // patient_id
  const user_id = req.user.id;
  
  if (!id || isNaN(id)) {
    return res.status(400).json({ error: 'Invalid patient ID' });
  }
  
  try {
    // Verify doctor
    const [doctorRows] = await db.promise().query(
      'SELECT id FROM doctors WHERE user_id = ?',
      [user_id]
    );
    
    if (doctorRows.length === 0) {
      return res.status(400).json({ error: 'Doctor profile not found' });
    }
    
    const doctor_id = doctorRows[0].id;
    
    // Get patient details
    const [patientRows] = await db.promise().query(
      `SELECT 
         p.id AS patient_id,
         u.name,
         u.email,
         COALESCE(p.phone, '') AS phone,
         COALESCE(p.blood_group, '') AS blood_group,
         p.dob,
         COALESCE(p.address, '') AS address,
         COALESCE(p.sex, '') AS sex,
         COALESCE(p.age, 0) AS age
       FROM patients p
       JOIN users u ON u.id = p.user_id
       WHERE p.id = ?`,
      [id]
    );
    
    if (patientRows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    // Get all appointments for this patient with this doctor
    const [appointments] = await db.promise().query(
      `SELECT 
         a.id AS appointment_id,
         a.date,
         COALESCE(a.time, 'TBD') AS time,
         a.status,
         a.created_at
       FROM appointments a
       WHERE a.patient_id = ? AND a.doctor_id = ?
       ORDER BY a.date DESC, a.time DESC`,
      [id, doctor_id]
    );
    
    res.status(200).json({
      patient: patientRows[0],
      appointments: appointments,
      total_visits: appointments.length
    });
  } catch (err) {
    console.error('Error fetching patient history:', err);
    res.status(500).json({ error: 'Failed to fetch patient history', details: err.message });
  }
};

// Create prescription
const createPrescription = async (req, res) => {
  const { appointment_id, diagnosis, medications, instructions, follow_up_date } = req.body;
  const user_id = req.user.id;
  
  // Validate required fields
  if (!appointment_id) {
    return res.status(400).json({ error: 'Appointment ID is required' });
  }
  if (!diagnosis) {
    return res.status(400).json({ error: 'Diagnosis is required' });
  }
  if (!medications) {
    return res.status(400).json({ error: 'Medications are required' });
  }
  
  try {
    // Verify doctor
    const [doctorRows] = await db.promise().query(
      'SELECT id FROM doctors WHERE user_id = ?',
      [user_id]
    );
    
    if (doctorRows.length === 0) {
      return res.status(400).json({ error: 'Doctor profile not found' });
    }
    
    const doctor_id = doctorRows[0].id;
    
    // Verify appointment belongs to this doctor and is done
    const [apptRows] = await db.promise().query(
      'SELECT id, patient_id FROM appointments WHERE id = ? AND doctor_id = ? AND status = "done"',
      [appointment_id, doctor_id]
    );
    
    if (apptRows.length === 0) {
      return res.status(404).json({ 
        error: 'Appointment not found, not completed, or you are not authorized' 
      });
    }
    
    // Check if prescription already exists
    const [existingPrescription] = await db.promise().query(
      'SELECT id FROM prescriptions WHERE appointment_id = ?',
      [appointment_id]
    );
    
    if (existingPrescription.length > 0) {
      return res.status(409).json({ 
        error: 'Prescription already exists for this appointment' 
      });
    }
    
    // Create prescription
    const [result] = await db.promise().query(
      `INSERT INTO prescriptions (appointment_id, doctor_id, diagnosis, medications, instructions, follow_up_date, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [appointment_id, doctor_id, diagnosis, medications, instructions, follow_up_date || null]
    );
    
    res.status(201).json({
      success: true,
      message: 'Prescription created successfully',
      prescription_id: result.insertId
    });
  } catch (err) {
    console.error('Error creating prescription:', err);
    res.status(500).json({ error: 'Failed to create prescription', details: err.message });
  }
};

// Get prescription
const getPrescription = async (req, res) => {
  const { appointmentId } = req.params;
  const user_id = req.user.id;
  
  if (!appointmentId || isNaN(appointmentId)) {
    return res.status(400).json({ error: 'Invalid appointment ID' });
  }
  
  try {
    // Check if user is patient or doctor
    const [userRows] = await db.promise().query(
      'SELECT role FROM users WHERE id = ?',
      [user_id]
    );
    
    const userRole = userRows[0]?.role;
    
    if (!userRole) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    let query = `
      SELECT 
        p.id AS prescription_id,
        p.diagnosis,
        p.medications,
        p.instructions,
        p.follow_up_date,
        DATE_FORMAT(p.created_at, '%Y-%m-%d') AS created_at,
        a.id AS appointment_id,
        a.date AS appointment_date,
        COALESCE(a.time, 'TBD') AS appointment_time,
        d.name AS doctor_name,
        d.specialty,
        pat.name AS patient_name,
        pat.email AS patient_email
      FROM prescriptions p
      JOIN appointments a ON a.id = p.appointment_id
      JOIN doctors doc ON doc.id = p.doctor_id
      JOIN users d ON d.id = doc.user_id
      JOIN patients pati ON pati.id = a.patient_id
      JOIN users pat ON pat.id = pati.user_id
      WHERE a.id = ?
    `;
    
    const params = [appointmentId];
    
    // Add role-based filtering
    if (userRole === 'patient') {
      query += ` AND a.patient_id = (SELECT id FROM patients WHERE user_id = ?)`;
      params.push(user_id);
    } else if (userRole === 'doctor') {
      query += ` AND p.doctor_id = (SELECT id FROM doctors WHERE user_id = ?)`;
      params.push(user_id);
    }
    
    const [rows] = await db.promise().query(query, params);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Prescription not found or you are not authorized to view it' });
    }
    
    res.status(200).json({ prescription: rows[0] });
  } catch (err) {
    console.error('Error fetching prescription:', err);
    res.status(500).json({ error: 'Failed to fetch prescription', details: err.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getMyPatients,
  getPatientHistory,
  createPrescription,
  getPrescription
};