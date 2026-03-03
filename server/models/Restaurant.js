const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Restaurant name is required'],
            trim: true,
            maxlength: [100, 'Name cannot exceed 100 characters'],
        },
        description: {
            type: String,
            maxlength: [500, 'Description cannot exceed 500 characters'],
            default: '',
        },
        cuisines: {
            type: [String],
            required: [true, 'At least one cuisine type is required'],
        },
        address: {
            street: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            zipCode: { type: String },
            country: { type: String, default: 'India' },
        },
        location: {
            type: { type: String, enum: ['Point'], default: 'Point' },
            coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
        },
        images: {
            type: [String],
            default: [],
        },
        coverImage: {
            type: String,
            default: '',
        },
        rating: {
            type: Number,
            min: 0,
            max: 5,
            default: 0,
        },
        reviewCount: {
            type: Number,
            default: 0,
        },
        operatingHours: {
            open: { type: String, default: '09:00' },
            close: { type: String, default: '23:00' },
        },
        isCloudKitchen: {
            type: Boolean,
            default: false,
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        deliveryTime: {
            min: { type: Number, default: 20 },
            max: { type: Number, default: 40 },
        },
        deliveryFee: {
            type: Number,
            default: 30,
        },
        minOrderAmount: {
            type: Number,
            default: 100,
        },
        tags: {
            type: [String],
            default: [],
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Virtual: get menu items for this restaurant
restaurantSchema.virtual('menuItems', {
    ref: 'MenuItem',
    localField: '_id',
    foreignField: 'restaurant',
    justOne: false,
});

// Index for geospatial queries
restaurantSchema.index({ location: '2dsphere' });

// Text index for search
restaurantSchema.index({ name: 'text', cuisines: 'text', tags: 'text' });

module.exports = mongoose.model('Restaurant', restaurantSchema);
