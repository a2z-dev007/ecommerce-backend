# API Endpoints Documentation

This document lists all available API endpoints in the e-commerce backend.

## Base URL
```
http://localhost:5000/api/v1
```

## Authentication
Most endpoints require authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## 1. Authentication (`/auth`)
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user
- `POST /auth/refresh` - Refresh access token
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password

## 2. Users (`/users`)
- `GET /users` - Get all users (Admin/Staff)
- `GET /users/stats` - Get user statistics (Admin)
- `GET /users/:id` - Get user by ID (Admin/Staff)
- `POST /users` - Create user (Admin)
- `PUT /users/:id` - Update user (Admin)
- `DELETE /users/:id` - Delete user (Admin)
- `PUT /users/profile/update` - Update current user profile
- `POST /users/profile/addresses` - Add address
- `PUT /users/profile/addresses/:addressId` - Update address
- `DELETE /users/profile/addresses/:addressId` - Delete address
- `GET /users/profile/wishlist` - Get wishlist (NEW)
- `POST /users/profile/wishlist` - Add to wishlist (NEW)
- `DELETE /users/profile/wishlist/:productId` - Remove from wishlist (NEW)
- `DELETE /users/profile/wishlist` - Clear wishlist (NEW)

## 3. Products (`/products`)
- `GET /products` - Get all products (with filters & pagination)
- `GET /products/featured` - Get featured products
- `GET /products/slug/:slug` - Get product by slug
- `GET /products/:id` - Get product by ID
- `GET /products/:id/related` - Get related products
- `GET /products/admin/stats` - Get product statistics (Admin/Staff)
- `POST /products` - Create product (Admin/Staff)
- `PUT /products/:id` - Update product (Admin/Staff)
- `DELETE /products/:id` - Delete product (Admin/Staff)
- `PUT /products/bulk/update` - Bulk update products (Admin/Staff) (NEW)
- `DELETE /products/bulk/delete` - Bulk delete products (Admin/Staff) (NEW)

## 4. Categories (`/categories`)
- `GET /categories` - Get all categories
- `GET /categories/:id` - Get category by ID
- `GET /categories/slug/:slug` - Get category by slug
- `POST /categories` - Create category (Admin/Staff)
- `PUT /categories/:id` - Update category (Admin/Staff)
- `DELETE /categories/:id` - Delete category (Admin/Staff)

## 5. Cart (`/carts`)
- `GET /carts` - Get user's cart
- `POST /carts/items` - Add item to cart
- `PUT /carts/items/:productId` - Update cart item quantity
- `DELETE /carts/items/:productId` - Remove item from cart
- `DELETE /carts` - Clear cart
- `POST /carts/merge` - Merge session cart with user cart (Authenticated)

## 6. Orders (`/orders`)
- `GET /orders` - Get orders (user's own or all for Admin/Staff)
- `GET /orders/stats` - Get order statistics (Admin/Staff)
- `GET /orders/number/:orderNumber` - Get order by order number
- `GET /orders/user/:userId/history` - Get user order history (NEW)
- `GET /orders/:id` - Get order by ID
- `GET /orders/:id/tracking` - Get order tracking info (NEW)
- `POST /orders` - Create new order (Authenticated)
- `PUT /orders/:id/status` - Update order status (Admin/Staff)
- `PUT /orders/:id/payment` - Update payment status (Admin/Staff)
- `PUT /orders/:id/tracking` - Add tracking number (Admin/Staff) (NEW)
- `POST /orders/:id/cancel` - Cancel order

## 7. Coupons (`/coupons`)
- `POST /coupons/validate` - Validate coupon code
- `GET /coupons` - Get all coupons (Admin/Staff)
- `GET /coupons/:id` - Get coupon by ID (Admin/Staff)
- `POST /coupons` - Create coupon (Admin/Staff)
- `PUT /coupons/:id` - Update coupon (Admin/Staff)
- `DELETE /coupons/:id` - Delete coupon (Admin/Staff)

## 8. Reviews (`/reviews`)
- `GET /reviews` - Get reviews (with filters)
- `GET /reviews/product/:productId/stats` - Get product review statistics
- `GET /reviews/:id` - Get review by ID
- `POST /reviews` - Create review (Authenticated)
- `PUT /reviews/:id` - Update review (Authenticated)
- `DELETE /reviews/:id` - Delete review
- `POST /reviews/:id/helpful` - Mark review as helpful
- `POST /reviews/:id/report` - Report review
- `POST /reviews/:id/approve` - Approve review (Admin/Staff)
- `POST /reviews/:id/respond` - Respond to review (Admin/Staff)

## 9. Payments (`/payments`)
- `GET /payments` - Get all payments (Admin/Staff)
- `GET /payments/stats` - Get payment statistics (Admin/Staff)
- `GET /payments/intent/:intentId` - Get payment by intent ID (Admin/Staff)
- `GET /payments/order/:orderId` - Get payments by order (Admin/Staff)
- `GET /payments/:id` - Get payment by ID (Admin/Staff)
- `POST /payments` - Create payment (Admin/Staff)
- `PUT /payments/:id/status` - Update payment status (Admin/Staff)
- `POST /payments/:id/refund` - Process refund (Admin/Staff)

## 10. Inventory (`/inventory`)
- `GET /inventory` - Get inventory transactions (Admin/Staff)
- `GET /inventory/stats` - Get inventory statistics (Admin/Staff)
- `GET /inventory/product/:productId` - Get product transactions (Admin/Staff)
- `GET /inventory/:id` - Get transaction by ID (Admin/Staff)
- `POST /inventory` - Create transaction (Admin/Staff)
- `POST /inventory/adjust` - Adjust stock (Admin/Staff)
- `POST /inventory/add` - Add stock (Admin/Staff)
- `POST /inventory/remove` - Remove stock (Admin/Staff)

## 11. CMS Pages (`/cms`)
- `GET /cms/published` - Get all published pages
- `GET /cms/slug/:slug` - Get page by slug
- `GET /cms` - Get all pages (Admin/Staff)
- `GET /cms/:id` - Get page by ID (Admin/Staff)
- `POST /cms` - Create page (Admin/Staff)
- `PUT /cms/:id` - Update page (Admin/Staff)
- `DELETE /cms/:id` - Delete page (Admin/Staff)
- `POST /cms/:id/publish` - Publish page (Admin/Staff)
- `POST /cms/:id/unpublish` - Unpublish page (Admin/Staff)

## 12. Settings (`/settings`)
- `GET /settings` - Get all settings
- `PUT /settings` - Update settings (Admin)

## 13. Health Check
- `GET /health` - API health check

---

## Query Parameters

### Pagination
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `sort` - Sort field (default: 'createdAt')
- `order` - Sort order: 'asc' or 'desc' (default: 'desc')

### Filters
- `search` - Search term
- `status` - Filter by status
- `category` - Filter by category
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `startDate` - Start date for date range
- `endDate` - End date for date range

---

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Success message",
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

## User Roles
- `admin` - Full access to all endpoints
- `staff` - Access to management endpoints
- `user` - Access to customer endpoints

---

## Notes
- All timestamps are in ISO 8601 format
- All prices are in cents (multiply by 100)
- Session ID can be passed via `x-session-id` header for cart operations
