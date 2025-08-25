# E-commerce Platform

![E-commerce Platform](frontend/public/placeholder-logo.svg)

A modern e-commerce platform for beauty and cosmetics products built with Next.js and Express.js.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Contributing](#contributing)

## 🌟 Overview

E-commerce Platform is a full-featured e-commerce platform designed for a beauty and cosmetics store. The application provides a seamless shopping experience for customers and comprehensive management tools for administrators.

## ✨ Features

### Customer Features

- **Product Browsing**: Browse featured products and full catalog with search and filtering
- **User Authentication**: Phone-based authentication system
- **Shopping Cart**: Add, remove, and update product quantities
- **Checkout Process**: Complete purchases with delivery information
- **User Profiles**: Manage addresses and view order history

### Admin Features

- **Product Management**: Add, edit, delete, and manage product inventory
- **Order Management**: View and process customer orders
- **Comment Moderation**: Manage product reviews and comments
- **Dashboard**: View sales statistics and inventory levels

## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js (React)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom UI components
- **State Management**: React Context API
- **Authentication**: JWT-based auth with local storage

### Backend

- **Server**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT for both user and admin authentication
- **Validation**: Zod schema validation
- **Security**: Helmet, CORS, rate limiting

## 📁 Project Structure

```
├── backend/               # Express.js server
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   └── server.js          # Main server file
├── database/              # Database setup scripts
└── frontend/              # Next.js application
    ├── app/               # Next.js app directory
    │   ├── about/         # About page
    │   ├── admin/         # Admin dashboard and tools
    │   ├── auth/          # Authentication pages
    │   ├── cart/          # Shopping cart
    │   ├── checkout/      # Checkout process
    │   └── products/      # Product listings and details
    ├── components/        # Reusable React components
    ├── contexts/          # React context providers
    ├── hooks/             # Custom React hooks
    ├── lib/               # Utility functions and API client
    └── public/            # Static assets
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or later)
- MongoDB
- npm or pnpm

### Installation

1. Clone the repository

```bash
git clone https://github.com/Tilak630Devi/e-commerce_webpage
cd e-commerce_webpage
```

2. Install backend dependencies

```bash
cd backend
npm install --legacy-peer-deps
```

3. Install frontend dependencies

```bash
cd ../frontend
npm install --legacy-peer-deps
```

4. Set up environment variables (see [Environment Variables](#environment-variables))

5. Start the development servers

**Backend:**

```bash
cd backend
npm run dev
```

**Frontend:**

```bash
cd frontend
npm run dev
```

6. Open your browser and navigate to `http://localhost:3000`

## 🔐 Environment Variables

### Backend (.env)

```
PORT=5000
MONGODB_URI=YOUR_MONGODB_URI
DB_NAME=shopDB
ADMIN_JWT_SECRET=your_admin_jwt_secret
USER_JWT_SECRET=your_user_jwt_secret
SHOP_WHATSAPP_NUMBER=CONTACT
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env.local)

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## 📚 API Documentation

### Authentication

- `POST /auth/signup` - Register a new user
- `POST /auth/login` - Login with phone number
- `POST /admin/login` - Admin login

### Products

- `GET /products` - List all products
- `GET /products/:slug` - Get product details
- `POST /admin/products` - Create a product (admin)
- `PATCH /admin/products/:id` - Update a product (admin)
- `DELETE /admin/products/:id` - Delete a product (admin)

### Cart

- `GET /cart` - Get user's cart
- `POST /cart` - Add item to cart
- `PATCH /cart/:productId` - Update cart item
- `DELETE /cart/:productId` - Remove from cart

### Comments

- `GET /products/:productId/comments` - Get product comments
- `POST /products/:productId/comments` - Add a comment
- `GET /admin/comments` - List all comments (admin)
- `PATCH /admin/comments/:id` - Update comment visibility (admin)

## 🌐 Deployment

### Backend

The Express.js backend can be deployed to platforms like:

- Heroku
- DigitalOcean
- AWS EC2

### Frontend

The Next.js frontend can be deployed to:

- Vercel (recommended)
- Netlify
- AWS Amplify

## 👥 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

Developed with ❤️ for E-commerce Platform
