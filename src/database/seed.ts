import {
  database,
  User,
  Settings,
  Category,
  Product,
  Order,
  Cart,
  Coupon,
  Review,
  CmsPage,
  InventoryTransaction
} from './index';
import { PasswordUtils, SlugUtils } from '../common/utils';
import { UserRole, OrderStatus, PaymentStatus, PaymentMethod, CouponType, InventoryAction } from '../common/types';

// Sample data arrays
const sampleUsers = [
  { firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', role: UserRole.USER },
  { firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', role: UserRole.USER },
  { firstName: 'Mike', lastName: 'Johnson', email: 'mike.johnson@example.com', role: UserRole.USER },
  { firstName: 'Sarah', lastName: 'Williams', email: 'sarah.williams@example.com', role: UserRole.USER },
  { firstName: 'David', lastName: 'Brown', email: 'david.brown@example.com', role: UserRole.USER },
  { firstName: 'Emily', lastName: 'Davis', email: 'emily.davis@example.com', role: UserRole.USER },
  { firstName: 'Chris', lastName: 'Miller', email: 'chris.miller@example.com', role: UserRole.USER },
  { firstName: 'Lisa', lastName: 'Wilson', email: 'lisa.wilson@example.com', role: UserRole.USER },
  { firstName: 'Tom', lastName: 'Moore', email: 'tom.moore@example.com', role: UserRole.USER },
  { firstName: 'Anna', lastName: 'Taylor', email: 'anna.taylor@example.com', role: UserRole.USER },
  { firstName: 'Staff', lastName: 'Member', email: 'staff@example.com', role: UserRole.STAFF },
  { firstName: 'Manager', lastName: 'User', email: 'manager@example.com', role: UserRole.STAFF },
];

const sampleCategories = [
  { name: 'Electronics', description: 'Electronic devices and gadgets', parent: null },
  { name: 'Clothing', description: 'Fashion and apparel', parent: null },
  { name: 'Home & Garden', description: 'Home improvement and garden supplies', parent: null },
  { name: 'Sports & Outdoors', description: 'Sports equipment and outdoor gear', parent: null },
  { name: 'Books', description: 'Books and educational materials', parent: null },
  { name: 'Smartphones', description: 'Mobile phones and accessories', parent: 'Electronics' },
  { name: 'Laptops', description: 'Laptops and computers', parent: 'Electronics' },
  { name: 'Audio', description: 'Headphones, speakers, and audio equipment', parent: 'Electronics' },
  { name: 'Men\'s Clothing', description: 'Clothing for men', parent: 'Clothing' },
  { name: 'Women\'s Clothing', description: 'Clothing for women', parent: 'Clothing' },
  { name: 'Shoes', description: 'Footwear for all occasions', parent: 'Clothing' },
  { name: 'Furniture', description: 'Home furniture and decor', parent: 'Home & Garden' },
];

const sampleProducts = [
  {
    name: 'iPhone 15 Pro',
    description: 'The latest iPhone with A17 Pro chip, titanium design, and advanced camera system. Features include 48MP main camera, 5x telephoto zoom, and all-day battery life.',
    shortDescription: 'Latest iPhone with A17 Pro chip and titanium design',
    category: 'Smartphones',
    brand: 'Apple',
    sku: 'IPHONE15PRO128',
    price: 999.99,
    compareAtPrice: 1099.99,
    cost: 750.00,
    stock: 50,
    isFeatured: true,
    tags: ['smartphone', 'apple', 'iphone', 'premium']
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    description: 'Premium Android smartphone with S Pen, 200MP camera, and AI-powered features. Perfect for productivity and creativity.',
    shortDescription: 'Premium Galaxy with S Pen and 200MP camera',
    category: 'Smartphones',
    brand: 'Samsung',
    sku: 'GALAXYS24ULTRA256',
    price: 1199.99,
    compareAtPrice: 1299.99,
    cost: 900.00,
    stock: 35,
    isFeatured: true,
    tags: ['smartphone', 'samsung', 'galaxy', 'android']
  },
  {
    name: 'MacBook Pro 14-inch',
    description: 'Powerful laptop with M3 Pro chip, stunning Liquid Retina XDR display, and all-day battery life. Perfect for professionals.',
    shortDescription: 'Professional laptop with M3 Pro chip',
    category: 'Laptops',
    brand: 'Apple',
    sku: 'MACBOOKPRO14M3',
    price: 1999.99,
    compareAtPrice: 2199.99,
    cost: 1500.00,
    stock: 25,
    isFeatured: true,
    tags: ['laptop', 'apple', 'macbook', 'professional']
  },
  {
    name: 'Dell XPS 13',
    description: 'Ultra-portable laptop with Intel Core i7, stunning InfinityEdge display, and premium build quality.',
    shortDescription: 'Ultra-portable laptop with premium design',
    category: 'Laptops',
    brand: 'Dell',
    sku: 'DELLXPS13I7',
    price: 1299.99,
    compareAtPrice: 1399.99,
    cost: 950.00,
    stock: 40,
    isFeatured: false,
    tags: ['laptop', 'dell', 'ultrabook', 'portable']
  },
  {
    name: 'Sony WH-1000XM5',
    description: 'Industry-leading noise canceling headphones with exceptional sound quality and 30-hour battery life.',
    shortDescription: 'Premium noise-canceling headphones',
    category: 'Audio',
    brand: 'Sony',
    sku: 'SONYWH1000XM5',
    price: 399.99,
    compareAtPrice: 449.99,
    cost: 280.00,
    stock: 60,
    isFeatured: true,
    tags: ['headphones', 'sony', 'noise-canceling', 'wireless']
  },
  {
    name: 'AirPods Pro (3rd Gen)',
    description: 'Apple\'s premium wireless earbuds with adaptive transparency, spatial audio, and personalized volume.',
    shortDescription: 'Premium wireless earbuds with spatial audio',
    category: 'Audio',
    brand: 'Apple',
    sku: 'AIRPODSPRO3GEN',
    price: 249.99,
    compareAtPrice: 279.99,
    cost: 180.00,
    stock: 80,
    isFeatured: true,
    tags: ['earbuds', 'apple', 'airpods', 'wireless']
  },
  {
    name: 'Men\'s Classic T-Shirt',
    description: 'Comfortable cotton t-shirt perfect for everyday wear. Available in multiple colors and sizes.',
    shortDescription: 'Comfortable cotton t-shirt for everyday wear',
    category: 'Men\'s Clothing',
    brand: 'BasicWear',
    sku: 'MENSCLASSICTEE',
    price: 24.99,
    compareAtPrice: 29.99,
    cost: 12.00,
    stock: 200,
    isFeatured: false,
    tags: ['t-shirt', 'men', 'cotton', 'casual']
  },
  {
    name: 'Women\'s Yoga Leggings',
    description: 'High-performance leggings with moisture-wicking fabric and four-way stretch for ultimate comfort.',
    shortDescription: 'High-performance yoga leggings',
    category: 'Women\'s Clothing',
    brand: 'ActiveFit',
    sku: 'WOMENYOGALEGGINGS',
    price: 79.99,
    compareAtPrice: 89.99,
    cost: 40.00,
    stock: 150,
    isFeatured: false,
    tags: ['leggings', 'women', 'yoga', 'activewear']
  },
  {
    name: 'Running Shoes',
    description: 'Lightweight running shoes with responsive cushioning and breathable mesh upper for optimal performance.',
    shortDescription: 'Lightweight running shoes with responsive cushioning',
    category: 'Shoes',
    brand: 'RunFast',
    sku: 'RUNNINGSHOES42',
    price: 129.99,
    compareAtPrice: 149.99,
    cost: 75.00,
    stock: 100,
    isFeatured: true,
    tags: ['shoes', 'running', 'athletic', 'lightweight']
  },
  {
    name: 'Office Chair',
    description: 'Ergonomic office chair with lumbar support, adjustable height, and breathable mesh back for all-day comfort.',
    shortDescription: 'Ergonomic office chair with lumbar support',
    category: 'Furniture',
    brand: 'ComfortSeating',
    sku: 'OFFICECHAIR001',
    price: 299.99,
    compareAtPrice: 349.99,
    cost: 180.00,
    stock: 30,
    isFeatured: false,
    tags: ['chair', 'office', 'ergonomic', 'furniture']
  },
  {
    name: 'Programming Book Bundle',
    description: 'Complete collection of programming books covering JavaScript, Python, and web development fundamentals.',
    shortDescription: 'Complete programming book collection',
    category: 'Books',
    brand: 'TechBooks',
    sku: 'PROGBOOKBUNDLE',
    price: 89.99,
    compareAtPrice: 119.99,
    cost: 45.00,
    stock: 75,
    isFeatured: false,
    tags: ['books', 'programming', 'education', 'technology']
  },
  {
    name: 'Fitness Tracker',
    description: 'Advanced fitness tracker with heart rate monitoring, GPS, and 7-day battery life.',
    shortDescription: 'Advanced fitness tracker with GPS',
    category: 'Electronics',
    brand: 'FitTech',
    sku: 'FITNESSTRACKER01',
    price: 199.99,
    compareAtPrice: 229.99,
    cost: 120.00,
    stock: 65,
    isFeatured: true,
    tags: ['fitness', 'tracker', 'health', 'wearable']
  }
];

const sampleCoupons = [
  { code: 'WELCOME10', name: 'Welcome Discount', type: CouponType.PERCENTAGE, value: 10, minimumOrderValue: 50 },
  { code: 'SAVE20', name: 'Save $20', type: CouponType.FIXED_AMOUNT, value: 20, minimumOrderValue: 100 },
  { code: 'FREESHIP', name: 'Free Shipping', type: CouponType.FREE_SHIPPING, value: 0, minimumOrderValue: 75 },
  { code: 'ELECTRONICS15', name: 'Electronics 15% Off', type: CouponType.PERCENTAGE, value: 15, minimumOrderValue: 200 },
  { code: 'NEWUSER25', name: 'New User $25 Off', type: CouponType.FIXED_AMOUNT, value: 25, minimumOrderValue: 150 },
  { code: 'SUMMER30', name: 'Summer Sale 30%', type: CouponType.PERCENTAGE, value: 30, minimumOrderValue: 300 },
  { code: 'BULK50', name: 'Bulk Order $50 Off', type: CouponType.FIXED_AMOUNT, value: 50, minimumOrderValue: 500 },
  { code: 'STUDENT15', name: 'Student Discount', type: CouponType.PERCENTAGE, value: 15, minimumOrderValue: 75 },
  { code: 'LOYALTY20', name: 'Loyalty Reward', type: CouponType.PERCENTAGE, value: 20, minimumOrderValue: 200 },
  { code: 'FLASH40', name: 'Flash Sale 40%', type: CouponType.PERCENTAGE, value: 40, minimumOrderValue: 400 },
];

const sampleCmsPages = [
  {
    title: 'About Us',
    slug: 'about-us',
    content: '<h1>About Our Company</h1><p>We are a leading ecommerce platform dedicated to providing the best products and customer service...</p>',
    excerpt: 'Learn more about our company and mission',
    isPublished: true,
    seo: {
      metaTitle: 'About Us - Our Story and Mission',
      metaDescription: 'Learn about our company history, mission, and commitment to excellence in ecommerce.',
      metaKeywords: 'about us, company, mission, ecommerce'
    }
  },
  {
    title: 'Privacy Policy',
    slug: 'privacy-policy',
    content: '<h1>Privacy Policy</h1><p>This privacy policy explains how we collect, use, and protect your personal information...</p>',
    excerpt: 'Our commitment to protecting your privacy',
    isPublished: true,
    seo: {
      metaTitle: 'Privacy Policy - Data Protection',
      metaDescription: 'Read our privacy policy to understand how we protect and use your personal information.',
      metaKeywords: 'privacy policy, data protection, personal information'
    }
  },
  {
    title: 'Terms of Service',
    slug: 'terms-of-service',
    content: '<h1>Terms of Service</h1><p>By using our website, you agree to the following terms and conditions...</p>',
    excerpt: 'Terms and conditions for using our service',
    isPublished: true,
    seo: {
      metaTitle: 'Terms of Service - Legal Agreement',
      metaDescription: 'Read our terms of service to understand the legal agreement for using our platform.',
      metaKeywords: 'terms of service, legal, agreement, conditions'
    }
  },
  {
    title: 'Shipping Information',
    slug: 'shipping-info',
    content: '<h1>Shipping Information</h1><p>We offer fast and reliable shipping options to get your orders to you quickly...</p>',
    excerpt: 'Information about our shipping options and policies',
    isPublished: true,
    seo: {
      metaTitle: 'Shipping Information - Fast Delivery Options',
      metaDescription: 'Learn about our shipping options, delivery times, and shipping policies.',
      metaKeywords: 'shipping, delivery, fast shipping, shipping policy'
    }
  },
  {
    title: 'Return Policy',
    slug: 'return-policy',
    content: '<h1>Return Policy</h1><p>We want you to be completely satisfied with your purchase. Our return policy allows...</p>',
    excerpt: 'Easy returns and exchanges for your peace of mind',
    isPublished: true,
    seo: {
      metaTitle: 'Return Policy - Easy Returns and Exchanges',
      metaDescription: 'Learn about our hassle-free return policy and how to return or exchange items.',
      metaKeywords: 'return policy, returns, exchanges, refunds'
    }
  },
  {
    title: 'FAQ',
    slug: 'faq',
    content: '<h1>Frequently Asked Questions</h1><p>Find answers to the most common questions about our products and services...</p>',
    excerpt: 'Answers to frequently asked questions',
    isPublished: true,
    seo: {
      metaTitle: 'FAQ - Frequently Asked Questions',
      metaDescription: 'Find answers to common questions about our products, shipping, returns, and more.',
      metaKeywords: 'faq, questions, answers, help, support'
    }
  },
  {
    title: 'Contact Us',
    slug: 'contact-us',
    content: '<h1>Contact Us</h1><p>Get in touch with our customer service team for any questions or support needs...</p>',
    excerpt: 'Get in touch with our customer service team',
    isPublished: true,
    seo: {
      metaTitle: 'Contact Us - Customer Support',
      metaDescription: 'Contact our customer service team for support, questions, or feedback.',
      metaKeywords: 'contact us, customer service, support, help'
    }
  },
  {
    title: 'Size Guide',
    slug: 'size-guide',
    content: '<h1>Size Guide</h1><p>Find the perfect fit with our comprehensive size guide for clothing and shoes...</p>',
    excerpt: 'Comprehensive size guide for all products',
    isPublished: true,
    seo: {
      metaTitle: 'Size Guide - Find Your Perfect Fit',
      metaDescription: 'Use our size guide to find the perfect fit for clothing, shoes, and accessories.',
      metaKeywords: 'size guide, sizing, fit, measurements'
    }
  },
  {
    title: 'Gift Cards',
    slug: 'gift-cards',
    content: '<h1>Gift Cards</h1><p>Give the perfect gift with our digital gift cards. Available in various denominations...</p>',
    excerpt: 'Perfect gifts for any occasion',
    isPublished: true,
    seo: {
      metaTitle: 'Gift Cards - Perfect Gifts for Everyone',
      metaDescription: 'Purchase digital gift cards for friends and family. Perfect for any occasion.',
      metaKeywords: 'gift cards, gifts, digital gifts, presents'
    }
  },
  {
    title: 'Careers',
    slug: 'careers',
    content: '<h1>Careers</h1><p>Join our team and help us build the future of ecommerce. We offer exciting opportunities...</p>',
    excerpt: 'Join our growing team',
    isPublished: true,
    seo: {
      metaTitle: 'Careers - Join Our Team',
      metaDescription: 'Explore career opportunities and join our growing team of ecommerce professionals.',
      metaKeywords: 'careers, jobs, employment, opportunities, team'
    }
  }
];

const seedUsers = async () => {
  try {
    // Check if users already exist
    const existingUsers = await User.countDocuments();
    if (existingUsers > 1) {
      console.log('✅ Users already exist');
      return;
    }

    // Create admin user
    const adminPassword = await PasswordUtils.hash('Admin@123');
    const admin = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: adminPassword,
      role: UserRole.ADMIN,
      isActive: true,
      isEmailVerified: true,
      phone: '+1234567890',
      addresses: [{
        type: 'billing',
        firstName: 'Admin',
        lastName: 'User',
        addressLine1: '123 Admin Street',
        city: 'Admin City',
        state: 'AC',
        postalCode: '12345',
        country: 'United States',
        isDefault: true
      }]
    });

    await admin.save();

    // Create sample users
    const userPassword = await PasswordUtils.hash('Password@123');
    const users = [];

    for (const userData of sampleUsers) {
      const user = new User({
        ...userData,
        password: userPassword,
        isActive: true,
        isEmailVerified: true,
        phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        dateOfBirth: new Date(1980 + Math.floor(Math.random() * 30), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        gender: Math.random() > 0.5 ? 'male' : 'female',
        preferences: {
          newsletter: Math.random() > 0.3,
          smsNotifications: Math.random() > 0.7,
          emailNotifications: Math.random() > 0.2
        },
        addresses: [{
          type: Math.random() > 0.5 ? 'shipping' : 'billing',
          firstName: userData.firstName,
          lastName: userData.lastName,
          addressLine1: `${Math.floor(Math.random() * 9999) + 1} ${['Main', 'Oak', 'Pine', 'Elm', 'Maple'][Math.floor(Math.random() * 5)]} Street`,
          city: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][Math.floor(Math.random() * 5)],
          state: ['NY', 'CA', 'IL', 'TX', 'AZ'][Math.floor(Math.random() * 5)],
          postalCode: `${Math.floor(Math.random() * 90000) + 10000}`,
          country: 'United States',
          isDefault: true
        }]
      });
      users.push(user);
    }

    await User.insertMany(users);
    console.log(`✅ Created ${users.length + 1} users (1 admin + ${users.length} regular users)`);
    console.log('📧 Admin Email: admin@example.com');
    console.log('🔑 Admin Password: Admin@123');
    console.log('🔑 User Password: Password@123');
  } catch (error) {
    console.error('❌ Error creating users:', error);
  }
};

const seedCategories = async (): Promise<Map<string, any>> => {
  try {
    const existingCategories = await Category.countDocuments();
    if (existingCategories > 0) {
      console.log('✅ Categories already exist');
      const categories = await Category.find();
      const categoryMap = new Map<string, any>();
      categories.forEach(cat => categoryMap.set(cat.name, cat._id));
      return categoryMap;
    }

    const categoryMap = new Map<string, any>();
    const categories: any[] = [];

    // Create root categories first
    for (const categoryData of sampleCategories.filter(cat => !cat.parent)) {
      const slug = SlugUtils.generate(categoryData.name);
      const category = new Category({
        name: categoryData.name,
        slug,
        description: categoryData.description,
        isActive: true,
        sortOrder: categories.length + 1,
        seo: {
          metaTitle: `${categoryData.name} - Best Deals Online`,
          metaDescription: `Shop ${categoryData.name.toLowerCase()} with great prices and fast shipping`,
          metaKeywords: categoryData.name.toLowerCase().replace(/\s+/g, ', ')
        }
      });

      const savedCategory = await category.save();
      categoryMap.set(categoryData.name, savedCategory._id);
      categories.push(savedCategory);
    }

    // Create subcategories
    for (const categoryData of sampleCategories.filter(cat => cat.parent)) {
      const parentId = categoryData.parent ? categoryMap.get(categoryData.parent) : null;
      if (parentId) {
        const slug = SlugUtils.generate(categoryData.name);
        const category = new Category({
          name: categoryData.name,
          slug,
          description: categoryData.description,
          parentCategory: parentId,
          isActive: true,
          sortOrder: categories.length + 1,
          seo: {
            metaTitle: `${categoryData.name} - Premium Selection`,
            metaDescription: `Discover our ${categoryData.name.toLowerCase()} collection with top brands and quality`,
            metaKeywords: categoryData.name.toLowerCase().replace(/\s+/g, ', ')
          }
        });

        const savedCategory = await category.save();
        categoryMap.set(categoryData.name, savedCategory._id);
        categories.push(savedCategory);
      }
    }

    console.log(`✅ Created ${categories.length} categories`);
    return categoryMap;
  } catch (error) {
    console.error('❌ Error creating categories:', error);
    return new Map();
  }
};

const seedProducts = async (categoryMap: Map<string, any>) => {
  try {
    const existingProducts = await Product.countDocuments();
    if (existingProducts > 0) {
      console.log('✅ Products already exist');
      return [];
    }

    const products = [];

    for (const productData of sampleProducts) {
      const categoryId = categoryMap.get(productData.category);
      if (!categoryId) continue;

      const slug = SlugUtils.generate(productData.name);

      const product = new Product({
        name: productData.name,
        slug,
        description: productData.description,
        shortDescription: productData.shortDescription,
        category: categoryId,
        brand: productData.brand,
        sku: productData.sku,
        price: productData.price,
        compareAtPrice: productData.compareAtPrice,
        cost: productData.cost,
        stock: productData.stock,
        lowStockThreshold: 5,
        trackQuantity: true,
        allowBackorder: false,
        weight: Math.random() * 2 + 0.1, // Random weight between 0.1-2.1 kg
        dimensions: {
          length: Math.random() * 30 + 5,
          width: Math.random() * 20 + 5,
          height: Math.random() * 10 + 1
        },
        images: [
          `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 1000)}`,
          `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 1000)}`,
          `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 1000)}`
        ],
        variants: productData.category === 'Smartphones' || productData.category === 'Clothing' ? [
          {
            name: `${productData.name} - Variant 1`,
            sku: `${productData.sku}V1`,
            price: productData.price,
            stock: Math.floor(productData.stock / 2),
            lowStockThreshold: 3,
            attributes: {
              color: ['Black', 'White', 'Blue', 'Red'][Math.floor(Math.random() * 4)],
              size: ['S', 'M', 'L', 'XL'][Math.floor(Math.random() * 4)]
            },
            images: [`https://picsum.photos/800/600?random=${Math.floor(Math.random() * 1000)}`],
            isActive: true
          },
          {
            name: `${productData.name} - Variant 2`,
            sku: `${productData.sku}V2`,
            price: productData.price + 50,
            stock: Math.floor(productData.stock / 2),
            lowStockThreshold: 3,
            attributes: {
              color: ['Silver', 'Gold', 'Rose Gold'][Math.floor(Math.random() * 3)],
              size: ['M', 'L', 'XL', 'XXL'][Math.floor(Math.random() * 4)]
            },
            images: [`https://picsum.photos/800/600?random=${Math.floor(Math.random() * 1000)}`],
            isActive: true
          }
        ] : [],
        attributes: [
          {
            name: 'Color',
            values: ['Black', 'White', 'Blue', 'Red', 'Silver', 'Gold']
          },
          {
            name: 'Size',
            values: ['S', 'M', 'L', 'XL', 'XXL']
          }
        ],
        isActive: true,
        isFeatured: productData.isFeatured,
        isDigital: productData.category === 'Books',
        requiresShipping: productData.category !== 'Books',
        taxable: true,
        tags: productData.tags,
        seo: {
          metaTitle: `${productData.name} - ${productData.shortDescription}`.substring(0, 60),
          metaDescription: productData.description.substring(0, 160),
          metaKeywords: productData.tags.join(', ')
        },
        ratings: {
          average: Math.random() * 2 + 3, // Random rating between 3-5
          count: Math.floor(Math.random() * 100) + 10 // Random count between 10-110
        },
        salesCount: Math.floor(Math.random() * 500),
        viewCount: Math.floor(Math.random() * 1000) + 100
      });

      const savedProduct = await product.save();
      products.push(savedProduct);
    }

    console.log(`✅ Created ${products.length} products`);
    return products;
  } catch (error) {
    console.error('❌ Error creating products:', error);
    return [];
  }
};

const seedCoupons = async () => {
  try {
    const existingCoupons = await Coupon.countDocuments();
    if (existingCoupons > 0) {
      console.log('✅ Coupons already exist');
      return;
    }

    const coupons = [];

    for (const couponData of sampleCoupons) {
      const coupon = new Coupon({
        code: couponData.code,
        name: couponData.name,
        description: `Get ${couponData.type === CouponType.PERCENTAGE ? couponData.value + '%' : '$' + couponData.value} off your order`,
        type: couponData.type,
        value: couponData.value,
        minimumOrderValue: couponData.minimumOrderValue,
        maximumDiscountAmount: couponData.type === CouponType.PERCENTAGE ? couponData.minimumOrderValue * 0.5 : undefined,
        usageLimit: Math.floor(Math.random() * 1000) + 100,
        usageCount: Math.floor(Math.random() * 50),
        userUsageLimit: 1,
        isActive: true,
        startsAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      });

      coupons.push(coupon);
    }

    await Coupon.insertMany(coupons);
    console.log(`✅ Created ${coupons.length} coupons`);
  } catch (error) {
    console.error('❌ Error creating coupons:', error);
  }
};

const seedOrders = async (users: any[], products: any[]) => {
  try {
    const existingOrders = await Order.countDocuments();
    if (existingOrders > 0) {
      console.log('✅ Orders already exist');
      return;
    }

    const orders = [];
    const orderStatuses = Object.values(OrderStatus);
    const paymentStatuses = Object.values(PaymentStatus);
    const paymentMethods = Object.values(PaymentMethod);

    for (let i = 0; i < 15; i++) {
      const customer = users[Math.floor(Math.random() * users.length)];
      const orderProducts = [];
      const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 items per order

      let subtotal = 0;

      for (let j = 0; j < numItems; j++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        const price = product.price;
        const total = price * quantity;

        orderProducts.push({
          product: product._id,
          name: product.name,
          sku: product.sku,
          price: price,
          quantity: quantity,
          total: total,
          image: product.images[0]
        });

        subtotal += total;
      }

      const taxAmount = subtotal * 0.08; // 8% tax
      const shippingAmount = subtotal > 75 ? 0 : 9.99; // Free shipping over $75
      const totalAmount = subtotal + taxAmount + shippingAmount;

      const order = new Order({
        orderNumber: `ORD-${Date.now()}-${i.toString().padStart(3, '0')}`,
        customer: customer._id,
        email: customer.email,
        phone: customer.phone,
        items: orderProducts,
        subtotal: subtotal,
        taxAmount: taxAmount,
        shippingAmount: shippingAmount,
        discountAmount: 0,
        totalAmount: totalAmount,
        currency: 'USD',
        status: orderStatuses[Math.floor(Math.random() * orderStatuses.length)],
        paymentStatus: paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)],
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        shippingAddress: {
          firstName: customer.firstName,
          lastName: customer.lastName,
          addressLine1: customer.addresses[0]?.addressLine1 || '123 Default St',
          city: customer.addresses[0]?.city || 'Default City',
          state: customer.addresses[0]?.state || 'DC',
          postalCode: customer.addresses[0]?.postalCode || '12345',
          country: customer.addresses[0]?.country || 'United States',
          phone: customer.phone
        },
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
      });

      orders.push(order);
    }

    await Order.insertMany(orders);
    console.log(`✅ Created ${orders.length} orders`);
  } catch (error) {
    console.error('❌ Error creating orders:', error);
  }
};

const seedReviews = async (users: any[], products: any[]) => {
  try {
    const existingReviews = await Review.countDocuments();
    if (existingReviews > 0) {
      console.log('✅ Reviews already exist');
      return;
    }

    const reviews = [];
    const reviewComments = [
      'Great product! Highly recommend.',
      'Excellent quality and fast shipping.',
      'Perfect for my needs. Very satisfied.',
      'Good value for money.',
      'Amazing product, exceeded expectations!',
      'Fast delivery and great customer service.',
      'Quality is outstanding, will buy again.',
      'Exactly as described, very happy.',
      'Fantastic product, love it!',
      'Great purchase, highly recommended.',
      'Superb quality and design.',
      'Excellent product, great value.',
      'Very pleased with this purchase.',
      'Outstanding quality and service.',
      'Perfect product, fast shipping.'
    ];

    for (let i = 0; i < 25; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const product = products[Math.floor(Math.random() * products.length)];

      const review = new Review({
        product: product._id,
        user: user._id,
        rating: Math.floor(Math.random() * 2) + 4, // 4-5 star ratings mostly
        title: `Review for ${product.name}`,
        comment: reviewComments[Math.floor(Math.random() * reviewComments.length)],
        images: Math.random() > 0.7 ? [`https://picsum.photos/400/300?random=${Math.floor(Math.random() * 1000)}`] : [],
        isVerifiedPurchase: Math.random() > 0.3,
        isApproved: Math.random() > 0.1,
        helpfulCount: Math.floor(Math.random() * 20),
        createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000) // Random date within last 60 days
      });

      reviews.push(review);
    }

    await Review.insertMany(reviews);
    console.log(`✅ Created ${reviews.length} reviews`);
  } catch (error) {
    console.error('❌ Error creating reviews:', error);
  }
};

const seedCarts = async (users: any[], products: any[]) => {
  try {
    const existingCarts = await Cart.countDocuments();
    if (existingCarts > 0) {
      console.log('✅ Carts already exist');
      return;
    }

    const carts = [];

    // Create carts for some users
    for (let i = 0; i < Math.min(8, users.length); i++) {
      const user = users[i];
      const cartItems = [];
      const numItems = Math.floor(Math.random() * 4) + 1; // 1-4 items per cart

      for (let j = 0; j < numItems; j++) {
        const product = products[Math.floor(Math.random() * products.length)];
        cartItems.push({
          product: product._id,
          quantity: Math.floor(Math.random() * 3) + 1,
          price: product.price,
          addedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Within last 7 days
        });
      }

      const cart = new Cart({
        user: user._id,
        items: cartItems
      });

      carts.push(cart);
    }

    await Cart.insertMany(carts);
    console.log(`✅ Created ${carts.length} carts`);
  } catch (error) {
    console.error('❌ Error creating carts:', error);
  }
};

const seedCmsPages = async (adminUser: any) => {
  try {
    const existingPages = await CmsPage.countDocuments();
    if (existingPages > 0) {
      console.log('✅ CMS pages already exist');
      return;
    }

    const pages = sampleCmsPages.map(pageData => ({
      ...pageData,
      createdBy: adminUser._id,
      updatedBy: adminUser._id
    }));

    await CmsPage.insertMany(pages);
    console.log(`✅ Created ${pages.length} CMS pages`);
  } catch (error) {
    console.error('❌ Error creating CMS pages:', error);
  }
};

const seedInventoryTransactions = async (products: any[], adminUser: any) => {
  try {
    const existingTransactions = await InventoryTransaction.countDocuments();
    if (existingTransactions > 0) {
      console.log('✅ Inventory transactions already exist');
      return;
    }

    const transactions = [];
    const actions = Object.values(InventoryAction);
    const reasons = ['Initial stock', 'Restock', 'Sale', 'Return', 'Damaged goods', 'Inventory adjustment'];

    for (let i = 0; i < 30; i++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const action = actions[Math.floor(Math.random() * actions.length)];
      const quantity = Math.floor(Math.random() * 50) + 1;
      const previousStock = Math.floor(Math.random() * 100);

      let newStock;
      if (action === InventoryAction.IN) {
        newStock = previousStock + quantity;
      } else if (action === InventoryAction.OUT) {
        newStock = Math.max(0, previousStock - quantity);
      } else {
        newStock = quantity; // Adjustment sets absolute value
      }

      const transaction = new InventoryTransaction({
        product: product._id,
        action: action,
        quantity: quantity,
        previousStock: previousStock,
        newStock: newStock,
        reason: reasons[Math.floor(Math.random() * reasons.length)],
        reference: `REF-${Date.now()}-${i}`,
        performedBy: adminUser._id,
        notes: `${action} operation for ${product.name}`,
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000) // Within last 90 days
      });

      transactions.push(transaction);
    }

    await InventoryTransaction.insertMany(transactions);
    console.log(`✅ Created ${transactions.length} inventory transactions`);
  } catch (error) {
    console.error('❌ Error creating inventory transactions:', error);
  }
};

const seedSettings = async () => {
  try {
    // Check if settings already exist
    const existingSettings = await Settings.findOne();
    if (existingSettings) {
      console.log('✅ Settings already exist');
      return;
    }

    // Create comprehensive settings
    const settings = new Settings({
      businessName: 'TechStore Pro',
      businessDescription: 'Your premier destination for the latest technology and electronics. We offer cutting-edge products with exceptional customer service.',
      logo: 'https://picsum.photos/200/80?random=logo',
      favicon: 'https://picsum.photos/32/32?random=favicon',
      currency: 'USD',
      currencySymbol: '$',
      timezone: 'America/New_York',
      language: 'en',
      contactInfo: {
        email: 'contact@techstore.com',
        phone: '+1-800-TECH-STORE',
        address: {
          street: '123 Technology Avenue',
          city: 'San Francisco',
          state: 'CA',
          postalCode: '94105',
          country: 'United States',
        },
      },
      socialMedia: {
        facebook: 'https://facebook.com/techstore',
        twitter: 'https://twitter.com/techstore',
        instagram: 'https://instagram.com/techstore',
        linkedin: 'https://linkedin.com/company/techstore',
        youtube: 'https://youtube.com/techstore'
      },
      theme: {
        primaryColor: '#2563eb',
        secondaryColor: '#64748b',
        accentColor: '#10b981',
        fontFamily: 'Inter, system-ui, sans-serif',
      },
      features: {
        enableReviews: true,
        enableWishlist: true,
        enableCompareProducts: true,
        enableGuestCheckout: true,
        enableCoupons: true,
        enableInventoryTracking: true,
        enableMultipleAddresses: true,
        enableNewsletterSignup: true,
      },
      tax: {
        enabled: true,
        rate: 8.25,
        inclusive: false,
        displayPricesWithTax: false,
      },
      shipping: {
        enabled: true,
        freeShippingThreshold: 75,
        defaultRate: 9.99,
        zones: [
          {
            name: 'Domestic US',
            countries: ['US'],
            rate: 9.99,
          },
          {
            name: 'North America',
            countries: ['CA', 'MX'],
            rate: 19.99,
          },
          {
            name: 'Europe',
            countries: ['GB', 'DE', 'FR', 'IT', 'ES'],
            rate: 29.99,
          },
          {
            name: 'Asia Pacific',
            countries: ['AU', 'JP', 'SG', 'HK'],
            rate: 34.99,
          },
          {
            name: 'Rest of World',
            countries: ['*'],
            rate: 39.99,
          },
        ],
      },
      payments: {
        stripe: {
          enabled: true,
          publicKey: 'pk_test_example_key',
          secretKey: 'sk_test_example_key',
        },
        paypal: {
          enabled: true,
          clientId: 'paypal_client_id_example',
          clientSecret: 'paypal_client_secret_example',
          sandbox: true,
        },
        cashOnDelivery: {
          enabled: true,
        },
      },
      email: {
        smtp: {
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          username: 'noreply@techstore.com',
          password: 'email_password',
        },
        fromEmail: 'noreply@techstore.com',
        fromName: 'TechStore Pro',
        templates: {
          orderConfirmation: true,
          orderShipped: true,
          orderDelivered: true,
          passwordReset: true,
          welcomeEmail: true,
        },
      },
      seo: {
        metaTitle: 'TechStore Pro - Premium Electronics & Technology',
        metaDescription: 'Shop the latest electronics, smartphones, laptops, and tech accessories at TechStore Pro. Fast shipping, great prices, and excellent customer service.',
        metaKeywords: 'electronics, technology, smartphones, laptops, gadgets, online store, tech accessories',
        googleAnalyticsId: 'GA-XXXXXXXXX-X',
        facebookPixelId: '123456789012345',
      },
      legal: {
        termsOfService: '<h1>Terms of Service</h1><p>Welcome to TechStore Pro. By using our website, you agree to these terms...</p>',
        privacyPolicy: '<h1>Privacy Policy</h1><p>Your privacy is important to us. This policy explains how we collect and use your information...</p>',
        returnPolicy: '<h1>Return Policy</h1><p>We want you to be completely satisfied with your purchase. Returns are accepted within 30 days...</p>',
        shippingPolicy: '<h1>Shipping Policy</h1><p>We offer fast and reliable shipping options to get your orders to you quickly...</p>',
      },
      maintenance: {
        enabled: false,
        message: 'We are currently performing scheduled maintenance. Please check back soon.',
        allowedIPs: ['127.0.0.1', '::1'],
      },
    });

    await settings.save();
    console.log('✅ Comprehensive settings created successfully');
  } catch (error) {
    console.error('❌ Error creating settings:', error);
  }
};

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting comprehensive database seeding...');

    // Connect to database
    await database.connect();

    // Seed data in order (due to dependencies)
    console.log('👥 Seeding users...');
    await seedUsers();

    console.log('📁 Seeding categories...');
    const categoryMap = await seedCategories();

    console.log('📦 Seeding products...');
    const products = await seedProducts(categoryMap || new Map());

    console.log('🎫 Seeding coupons...');
    await seedCoupons();

    console.log('⚙️ Seeding settings...');
    await seedSettings();

    // Get users and admin for dependent data
    const users = await User.find({ role: { $ne: UserRole.ADMIN } }).limit(10);
    const adminUser = await User.findOne({ role: UserRole.ADMIN });

    if (users.length > 0 && products.length > 0) {
      console.log('🛒 Seeding orders...');
      await seedOrders(users, products);

      console.log('⭐ Seeding reviews...');
      await seedReviews(users, products);

      console.log('🛍️ Seeding carts...');
      await seedCarts(users, products);
    }

    if (adminUser) {
      console.log('📄 Seeding CMS pages...');
      await seedCmsPages(adminUser);

      if (products.length > 0) {
        console.log('📊 Seeding inventory transactions...');
        await seedInventoryTransactions(products, adminUser);
      }
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Seeded Data Summary:');
    console.log(`👥 Users: ${await User.countDocuments()} (including admin)`);
    console.log(`📁 Categories: ${await Category.countDocuments()}`);
    console.log(`📦 Products: ${await Product.countDocuments()}`);
    console.log(`🎫 Coupons: ${await Coupon.countDocuments()}`);
    console.log(`🛒 Orders: ${await Order.countDocuments()}`);
    console.log(`⭐ Reviews: ${await Review.countDocuments()}`);
    console.log(`🛍️ Carts: ${await Cart.countDocuments()}`);
    console.log(`📄 CMS Pages: ${await CmsPage.countDocuments()}`);
    console.log(`📊 Inventory Transactions: ${await InventoryTransaction.countDocuments()}`);

    console.log('\n🔐 Login Credentials:');
    console.log('📧 Admin Email: admin@example.com');
    console.log('🔑 Admin Password: Admin@123');
    console.log('🔑 User Password (all users): Password@123');

    console.log('\n🚀 You can now start testing all APIs with realistic data!');

    // Disconnect
    await database.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    console.error(error);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

export { seedDatabase };