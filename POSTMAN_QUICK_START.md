# Postman Collection - Quick Start Guide

## 📦 What's Included

The `postman_collection.json` file contains **113 API endpoints** organized into 12 modules:

1. **Health Check** (1 endpoint)
2. **Authentication** (6 endpoints)
3. **Users** (14 endpoints) - Including wishlist
4. **Products** (11 endpoints) - Including bulk operations
5. **Categories** (9 endpoints)
6. **Cart** (6 endpoints)
7. **Orders** (11 endpoints) - Including tracking
8. **Coupons** (6 endpoints)
9. **Reviews** (10 endpoints)
10. **Payments** (8 endpoints)
11. **Inventory** (8 endpoints)
12. **CMS Pages** (9 endpoints)
13. **Settings** (14 endpoints)

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Import Collection
1. Open Postman
2. Click **Import** button
3. Select `postman_collection.json`
4. Click **Import**

### Step 2: Set Base URL
The collection uses `http://localhost:5000/api/v1` by default.

To change it:
1. Click on the collection name
2. Go to **Variables** tab
3. Update `baseUrl` value
4. Click **Save**

### Step 3: Test Authentication
1. Open **1. Authentication** folder
2. Run **Login** request
3. The `accessToken` will be saved automatically
4. All other requests will use this token

---

## 🎯 Testing Workflow

### For Users/Customers:

```
1. Register/Login → Get access token
2. Browse Products → GET /products
3. Add to Cart → POST /carts/items
4. View Cart → GET /carts
5. Create Order → POST /orders
6. Track Order → GET /orders/:id/tracking
7. Add Review → POST /reviews
8. Manage Wishlist → POST /users/profile/wishlist
```

### For Admins:

```
1. Login as Admin
2. Create Products → POST /products
3. Manage Inventory → POST /inventory/add
4. Process Orders → PUT /orders/:id/status
5. Approve Reviews → POST /reviews/:id/approve
6. View Statistics → GET /products/admin/stats
7. Manage Coupons → POST /coupons
8. Update Settings → PUT /settings/*
```

---

## 🔑 Authentication

### Auto-Save Tokens
The collection automatically saves tokens after login/register:
- `accessToken` - Used for authenticated requests
- `refreshToken` - Used to get new access token
- `userId` - Current user ID

### Manual Token Setup
If needed, set tokens manually:
1. Click collection name
2. Go to **Variables** tab
3. Set `accessToken` value
4. Click **Save**

---

## 📝 Variables Reference

The collection uses these variables (auto-populated):

| Variable | Description | Example |
|----------|-------------|---------|
| `baseUrl` | API base URL | `http://localhost:5000/api/v1` |
| `accessToken` | JWT access token | Auto-saved after login |
| `refreshToken` | JWT refresh token | Auto-saved after login |
| `userId` | Current user ID | Auto-saved after login |
| `productId` | Last created product | Auto-saved after create |
| `categoryId` | Last created category | Auto-saved after create |
| `orderId` | Last created order | Auto-saved after create |
| `couponId` | Last created coupon | Auto-saved after create |
| `reviewId` | Last created review | Auto-saved after create |
| `paymentId` | Last created payment | Auto-saved after create |
| `sessionId` | Cart session ID | Set manually for guest cart |
| `cmsPageId` | Last created CMS page | Auto-saved after create |

---

## 🧪 Testing Tips

### 1. Run Collection
Test all endpoints at once:
1. Click collection name
2. Click **Run** button
3. Select requests to run
4. Click **Run Collection**

### 2. Environment Variables
Create different environments (Dev, Staging, Prod):
1. Click **Environments** (left sidebar)
2. Click **+** to create new
3. Add variables (baseUrl, etc.)
4. Select environment before testing

### 3. Pre-request Scripts
Some requests have pre-request scripts that:
- Generate timestamps
- Create random data
- Set dynamic values

### 4. Test Scripts
Many requests have test scripts that:
- Auto-save IDs
- Validate responses
- Set variables for next requests

---

## 📋 Common Scenarios

### Scenario 1: Complete Shopping Flow
```
1. Login → POST /auth/login
2. Browse → GET /products
3. Add to Cart → POST /carts/items (productId, quantity)
4. View Cart → GET /carts
5. Checkout → POST /orders
6. Track → GET /orders/:id/tracking
```

### Scenario 2: Product Management
```
1. Login as Admin → POST /auth/login
2. Create Category → POST /categories
3. Create Product → POST /products (use categoryId)
4. Add Stock → POST /inventory/add
5. Update Product → PUT /products/:id
6. View Stats → GET /products/admin/stats
```

### Scenario 3: Order Processing
```
1. View Orders → GET /orders
2. Update Status → PUT /orders/:id/status (to "processing")
3. Add Tracking → PUT /orders/:id/tracking
4. Update Status → PUT /orders/:id/status (to "shipped")
5. Customer Tracks → GET /orders/:id/tracking
```

### Scenario 4: Review Management
```
1. Customer Creates Review → POST /reviews
2. Admin Views Reviews → GET /reviews?approved=false
3. Admin Approves → POST /reviews/:id/approve
4. Admin Responds → POST /reviews/:id/respond
5. View Stats → GET /reviews/product/:productId/stats
```

---

## 🔍 Query Parameters

### Pagination (Most GET endpoints)
```
?page=1&limit=10&sort=createdAt&order=desc
```

### Filtering
```
?search=keyword
?status=active
?category=electronics
?minPrice=10&maxPrice=100
```

### Date Range
```
?startDate=2024-01-01&endDate=2024-12-31
```

---

## ⚠️ Important Notes

### 1. Default Credentials
The collection uses these default credentials:
- **Admin:** `admin@example.com` / `Admin@123`
- **User:** `john@example.com` / `Pass@123`

**Change these in production!**

### 2. Session-Based Cart
For guest cart operations, set `sessionId` variable:
```
x-session-id: {{sessionId}}
```

### 3. Role-Based Access
Some endpoints require specific roles:
- **Admin only:** User management, Settings
- **Admin/Staff:** Product management, Orders, Inventory
- **User:** Profile, Cart, Orders, Reviews, Wishlist
- **Public:** Browse products, View CMS pages

### 4. Response Format
All responses follow this format:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "pagination": { ... }
}
```

---

## 🐛 Troubleshooting

### Issue: 401 Unauthorized
**Solution:** Login again to refresh token
```
POST /auth/login
```

### Issue: 404 Not Found
**Solution:** Check if server is running
```
GET /health
```

### Issue: Variables not saving
**Solution:** Check test scripts are enabled
1. Settings → General
2. Enable "Allow reading files outside working directory"

### Issue: CORS errors
**Solution:** Check backend CORS configuration
- Ensure frontend URL is whitelisted
- Check credentials are allowed

---

## 📚 Additional Resources

- **Full API Documentation:** `API_ENDPOINTS.md`
- **Detailed Guide:** `POSTMAN_COLLECTION_GUIDE.md`
- **Module Analysis:** `MODULE_CRUD_ANALYSIS.md`
- **Implementation Details:** `FINAL_API_SUMMARY.md`

---

## 🔄 Regenerate Collection

If you need to regenerate the collection:

```bash
cd backend
python3 generate_postman.py
```

This will create a fresh `postman_collection.json` with all 113 endpoints.

---

## 💡 Pro Tips

1. **Use Folders:** Organize requests by feature/module
2. **Use Variables:** Avoid hardcoding IDs and tokens
3. **Use Environments:** Separate Dev/Staging/Prod configs
4. **Use Tests:** Validate responses automatically
5. **Use Pre-requests:** Generate dynamic data
6. **Use Collections Runner:** Test multiple requests
7. **Use Mock Servers:** Test frontend without backend
8. **Export Results:** Share test results with team

---

## 🎉 You're Ready!

Import the collection and start testing your E-Commerce Backend API!

**Happy Testing! 🚀**
