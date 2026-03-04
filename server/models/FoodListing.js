const mongoose = require('mongoose');

const foodListingSchema = new mongoose.Schema(
    {
        restaurant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Restaurant',
            required: true,
        },
        listedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        title: {
            type: String,
            required: [true, 'Food title is required'],
            trim: true,
            maxlength: 200,
        },
        description: {
            type: String,
            maxlength: 500,
        },
        items: [
            {
                name: { type: String, required: true },
                quantity: { type: String }, // e.g. "5 portions", "2 kg"
                isVeg: { type: Boolean, default: true },
            },
        ],
        totalServings: {
            type: Number,
            required: [true, 'Total servings is required'],
            min: 1,
        },
        remainingServings: {
            type: Number,
            min: 0,
        },
        // Nominal cost (CSR — not free, but very low price)
        nominalCost: {
            type: Number,
            default: 10,
            min: 0,
        },
        category: {
            type: String,
            enum: ['leftover', 'surplus', 'near_expiry', 'donation'],
            default: 'leftover',
        },
        status: {
            type: String,
            enum: ['available', 'partially_claimed', 'fully_claimed', 'expired'],
            default: 'available',
        },
        pickupAddress: {
            street: String,
            city: String,
            state: String,
            zipCode: String,
        },
        pickupWindow: {
            start: Date,
            end: Date,
        },
        expiresAt: {
            type: Date,
            required: true,
        },
        claims: [
            {
                claimedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
                ngoName: String,
                servingsClaimed: Number,
                claimedAt: { type: Date, default: Date.now },
                status: {
                    type: String,
                    enum: ['pending', 'picked_up', 'cancelled'],
                    default: 'pending',
                },
            },
        ],
        image: String,
    },
    { timestamps: true }
);

// Index for availability queries
foodListingSchema.index({ status: 1, expiresAt: 1, city: 1 });
foodListingSchema.index({ restaurant: 1, createdAt: -1 });

// Pre-save: auto-update status
foodListingSchema.pre('save', function (next) {
    if (!this.remainingServings && this.remainingServings !== 0) {
        this.remainingServings = this.totalServings;
    }
    if (this.remainingServings <= 0) {
        this.status = 'fully_claimed';
    } else if (this.remainingServings < this.totalServings) {
        this.status = 'partially_claimed';
    }
    if (this.expiresAt && this.expiresAt <= new Date()) {
        this.status = 'expired';
    }
    next();
});

module.exports = mongoose.model('FoodListing', foodListingSchema);
