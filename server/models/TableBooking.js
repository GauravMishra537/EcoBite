const mongoose = require('mongoose');

const tableBookingSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        restaurant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Restaurant',
            required: true,
        },
        date: {
            type: Date,
            required: [true, 'Booking date is required'],
        },
        timeSlot: {
            type: String,
            required: [true, 'Time slot is required'],
            // e.g. "12:00", "13:00", "19:00"
        },
        guests: {
            type: Number,
            required: [true, 'Number of guests is required'],
            min: [1, 'At least 1 guest required'],
            max: [20, 'Maximum 20 guests per booking'],
        },
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'],
            default: 'pending',
        },
        specialRequests: {
            type: String,
            maxlength: 500,
        },
        // Pre-order meals
        preOrder: {
            enabled: { type: Boolean, default: false },
            items: [
                {
                    menuItem: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'MenuItem',
                    },
                    name: String,
                    price: Number,
                    quantity: { type: Number, default: 1 },
                },
            ],
            totalAmount: { type: Number, default: 0 },
            notes: String,
        },
        contactPhone: String,
        confirmedAt: Date,
        cancelledAt: Date,
        cancelReason: String,
    },
    { timestamps: true }
);

// Index for efficient queries
tableBookingSchema.index({ restaurant: 1, date: 1, timeSlot: 1 });
tableBookingSchema.index({ user: 1, createdAt: -1 });

// Virtual: is upcoming
tableBookingSchema.virtual('isUpcoming').get(function () {
    const bookingDateTime = new Date(this.date);
    const [hours, minutes] = (this.timeSlot || '').split(':').map(Number);
    bookingDateTime.setHours(hours || 0, minutes || 0);
    return bookingDateTime > new Date();
});

module.exports = mongoose.model('TableBooking', tableBookingSchema);
