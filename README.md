# 🏖️ Booking Website API

A comprehensive RESTful API for a travel booking platform built with NestJS. This API enables users to browse destinations, view travel packages, and manage bookings with a robust authentication and authorization system.

## ✨ Features

- **🔐 Authentication & Authorization**: JWT-based authentication with role-based access control (Admin/User)
- **🌍 Destinations Management**: Browse and manage travel destinations with image uploads
- **📦 Packages Management**: Create and manage travel packages linked to destinations
- **📋 Bookings System**: Complete booking management with status tracking (Pending, Confirmed, Canceled)
- **👥 User Management**: User registration, profile management, and admin controls
- **📸 Image Upload**: Cloudinary integration for image storage and management
- **📄 Pagination**: Efficient pagination for all list endpoints
- **✅ Input Validation**: Comprehensive request validation using class-validator
- **🧪 Unit Testing**: Full test coverage for all services
- **📝 API Documentation**: Complete Postman collection with examples

## 🛠️ Tech Stack

- **Framework**: NestJS (Node.js)
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer + Cloudinary
- **Validation**: class-validator, class-transformer
- **Testing**: Jest
- **Architecture**: Clean Architecture (Repository Pattern, Service Layer, DTOs)

## 📁 Project Structure

```
src/
├── modules/          # Feature modules (Auth, Users, Destinations, Packages, Bookings)
├── common/           # Shared utilities (Guards, Decorators, Pipes, Filters)
├── config/          # Configuration files (Database, JWT, Cloudinary)
├── shared/          # Shared services and utilities
└── features/        # Additional feature modules
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB database
- Cloudinary account (for image uploads)

### Installation

1. Clone the repository
```bash
git clone https://github.com/AmrMagdy00/Booking-website-API.git
cd Booking-website-API
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```

4. Configure your `.env` file:
```env
PORT=3000
DATABASE_URI=mongodb://localhost:27017/booking-db
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

5. Run the application
```bash
# Development
npm run start:dev

# Production
npm run build
npm run start
```

## 📚 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login

### Users
- `GET /users` - Get all users (Admin only)
- `GET /users/:id` - Get user by ID
- `POST /users` - Create user (Admin only)
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Destinations
- `GET /destinations` - Get all destinations (Public)
- `GET /destinations/:id` - Get destination by ID (Public)
- `POST /destinations` - Create destination (Admin only)
- `PATCH /destinations/:id` - Update destination (Admin only)
- `DELETE /destinations/:id` - Delete destination (Admin only)

### Packages
- `GET /packages?destinationId=xxx` - Get packages by destination (Public)
- `GET /packages/:id` - Get package by ID (Public)
- `POST /packages` - Create package (Admin only)
- `PATCH /packages/:id` - Update package (Admin only)
- `DELETE /packages/:id` - Delete package (Admin only)

### Bookings
- `GET /bookings` - Get all bookings (Authenticated)
- `GET /bookings/:id` - Get booking by ID (Authenticated)
- `POST /bookings` - Create booking (Authenticated)
- `PATCH /bookings/:id` - Update booking (Authenticated)
- `DELETE /bookings/:id` - Delete booking (Admin only)

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run tests with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e
```

## 📖 API Documentation

A complete Postman collection is included in the repository (`Booking-wepsite-API.postman_collection.json`) with:
- All endpoints documented
- Request/response examples
- Auto token handling
- Test scripts

## 🏗️ Architecture

The project follows Clean Architecture principles:

- **Controllers**: Handle HTTP requests and responses
- **Services**: Business logic layer
- **Repositories**: Data access layer
- **DTOs**: Data Transfer Objects for validation
- **Mappers**: Transform between entities and DTOs
- **Guards**: Authentication and authorization
- **Interceptors**: Cross-cutting concerns (logging)

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Role-based access control (RBAC)
- Input validation and sanitization
- Environment variables for sensitive data
- No hardcoded secrets

## 📦 Key Dependencies

- `@nestjs/core` - NestJS framework
- `@nestjs/mongoose` - MongoDB integration
- `@nestjs/jwt` - JWT authentication
- `@nestjs/config` - Configuration management
- `mongoose` - MongoDB ODM
- `bcrypt` - Password hashing
- `cloudinary` - Image storage
- `class-validator` - Input validation

## 🌐 Deployment

The application is configured for deployment on platforms like Render, Heroku, or AWS. Make sure to set all required environment variables in your deployment platform.

## 📝 License

This project is private and proprietary.

## 👤 Author

**Amr Magdy**

- GitHub: [@AmrMagdy00](https://github.com/AmrMagdy00)
- Repository: [Booking-website-API](https://github.com/AmrMagdy00/Booking-website-API)

---

⭐ If you find this project interesting, feel free to explore the codebase!
