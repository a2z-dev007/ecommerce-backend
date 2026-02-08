# Ecommerce Backend Comprehensive Guide

This documentation provides a detailed overview of the backend architecture, modules, and setup for the Ecommerce Platform.

## 1. Project Overview

**Technology Stack:**

- **Runtime:** Node.js (>=18)
- **Framework:** Express (Clean Architecture with TypeScript)
- **Database:** MongoDB (via Mongoose ODM)
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs
- **Validation:** Zod
- **File Storage:** Cloudinary (via Multer)
- **Email:** Nodemailer / Resend
- **Testing:** Jest
- **Documentation:** Markdown & Postman Collections

**Architecture Pattern:**
The application follows a modular, layered architecture:

- **Routes Layer** (`*.routes.ts`): Defines endpoints, applies middleware, and delegates to controllers.
- **Controller Layer** (`*.controller.ts`): Handles HTTP requests/responses, input parsing, and calls services.
- **Service Layer** (`*.service.ts`): Contains business logic and interacts with the database models.
- **Model Layer** (`src/database/models`): Mongoose schemas defining data structure and validation.

## 2. Getting Started

### Prerequisites

- Node.js installed (v18+)
- MongoDB instance (local or Atlas connection string)
- Cloudinary Account (for image uploads)
- SMTP/Resend credentials (for emails)

### Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Environment Setup

Create a `.env` file in the root directory (copy from `.env.example`). Key variables include:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/ecommerce

# Security
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
COOKIE_SECRET=your_cookie_secret
CORS_ORIGIN=http://localhost:3000

# File Upload (Cloudinary)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Email
SMTP_HOST=...
SMTP_PORT=...
SMTP_USER=...
SMTP_PASS=...
```

### Running the Application

- **Development Mode** (Hot Reload):
  ```bash
  npm run dev
  ```
- **Production Build & Run**:
  ```bash
  npm run build
  npm start
  ```
- **Database Seeding**:
  ```bash
  npm run seed
  ```

## 3. Directory Structure

```
backend/
├── src/
│   ├── app.ts              # Express App configuration (Middleware, CORS)
│   ├── server.ts           # Entry point (Server listener)
│   ├── common/             # Shared utilities
│   │   ├── middlewares/    # Auth, Error, RateLimit middleware
│   │   ├── utils/          # Helper functions
│   │   └── types/          # Global TypeScript interfaces
│   ├── config/             # Config files (Env, CORS)
│   ├── database/           # DB Connection and Models
│   │   ├── models/         # Mongoose Models (User, Product, Order, etc.)
│   │   └── seed.ts         # Seeding logic
│   ├── modules/            # Feature-based modules
│   │   ├── auth/           # Authentication logic
│   │   ├── products/       # Product management
│   │   ├── orders/         # Order processing
│   │   └── ... (others)
│   ├── routes/             # Central route aggregator (v1.routes.ts)
│   └── uploads/            # Temporary upload storage
```

## 4. Key Configurations & Middleware

### Global Middleware (`app.ts`)

1.  **Security**: `helmet` (Secure Headers), `cors` (Cross-Origin requests).
2.  **Rate Limiting**: Global limit + Specific strict limits for Auth endpoints.
3.  **Parsers**: `express.json` (Body), `cookieParser`, `compression` (Gzip).
4.  **Logging**: `morgan` (Request logging).

### Error Handling

Located in `src/common/middlewares/error.middleware.ts`.

- **NotFoundHandler**: returns 404 for unknown routes.
- **ErrorHandler**: Catches exceptions, formats them into a standard JSON response:
  ```json
  {
    "success": false,
    "message": "Error description"
  }
  ```

## 5. Module Guide

### Authentication Module (`src/modules/auth`)

Handles user registration, login, and session management.

- **Routes**:
  - `POST /api/v1/auth/register`: Create new user.
  - `POST /api/v1/auth/login`: Authenticate and receive JWT.
  - `POST /api/v1/auth/logout`: Invalidate session.
  - `POST /api/v1/auth/forgot-password`: Initiate password reset.
  - `GET /api/v1/auth/profile`: Get current user info (Protected).

### Users Module (`src/modules/users`)

Manage user accounts (often Admin only, or self-management).

- Likely includes CRUD for users, role management, and address management.

### Products Module (`src/modules/products`)

Core catalog functionality.

- **Service**: Handles searching, filtering, and stock checking.
- **Routes**:
  - `GET /api/v1/products`: List products (pagination, filter).
  - `GET /api/v1/products/:id`: Get single product details.
  - `POST /api/v1/products`: Create product (Admin/Seller).
  - `PUT /api/v1/products/:id`: Update product.

### Global Routes (`src/routes/v1.routes.ts`)

All modules are mounted here:

- `/auth` -> AuthRoutes
- `/users` -> UsersRoutes
- `/products` -> ProductsRoutes
- `/categories` -> CategoriesRoutes
- `/orders` -> OrdersRoutes
- `/carts` -> CartsRoutes
- `/payments` -> PaymentsRoutes
- `/reviews` -> ReviewsRoutes
- `/settings` -> SettingsRoutes

### Additional Modules

- **Carts**: Manage temporary shopping cart items.
- **Orders**: Process placed orders, handle status updates.
- **Inventory**: Track stock levels (likely linked to Products).
- **Payments**: Integration (likely Stripe/Razorpay) handlers.
- **Reviews**: Product feedback system.
- **CMS**: Content management for frontend banners/sliders.

## 6. Database & Models

Models are located in `src/database/models` and use Mongoose schemas.
Common patterns:

- **Timestamps**: `createdAt`, `updatedAt` are standard.
- **Relationships**: usage of `ObjectId` references (e.g., Order references User and Products).

To seed the database with initial data:

```bash
npm run seed
```

This typically creates default Admin users, categories, and dummy products.

## 7. Testing

The project uses Jest for testing.

- **Run all tests**: `npm test`
- **Watch mode**: `npm run test:watch`

Tests usually cover Controller logic (Unit) or API Endpoints (Integration).
