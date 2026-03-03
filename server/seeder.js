/**
 * Database seeder — populates MongoDB with sample restaurants and menu items.
 * Run: cd server && node seeder.js
 */

const env = require('./config/env');
const connectDB = require('./config/db');
const User = require('./models/User');
const Restaurant = require('./models/Restaurant');
const MenuItem = require('./models/MenuItem');

const sampleRestaurants = [
    {
        name: 'Spice Garden',
        description: 'Authentic North Indian cuisine with rich flavors and aromatic spices. Signature butter chicken and dal makhani.',
        cuisines: ['North Indian', 'Mughlai'],
        address: { street: '45 MG Road', city: 'Delhi', state: 'Delhi', zipCode: '110001' },
        location: { type: 'Point', coordinates: [77.2090, 28.6139] },
        coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600',
        images: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600'],
        rating: 4.5,
        reviewCount: 234,
        deliveryTime: { min: 25, max: 35 },
        deliveryFee: 25,
        minOrderAmount: 150,
        tags: ['popular', 'top-rated', 'north-indian'],
        isActive: true,
        isVerified: true,
    },
    {
        name: 'Dragon Wok',
        description: 'Flavorful Chinese and Asian fusion dishes. Crispy noodles, dim sums, and sizzling plates.',
        cuisines: ['Chinese', 'Asian'],
        address: { street: '12 Park Street', city: 'Mumbai', state: 'Maharashtra', zipCode: '400001' },
        location: { type: 'Point', coordinates: [72.8777, 19.0760] },
        coverImage: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600',
        images: ['https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600'],
        rating: 4.3,
        reviewCount: 178,
        deliveryTime: { min: 20, max: 30 },
        deliveryFee: 20,
        minOrderAmount: 120,
        tags: ['chinese', 'asian', 'noodles'],
        isActive: true,
        isVerified: true,
    },
    {
        name: 'Pizza Planet',
        description: 'Wood-fired pizzas with fresh toppings, creamy pastas, and crispy garlic bread.',
        cuisines: ['Italian', 'Pizza'],
        address: { street: '78 Brigade Road', city: 'Bangalore', state: 'Karnataka', zipCode: '560001' },
        location: { type: 'Point', coordinates: [77.5946, 12.9716] },
        coverImage: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600',
        images: ['https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600'],
        rating: 4.7,
        reviewCount: 312,
        deliveryTime: { min: 20, max: 30 },
        deliveryFee: 30,
        minOrderAmount: 200,
        tags: ['pizza', 'italian', 'top-rated'],
        isActive: true,
        isVerified: true,
    },
    {
        name: 'Green Bowl',
        description: 'Healthy and wholesome meals — salads, grain bowls, smoothies, and vegan options.',
        cuisines: ['Healthy', 'Salads', 'Continental'],
        address: { street: '25 Linking Road', city: 'Mumbai', state: 'Maharashtra', zipCode: '400050' },
        location: { type: 'Point', coordinates: [72.8361, 19.0700] },
        coverImage: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600',
        images: ['https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600'],
        rating: 4.4,
        reviewCount: 145,
        deliveryTime: { min: 15, max: 25 },
        deliveryFee: 15,
        minOrderAmount: 100,
        tags: ['healthy', 'vegan', 'salads'],
        isActive: true,
        isVerified: true,
        isCloudKitchen: true,
    },
    {
        name: 'Biryani House',
        description: 'The finest Hyderabadi dum biryani, kebabs, and traditional Andhra-style curries.',
        cuisines: ['Biryani', 'Hyderabadi', 'South Indian'],
        address: { street: '30 Charminar Road', city: 'Hyderabad', state: 'Telangana', zipCode: '500002' },
        location: { type: 'Point', coordinates: [78.4867, 17.3850] },
        coverImage: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600',
        images: ['https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600'],
        rating: 4.8,
        reviewCount: 456,
        deliveryTime: { min: 30, max: 45 },
        deliveryFee: 20,
        minOrderAmount: 180,
        tags: ['biryani', 'top-rated', 'popular'],
        isActive: true,
        isVerified: true,
    },
    {
        name: 'Burger Barn',
        description: 'Juicy gourmet burgers, loaded fries, and thick shakes. American-style comfort food.',
        cuisines: ['American', 'Burger', 'Fast Food'],
        address: { street: '10 FC Road', city: 'Pune', state: 'Maharashtra', zipCode: '411004' },
        location: { type: 'Point', coordinates: [73.8567, 18.5204] },
        coverImage: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600',
        images: ['https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600'],
        rating: 4.2,
        reviewCount: 198,
        deliveryTime: { min: 15, max: 25 },
        deliveryFee: 25,
        minOrderAmount: 150,
        tags: ['burgers', 'fast-food', 'american'],
        isActive: true,
        isVerified: true,
        isCloudKitchen: true,
    },
];

// Menu items mapped by restaurant index
const sampleMenuItems = {
    0: [ // Spice Garden
        { name: 'Butter Chicken', description: 'Creamy tomato-based curry with tender chicken', price: 280, category: 'Main Course', isVeg: false, preparationTime: 20, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400' },
        { name: 'Dal Makhani', description: 'Slow-cooked black lentils in rich butter cream', price: 220, category: 'Main Course', isVeg: true, preparationTime: 15, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400' },
        { name: 'Paneer Tikka', description: 'Chargrilled cottage cheese with spices', price: 240, category: 'Starters', isVeg: true, preparationTime: 15, image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400' },
        { name: 'Chicken Biryani', description: 'Fragrant basmati rice with spiced chicken', price: 260, category: 'Rice', isVeg: false, preparationTime: 25, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400' },
        { name: 'Garlic Naan', description: 'Freshly baked bread with garlic butter', price: 60, category: 'Breads', isVeg: true, preparationTime: 8 },
        { name: 'Gulab Jamun', description: 'Soft milk dumplings in rose-flavored sugar syrup', price: 100, category: 'Desserts', isVeg: true, preparationTime: 5 },
    ],
    1: [ // Dragon Wok
        { name: 'Hakka Noodles', description: 'Stir-fried noodles with vegetables and soy sauce', price: 180, category: 'Noodles', isVeg: true, preparationTime: 12, image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400' },
        { name: 'Chicken Manchurian', description: 'Deep-fried chicken in tangy Manchurian sauce', price: 220, category: 'Main Course', isVeg: false, preparationTime: 18 },
        { name: 'Veg Spring Rolls', description: 'Crispy rolls stuffed with mixed vegetables', price: 150, category: 'Starters', isVeg: true, preparationTime: 10 },
        { name: 'Kung Pao Chicken', description: 'Spicy stir-fried chicken with peanuts', price: 260, category: 'Main Course', isVeg: false, preparationTime: 15 },
        { name: 'Fried Rice', description: 'Wok-tossed rice with eggs and vegetables', price: 170, category: 'Rice', isVeg: false, preparationTime: 12 },
    ],
    2: [ // Pizza Planet
        { name: 'Margherita Pizza', description: 'Classic tomato, mozzarella, and fresh basil', price: 299, category: 'Pizza', isVeg: true, preparationTime: 18, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400' },
        { name: 'Pepperoni Pizza', description: 'Loaded with spicy pepperoni and cheese', price: 399, category: 'Pizza', isVeg: false, preparationTime: 20 },
        { name: 'Alfredo Pasta', description: 'Creamy white sauce pasta with mushrooms', price: 249, category: 'Pasta', isVeg: true, preparationTime: 15 },
        { name: 'Garlic Bread', description: 'Toasted bread with garlic butter and herbs', price: 129, category: 'Sides', isVeg: true, preparationTime: 8 },
        { name: 'Tiramisu', description: 'Italian coffee-flavored layered dessert', price: 199, category: 'Desserts', isVeg: true, preparationTime: 5 },
    ],
    3: [ // Green Bowl
        { name: 'Quinoa Buddha Bowl', description: 'Quinoa with roasted veggies, avocado, and tahini', price: 320, category: 'Bowls', isVeg: true, preparationTime: 12, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400' },
        { name: 'Greek Salad', description: 'Fresh veggies with feta cheese and olive dressing', price: 220, category: 'Salads', isVeg: true, preparationTime: 8 },
        { name: 'Grilled Chicken Wrap', description: 'Whole wheat wrap with grilled chicken and greens', price: 260, category: 'Wraps', isVeg: false, preparationTime: 12 },
        { name: 'Berry Smoothie', description: 'Mixed berries blended with yogurt and honey', price: 180, category: 'Beverages', isVeg: true, preparationTime: 5 },
    ],
    4: [ // Biryani House
        { name: 'Hyderabadi Dum Biryani', description: 'Slow-cooked aromatic rice with tender goat meat', price: 350, category: 'Biryani', isVeg: false, preparationTime: 30, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400' },
        { name: 'Chicken Biryani', description: 'Flavorful chicken biryani with raita', price: 280, category: 'Biryani', isVeg: false, preparationTime: 25 },
        { name: 'Veg Biryani', description: 'Vegetable biryani with mint and saffron', price: 220, category: 'Biryani', isVeg: true, preparationTime: 20 },
        { name: 'Seekh Kebab', description: 'Minced meat kebabs grilled on charcoal', price: 200, category: 'Starters', isVeg: false, preparationTime: 15 },
        { name: 'Double Ka Meetha', description: 'Traditional Hyderabadi bread pudding', price: 120, category: 'Desserts', isVeg: true, preparationTime: 5 },
    ],
    5: [ // Burger Barn
        { name: 'Classic Smash Burger', description: 'Double smash patty with cheese, lettuce, and special sauce', price: 249, category: 'Burgers', isVeg: false, preparationTime: 12, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400' },
        { name: 'Veggie Crunch Burger', description: 'Crispy veggie patty with jalapenos and mayo', price: 199, category: 'Burgers', isVeg: true, preparationTime: 10 },
        { name: 'Loaded Fries', description: 'Fries topped with cheese, bacon, and sour cream', price: 179, category: 'Sides', isVeg: false, preparationTime: 8 },
        { name: 'Oreo Milkshake', description: 'Thick and creamy Oreo cookie milkshake', price: 149, category: 'Beverages', isVeg: true, preparationTime: 5 },
        { name: 'BBQ Chicken Wings', description: 'Crispy wings tossed in smoky BBQ sauce', price: 229, category: 'Starters', isVeg: false, preparationTime: 15 },
    ],
};

const seedDatabase = async () => {
    try {
        await connectDB();

        // Clear existing data
        await MenuItem.deleteMany({});
        await Restaurant.deleteMany({});

        console.log('🗑️  Cleared existing restaurants and menu items');

        // Create or find a demo restaurant owner
        let owner = await User.findOne({ email: 'demo-owner@ecobite.com' });
        if (!owner) {
            owner = await User.create({
                name: 'Demo Restaurant Owner',
                email: 'demo-owner@ecobite.com',
                password: 'demo123456',
                role: 'restaurant',
            });
            console.log('👤 Created demo restaurant owner');
        }

        // Create restaurants
        const createdRestaurants = [];
        for (const restaurantData of sampleRestaurants) {
            const restaurant = await Restaurant.create({
                ...restaurantData,
                owner: owner._id,
            });
            createdRestaurants.push(restaurant);
            console.log(`🏪 Created restaurant: ${restaurant.name}`);
        }

        // Create menu items
        let totalItems = 0;
        for (let i = 0; i < createdRestaurants.length; i++) {
            const items = sampleMenuItems[i] || [];
            for (const itemData of items) {
                await MenuItem.create({
                    ...itemData,
                    restaurant: createdRestaurants[i]._id,
                });
                totalItems++;
            }
        }

        console.log(`\n✅ Seeded ${createdRestaurants.length} restaurants and ${totalItems} menu items`);
        console.log('📧 Demo owner login: demo-owner@ecobite.com / demo123456\n');

        process.exit(0);
    } catch (err) {
        console.error('❌ Seeder error:', err.message);
        process.exit(1);
    }
};

seedDatabase();
