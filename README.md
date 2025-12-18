# Ecommerce Backend

A production-ready, scalable single-vendor ecommerce backend built with Node.js, Express, TypeScript, and MongoDB.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control (Admin, Staff, User)
- **User Management**: Complete user lifecycle with profiles and address management
- **Product Management**: Products with variants, categories, and inventory tracking
- **Order Management**: Full order lifecycle from cart to delivery
- **Payment Processing**: Multiple payment gateway support (Stripe, PayPal, COD)
- **Coupon System**: Flexible discount and coupon management
- **Review System**: Product reviews and ratings
- **CMS**: Content management for pages and policies
- **Settings**: Configurable business settings and preferences
- **Inventory Tracking**: Real-time stock management with transaction history
- **Security**: Rate limiting, CORS, helmet, input validation
- **Scalability**: Clean architecture, stateless design, ready for horizontal scaling

## 🛠 Tech Stack

- **Runtime**: Node.js (LTS)
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (Access + Refresh tokens)
- **Validation**: Zod
- **Security**: Helmet, CORS, Rate Limiting
- **File Upload**: Multer
- **Password Hashing**: bcryptjs
- **Environment**: dotenv

## 📁 Project Structure

```
src/
├── app.ts                 # Express app configuration
├── server.ts              # Server startup and graceful shutdown
├── config/                # Configuration files
│   ├── db.ts             # Database connection
│   ├── env.ts            # Environment variables
│   ├── jwt.ts            # JWT utilities
│   └── cors.ts           # CORS configuration
├── modules/               # Feature modules
│   ├── auth/             # Authentication module
│   ├── users/            # User management
│   ├── products/         # Product management
│   ├── categories/       # Category management
│   ├── orders/           # Order management
│   ├── cart/             # Shopping cart
│   ├── inventory/        # Inventory tracking
│   ├── coupons/          # Coupon management
│   ├── reviews/          # Review system
│   ├── payments/         # Payment processing
│   ├── shipping/         # Shipping management
│   ├── cms/              # Content management
│   └── settings/         # Business settings
├── common/               # Shared utilities
│   ├── middlewares/      # Express middlewares
│   ├── utils/            # Utility functions
│   ├── constants/        # Application constants
│   └── types/            # TypeScript types
├── routes/               # API routes
│   └── v1.routes.ts      # Version 1 routes
├── database/             # Database layer
│   ├── models/           # Mongoose models
│   ├── index.ts          # Database exports
│   └── seed.ts           # Database seeding
└── docs/                 # Documentation
```

## 🚦 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ecommerce-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/ecommerce_db
   JWT_ACCESS_SECRET=your-super-secret-access-key-here
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
   # ... other variables
   ```

4. **Database Setup**
   ```bash
   # Seed the database with initial data
   npm run seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

### Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | User login |
| POST | `/auth/refresh-token` | Refresh access token |
| POST | `/auth/logout` | Logout user |
| POST | `/auth/forgot-password` | Request password reset |
| POST | `/auth/reset-password` | Reset password |
| GET | `/auth/profile` | Get user profile |

### User Management

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/users` | Get all users | Admin/Staff |
| GET | `/users/:id` | Get user by ID | Admin/Staff |
| POST | `/users` | Create new user | Admin |
| PUT | `/users/:id` | Update user | Admin |
| DELETE | `/users/:id` | Delete user | Admin |
| PUT | `/users/profile/update` | Update own profile | User |
| POST | `/users/profile/addresses` | Add address | User |

### Response Format

All API responses follow this structure:

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

## 🔐 Authentication

The API uses JWT-based authentication with access and refresh tokens:

- **Access Token**: Short-lived (15 minutes), used for API requests
- **Refresh Token**: Long-lived (7 days), used to generate new access tokens

### Usage

1. **Login** to get tokens
2. **Include access token** in Authorization header:
   ```
   Authorization: Bearer <access_token>
   ```
3. **Refresh token** when access token expires

## 👥 User Roles

- **ADMIN**: Full system access, business owner
- **STAFF**: Limited admin access for employees
- **USER**: Customer access for shopping

## 🛡 Security Features

- **Rate Limiting**: Prevents abuse and DDoS attacks
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers for protection
- **Input Validation**: Zod schema validation
- **Password Hashing**: bcrypt with configurable rounds
- **JWT Security**: Separate secrets for access/refresh tokens
- **Error Handling**: Centralized error management

## 📊 Database Design

### Key Models

- **User**: Customer and admin accounts
- **Product**: Product catalog with variants
- **Category**: Hierarchical product categories
- **Order**: Order management and tracking
- **Cart**: Shopping cart functionality
- **Coupon**: Discount and promotion system
- **Review**: Product reviews and ratings
- **Settings**: Business configuration
- **Payment**: Payment transaction records
- **Inventory**: Stock tracking and history

### Database Isolation

Each business deployment uses:
- **Single Database**: One MongoDB database per business
- **No Multi-tenancy**: No shared data between businesses
- **Environment-based**: Database connection via environment variables

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | development |
| `PORT` | Server port | 3000 |
| `MONGODB_URI` | MongoDB connection string | Required |
| `JWT_ACCESS_SECRET` | JWT access token secret | Required |
| `JWT_REFRESH_SECRET` | JWT refresh token secret | Required |
| `CORS_ORIGIN` | Allowed CORS origins | * |

### Business Settings

Configure your business through the Settings API:
- Business information
- Currency and localization
- Payment gateways
- Shipping zones
- Tax configuration
- Feature toggles
- Email templates
- SEO settings

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

## 📈 Scaling Considerations

### Horizontal Scaling
- Stateless API design
- JWT tokens (no server-side sessions)
- Database per business (no shared state)
- Ready for load balancers

### Performance Optimization
- Database indexing
- Query optimization
- Caching layer ready (Redis)
- File upload optimization
- Compression middleware

### Monitoring
- Structured logging
- Error tracking ready
- Health check endpoints
- Performance metrics ready

## 🚀 Deployment

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

### Environment Setup

1. **Production Environment**
   ```env
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/business_db
   JWT_ACCESS_SECRET=your-production-access-secret
   JWT_REFRESH_SECRET=your-production-refresh-secret
   ```

2. **SSL/HTTPS**
   - Use reverse proxy (nginx)
   - Configure SSL certificates
   - Update CORS origins

3. **Database**
   - MongoDB Atlas (recommended)
   - Proper indexing
   - Regular backups

## 📝 License

This project is licensed under the MIT License.

## 🤝 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

---

**Note**: This is a single-vendor ecommerce backend. Each business receives their own isolated backend and database. No multi-tenant or super admin functionality is included.