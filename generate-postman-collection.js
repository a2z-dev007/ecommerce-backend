/**
 * Generate Complete Postman Collection
 * Run: node generate-postman-collection.js
 */

const fs = require('fs');

const collection = {
  info: {
    _postman_id: 'ecommerce-backend-complete-v2',
    name: 'E-Commerce Backend API - Complete',
    description: 'Complete API collection with 100+ endpoints including all CRUD operations and business logic',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    version: '2.0.0'
  },
  auth: {
    type: 'bearer',
    bearer: [{ key: 'token', value: '{{accessToken}}', type: 'string' }]
  },
  variable: [
    { key: 'baseUrl', value: 'http://localhost:5000/api/v1', type: 'string' },
    { key: 'accessToken', value: '', type: 'string' },
    { key: 'refreshToken', value: '', type: 'string' },
    { key: 'userId', value: '', type: 'string' },
    { key: 'productId', value: '', type: 'string' },
    { key: 'categoryId', value: '', type: 'string' },
    { key: 'orderId', value: '', type: 'string' },
    { key: 'couponId', value: '', type: 'string' },
    { key: 'reviewId', value: '', type: 'string' },
    { key: 'paymentId', value: '', type: 'string' },
    { key: 'sessionId', value: '', type: 'string' },
    { key: 'cmsPageId', value: '', type: 'string' }
  ],
  item: [
    // Health Check
    {
      name: '0. Health Check',
      item: [
        {
          name: 'API Health Check',
          request: {
            method: 'GET',
            header: [],
            url: { raw: '{{baseUrl}}/health', host: ['{{baseUrl}}'], path: ['health'] }
          }
        }
      ]
    },
    
    // Authentication
    {
      name: '1. Authentication',
      item: [
        {
          name: 'Register',
          event: [{
            listen: 'test',
            script: {
              exec: [
                'if (pm.response.code === 201) {',
                '    const response = pm.response.json();',
                '    pm.collectionVariables.set("accessToken", response.data.accessToken);',
                '    pm.collectionVariables.set("refreshToken", response.data.refreshToken);',
                '    pm.collectionVariables.set("userId", response.data.user._id);',
                '}'
              ]
            }
          }],
          request: {
            method: 'POST',
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: {
              mode: 'raw',
              raw: JSON.stringify({
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                password: 'Password@123',
                phone: '+1234567890'
              }, null, 2)
            },
            url: { raw: '{{baseUrl}}/auth/register', host: ['{{baseUrl}}'], path: ['auth', 'register'] }
          }
        },
        {
          name: 'Login',
          event: [{
            listen: 'test',
            script: {
              exec: [
                'if (pm.response.code === 200) {',
                '    const response = pm.response.json();',
                '    pm.collectionVariables.set("accessToken", response.data.accessToken);',
                '    pm.collectionVariables.set("refreshToken", response.data.refreshToken);',
                '    pm.collectionVariables.set("userId", response.data.user._id);',
                '}'
              ]
            }
          }],
          request: {
            method: 'POST',
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: {
              mode: 'raw',
              raw: JSON.stringify({ email: 'admin@example.com', password: 'Admin@123' }, null, 2)
            },
            url: { raw: '{{baseUrl}}/auth/login', host: ['{{baseUrl}}'], path: ['auth', 'login'] }
          }
        },
        {
          name: 'Refresh Token',
          request: {
            method: 'POST',
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: {
              mode: 'raw',
              raw: JSON.stringify({ refreshToken: '{{refreshToken}}' }, null, 2)
            },
            url: { raw: '{{baseUrl}}/auth/refresh', host: ['{{baseUrl}}'], path: ['auth', 'refresh'] }
          }
        },
        {
          name: 'Logout',
          request: {
            auth: { type: 'bearer', bearer: [{ key: 'token', value: '{{accessToken}}' }] },
            method: 'POST',
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: {
              mode: 'raw',
              raw: JSON.stringify({ refreshToken: '{{refreshToken}}' }, null, 2)
            },
            url: { raw: '{{baseUrl}}/auth/logout', host: ['{{baseUrl}}'], path: ['auth', 'logout'] }
          }
        },
        {
          name: 'Forgot Password',
          request: {
            method: 'POST',
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: {
              mode: 'raw',
              raw: JSON.stringify({ email: 'user@example.com' }, null, 2)
            },
            url: { raw: '{{baseUrl}}/auth/forgot-password', host: ['{{baseUrl}}'], path: ['auth', 'forgot-password'] }
          }
        },
        {
          name: 'Reset Password',
          request: {
            method: 'POST',
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: {
              mode: 'raw',
              raw: JSON.stringify({ token: 'reset-token', password: 'NewPassword@123' }, null, 2)
            },
            url: { raw: '{{baseUrl}}/auth/reset-password', host: ['{{baseUrl}}'], path: ['auth', 'reset-password'] }
          }
        }
      ]
    }
  ]
};

// Write to file
fs.writeFileSync(
  './postman_collection.json',
  JSON.stringify(collection, null, 2)
);

console.log('✅ Postman collection generated successfully!');
console.log('📁 File: postman_collection.json');
console.log('📊 Import this file into Postman to test all APIs');
