# Database Seeding Guide

This guide explains how to seed your ecommerce database with comprehensive dummy data for testing all APIs.

## 🌱 What Gets Seeded

The seeder creates realistic dummy data for all major entities:

### **Users (13 total)**
- **1 Admin**: `admin@example.com` / `Admin@123`
- **2 Staff**: Various staff members with different roles
- **10 Regular Users**: Customers with complete profiles, addresses, and preferences

### **Categories (12 total)**
- **5 Root Categories**: Electronics, Clothing, Home & Garden, Sports & Outdoors, Books
- **7 Subcategories**: Smartphones, Laptops, Audio, Men's/Women's Clothing, Shoes, Furniture

### **Products (12+ total)**
- **Electronics**: iPhone 15 Pro, Samsung Galaxy S24, MacBook Pro, Dell XPS, Sony Headphones, AirPods, Fitness Tracker
- **Clothing**: T-shirts, Yoga Leggings, Running Shoes
- **Furniture**: Office Chair
- **Books**: Programming Bundle
- Each product includes variants, attributes, SEO data, and realistic pricing

### **Orders (15 total)**
- Random orders with 1-3 products each
- Various order statuses (pending, confirmed, shipped, delivered)
- Different payment methods and statuses
- Realistic shipping addresses and totals

### **Reviews (25 total)**
- 4-5 star ratings with realistic comments
- Mix of verified and unverified purchases
- Some with images, helpful counts
- Distributed across different products

### **Coupons (10 total)**
- **Percentage Discounts**: WELCOME10, ELECTRONICS15, SUMMER30, etc.
- **Fixed Amount**: SAVE20, NEWUSER25, BULK50
- **Free Shipping**: FREESHIP
- Various minimum order values and usage limits

### **Shopping Carts (8 total)**
- Active carts for different users
- 1-4 items per cart with realistic quantities
- Recent addition timestamps

### **CMS Pages (10 total)**
- About Us, Privacy Policy, Terms of Service
- Shipping Info, Return Policy, FAQ
- Contact Us, Size Guide, Gift Cards, Careers
- Complete with SEO metadata and content

### **Inventory Transactions (30 total)**
- Stock in/out/adjustment operations
- Various reasons (restock, sales, returns, damaged goods)
- Historical data over 90 days
- Linked to products and admin user

### **Business Settings**
- Complete business configuration
- Payment gateway settings (Stripe, PayPal, COD)
- Shipping zones for different regions
- Tax configuration, theme settings
- Feature toggles and SEO settings

## 🚀 How to Seed

### **Method 1: NPM Script (Recommended)**
```bash
npm run seed
```

### **Method 2: Direct Execution**
```bash
npx ts-node src/database/seed.ts
```

### **Method 3: From Built Code**
```bash
npm run build
node dist/database/seed.js
```

## 📋 Seeding Process

The seeder runs in a specific order to handle data dependencies:

1. **Users** → Creates admin and regular users first
2. **Categories** → Creates category hierarchy
3. **Products** → Creates products linked to categories
4. **Coupons** → Creates discount codes
5. **Settings** → Creates business configuration
6. **Orders** → Creates orders using existing users and products
7. **Reviews** → Creates reviews for products by users
8. **Carts** → Creates active shopping carts
9. **CMS Pages** → Creates content pages
10. **Inventory Transactions** → Creates stock movement history

## 🔍 Verification

After seeding, you'll see a summary like this:

```
🎉 Database seeding completed successfully!

📋 Seeded Data Summary:
👥 Users: 13 (including admin)
📁 Categories: 12
📦 Products: 12
🎫 Coupons: 10
🛒 Orders: 15
⭐ Reviews: 25
🛍️ Carts: 8
📄 CMS Pages: 10
📊 Inventory Transactions: 30

🔐 Login Credentials:
📧 Admin Email: admin@example.com
🔑 Admin Password: Admin@123
🔑 User Password (all users): Password@123
```

## 🧪 Testing with Seeded Data

### **Authentication Testing**
```bash
# Login as admin
POST /auth/login
{
  "email": "admin@example.com",
  "password": "Admin@123"
}

# Login as regular user
POST /auth/login
{
  "email": "john.doe@example.com",
  "password": "Password@123"
}
```

### **Product Catalog Testing**
```bash
# Get all products (should return 12+ products)
GET /products

# Get featured products (should return several featured items)
GET /products/featured

# Search products
GET /products?search=iphone

# Filter by category
GET /products?category={{categoryId}}

# Filter by price range
GET /products?minPrice=100&maxPrice=500
```

### **Category Testing**
```bash
# Get category tree (hierarchical structure)
GET /categories/tree

# Get all categories
GET /categories

# Get specific category with subcategories
GET /categories/{{categoryId}}
```

### **User Management Testing**
```bash
# Get all users (admin only)
GET /users

# Get user statistics
GET /users/stats

# Update user profile
PUT /users/profile/update
```

### **Order Management Testing**
```bash
# Get orders (admin/staff)
GET /orders

# Get order statistics
GET /orders/stats

# Get user's order history
GET /orders/my-orders
```

### **Coupon Testing**
```bash
# Get all coupons
GET /coupons

# Validate coupon
POST /coupons/validate
{
  "code": "WELCOME10",
  "orderTotal": 100
}
```

## 🔄 Re-seeding

### **Clean Re-seed**
To completely reset and re-seed:

```bash
# Method 1: Drop database and re-seed
# (Connect to MongoDB and drop the database)
npm run seed

# Method 2: Clear collections manually
# The seeder checks for existing data and skips if found
```

### **Partial Re-seed**
The seeder is idempotent - it checks for existing data:

- If data exists, it skips that section
- If you want to re-seed specific data, manually delete those collections first
- Then run the seeder again

## 🎯 Sample API Workflows

### **Complete Ecommerce Flow**
1. **Browse Products**: `GET /products`
2. **View Product Details**: `GET /products/{{productId}}`
3. **Add to Cart**: `POST /cart/add`
4. **Apply Coupon**: `POST /cart/apply-coupon`
5. **Checkout**: `POST /orders/create`
6. **Track Order**: `GET /orders/{{orderId}}`

### **Admin Management Flow**
1. **Login as Admin**: `POST /auth/login`
2. **View Dashboard Stats**: `GET /users/stats`, `GET /products/admin/stats`
3. **Manage Products**: `POST /products`, `PUT /products/{{id}}`
4. **Manage Orders**: `GET /orders`, `PUT /orders/{{id}}/status`
5. **Configure Settings**: `PUT /settings/business`

### **Content Management Flow**
1. **Get CMS Pages**: `GET /cms/pages`
2. **Update Page Content**: `PUT /cms/pages/{{id}}`
3. **Manage Categories**: `POST /categories`, `PUT /categories/{{id}}`

## 🛠️ Customization

### **Adding More Data**
To add more sample data, edit `src/database/seed.ts`:

```typescript
// Add more sample products
const sampleProducts = [
  // ... existing products
  {
    name: 'Your New Product',
    description: 'Product description',
    category: 'Electronics',
    // ... other fields
  }
];

// Add more sample users
const sampleUsers = [
  // ... existing users
  { firstName: 'New', lastName: 'User', email: 'new@example.com', role: UserRole.USER }
];
```

### **Modifying Data Quantities**
Change the loops in seeding functions:

```typescript
// Create more orders (change from 15 to 50)
for (let i = 0; i < 50; i++) {
  // ... order creation logic
}

// Create more reviews (change from 25 to 100)
for (let i = 0; i < 100; i++) {
  // ... review creation logic
}
```

## 🚨 Important Notes

1. **Environment**: Always seed in development/testing environments first
2. **Data Reset**: Seeding will not overwrite existing data - it checks first
3. **Dependencies**: Some data depends on other data (orders need users and products)
4. **Performance**: Seeding large amounts of data may take time
5. **Cleanup**: Consider data cleanup strategies for test environments

## 🔧 Troubleshooting

### **Common Issues**

**"Users already exist"**
- The seeder found existing data and skipped creation
- This is normal behavior to prevent duplicates

**"Error creating products"**
- Check if categories were created successfully
- Verify database connection and permissions

**"Validation errors"**
- Check required fields in models
- Verify data format matches schema requirements

**"Connection timeout"**
- Increase MongoDB connection timeout
- Check database server status

### **Debug Mode**
Add more logging to see detailed progress:

```typescript
console.log('Creating product:', productData.name);
console.log('Saved product with ID:', savedProduct._id);
```

---

**Ready to Test!** After seeding, you have a fully populated ecommerce database ready for comprehensive API testing with realistic data scenarios.