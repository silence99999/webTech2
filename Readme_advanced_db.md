# 🛒 Online Shop Web Application
**Advanced Databases (NoSQL) – Endterm Project**

---

## 1. Project Overview

This project is a **web-based Online Shop application** developed as an endterm assessment for the course **Advanced Databases (NoSQL)**.

The goal of the project is to demonstrate:
- Advanced MongoDB data modeling
- Use of aggregation pipelines
- Implementation of RESTful APIs
- Secure backend logic with authentication and authorization
- Practical business-oriented database design

The backend is implemented using **Node.js, Express, and MongoDB**, following **MVC architecture** and best practices for NoSQL systems.

---

## 2. System Architecture

The system follows a **client–server architecture**:

- **Backend**: Node.js + Express
- **Database**: MongoDB (NoSQL)
- **Architecture Pattern**: MVC (Model–View–Controller)
- **Authentication**: JWT + bcrypt
- **Authorization**: Role-Based Access Control (RBAC)

### Folder Structure
```text
config/ → Database configuration
models/ → Mongoose schemas
controllers/ → Business logic
routes/ → API endpoints
middleware/ → Authentication & authorization
server.js → Application entry point
```
This structure ensures scalability, maintainability, and clear separation of concerns.

---

## 3. Database Design & Data Models

The database uses **multiple collections**, combining **embedded** and **referenced** documents.

---

### 3.1 User (Authentication Entity)

Used for system access and security.

**Fields:**
- email (unique)
- password (hashed with bcrypt)
- role (`user`, `admin`)

**Purpose:**
- Authentication
- Authorization
- Role-based access control

Passwords are never stored in plain text.

---

### 3.2 Customer (Business Entity)

Represents buyers in the online shop.

**Fields:**
- full_name
- email
- phone
- address
- user_id (optional reference to User)

A customer may be linked to a user account, but guest customers are also supported.

---

### 3.3 Product (Primary Object)

Represents items available for sale.

**Fields:**
- name
- category
- brand
- price
- stock_quantity

**Indexing:**
- Compound index on `category` and `price` for optimized product filtering.

---

### 3.4 Order (Secondary Object)

Represents purchases made by customers.

**Fields:**
- order_date
- order_status
- total_amount
- customer_id (reference to Customer)
- order_items (embedded array)

**Embedded Document (`order_items`):**
- product_id (reference to Product)
- quantity
- unit_price

**Indexing:**
- Compound index on `customer_id` and `order_date` for optimized order history queries.

---

## 4. MongoDB Features Used

### 4.1 CRUD Operations
- Full Create, Read, Update, Delete operations across all collections
- CRUD implemented via RESTful API endpoints

---

### 4.2 Advanced Update & Delete Operations

The project uses MongoDB advanced operators:
- `$push` – add items to an order
- `$pull` – remove items from an order
- `$inc` – update total order price
- `$set` – update specific fields

These operations reflect real business logic in an online shop.

---

### 4.3 Aggregation Framework

Multi-stage aggregation pipelines are implemented for analytics:

**Examples:**
- Total revenue per product
- Number of orders and total spending per customer

**Stages used:**
- `$unwind`
- `$group`
- `$sum`
- `$multiply`
- `$sort`

These aggregations provide meaningful business insights.

---

### 4.4 Indexing & Optimization

To improve performance:
- Compound indexes are defined on frequently queried fields
- Indexes optimize filtering and sorting operations
- Index usage is justified based on real query patterns

---

## 5. REST API Design

The backend exposes a **RESTful API** following standard conventions.

### API Characteristics:
- Clear endpoint structure
- Proper HTTP methods (GET, POST, PUT, DELETE)
- JSON request/response format
- Protected routes using JWT

### Endpoint Coverage:
- Authentication (register, login)
- Products CRUD
- Customers CRUD
- Orders CRUD
- Analytics endpoints (aggregation-based)

The project includes **more than the minimum required number of endpoints**.

---

## 6. Authentication & Authorization

### Authentication
- Users log in with email and password
- JWT tokens are issued upon successful login
- Tokens are required for protected routes

### Authorization (RBAC)
- **User**: read-only access
- **Admin**: create, update, delete access

| Action | User | Admin |
|------|------|-------|
GET (Read) | ✅ | ✅ |
POST | ❌ | ✅ |
PUT | ❌ | ✅ |
DELETE | ❌ | ✅ |

---

## 7. Environment Setup

### 7.1 Install Dependencies
```bash
npm install
```
### Create .env file
```bash
PORT=3000
MONGO_URI=mongodb://localhost:27017/online_shop
JWT_SECRET=your_secret_key_here
```
### Run the server
```bash
node server.js
```
Server will run at:
```text
http://localhost:3000
```

## Conclusion

This project demonstrates advanced NoSQL concepts including:

Proper MongoDB data modeling

Aggregation pipelines with business meaning

Secure backend logic

RESTful API design

Performance optimization through indexing

The backend is fully compliant with the course requirements and ready for frontend integration.