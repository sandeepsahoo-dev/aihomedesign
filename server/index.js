const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const aiRoutes = require('./routes/aiRoutes');

dotenv.config();

// Connect to database
connectDB();

const app = express();

const path = require('path');
const pdfRoutes = require('./routes/pdfRoutes');

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Basic Route
app.get('/', (req, res) => {
    res.send('AI Home Design Backend is running...');
});

app.get('/api/health', (req, res) => {
    res.status(200).json({ message: 'Server is running' });
});

app.use('/api/users', userRoutes);
app.use('/api', aiRoutes);
app.use('/api/pdf', pdfRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
