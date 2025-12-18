import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// 👇 VERIFY THIS PATH: Ensure it points to your actual Product model
import { Product } from '../database/models/Product';

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const products = [
    {
        name: "Premium Wireless Headphones",
        slug: "premium-wireless-headphones",
        description: "High-fidelity audio with active noise cancellation and 30-hour battery life.",
        price: 249.99,
        category: "Electronics",
        stock: 45,
        images: ["https://placehold.co/600x400/png?text=Headphones"],
        isActive: true
    },
    {
        name: "Ergonomic Office Chair",
        slug: "ergonomic-office-chair",
        description: "Breathable mesh chair with lumbar support and adjustable armrests.",
        price: 199.50,
        category: "Furniture",
        stock: 20,
        images: ["https://placehold.co/600x400/png?text=Office+Chair"],
        isActive: true
    },
    {
        name: "4K Ultra HD Smart TV",
        slug: "4k-ultra-hd-smart-tv",
        description: "55-inch display with HDR10+ and built-in streaming apps.",
        price: 499.00,
        category: "Electronics",
        stock: 15,
        images: ["https://placehold.co/600x400/png?text=Smart+TV"],
        isActive: true
    },
    {
        name: "Mechanical Gaming Keyboard",
        slug: "mechanical-gaming-keyboard",
        description: "RGB backlit keyboard with tactile blue switches for ultimate precision.",
        price: 89.99,
        category: "Gaming",
        stock: 100,
        images: ["https://placehold.co/600x400/png?text=Keyboard"],
        isActive: true
    },
    {
        name: "Stainless Steel Water Bottle",
        slug: "stainless-steel-water-bottle",
        description: "Double-walled vacuum insulated bottle keeps drinks cold for 24 hours.",
        price: 25.00,
        category: "Accessories",
        stock: 200,
        images: ["https://placehold.co/600x400/png?text=Water+Bottle"],
        isActive: true
    },
    {
        name: "Organic Cotton T-Shirt",
        slug: "organic-cotton-t-shirt",
        description: "Soft, sustainable, and breathable cotton t-shirt in various sizes.",
        price: 19.99,
        category: "Apparel",
        stock: 150,
        images: ["https://placehold.co/600x400/png?text=T-Shirt"],
        isActive: true
    },
    {
        name: "Smart Fitness Watch",
        slug: "smart-fitness-watch",
        description: "Track your heart rate, steps, and sleep with this waterproof smart watch.",
        price: 129.95,
        category: "Wearables",
        stock: 60,
        images: ["https://placehold.co/600x400/png?text=Smart+Watch"],
        isActive: true
    },
    {
        name: "Professional Chef's Knife",
        slug: "professional-chefs-knife",
        description: "High-carbon stainless steel blade for precision cutting and chopping.",
        price: 75.00,
        category: "Kitchen",
        stock: 35,
        images: ["https://placehold.co/600x400/png?text=Chef+Knife"],
        isActive: true
    },
    {
        name: "Yoga Mat with Carrying Strap",
        slug: "yoga-mat-strap",
        description: "Non-slip, extra thick yoga mat perfect for home or studio workouts.",
        price: 35.50,
        category: "Fitness",
        stock: 80,
        images: ["https://placehold.co/600x400/png?text=Yoga+Mat"],
        isActive: true
    },
    {
        name: "Bluetooth Portable Speaker",
        slug: "bluetooth-portable-speaker",
        description: "Compact speaker with powerful bass and waterproof design.",
        price: 59.99,
        category: "Electronics",
        stock: 75,
        images: ["https://placehold.co/600x400/png?text=Speaker"],
        isActive: true
    }
];

const seedDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is not defined in .env file");
        }

        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected');

        // Optional: Clear existing products
        console.log('🧹 Clearing existing products...');
        await Product.deleteMany({});

        console.log('🌱 Seeding new products...');
        await Product.insertMany(products);

        console.log('✨ Database seeded successfully with 10 products!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
};

seedDB();