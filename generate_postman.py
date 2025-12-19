#!/usr/bin/env python3
"""
Generate Complete Postman Collection for E-Commerce Backend
Usage: python3 generate_postman.py
"""

import json

def create_request(name, method, path, body=None, auth=True, test_script=None, description=None):
    """Helper to create a request object"""
    request = {
        "name": name,
        "request": {
            "method": method,
            "header": [],
            "url": {
                "raw": f"{{{{baseUrl}}}}{path}",
                "host": ["{{baseUrl}}"],
                "path": path.strip('/').split('/')
            }
        }
    }
    
    if description:
        request["request"]["description"] = description
    
    if auth:
        request["request"]["auth"] = {
            "type": "bearer",
            "bearer": [{"key": "token", "value": "{{accessToken}}", "type": "string"}]
        }
    
    if body:
        request["request"]["header"].append({"key": "Content-Type", "value": "application/json"})
        request["request"]["body"] = {
            "mode": "raw",
            "raw": json.dumps(body, indent=2)
        }
    
    if test_script:
        request["event"] = [{
            "listen": "test",
            "script": {"exec": test_script, "type": "text/javascript"}
        }]
    
    return request

# Collection structure
collection = {
    "info": {
        "_postman_id": "ecommerce-complete-v2",
        "name": "E-Commerce Backend - Complete API Collection",
        "description": "Complete collection with 100+ endpoints for testing all backend APIs",
        "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
        "version": "2.0.0"
    },
    "variable": [
        {"key": "baseUrl", "value": "http://localhost:5000/api/v1"},
        {"key": "accessToken", "value": ""},
        {"key": "refreshToken", "value": ""},
        {"key": "userId", "value": ""},
        {"key": "productId", "value": ""},
        {"key": "categoryId", "value": ""},
        {"key": "orderId", "value": ""},
        {"key": "couponId", "value": ""},
        {"key": "reviewId", "value": ""},
        {"key": "paymentId", "value": ""},
        {"key": "sessionId", "value": ""},
        {"key": "cmsPageId", "value": ""}
    ],
    "item": []
}

# Health Check
collection["item"].append({
    "name": "0. Health Check",
    "item": [
        create_request("API Health Check", "GET", "/health", auth=False)
    ]
})

# Authentication
auth_save_tokens = [
    "if (pm.response.code === 200 || pm.response.code === 201) {",
    "    const response = pm.response.json();",
    "    if (response.data.accessToken) pm.collectionVariables.set('accessToken', response.data.accessToken);",
    "    if (response.data.refreshToken) pm.collectionVariables.set('refreshToken', response.data.refreshToken);",
    "    if (response.data.user) pm.collectionVariables.set('userId', response.data.user._id);",
    "}"
]

collection["item"].append({
    "name": "1. Authentication",
    "item": [
        create_request("Register", "POST", "/auth/register", 
            {"firstName": "John", "lastName": "Doe", "email": "john@example.com", "password": "Pass@123"},
            auth=False, test_script=auth_save_tokens),
        create_request("Login", "POST", "/auth/login",
            {"email": "admin@example.com", "password": "Admin@123"},
            auth=False, test_script=auth_save_tokens),
        create_request("Refresh Token", "POST", "/auth/refresh",
            {"refreshToken": "{{refreshToken}}"}, auth=False),
        create_request("Logout", "POST", "/auth/logout",
            {"refreshToken": "{{refreshToken}}"}),
        create_request("Forgot Password", "POST", "/auth/forgot-password",
            {"email": "user@example.com"}, auth=False),
        create_request("Reset Password", "POST", "/auth/reset-password",
            {"token": "reset-token", "password": "NewPass@123"}, auth=False)
    ]
})

# Users
collection["item"].append({
    "name": "2. Users",
    "item": [
        create_request("Get All Users", "GET", "/users?page=1&limit=10"),
        create_request("Get User Stats", "GET", "/users/stats"),
        create_request("Get User by ID", "GET", "/users/{{userId}}"),
        create_request("Create User", "POST", "/users",
            {"firstName": "Jane", "lastName": "Smith", "email": "jane@example.com", "password": "Pass@123", "role": "user"}),
        create_request("Update User", "PUT", "/users/{{userId}}",
            {"firstName": "Jane Updated", "isActive": True}),
        create_request("Delete User", "DELETE", "/users/{{userId}}"),
        create_request("Update Profile", "PUT", "/users/profile/update",
            {"firstName": "John", "phone": "+1234567890"}),
        create_request("Add Address", "POST", "/users/profile/addresses",
            {"addressType": "shipping", "firstName": "John", "lastName": "Doe", "addressLine1": "123 Main St", 
             "city": "New York", "state": "NY", "postalCode": "10001", "country": "USA", "isDefault": True}),
        create_request("Update Address", "PUT", "/users/profile/addresses/:addressId",
            {"addressLine1": "456 Oak Ave"}),
        create_request("Delete Address", "DELETE", "/users/profile/addresses/:addressId"),
        create_request("Get Wishlist", "GET", "/users/profile/wishlist"),
        create_request("Add to Wishlist", "POST", "/users/profile/wishlist",
            {"productId": "{{productId}}"}),
        create_request("Remove from Wishlist", "DELETE", "/users/profile/wishlist/{{productId}}"),
        create_request("Clear Wishlist", "DELETE", "/users/profile/wishlist")
    ]
})

# Products
save_product_id = [
    "if (pm.response.code === 201) {",
    "    pm.collectionVariables.set('productId', pm.response.json().data._id);",
    "}"
]

collection["item"].append({
    "name": "3. Products",
    "item": [
        create_request("Get All Products", "GET", "/products?page=1&limit=10", auth=False),
        create_request("Get Featured Products", "GET", "/products/featured", auth=False),
        create_request("Get Product by Slug", "GET", "/products/slug/iphone-15-pro", auth=False),
        create_request("Get Product by ID", "GET", "/products/{{productId}}", auth=False),
        create_request("Get Related Products", "GET", "/products/{{productId}}/related", auth=False),
        create_request("Get Product Stats", "GET", "/products/admin/stats"),
        create_request("Create Product", "POST", "/products",
            {"name": "iPhone 15 Pro", "description": "Latest iPhone", "category": "{{categoryId}}",
             "sku": "IPHONE15PRO", "price": 999.99, "stock": 50, "isFeatured": True},
            test_script=save_product_id),
        create_request("Update Product", "PUT", "/products/{{productId}}",
            {"price": 949.99, "stock": 45}),
        create_request("Delete Product", "DELETE", "/products/{{productId}}"),
        create_request("Bulk Update Products", "PUT", "/products/bulk/update",
            {"productIds": ["id1", "id2"], "updateData": {"isActive": True}}),
        create_request("Bulk Delete Products", "DELETE", "/products/bulk/delete",
            {"productIds": ["id1", "id2"]})
    ]
})

# Categories
save_category_id = [
    "if (pm.response.code === 201) {",
    "    pm.collectionVariables.set('categoryId', pm.response.json().data._id);",
    "}"
]

collection["item"].append({
    "name": "4. Categories",
    "item": [
        create_request("Get All Categories", "GET", "/categories", auth=False),
        create_request("Get Category Tree", "GET", "/categories/tree", auth=False),
        create_request("Get Category by Slug", "GET", "/categories/slug/electronics", auth=False),
        create_request("Get Category by ID", "GET", "/categories/{{categoryId}}", auth=False),
        create_request("Get Category Stats", "GET", "/categories/admin/stats"),
        create_request("Create Category", "POST", "/categories",
            {"name": "Electronics", "description": "Electronic devices", "isActive": True},
            test_script=save_category_id),
        create_request("Update Category", "PUT", "/categories/{{categoryId}}",
            {"description": "Updated description"}),
        create_request("Delete Category", "DELETE", "/categories/{{categoryId}}"),
        create_request("Reorder Categories", "POST", "/categories/reorder",
            [{"id": "cat1", "sortOrder": 1}, {"id": "cat2", "sortOrder": 2}])
    ]
})

# Cart
collection["item"].append({
    "name": "5. Cart",
    "item": [
        create_request("Get Cart", "GET", "/carts", auth=False),
        create_request("Add to Cart", "POST", "/carts/items",
            {"productId": "{{productId}}", "quantity": 2}, auth=False),
        create_request("Update Cart Item", "PUT", "/carts/items/{{productId}}",
            {"quantity": 3}, auth=False),
        create_request("Remove from Cart", "DELETE", "/carts/items/{{productId}}", auth=False),
        create_request("Clear Cart", "DELETE", "/carts", auth=False),
        create_request("Merge Cart", "POST", "/carts/merge")
    ]
})

# Orders
save_order_id = [
    "if (pm.response.code === 201) {",
    "    pm.collectionVariables.set('orderId', pm.response.json().data._id);",
    "}"
]

collection["item"].append({
    "name": "6. Orders",
    "item": [
        create_request("Get All Orders", "GET", "/orders?page=1&limit=10"),
        create_request("Get Order Stats", "GET", "/orders/stats"),
        create_request("Get Order by Number", "GET", "/orders/number/ORD-202412-00001"),
        create_request("Get User Order History", "GET", "/orders/user/{{userId}}/history"),
        create_request("Get Order by ID", "GET", "/orders/{{orderId}}"),
        create_request("Get Order Tracking", "GET", "/orders/{{orderId}}/tracking"),
        create_request("Create Order", "POST", "/orders",
            {"email": "customer@example.com", "shippingAddress": {
                "firstName": "John", "lastName": "Doe", "addressLine1": "123 Main St",
                "city": "New York", "state": "NY", "postalCode": "10001", "country": "USA"
            }, "paymentMethod": "credit_card"}, test_script=save_order_id),
        create_request("Update Order Status", "PUT", "/orders/{{orderId}}/status",
            {"status": "shipped"}),
        create_request("Update Payment Status", "PUT", "/orders/{{orderId}}/payment",
            {"paymentStatus": "completed"}),
        create_request("Add Tracking Number", "PUT", "/orders/{{orderId}}/tracking",
            {"trackingNumber": "1Z999AA10123456784", "shippingMethod": "UPS"}),
        create_request("Cancel Order", "POST", "/orders/{{orderId}}/cancel")
    ]
})

# Coupons
save_coupon_id = [
    "if (pm.response.code === 201) {",
    "    pm.collectionVariables.set('couponId', pm.response.json().data._id);",
    "}"
]

collection["item"].append({
    "name": "7. Coupons",
    "item": [
        create_request("Validate Coupon", "POST", "/coupons/validate",
            {"code": "SAVE20", "orderValue": 100, "productIds": [], "categoryIds": []}, auth=False),
        create_request("Get All Coupons", "GET", "/coupons"),
        create_request("Get Coupon by ID", "GET", "/coupons/{{couponId}}"),
        create_request("Create Coupon", "POST", "/coupons",
            {"code": "SAVE20", "name": "20% Off", "type": "percentage", "value": 20,
             "minimumOrderValue": 50, "usageLimit": 100}, test_script=save_coupon_id),
        create_request("Update Coupon", "PUT", "/coupons/{{couponId}}",
            {"value": 25}),
        create_request("Delete Coupon", "DELETE", "/coupons/{{couponId}}")
    ]
})

# Reviews
save_review_id = [
    "if (pm.response.code === 201) {",
    "    pm.collectionVariables.set('reviewId', pm.response.json().data._id);",
    "}"
]

collection["item"].append({
    "name": "8. Reviews",
    "item": [
        create_request("Get All Reviews", "GET", "/reviews?productId={{productId}}", auth=False),
        create_request("Get Product Review Stats", "GET", "/reviews/product/{{productId}}/stats", auth=False),
        create_request("Get Review by ID", "GET", "/reviews/{{reviewId}}", auth=False),
        create_request("Create Review", "POST", "/reviews",
            {"productId": "{{productId}}", "rating": 5, "title": "Great!", "comment": "Excellent product"},
            test_script=save_review_id),
        create_request("Update Review", "PUT", "/reviews/{{reviewId}}",
            {"rating": 4, "comment": "Updated review"}),
        create_request("Delete Review", "DELETE", "/reviews/{{reviewId}}"),
        create_request("Mark Review Helpful", "POST", "/reviews/{{reviewId}}/helpful", auth=False),
        create_request("Report Review", "POST", "/reviews/{{reviewId}}/report", auth=False),
        create_request("Approve Review", "POST", "/reviews/{{reviewId}}/approve"),
        create_request("Respond to Review", "POST", "/reviews/{{reviewId}}/respond",
            {"message": "Thank you for your feedback!"})
    ]
})

# Payments
collection["item"].append({
    "name": "9. Payments",
    "item": [
        create_request("Get All Payments", "GET", "/payments"),
        create_request("Get Payment Stats", "GET", "/payments/stats"),
        create_request("Get Payment by Intent ID", "GET", "/payments/intent/pi_123456"),
        create_request("Get Payments by Order", "GET", "/payments/order/{{orderId}}"),
        create_request("Get Payment by ID", "GET", "/payments/{{paymentId}}"),
        create_request("Create Payment", "POST", "/payments",
            {"orderId": "{{orderId}}", "paymentIntentId": "pi_123456", "method": "credit_card", "amount": 99.99}),
        create_request("Update Payment Status", "PUT", "/payments/{{paymentId}}/status",
            {"status": "completed"}),
        create_request("Process Refund", "POST", "/payments/{{paymentId}}/refund",
            {"amount": 50.00, "reason": "Customer request"})
    ]
})

# Inventory
collection["item"].append({
    "name": "10. Inventory",
    "item": [
        create_request("Get All Transactions", "GET", "/inventory"),
        create_request("Get Inventory Stats", "GET", "/inventory/stats"),
        create_request("Get Product Transactions", "GET", "/inventory/product/{{productId}}"),
        create_request("Get Transaction by ID", "GET", "/inventory/:id"),
        create_request("Create Transaction", "POST", "/inventory",
            {"productId": "{{productId}}", "action": "in", "quantity": 100, "reason": "New stock"}),
        create_request("Adjust Stock", "POST", "/inventory/adjust",
            {"productId": "{{productId}}", "quantity": 50, "reason": "Inventory count"}),
        create_request("Add Stock", "POST", "/inventory/add",
            {"productId": "{{productId}}", "quantity": 100, "reason": "Restock"}),
        create_request("Remove Stock", "POST", "/inventory/remove",
            {"productId": "{{productId}}", "quantity": 10, "reason": "Damaged items"})
    ]
})

# CMS Pages
save_cms_id = [
    "if (pm.response.code === 201) {",
    "    pm.collectionVariables.set('cmsPageId', pm.response.json().data._id);",
    "}"
]

collection["item"].append({
    "name": "11. CMS Pages",
    "item": [
        create_request("Get Published Pages", "GET", "/cms/published", auth=False),
        create_request("Get Page by Slug", "GET", "/cms/slug/about-us", auth=False),
        create_request("Get All Pages", "GET", "/cms"),
        create_request("Get Page by ID", "GET", "/cms/{{cmsPageId}}"),
        create_request("Create Page", "POST", "/cms",
            {"title": "About Us", "content": "<h1>About</h1>", "isPublished": True},
            test_script=save_cms_id),
        create_request("Update Page", "PUT", "/cms/{{cmsPageId}}",
            {"content": "<h1>Updated About</h1>"}),
        create_request("Delete Page", "DELETE", "/cms/{{cmsPageId}}"),
        create_request("Publish Page", "POST", "/cms/{{cmsPageId}}/publish"),
        create_request("Unpublish Page", "POST", "/cms/{{cmsPageId}}/unpublish")
    ]
})

# Settings
collection["item"].append({
    "name": "12. Settings",
    "item": [
        create_request("Get Public Settings", "GET", "/settings/public", auth=False),
        create_request("Get All Settings", "GET", "/settings"),
        create_request("Update Settings", "PUT", "/settings",
            {"businessName": "My Store", "currency": "USD"}),
        create_request("Update Business Info", "PUT", "/settings/business",
            {"businessName": "TechStore", "contactInfo": {"email": "info@techstore.com"}}),
        create_request("Update Currency", "PUT", "/settings/currency",
            {"currency": "USD", "currencySymbol": "$"}),
        create_request("Update Theme", "PUT", "/settings/theme",
            {"primaryColor": "#007bff"}),
        create_request("Update Features", "PUT", "/settings/features",
            {"enableReviews": True, "enableWishlist": True}),
        create_request("Update Tax Settings", "PUT", "/settings/tax",
            {"enabled": True, "rate": 10}),
        create_request("Update Shipping Settings", "PUT", "/settings/shipping",
            {"enabled": True, "freeShippingThreshold": 50}),
        create_request("Update Payment Settings", "PUT", "/settings/payments",
            {"stripe": {"enabled": True}}),
        create_request("Update Email Settings", "PUT", "/settings/email",
            {"fromEmail": "noreply@store.com"}),
        create_request("Update SEO Settings", "PUT", "/settings/seo",
            {"metaTitle": "My Store"}),
        create_request("Update Legal Settings", "PUT", "/settings/legal",
            {"termsOfService": "Terms..."}),
        create_request("Update Maintenance Mode", "PUT", "/settings/maintenance",
            {"enabled": False})
    ]
})

# Write to file
with open('postman_collection.json', 'w') as f:
    json.dump(collection, f, indent=2)

print("✅ Postman collection generated successfully!")
print("📁 File: postman_collection.json")
print(f"📊 Total endpoints: {sum(len(folder['item']) for folder in collection['item'])}")
print("\n🚀 Import this file into Postman to test all APIs")
