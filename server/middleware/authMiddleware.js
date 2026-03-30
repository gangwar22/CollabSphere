const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            if (!decoded || !decoded.id) {
                res.status(401);
                return next(new Error('Invalid token structure'));
            }

            // Get user from the token
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                res.status(401);
                return next(new Error('User not found in system'));
            }

            next();
        } catch (error) {
            console.error('PROTECT MIDDLEWARE ERROR:', error);
            res.status(401);
            return next(new Error('Not authorized, token failed: ' + error.message));
        }
    }

    if (!token) {
        res.status(401);
        return next(new Error('Not authorized, no token provided'));
    }
};

const admin = (req, res, next) => {
    if (req.user && (req.user.isAdmin || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403); // Use 403 Forbidden for role issues
        return next(new Error('Not authorized as an admin. Access denied.'));
    }
};

module.exports = { protect, admin };
