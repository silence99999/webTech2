# Final Report

## Project Overview
This project is a full‑stack web application for inventory and order management. It demonstrates NoSQL data modeling, MongoDB queries/aggregations, and secure REST API design with a working frontend.

## System Architecture
- **Frontend**: Static HTML/CSS/JS served from `frontend/`
- **Backend**: Express REST API
- **Database**: MongoDB accessed through Mongoose

## Database Schema Description
### `users`
- `email` (unique)
- `password` (hashed)
- `role` (`user` | `admin`)

### `items` (implemented as `products` in code)
- `name`
- `category`
- `brand`
- `price`
- `stock_quantity`

### `orders`
- `user_id` (ref: `users`)
- `order_date`
- `order_status`
- `total_amount`
- `order_items` (embedded array):
  - `product_id` (ref: `items/products`)
  - `quantity`
  - `unit_price`

This design uses **referenced** documents between orders and items, and **embedded** documents for order line items.

## MongoDB Queries and Aggregations
### Aggregation: Revenue by Product
`GET /api/orders/analytics/revenue-by-product`
- `$unwind` order items
- `$group` by product id
- `$lookup` product data
- `$project` final response

### Advanced Updates/Deletes
- Add item to order: `$push`, `$inc`
- Remove item from order: `$pull`
- Stock updates: `$inc` on items

## Pagination, Filtering, Sorting
List endpoints accept query params:
- `page`, `limit`
- `sort` and `order` (e.g., `order=asc|desc`)
- Products: `category`, `brand`, `q`, `inStock=1`
- Orders: `status`, `from`, `to`, `userId` (admin)

## API Documentation (Summary)
Auth:
- `POST /api/auth/register`
- `POST /api/auth/login`

Items (Products):
- `GET /api/products`
- `POST /api/products` (admin)
- `PUT /api/products/:id` (admin)
- `DELETE /api/products/:id` (admin)

Orders:
- `GET /api/orders`
- `GET /api/orders/:id`
- `POST /api/orders` (admin)
- `PUT /api/orders/:id` (admin)
- `DELETE /api/orders/:id` (admin)
- `POST /api/orders/:id/items` (admin)
- `DELETE /api/orders/:id/items/:productId` (admin)
- `GET /api/orders/analytics/revenue-by-product` (admin)
- `POST /api/orders/place`

## Indexing and Optimization Strategy
- `items/products`: compound index on `{ category: 1, price: 1 }`
- `orders`: compound index on `{ user_id: 1, order_date: -1 }`

## Authentication and Authorization
- JWT authentication middleware
- Role-based access control for admin endpoints

## Notes
The “items” collection is implemented in code as `products` for UI clarity, but represents the same dataset.
