const TableBooking = require('../models/TableBooking');
const Restaurant = require('../models/Restaurant');
const ErrorResponse = require('../utils/errorResponse');

// Available time slots
const TIME_SLOTS = [
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '18:00', '18:30', '19:00', '19:30', '20:00',
    '20:30', '21:00', '21:30',
];

const MAX_BOOKINGS_PER_SLOT = 5;

/**
 * @desc    Get available time slots for a restaurant on a date
 * @route   GET /api/bookings/slots/:restaurantId
 * @access  Public
 */
exports.getAvailableSlots = async (req, res, next) => {
    try {
        const { restaurantId } = req.params;
        const { date } = req.query;

        if (!date) {
            return next(new ErrorResponse('Date query parameter is required (YYYY-MM-DD)', 400));
        }

        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return next(new ErrorResponse('Restaurant not found', 404));
        }

        // Don't allow booking for cloud kitchens (delivery-only)
        if (restaurant.isCloudKitchen) {
            return next(new ErrorResponse('This is a cloud kitchen — table booking not available', 400));
        }

        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        // Count bookings per slot
        const existingBookings = await TableBooking.aggregate([
            {
                $match: {
                    restaurant: restaurant._id,
                    date: { $gte: startOfDay, $lte: endOfDay },
                    status: { $in: ['pending', 'confirmed'] },
                },
            },
            { $group: { _id: '$timeSlot', count: { $sum: 1 } } },
        ]);

        const bookingMap = {};
        existingBookings.forEach((b) => { bookingMap[b._id] = b.count; });

        const slots = TIME_SLOTS.map((slot) => ({
            time: slot,
            available: (bookingMap[slot] || 0) < MAX_BOOKINGS_PER_SLOT,
            remainingSlots: MAX_BOOKINGS_PER_SLOT - (bookingMap[slot] || 0),
        }));

        res.status(200).json({
            success: true,
            restaurant: { _id: restaurant._id, name: restaurant.name },
            date,
            slots,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Create a table booking (with optional pre-order)
 * @route   POST /api/bookings
 * @access  Private
 */
exports.createBooking = async (req, res, next) => {
    try {
        const {
            restaurantId, date, timeSlot, guests,
            specialRequests, contactPhone, preOrder,
        } = req.body;

        if (!restaurantId || !date || !timeSlot || !guests) {
            return next(new ErrorResponse('Restaurant, date, time slot, and guests are required', 400));
        }

        if (!TIME_SLOTS.includes(timeSlot)) {
            return next(new ErrorResponse('Invalid time slot', 400));
        }

        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return next(new ErrorResponse('Restaurant not found', 404));
        }

        if (restaurant.isCloudKitchen) {
            return next(new ErrorResponse('Cloud kitchens do not support table booking', 400));
        }

        // Check slot availability
        const bookingDate = new Date(date);
        bookingDate.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const slotCount = await TableBooking.countDocuments({
            restaurant: restaurantId,
            date: { $gte: bookingDate, $lte: endOfDay },
            timeSlot,
            status: { $in: ['pending', 'confirmed'] },
        });

        if (slotCount >= MAX_BOOKINGS_PER_SLOT) {
            return next(new ErrorResponse('This time slot is fully booked', 400));
        }

        // Build pre-order data
        let preOrderData = { enabled: false, items: [], totalAmount: 0, notes: '' };
        if (preOrder?.enabled && preOrder.items?.length > 0) {
            const totalAmount = preOrder.items.reduce(
                (sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0
            );
            preOrderData = {
                enabled: true,
                items: preOrder.items,
                totalAmount,
                notes: preOrder.notes || '',
            };
        }

        const booking = await TableBooking.create({
            user: req.user.id,
            restaurant: restaurantId,
            date: bookingDate,
            timeSlot,
            guests,
            specialRequests: specialRequests || '',
            contactPhone: contactPhone || '',
            preOrder: preOrderData,
        });

        const populated = await TableBooking.findById(booking._id)
            .populate('restaurant', 'name coverImage address phone');

        res.status(201).json({
            success: true,
            booking: populated,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Get user's bookings
 * @route   GET /api/bookings/my
 * @access  Private
 */
exports.getMyBookings = async (req, res, next) => {
    try {
        const bookings = await TableBooking.find({ user: req.user.id })
            .sort({ date: -1, createdAt: -1 })
            .limit(30)
            .populate('restaurant', 'name coverImage address');

        res.status(200).json({
            success: true,
            count: bookings.length,
            bookings,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Get single booking
 * @route   GET /api/bookings/:id
 * @access  Private
 */
exports.getBooking = async (req, res, next) => {
    try {
        const booking = await TableBooking.findById(req.params.id)
            .populate('restaurant', 'name coverImage address phone')
            .populate('user', 'name email phone');

        if (!booking) {
            return next(new ErrorResponse('Booking not found', 404));
        }

        if (
            booking.user._id.toString() !== req.user.id &&
            req.user.role !== 'admin'
        ) {
            return next(new ErrorResponse('Not authorized', 403));
        }

        res.status(200).json({ success: true, booking });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Cancel booking
 * @route   PUT /api/bookings/:id/cancel
 * @access  Private
 */
exports.cancelBooking = async (req, res, next) => {
    try {
        const booking = await TableBooking.findById(req.params.id);
        if (!booking) {
            return next(new ErrorResponse('Booking not found', 404));
        }

        if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return next(new ErrorResponse('Not authorized', 403));
        }

        if (['cancelled', 'completed'].includes(booking.status)) {
            return next(new ErrorResponse(`Cannot cancel a ${booking.status} booking`, 400));
        }

        booking.status = 'cancelled';
        booking.cancelledAt = new Date();
        booking.cancelReason = req.body.reason || 'Cancelled by user';
        await booking.save();

        res.status(200).json({ success: true, booking });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Confirm booking (restaurant owner / admin)
 * @route   PUT /api/bookings/:id/confirm
 * @access  Private (restaurant owner / admin)
 */
exports.confirmBooking = async (req, res, next) => {
    try {
        const booking = await TableBooking.findById(req.params.id);
        if (!booking) {
            return next(new ErrorResponse('Booking not found', 404));
        }

        const restaurant = await Restaurant.findById(booking.restaurant);
        if (
            restaurant.owner.toString() !== req.user.id &&
            req.user.role !== 'admin'
        ) {
            return next(new ErrorResponse('Not authorized', 403));
        }

        if (booking.status !== 'pending') {
            return next(new ErrorResponse('Only pending bookings can be confirmed', 400));
        }

        booking.status = 'confirmed';
        booking.confirmedAt = new Date();
        await booking.save();

        res.status(200).json({ success: true, booking });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Get restaurant's bookings (for restaurant owner)
 * @route   GET /api/bookings/restaurant/:restaurantId
 * @access  Private (restaurant owner / admin)
 */
exports.getRestaurantBookings = async (req, res, next) => {
    try {
        const restaurant = await Restaurant.findById(req.params.restaurantId);
        if (!restaurant) {
            return next(new ErrorResponse('Restaurant not found', 404));
        }

        if (restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
            return next(new ErrorResponse('Not authorized', 403));
        }

        const { date, status } = req.query;
        const query = { restaurant: req.params.restaurantId };
        if (status) query.status = status;
        if (date) {
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);
            const end = new Date(date);
            end.setHours(23, 59, 59, 999);
            query.date = { $gte: start, $lte: end };
        }

        const bookings = await TableBooking.find(query)
            .sort({ date: 1, timeSlot: 1 })
            .populate('user', 'name email phone');

        res.status(200).json({
            success: true,
            count: bookings.length,
            bookings,
        });
    } catch (err) {
        next(err);
    }
};
