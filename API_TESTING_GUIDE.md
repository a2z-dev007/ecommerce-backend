# API Testing Guide

This guide provides comprehensive instructions for testing the ecommerce backend API using the provided Postman collection.

## 📋 Prerequisites

1. **Backend Running**: Ensure the backend server is running on `http://localhost:3000`
2. **Database Seeded**: Run `npm run seed` to create the initial admin user
3. **Postman Installed**: Download from [postman.com](https://www.postman.com/downloads/)

## 🚀 Quick Setup

### 1. Import Postman Collection

1. Open Postman
2. Click **Import** button
3. Select `postman_collection.json` file
4. Import `postman_environment.json` as environment
5. Select "Ecommerce Backend Environment" from the environment dropdown

### 2. Default Credentials

The seeded database includes:
- **Admin Email**: `admin@example.com`
- **Admin Password**: `Admin@123`

## 🔄 Testing Workflow

### Step 1: Authentication Flow

1. **Login as Admin**
   ```
   POST /auth/login
   {
     "email": "admin@example.com",
     "password": "Admin@123"
   }
   ```
   - This will automatically set `accessToken` and `refreshToken` variables
   - All subsequent requests will use the bearer token

2. **Get Profile**
   ```
   GET /auth/profile
   ```
   - Verify authentication is working
   - Check user details and role

3. **Register New User**
   ```
   POST /auth/register
   {
     "firstName": "John",
     "lastName": "Doe",
     "email": "john.doe@example.com",
     "password": "Password@123"
   }
   ```

### Step 2: Category Management

1. **Create Root Category**
   ```
   POST /categories
   {
     "name": "Electronics",
     "description": "Electronic devices and gadgets",
     "isActive": true,
     "sortOrder": 1
   }
   ```
   - This sets the `categoryId` variable automatically

2. **Create Subcategory**
   ```
   POST /categories
   {
     "name": "Smartphones",
     "parentCategory": "{{categoryId}}",
     "description": "Latest smartphones"
   }
   ```

3. **Get Category Tree**
   ```
   GET /categories/tree
   ```
   - View hierarchical category structure

### Step 3: Product Management

1. **Create Product**
   ```
   POST /products
   {
     "name": "iPhone 15 Pro",
     "description": "Latest iPhone with advanced features",
     "category": "{{categoryId}}",
     "sku": "IPHONE15PRO128",
     "price": 999.99,
     "stock": 50,
     "isFeatured": true
   }
   ```
   - This sets the `productId` variable automatically

2. **Get Products with Filters**
   ```
   GET /products?search=iphone&minPrice=500&maxPrice=1500
   ```

3. **Get Featured Products**
   ```
   GET /products/featured?limit=5
   ```

### Step 4: User Management

1. **Get All Users (Admin Only)**
   ```
   GET /users?page=1&limit=10
   ```

2. **Update User Profile**
   ```
   PUT /users/profile/update
   {
     "firstName": "John Updated",
     "phone": "+1234567891"
   }
   ```

3. **Add User Address**
   ```
   POST /users/profile/addresses
   {
     "type": "shipping",
     "firstName": "John",
     "lastName": "Doe",
     "addressLine1": "123 Main St",
     "city": "New York",
     "state": "NY",
     "postalCode": "10001",
     "country": "United States"
   }
   ```

### Step 5: Settings Configuration

1. **Update Business Information**
   ```
   PUT /settings/business
   {
     "businessName": "TechStore Pro",
     "businessDescription": "Your tech destination"
   }
   ```

2. **Configure Payment Methods**
   ```
   PUT /settings/payments
   {
     "stripe": { "enabled": true },
     "paypal": { "enabled": true },
     "cashOnDelivery": { "enabled": true }
   }
   ```

3. **Set Shipping Zones**
   ```
   PUT /settings/shipping
   {
     "enabled": true,
     "freeShippingThreshold": 75,
     "zones": [
       {
         "name": "Domestic",
         "countries": ["US"],
         "rate": 9.99
       }
     ]
   }
   ```

## 🧪 Test Scenarios

### Authentication Tests

1. **Valid Login**
   - Use correct credentials
   - Verify token generation
   - Check token expiration

2. **Invalid Login**
   - Wrong password: Should return 401
   - Non-existent email: Should return 401
   - Missing fields: Should return 400

3. **Token Refresh**
   - Use refresh token to get new access token
   - Verify old refresh token is invalidated

4. **Protected Routes**
   - Access without token: Should return 401
   - Access with expired token: Should return 401
   - Access with valid token: Should return data

### Role-Based Access Tests

1. **Admin Access**
   - Create/update/delete users
   - Access admin statistics
   - Manage all resources

2. **Staff Access**
   - View users but limited modifications
   - Manage products and categories
   - Cannot access admin-only features

3. **User Access**
   - Update own profile only
   - View public resources
   - Cannot access admin features

### Data Validation Tests

1. **Required Fields**
   - Missing required fields should return 400
   - Empty strings should be rejected

2. **Format Validation**
   - Invalid email format
   - Weak passwords
   - Invalid phone numbers

3. **Business Logic**
   - Duplicate email registration
   - Duplicate SKU creation
   - Invalid category parent relationships

### Pagination Tests

1. **Default Pagination**
   ```
   GET /products
   ```
   - Should return first 10 items

2. **Custom Pagination**
   ```
   GET /products?page=2&limit=5
   ```
   - Should return items 6-10

3. **Large Page Numbers**
   ```
   GET /products?page=999
   ```
   - Should return empty results gracefully

### Search and Filter Tests

1. **Text Search**
   ```
   GET /products?search=iphone
   ```
   - Should search in name, description, tags

2. **Price Range**
   ```
   GET /products?minPrice=100&maxPrice=500
   ```
   - Should filter by price range

3. **Category Filter**
   ```
   GET /products?category={{categoryId}}
   ```
   - Should return products in specific category

## 🔍 Response Validation

### Success Responses

All successful responses should follow this structure:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {},
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Error Responses

Error responses should follow this structure:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### HTTP Status Codes

- **200**: Success (GET, PUT)
- **201**: Created (POST)
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (authentication required)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found (resource doesn't exist)
- **409**: Conflict (duplicate resource)
- **500**: Internal Server Error

## 🚨 Common Issues & Solutions

### 1. Authentication Issues

**Problem**: "Unauthorized" errors
**Solution**: 
- Check if you're logged in
- Verify token is set in environment
- Try refreshing the token

### 2. Validation Errors

**Problem**: "Validation error" responses
**Solution**:
- Check required fields are provided
- Verify data formats (email, phone, etc.)
- Ensure password meets complexity requirements

### 3. Permission Errors

**Problem**: "Access forbidden" errors
**Solution**:
- Verify user role has required permissions
- Login as admin for admin-only operations
- Check endpoint access requirements

### 4. Database Errors

**Problem**: "Resource not found" errors
**Solution**:
- Ensure database is seeded
- Check if referenced IDs exist
- Verify relationships are correct

## 📊 Performance Testing

### Load Testing Endpoints

1. **High-Traffic Endpoints**
   - `GET /products` (product listing)
   - `GET /categories/tree` (navigation)
   - `POST /auth/login` (authentication)

2. **Concurrent Users**
   - Test with multiple simultaneous requests
   - Monitor response times
   - Check for rate limiting

3. **Large Datasets**
   - Create many products/categories
   - Test pagination performance
   - Verify search functionality

## 🔧 Environment Variables

For different environments, update the `baseUrl`:

- **Development**: `http://localhost:3000/api/v1`
- **Staging**: `https://staging-api.yourdomain.com/api/v1`
- **Production**: `https://api.yourdomain.com/api/v1`

## 📝 Test Documentation

### Creating Test Cases

1. **Test Name**: Descriptive name
2. **Endpoint**: HTTP method and URL
3. **Prerequisites**: Required setup
4. **Input Data**: Request body/parameters
5. **Expected Result**: Success criteria
6. **Actual Result**: Test outcome

### Example Test Case

```
Test: Create Product with Valid Data
Endpoint: POST /products
Prerequisites: Admin logged in, category exists
Input: Valid product data with all required fields
Expected: 201 status, product created with generated ID
Actual: ✅ Product created successfully
```

## 🎯 Testing Checklist

- [ ] All authentication flows work
- [ ] Role-based access is enforced
- [ ] Data validation is working
- [ ] CRUD operations function correctly
- [ ] Pagination works as expected
- [ ] Search and filters return correct results
- [ ] Error handling is appropriate
- [ ] Response formats are consistent
- [ ] Performance is acceptable
- [ ] Security measures are in place

---

**Note**: Always test in a development environment first. Never run destructive tests against production data.