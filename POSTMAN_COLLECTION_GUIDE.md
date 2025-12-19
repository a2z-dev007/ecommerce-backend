# Postman Collection Guide

## Quick Setup

### 1. Import Environment Variables

Create a Postman environment with these variables:

```json
{
  "baseUrl": "http://localhost:5000/api/v1",
  "accessToken": "",
  "refreshToken": "",
  "userId": "",
  "productId": "",
  "categoryId": "",
  "orderId": "",
  "couponId": "",
  "reviewId": "",
  "paymentId": "",
  "sessionId": "",
  "cmsPageId": ""
}
```

### 2. Authentication Setup

All authenticated requests should include:
```
Authorization: Bearer {{accessToken}}
```

For cart operations without auth, include:
```
x-session-id: {{sessionId}}
```

---

## API Endpoints by Module

### 🔐 Authentication (`/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login user | No |
| POST | `/auth/logout` | Logout user | Yes |
| POST | `/auth/refresh` | Refresh access token | No |
| POST | `/auth/forgot-password` | Request password reset | No |
| POST | `/auth/reset-password` | Reset password with token | No |

**Sample Login Request:**
```json
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "Admin@123"
}
```

---

### 👥 Users (`/users`)

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/users` | Get all users | Yes | Admin/Staff |
| GET | `/users/stats` | Get user statistics | Yes | Admin |
| GET | `/users/:id` | Get user by ID | Yes | Admin/Staff |
| POST | `/users` | Create user | Yes | Admin |
| PUT | `/users/:id` | Update user | Yes | Admin |
| DELETE | `/users/:id` | Delete user | Yes | Admin |
| PUT | `/users/profile/update` | Update own profile | Yes | User |
| POST | `/users/profile/addresses` | Add address | Yes | User |
| PUT | `/users/profile/addresses/:addressId` | Update address | Yes | User |
| DELETE | `/users/profile/addresses/:addressId` | Delete address | Yes | User |
| GET | `/users/profile/wishlist` | Get wishlist | Yes | User |
| POST | `/users/profile/wishlist` | Add to wishlist | Yes | User |
| DELETE | `/users/profile/wishlist/:productId` | Remove from wishlist | Yes | User |
| DELETE | `/users/profile/wishlist` | Clear wishlist | Yes | User |

**Sample Add to Wishlist:**
```json
POST {{baseUrl}}/users/profile/wishlist
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "productId": "{{productId}}"
}
```

---

### 📦 Products (`/products`)

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/products` | Get all products | No | - |
| GET | `/products/featured` | Get featured products | No | - |
| GET | `/products/slug/:slug` | Get product by slug | No | - |
| GET | `/products/:id` | Get product by ID | No | - |
| GET | `/products/:id/related` | Get related products | No | - |
| GET | `/products/admin/stats` | Get product stats | Yes | Admin/Staff |
| POST | `/products` | Create product | Yes | Admin/Staff |
| PUT | `/products/:id` | Update product | Yes | Admin/Staff |
| DELETE | `/products/:id` | Delete product | Yes | Admin/Staff |
| PUT | `/products/bulk/update` | Bulk update products | Yes | Admin/Staff |
| DELETE | `/products/bulk/delete` | Bulk delete products | Yes | Admin/Staff |

**Sample Create Product:**
```json
POST {{baseUrl}}/products
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "name": "iPhone 15 Pro",
  "description": "Latest iPhone",
  "category": "{{categoryId}}",
  "sku": "IPHONE15PRO",
  "price": 999.99,
  "stock": 50,
  "isFeatured": true
}
```

**Sample Bulk Update:**
```json
PUT {{baseUrl}}/products/bulk/update
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "productIds": ["id1", "id2", "id3"],
  "updateData": {
    "isActive": true,
    "isFeatured": false
  }
}
```

---

### 📂 Categories (`/categories`)

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/categories` | Get all categories | No | - |
| GET | `/categories/tree` | Get category tree | No | - |
| GET | `/categories/slug/:slug` | Get by slug | No | - |
| GET | `/categories/:id` | Get by ID | No | - |
| GET | `/categories/admin/stats` | Get stats | Yes | Admin/Staff |
| POST | `/categories` | Create category | Yes | Admin/Staff |
| PUT | `/categories/:id` | Update category | Yes | Admin/Staff |
| DELETE | `/categories/:id` | Delete category | Yes | Admin/Staff |
| POST | `/categories/reorder` | Reorder categories | Yes | Admin/Staff |

---

### 🛒 Cart (`/carts`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/carts` | Get cart | Optional |
| POST | `/carts/items` | Add to cart | Optional |
| PUT | `/carts/items/:productId` | Update cart item | Optional |
| DELETE | `/carts/items/:productId` | Remove from cart | Optional |
| DELETE | `/carts` | Clear cart | Optional |
| POST | `/carts/merge` | Merge session cart | Yes |

**Sample Add to Cart:**
```json
POST {{baseUrl}}/carts/items
x-session-id: {{sessionId}}
Content-Type: application/json

{
  "productId": "{{productId}}",
  "quantity": 2,
  "variantId": "optional-variant-id"
}
```

---

### 📋 Orders (`/orders`)

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/orders` | Get orders | Yes | User/Admin |
| GET | `/orders/stats` | Get order stats | Yes | Admin/Staff |
| GET | `/orders/number/:orderNumber` | Get by order number | Yes | User/Admin |
| GET | `/orders/user/:userId/history` | Get user history | Yes | User/Admin |
| GET | `/orders/:id` | Get by ID | Yes | User/Admin |
| GET | `/orders/:id/tracking` | Get tracking info | Yes | User/Admin |
| POST | `/orders` | Create order | Yes | User |
| PUT | `/orders/:id/status` | Update status | Yes | Admin/Staff |
| PUT | `/orders/:id/payment` | Update payment | Yes | Admin/Staff |
| PUT | `/orders/:id/tracking` | Add tracking | Yes | Admin/Staff |
| POST | `/orders/:id/cancel` | Cancel order | Yes | User/Admin |

**Sample Create Order:**
```json
POST {{baseUrl}}/orders
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "email": "customer@example.com",
  "phone": "+1234567890",
  "shippingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "addressLine1": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "USA"
  },
  "paymentMethod": "credit_card"
}
```

**Sample Add Tracking:**
```json
PUT {{baseUrl}}/orders/{{orderId}}/tracking
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "trackingNumber": "1Z999AA10123456784",
  "shippingMethod": "UPS Ground"
}
```

---

### 🎟️ Coupons (`/coupons`)

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| POST | `/coupons/validate` | Validate coupon | Optional | - |
| GET | `/coupons` | Get all coupons | Yes | Admin/Staff |
| GET | `/coupons/:id` | Get by ID | Yes | Admin/Staff |
| POST | `/coupons` | Create coupon | Yes | Admin/Staff |
| PUT | `/coupons/:id` | Update coupon | Yes | Admin/Staff |
| DELETE | `/coupons/:id` | Delete coupon | Yes | Admin/Staff |

**Sample Create Coupon:**
```json
POST {{baseUrl}}/coupons
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "code": "SAVE20",
  "name": "20% Off Sale",
  "type": "percentage",
  "value": 20,
  "minimumOrderValue": 50,
  "usageLimit": 100,
  "expiresAt": "2024-12-31T23:59:59Z"
}
```

**Sample Validate Coupon:**
```json
POST {{baseUrl}}/coupons/validate
Content-Type: application/json

{
  "code": "SAVE20",
  "orderValue": 100,
  "productIds": ["prod1", "prod2"],
  "categoryIds": ["cat1"]
}
```

---

### ⭐ Reviews (`/reviews`)

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/reviews` | Get reviews | Optional | - |
| GET | `/reviews/product/:productId/stats` | Get product stats | No | - |
| GET | `/reviews/:id` | Get by ID | Optional | - |
| POST | `/reviews` | Create review | Yes | User |
| PUT | `/reviews/:id` | Update review | Yes | User |
| DELETE | `/reviews/:id` | Delete review | Yes | User/Admin |
| POST | `/reviews/:id/helpful` | Mark helpful | Optional | - |
| POST | `/reviews/:id/report` | Report review | Optional | - |
| POST | `/reviews/:id/approve` | Approve review | Yes | Admin/Staff |
| POST | `/reviews/:id/respond` | Respond to review | Yes | Admin/Staff |

**Sample Create Review:**
```json
POST {{baseUrl}}/reviews
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "productId": "{{productId}}",
  "rating": 5,
  "title": "Excellent product!",
  "comment": "Very satisfied with this purchase",
  "orderId": "{{orderId}}"
}
```

---

### 💳 Payments (`/payments`)

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/payments` | Get all payments | Yes | Admin/Staff |
| GET | `/payments/stats` | Get payment stats | Yes | Admin/Staff |
| GET | `/payments/intent/:intentId` | Get by intent ID | Yes | Admin/Staff |
| GET | `/payments/order/:orderId` | Get by order | Yes | Admin/Staff |
| GET | `/payments/:id` | Get by ID | Yes | Admin/Staff |
| POST | `/payments` | Create payment | Yes | Admin/Staff |
| PUT | `/payments/:id/status` | Update status | Yes | Admin/Staff |
| POST | `/payments/:id/refund` | Process refund | Yes | Admin/Staff |

**Sample Process Refund:**
```json
POST {{baseUrl}}/payments/{{paymentId}}/refund
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "amount": 50.00,
  "reason": "Customer request",
  "refundId": "REF-12345"
}
```

---

### 📊 Inventory (`/inventory`)

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/inventory` | Get transactions | Yes | Admin/Staff |
| GET | `/inventory/stats` | Get inventory stats | Yes | Admin/Staff |
| GET | `/inventory/product/:productId` | Get product transactions | Yes | Admin/Staff |
| GET | `/inventory/:id` | Get by ID | Yes | Admin/Staff |
| POST | `/inventory` | Create transaction | Yes | Admin/Staff |
| POST | `/inventory/adjust` | Adjust stock | Yes | Admin/Staff |
| POST | `/inventory/add` | Add stock | Yes | Admin/Staff |
| POST | `/inventory/remove` | Remove stock | Yes | Admin/Staff |

**Sample Add Stock:**
```json
POST {{baseUrl}}/inventory/add
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "productId": "{{productId}}",
  "quantity": 100,
  "reason": "New shipment received",
  "reference": "PO-12345"
}
```

---

### 📄 CMS Pages (`/cms`)

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/cms/published` | Get published pages | No | - |
| GET | `/cms/slug/:slug` | Get by slug | No | - |
| GET | `/cms` | Get all pages | Yes | Admin/Staff |
| GET | `/cms/:id` | Get by ID | Yes | Admin/Staff |
| POST | `/cms` | Create page | Yes | Admin/Staff |
| PUT | `/cms/:id` | Update page | Yes | Admin/Staff |
| DELETE | `/cms/:id` | Delete page | Yes | Admin/Staff |
| POST | `/cms/:id/publish` | Publish page | Yes | Admin/Staff |
| POST | `/cms/:id/unpublish` | Unpublish page | Yes | Admin/Staff |

**Sample Create Page:**
```json
POST {{baseUrl}}/cms
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "title": "About Us",
  "content": "<h1>About Our Company</h1><p>We are...</p>",
  "excerpt": "Learn more about our company",
  "isPublished": true,
  "seo": {
    "metaTitle": "About Us - Company Name",
    "metaDescription": "Learn about our company history and values"
  }
}
```

---

### ⚙️ Settings (`/settings`)

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/settings/public` | Get public settings | No | - |
| GET | `/settings` | Get all settings | Yes | Admin |
| PUT | `/settings` | Update settings | Yes | Admin |
| PUT | `/settings/business` | Update business info | Yes | Admin |
| PUT | `/settings/currency` | Update currency | Yes | Admin |
| PUT | `/settings/theme` | Update theme | Yes | Admin |
| PUT | `/settings/features` | Update features | Yes | Admin |
| PUT | `/settings/tax` | Update tax settings | Yes | Admin |
| PUT | `/settings/shipping` | Update shipping | Yes | Admin |
| PUT | `/settings/payments` | Update payment settings | Yes | Admin |
| PUT | `/settings/email` | Update email settings | Yes | Admin |
| PUT | `/settings/seo` | Update SEO settings | Yes | Admin |
| PUT | `/settings/legal` | Update legal settings | Yes | Admin |
| PUT | `/settings/maintenance` | Update maintenance mode | Yes | Admin |

---

## Testing Workflow

### 1. Authentication Flow
1. Register a new user or login
2. Save the `accessToken` and `refreshToken`
3. Use `accessToken` for authenticated requests

### 2. Shopping Flow
1. Browse products (GET `/products`)
2. Add to cart (POST `/carts/items`)
3. View cart (GET `/carts`)
4. Create order (POST `/orders`)
5. Track order (GET `/orders/:id/tracking`)

### 3. Admin Flow
1. Login as admin
2. Create products (POST `/products`)
3. Manage inventory (POST `/inventory/add`)
4. Process orders (PUT `/orders/:id/status`)
5. View statistics (GET `/products/admin/stats`)

---

## Common Query Parameters

### Pagination
```
?page=1&limit=10&sort=createdAt&order=desc
```

### Filtering
```
?search=keyword&status=active&category=electronics
```

### Date Range
```
?startDate=2024-01-01&endDate=2024-12-31
```

---

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
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

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": { ... }
}
```

---

## Tips

1. **Auto-save tokens**: Use Postman test scripts to automatically save tokens
2. **Environment variables**: Use variables for IDs to chain requests
3. **Pre-request scripts**: Generate dynamic data (timestamps, UUIDs)
4. **Collections runner**: Test multiple requests in sequence
5. **Mock servers**: Create mock responses for frontend development

---

## Support

For issues or questions:
- Check API documentation: `API_ENDPOINTS.md`
- Review module analysis: `MODULE_CRUD_ANALYSIS.md`
- See implementation details: `FINAL_API_SUMMARY.md`

**Happy Testing! 🚀**
