const path = require('path');
require('dotenv').config();
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

// CORS Configuration - Allow any localhost port in development
const corsOptions = {
    origin: function (origin, callback) {
        const isDev = process.env.NODE_ENV === 'development';
        
        // Whitelist of allowed origins
        const whitelist = [
            process.env.CLIENT_URL || 'http://localhost:5173',
            'http://localhost:5173',
            'http://localhost:5174',
            'http://localhost:5175',
            'http://localhost:5176',
            'http://localhost:3000',
            'http://127.0.0.1:5173',
            'http://127.0.0.1:5174',
            'http://127.0.0.1:5175',
            'http://127.0.0.1:3000',
        ];
        
        // In development, allow any localhost origin
        if (isDev && origin && /^http:\/\/localhost:\d+$/.test(origin)) {
            callback(null, true);
        } else if (isDev && origin && /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) {
            callback(null, true);
        } else if (!isDev && whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else if (!origin) {
            // Allow requests without origin (mobile apps, curl, etc.)
            callback(null, true);
        } else if (isDev) {
            // In development, be permissive
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
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

// Serve Frontend in Production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));

    // Use a regular expression to handle all non-API paths for React Router
    app.get(/^(?!\/api).+/, (req, res) => {
        res.sendFile(path.resolve(__dirname, '../', 'client', 'dist', 'index.html'));
    });
} else {
    app.get('/', (req, res) => {
        res.send('CollabSphere API is running...');
    });
}

// Use error middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
