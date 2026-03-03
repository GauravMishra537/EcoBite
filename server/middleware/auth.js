const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const env = require('../config/env');

/**
 * Protect routes — verify JWT token from cookie or Authorization header.
 */
const protect = async (req, res, next) => {
    let token;

    // Check for token in cookies first, then Authorization header
    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    } else if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, env.JWT_SECRET);

        // Attach user to request
        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return next(new ErrorResponse('User not found', 401));
        }

        if (!req.user.isActive) {
            return next(new ErrorResponse('Your account has been deactivated', 401));
        }

        next();
    } catch (err) {
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }
};

/**
 * Authorize by role — restrict access to specific roles.
 * Usage: authorize('admin', 'restaurant')
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new ErrorResponse(
                    `Role '${req.user.role}' is not authorized to access this route`,
                    403
                )
            );
        }
        next();
    };
};

module.exports = { protect, authorize };
