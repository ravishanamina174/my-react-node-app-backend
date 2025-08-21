# Sales Dashboard Backend Implementation

## Overview
This document outlines the backend implementation for the Sales Dashboard, which provides sales analytics data grouped by category for the last 7 and 30 days.

## API Endpoints

### 1. GET /api/sales/last7days
Returns sales data grouped by category for the last 7 days.

**Authentication:** Required (Admin only)
**Authorization:** Admin role required

**Response Format:**
```json
{
  "success": true,
  "data": [
    {
      "day": "2025-01-15",
      "Shoes": 5,
      "Shorts": 3,
      "T-shirts": 8,
      "Pants": 2,
      "Socks": 1
    },
    {
      "day": "2025-01-16",
      "Shoes": 2,
      "Shorts": 4,
      "T-shirts": 6,
      "Pants": 1,
      "Socks": 0
    }
    // ... more days (total of 7 days)
  ]
}
```

### 2. GET /api/sales/last30days
Returns sales data grouped by category for the last 30 days.

**Authentication:** Required (Admin only)
**Authorization:** Admin role required

**Response Format:** Same as 7-day endpoint, but with 30 days of data.

### 3. GET /api/sales/debug/test (Development Only)
Test endpoint to verify the sales API functionality without authentication.

**Environment:** Development only (returns 404 in production)
**Authentication:** Not required

## Implementation Details

### MongoDB Aggregation Pipeline

Both endpoints use the same aggregation pipeline structure:

```javascript
[
  {
    $match: {
      createdAt: { $gte: startDate },
      status: { $ne: "cancelled" } // Exclude cancelled orders
    }
  },
  {
    $unwind: "$orderItems"
  },
  {
    $lookup: {
      from: "products",
      localField: "orderItems.product",
      foreignField: "_id",
      as: "product"
    }
  },
  {
    $unwind: "$product"
  },
  {
    $lookup: {
      from: "categories",
      localField: "product.categoryId",
      foreignField: "_id",
      as: "category"
    }
  },
  {
    $unwind: "$category"
  },
  {
    $group: {
      _id: {
        day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        category: "$category.name"
      },
      quantity: { $sum: "$orderItems.quantity" }
    }
  },
  {
    $group: {
      _id: "$_id.day",
      categories: {
        $push: {
          category: "$_id.category",
          quantity: "$quantity"
        }
      }
    }
  }
]
```

### Data Processing

1. **Date Range Generation:** Creates a complete range of dates (7 or 30 days)
2. **Category Discovery:** Fetches all available categories for consistent data structure
3. **Empty Data Structure:** Creates a template with all dates and categories set to 0
4. **Data Population:** Fills in actual sales quantities from the aggregation results
5. **Response Formatting:** Ensures consistent structure even for days with no sales

### Key Features

- **Complete Date Coverage:** All requested days are included, even with 0 sales
- **Category Consistency:** All categories appear in every day's data
- **Cancelled Order Exclusion:** Only completed orders are counted
- **Quantity Aggregation:** Sums quantities across multiple orders for the same day/category
- **Error Handling:** Proper error handling with next() middleware pattern

## File Structure

```
src/
├── api/
│   ├── sales.ts                    # Main sales router
│   ├── sales.test.ts              # Test file (optional)
│   └── middleware/
│       ├── authentication-middleware.ts
│       └── authorization-middleware.ts
├── infrastructure/
│   └── db/
│       └── entities/
│           ├── Order.ts
│           ├── Product.ts
│           └── Category.ts
└── index.ts                       # Main app with sales routes
```

## Authentication & Authorization

### Middleware Chain
1. **isAuthenticated:** Verifies user authentication
2. **isAdmin:** Ensures user has admin role

### Development Mode
- Authentication is bypassed in development for easier testing
- Admin role is automatically granted in development

### Production Mode
- Full Clerk authentication required
- Admin role verification through Clerk metadata

## Error Handling

### HTTP Status Codes
- **200:** Success with data
- **401:** Unauthorized (authentication required)
- **403:** Forbidden (admin role required)
- **404:** Not found (debug endpoint in production)
- **500:** Internal server error

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## Testing

### Manual Testing
1. **Development Mode:** Use `/api/sales/debug/test` endpoint
2. **Production Mode:** Use authenticated admin requests

### Test Data
The test file includes sample data creation:
- Categories: Shoes, T-shirts, Pants
- Products with proper category associations
- Orders with different dates and quantities

## Performance Considerations

### Database Indexes
Ensure proper indexes on:
- `Order.createdAt` (for date filtering)
- `Order.status` (for status filtering)
- `Product.categoryId` (for category lookups)

### Aggregation Optimization
- Pipeline stages are ordered for optimal performance
- Early filtering with `$match` stage
- Efficient lookups with proper field selection

## Security

### Input Validation
- Date parameters are calculated server-side
- No user input accepted for date ranges

### Data Exposure
- Only admin users can access sales data
- Debug endpoint is disabled in production
- Sensitive order details are not exposed

## Usage Examples

### Frontend Integration
```javascript
// Fetch 7-day sales data
const response = await fetch('/api/sales/last7days', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
});
const data = await response.json();

// Use data for charts
const chartData = data.data.map(day => ({
  date: day.day,
  shoes: day.Shoes,
  tshirts: day['T-shirts'],
  pants: day.Pants
}));
```

### cURL Testing
```bash
# Test 7-day endpoint (requires auth)
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8000/api/sales/last7days

# Test debug endpoint (development only)
curl http://localhost:8000/api/sales/debug/test
```

## Future Enhancements

### Potential Improvements
1. **Caching:** Implement Redis caching for frequently accessed data
2. **Real-time Updates:** WebSocket integration for live dashboard updates
3. **Additional Metrics:** Revenue, profit margins, customer analytics
4. **Export Functionality:** CSV/Excel export of sales data
5. **Custom Date Ranges:** Allow user-defined date ranges
6. **Product-level Analytics:** Individual product performance metrics

### Scalability Considerations
1. **Database Sharding:** For high-volume order data
2. **Read Replicas:** Separate analytics queries from transactional data
3. **Background Jobs:** Pre-calculate daily summaries
4. **API Rate Limiting:** Prevent abuse of analytics endpoints

## Troubleshooting

### Common Issues

1. **Empty Data Response**
   - Check if orders exist in the date range
   - Verify order status is not "cancelled"
   - Ensure products have valid category associations

2. **Authentication Errors**
   - Verify Clerk configuration in production
   - Check admin role metadata
   - Ensure proper token format

3. **Performance Issues**
   - Check database indexes
   - Monitor aggregation pipeline execution time
   - Consider implementing caching

### Debug Steps

1. Use `/api/sales/debug/test` endpoint in development
2. Check server logs for error messages
3. Verify database connectivity and data integrity
4. Test with minimal data sets

## Conclusion

The Sales Dashboard backend implementation provides a robust, secure, and performant solution for sales analytics. The implementation follows best practices for MongoDB aggregation, authentication, and error handling, while maintaining flexibility for future enhancements.
