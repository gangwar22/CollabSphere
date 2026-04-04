const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env'), override: true });
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const passport = require('passport');
const session = require('express-session');
require('./config/passport');


// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Passport & Sessions
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_session_secret',
    resave: false,
    saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

// Static folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/notes', require('./routes/noteRoutes'));
app.use('/api/files', require('./routes/fileRoutes'));
app.use('/api/gemini', require('./routes/geminiRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

app.get('/', (req, res) => {
    res.send('CollabSphere API is running...');
});

// Error Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
