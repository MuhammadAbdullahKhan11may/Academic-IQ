require('dotenv').config();
const express = require('express');
const cors = require('cors');
const analysisRoutes = require('./routes/analysisRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
app.use(express.static('../'));
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api', analysisRoutes);
app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/../index.html');
});
app.get('/', (req, res) => {
  console.log('Root route hit!');
  res.sendFile(__dirname + '/../index.html');
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`AcademicIQ backend running on http://localhost:${PORT}`);
});
