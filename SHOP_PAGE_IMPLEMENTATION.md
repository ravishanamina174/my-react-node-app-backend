# Shop Page Backend Implementation

This document describes the backend implementation for the shop page with filtering, sorting, and pagination capabilities.

## Overview

The shop page backend provides:
- Product filtering by category and color
- Product sorting by price (ascending/descending) and creation date
- Pagination support
- Category and color management
- RESTful API endpoints

## API Endpoints

### 1. Shop Products (Main Endpoint)
```
GET /api/products/shop
```

**Query Parameters:**
- `category` (optional): Category slug (e.g., "t-shirts", "pants") or "all"
- `color` (optional): Color ID or "all"
- `sort` (optional): Sort option
  - `price-asc`: Price low to high
  - `price-desc`: Price high to low
  - Default: Newest first (by creation date)
- `limit` (optional): Number of products per page (default: 50)
- `page` (optional): Page number (default: 1)

**Example Request:**
```
GET /api/products/shop?category=t-shirts&color=all&sort=price-asc&limit=20&page=1
```

**Response Format:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "product_id",
      "name": "Product Name",
      "description": "Product description",
      "price": 29.99,
      "image": "image_url",
      "categoryId": {
        "_id": "category_id",
        "name": "T-shirts",
        "slug": "t-shirts"
      },
      "colorId": {
        "_id": "color_id",
        "name": "Black",
        "hex": "#000000"
      },
      "featured": false,
      "stock": 25,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalProducts": 100,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### 2. Categories
```
GET /api/categories
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "category_id",
      "name": "T-shirts",
      "slug": "t-shirts",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 3. Colors
```
GET /api/colors
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "color_id",
      "name": "Black",
      "hex": "#000000",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

## Database Schema Updates

### Product Entity
- Added `colorId` field (optional, references Color)
- Added `featured` field (boolean, default: false)
- Added timestamps

### Color Entity
- `name`: Color name (e.g., "Black", "Navy")
- `hex`: Hex color code (e.g., "#000000")
- Timestamps

### Category Entity
- `name`: Category name
- `slug`: URL-friendly slug (auto-generated from name)
- Timestamps

## Setup Instructions

### 1. Database Seeding
Run the seed script to populate the database with initial data:

```bash
npm run seed
```

This will:
- Create categories with slugs
- Create products for each category
- Create colors
- Assign random colors to products

### 2. Update Existing Products with Colors
If you have existing products without colors, run:

```bash
npx ts-node src/infrastructure/db/updateProductsWithColors.ts
```

### 3. Environment Variables
Ensure these environment variables are set in your `.env` file:

```env
MONGODB_URI=your_mongodb_connection_string
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

## Frontend Integration

### Example Frontend Usage

```typescript
// Fetch shop products with filters
const fetchShopProducts = async (filters: {
  category?: string;
  color?: string;
  sort?: string;
  page?: number;
  limit?: number;
}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value && value !== 'all') {
      params.append(key, value.toString());
    }
  });
  
  const response = await fetch(`/api/products/shop?${params}`);
  return response.json();
};

// Fetch categories
const fetchCategories = async () => {
  const response = await fetch('/api/categories');
  return response.json();
};

// Fetch colors
const fetchColors = async () => {
  const response = await fetch('/api/colors');
  return response.json();
};
```

## Error Handling

The API uses the existing error handling middleware:
- `ValidationError`: Invalid input data
- `NotFoundError`: Resource not found
- `UnauthorizedError`: Authentication required
- `ForbiddenError`: Insufficient permissions

## Performance Considerations

- Products are populated with category and color data in a single query
- Pagination limits the number of products returned
- Indexes should be created on frequently queried fields:
  - `categoryId`
  - `colorId`
  - `price`
  - `createdAt`

## Future Enhancements

- Product search functionality
- Advanced filtering (price range, size, brand)
- Product recommendations
- Caching layer for frequently accessed data
- Elasticsearch integration for better search
