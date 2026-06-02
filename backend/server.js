const express    = require('express');
const cors       = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());  

const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const appointmentRoutes = require('./routes/appointments');
const doctorRoutes      = require('./routes/doctors');

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/doctors',      doctorRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Hospital API is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});