const { validationResult } = require('express-validator');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const env = require('../config/env');

/**
 * Helper: Send JWT token in httpOnly cookie + JSON response.
 */
const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();

    const cookieOptions = {
        expires: new Date(Date.now() + env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
    };

    // Remove password from output
    const userObj = user.toObject();
    delete userObj.password;

    res
        .status(statusCode)
        .cookie('token', token, cookieOptions)
        .json({
            success: true,
            token,
            user: userObj,
        });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res, next) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ErrorResponse(errors.array()[0].msg, 400));
        }

        const { name, email, password, phone, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return next(new ErrorResponse('An account with this email already exists', 400));
        }

        // Only allow customer, restaurant, delivery, ngo roles — admin must be set manually
        const allowedRoles = ['customer', 'restaurant', 'delivery', 'ngo'];
        const userRole = allowedRoles.includes(role) ? role : 'customer';

        const user = await User.create({
            name,
            email,
            password,
            phone,
            role: userRole,
        });

        sendTokenResponse(user, 201, res);
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ErrorResponse(errors.array()[0].msg, 400));
        }

        const { email, password } = req.body;

        // Find user and include password field
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return next(new ErrorResponse('Invalid email or password', 401));
        }

        if (!user.isActive) {
            return next(new ErrorResponse('Your account has been deactivated', 401));
        }

        // Check password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return next(new ErrorResponse('Invalid email or password', 401));
        }

        sendTokenResponse(user, 200, res);
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Get current logged-in user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({
            success: true,
            user,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Logout — clear cookie
 * @route   POST /api/auth/logout
 * @access  Private
 */
exports.logout = async (req, res, next) => {
    try {
        res.cookie('token', 'none', {
            expires: new Date(Date.now() + 5 * 1000), // 5 seconds
            httpOnly: true,
        });

        res.status(200).json({
            success: true,
            message: 'Logged out successfully',
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/updateprofile
 * @access  Private
 */
exports.updateProfile = async (req, res, next) => {
    try {
        const fieldsToUpdate = {};
        const allowedFields = ['name', 'phone', 'avatar'];

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                fieldsToUpdate[field] = req.body[field];
            }
        });

        const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            success: true,
            user,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Update password
 * @route   PUT /api/auth/updatepassword
 * @access  Private
 */
exports.updatePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return next(new ErrorResponse('Please provide current and new password', 400));
        }

        if (newPassword.length < 6) {
            return next(new ErrorResponse('New password must be at least 6 characters', 400));
        }

        const user = await User.findById(req.user.id).select('+password');

        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return next(new ErrorResponse('Current password is incorrect', 401));
        }

        user.password = newPassword;
        await user.save();

        sendTokenResponse(user, 200, res);
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Add / update address
 * @route   POST /api/auth/address
 * @access  Private
 */
exports.addAddress = async (req, res, next) => {
    try {
        const { label, street, city, state, zipCode, country, isDefault } = req.body;

        const user = await User.findById(req.user.id);

        // If this address is set as default, unset all others
        if (isDefault) {
            user.addresses.forEach((addr) => (addr.isDefault = false));
        }

        user.addresses.push({ label, street, city, state, zipCode, country, isDefault });
        await user.save();

        res.status(200).json({
            success: true,
            addresses: user.addresses,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Delete address
 * @route   DELETE /api/auth/address/:addressId
 * @access  Private
 */
exports.deleteAddress = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        user.addresses = user.addresses.filter(
            (addr) => addr._id.toString() !== req.params.addressId
        );
        await user.save();

        res.status(200).json({
            success: true,
            addresses: user.addresses,
        });
    } catch (err) {
        next(err);
    }
};
