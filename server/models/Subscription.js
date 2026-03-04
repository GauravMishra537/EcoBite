const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        plan: {
            type: String,
            enum: ['weekly', 'monthly', 'quarterly'],
            required: true,
        },
        status: {
            type: String,
            enum: ['active', 'expired', 'cancelled'],
            default: 'active',
        },
        startDate: {
            type: Date,
            default: Date.now,
        },
        endDate: {
            type: Date,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        benefits: {
            freeDelivery: { type: Boolean, default: true },
            discountPercent: { type: Number, default: 0 },
            prioritySupport: { type: Boolean, default: false },
        },
        paymentMethod: {
            type: String,
            enum: ['online', 'cod'],
            default: 'online',
        },
        stripeSubscriptionId: String,
        autoRenew: {
            type: Boolean,
            default: false,
        },
        cancelledAt: Date,
        cancelReason: String,
    },
    { timestamps: true }
);

// Check if subscription is currently active
subscriptionSchema.methods.isActive = function () {
    return this.status === 'active' && this.endDate > new Date();
};

// Static: find active subscription for a user
subscriptionSchema.statics.findActiveForUser = async function (userId) {
    return this.findOne({
        user: userId,
        status: 'active',
        endDate: { $gt: new Date() },
    });
};

// Pre-save: auto-expire
subscriptionSchema.pre('save', function (next) {
    if (this.status === 'active' && this.endDate <= new Date()) {
        this.status = 'expired';
    }
    next();
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
