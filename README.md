# Express Items API

A simple RESTful API built with Express.js for managing items stored in a JSON file. This API provides CRUD (Create, Read, Update, Delete) operations for product items.

## Project Description

This is a Node.js Express server that manages a collection of items with properties like product name, store name, and model. The data is persisted in a `data.json` file on the server's filesystem. The API provides endpoints for retrieving, creating, updating, and deleting items.

## Prerequisites

- Node.js (version 12 or higher)
- npm (Node Package Manager)

## Installation

1. Clone or download this project to your local machine
```bash
git clone https://github.com/silence99999/webTech2 
```    

2. Install dependencies:
```bash
npm install express
```

3. Create a `data.json` file in the root directory with the following initial content:
```json
[]
```

Or with sample data:
```json
[
  {
    "id": 1,
    "product_name": "iPhone 14",
    "store_name": "Apple Store",
    "store_id": 1,
    "model": "A2632"
  }
]
```

## How to Run the Server

Start the server with:
```bash
node app.js
```

Or if you have nodemon installed:
```bash
nodemon app.js
```

The server will start on port 3000. You should see:
```
Server listening on port 3000
Access it at: http://localhost:3000
```

## API Routes

### 1. GET `/`
**Description:** Check if server is running

**Response:**
```
server is running
```

---

### 2. GET `/hello`
**Description:** Test endpoint that returns a hello message

**Response:**
```json
{
  "message": "Hello from server"
}
```

---

### 3. GET `/time`
**Description:** Returns the current server time

**Response:**
```
2024-01-15T10:30:00.000Z
```

---

### 4. GET `/status`
**Description:** Returns a status message

**Response:** (Status: 201)
```json
{
  "message": "some text"
}
```

---

### 5. GET `/items`
**Description:** Retrieve all items from the database

**Response:** (Status: 200)
```json
[
  {
    "id": 1,
    "product_name": "iPhone 14",
    "store_name": "Apple Store",
    "store_id": 1,
    "model": "A2632"
  }
]
```

---

### 6. POST `/items`
**Description:** Create a new item

**Request Body:**
```json
{
  "product_name": "Samsung Galaxy S23",
  "store_name": "Samsung Store",
  "model": "SM-S911"
}
```

**Response:** (Status: 201)
```json
[
  {
    "id": 1,
    "product_name": "iPhone 14",
    "store_name": "Apple Store",
    "store_id": 1,
    "model": "A2632"
  },
  {
    "id": 2,
    "poduct_name": "Samsung Galaxy S23",
    "store_name": "Samsung Store",
    "store_id": 1,
    "model": "SM-S911"
  }
]
```

---

### 7. PUT `/item/:id`
**Description:** Update an existing item by ID

**URL Parameters:**
- `id` - The ID of the item to update

**Request Body:** (all fields optional)
```json
{
  "product_name": "iPhone 15",
  "store_name": "Apple Store NYC",
  "model": "A2846"
}
```

**Response:** (Status: 200)
```json
{
  "id": 1,
  "product_name": "iPhone 15",
  "store_name": "Apple Store NYC",
  "store_id": 1,
  "model": "A2846"
}
```

---

### 8. DELETE `/item/:id`
**Description:** Delete an item by ID

**URL Parameters:**
- `id` - The ID of the item to delete

**Response:** (Status: 200)
```json
{
  "message": "Item deleted successfully",
  "item": {
    "id": 1,
    "product_name": "iPhone 14",
    "store_name": "Apple Store",
    "store_id": 1,
    "model": "A2632"
  }
}
```

## Example Postman Requests

### 1. Get All Items
- **Method:** GET
- **URL:** `http://localhost:3000/items`
- **Headers:** None required

---

### 2. Create New Item
- **Method:** POST
- **URL:** `http://localhost:3000/items`
- **Headers:**
    - `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
  "product_name": "MacBook Pro",
  "store_name": "Apple Store",
  "model": "M3"
}
```

---

### 3. Update Item
- **Method:** PUT
- **URL:** `http://localhost:3000/item/1`
- **Headers:**
    - `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
  "product_name": "MacBook Pro 16",
  "model": "M3 Pro"
}
```

---

### 4. Delete Item
- **Method:** DELETE
- **URL:** `http://localhost:3000/item/1`


---

### 5. Test Server Status
- **Method:** GET
- **URL:** `http://localhost:3000/`

