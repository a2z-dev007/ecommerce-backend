# Quick Start Guide

Get your ecommerce backend up and running with dummy data in minutes!

## 🚀 Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your MongoDB connection
# Minimum required:
MONGODB_URI=mongodb://localhost:27017/ecommerce_db
JWT_ACCESS_SECRET=your-super-secret-access-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars
COOKIE_SECRET=your-cookie-secret-min-16-chars
```

### 3. Test Database Connection (Optional)
```bash
npm run test:connection
```

### 4. Seed Database with Dummy Data

**Option 1: Full TypeScript Seeder (Recommended)**
```bash
npm run seed
```

**Option 2: Simple JavaScript Seeder (Always Works)**
```bash
npm run seed:simple
```

**If you get path alias errors:**
- Use the simple seeder: `npm run seed:simple`
- Or run directly: `node simple-seed.js`

This will create:
- **13 Users** (1 admin + 2 staff + 10 customers)
- **12 Categories** (hierarchical structure)
- **12+ Products** (with variants, images, SEO)
- **15 Orders** (various statuses and payment methods)
- **25 Reviews** (4-5 star ratings with comments)
- **10 Coupons** (percentage, fixed, free shipping)
- **8 Shopping Carts** (active user carts)
- **10 CMS Pages** (about, privacy, terms, etc.)
- **30 Inventory Transactions** (stock movements)
- **Complete Business Settings** (payments, shipping, etc.)

### 5. Start Server

**Option A: Simple Server (Guaranteed to Work)**
```bash
npm run start:simple
```

**Option B: Full TypeScript Server**
```bash
npm run dev
```

**If you get import/path errors, use the simple server first to test connectivity.**

### 6. Test the API
Server runs on: `http://localhost:3000`

**Login Credentials:**
- **Admin**: `admin@example.com` / `Admin@123`
- **Users**: Any user email / `Password@123`

**Quick API Tests:**
```bash
# Health check
GET http://localhost:3000/api/v1/health

# Login as admin
POST http://localhost:3000/api/v1/auth/login
{
  "email": "admin@example.com",
  "password": "Admin@123"
}

# Get products
GET http://localhost:3000/api/v1/products

# Get categories
GET http://localhost:3000/api/v1/categories/tree
```

## 📱 Use Postman Collection

Import the provided Postman collection for complete API testing:
1. Import `postman_collection.json`
2. Import `postman_environment.json`
3. Run "Login" request first
4. All other requests will use the saved token automatically

## 🔧 Troubleshooting

**"Cannot find module" errors:**
- Make sure you ran `npm install`
- Check that all dependencies are installed

**Database connection errors:**
- Verify MongoDB is running
- Check MONGODB_URI in .env file
- Ensure database permissions are correct

**Seeding errors:**
- Check if data already exists (seeder skips existing data)
- Verify all required environment variables are set
- Check database connection and permissions

## 📊 What You Get

After seeding, you have a fully functional ecommerce backend with:

### **Realistic Product Catalog**
- Electronics (iPhone, Samsung, MacBook, Dell, Sony, Apple)
- Clothing (T-shirts, Leggings, Shoes)
- Furniture (Office Chair)
- Books (Programming Bundle)
- Fitness (Tracker)

### **Complete User Management**
- Admin dashboard access
- Customer profiles with addresses
- Staff members with limited access
- Realistic user preferences and data

### **Order Management**
- Orders in various statuses
- Different payment methods
- Shipping calculations
- Order history and tracking

### **Business Configuration**
- Payment gateways (Stripe, PayPal, COD)
- Shipping zones and rates
- Tax settings
- Theme customization
- Feature toggles

### **Content Management**
- SEO-optimized pages
- Legal pages (privacy, terms)
- Help content (FAQ, shipping info)
- Business pages (about, careers)

## 🎯 Next Steps

1. **Customize Products**: Add your own product categories and items
2. **Configure Payments**: Set up real Stripe/PayPal credentials
3. **Brand Settings**: Update business info, logo, and theme
4. **Test Workflows**: Use Postman to test complete user journeys
5. **Deploy**: Follow DEPLOYMENT.md for production setup

## 📚 Documentation

- **API_TESTING_GUIDE.md**: Comprehensive API testing instructions
- **SEEDING_GUIDE.md**: Detailed seeding documentation
- **DEPLOYMENT.md**: Production deployment guide
- **README.md**: Complete project documentation

---

**Ready to build!** Your ecommerce backend is now fully populated with realistic data and ready for development and testing.