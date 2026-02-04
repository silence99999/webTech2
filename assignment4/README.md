# Advanced Databases (NoSQL) Final Project

## Project Overview
Inventory + order management web app with authentication, admin tools, and analytics. The backend exposes a RESTful API backed by MongoDB, and the frontend provides CRUD interactions.

## Tech Stack
- Node.js + Express
- MongoDB + Mongoose
- Vanilla HTML/CSS/JS frontend

## Collections (3)
- `users`: authentication + roles
- `items` (implemented as `products` in code): catalog items for sale
- `orders`: orders placed by users, embedding order items

## System Architecture
- Frontend served statically from `/frontend`
- REST API under `/api/*`
- Auth via JWT (see `middleware/authMiddleware.js`)

## Setup
1. Configure `.env` with MongoDB connection string and JWT secret.
2. Install dependencies and run the server.

## API Summary
All list endpoints support pagination, sorting, and basic filtering via query params (see `REPORT.md` for details).
### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### Items (Products)
- `GET /api/products`
- `POST /api/products` (admin)
- `PUT /api/products/:id` (admin)
- `DELETE /api/products/:id` (admin)

### Orders
- `GET /api/orders`
- `GET /api/orders/:id`
- `POST /api/orders` (admin)
- `PUT /api/orders/:id` (admin)
- `DELETE /api/orders/:id` (admin)
- `POST /api/orders/:id/items` (admin)
- `DELETE /api/orders/:id/items/:productId` (admin)
- `GET /api/orders/analytics/revenue-by-product` (admin)
- `POST /api/orders/place`

For detailed documentation, see `REPORT.md`.
