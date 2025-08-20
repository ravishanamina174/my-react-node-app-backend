# Stripe Payment Integration Documentation

## Overview
This document describes the Stripe payment integration implemented in the e-commerce backend. The system supports both traditional checkout sessions and modern payment intents for enhanced payment processing.

## Environment Variables Required

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Frontend URL (for redirects)
FRONTEND_URL=http://localhost:3000
```

## API Endpoints

### 1. Create Payment Intent
**Endpoint**: `POST /api/payments/create-payment-intent`

**Purpose**: Creates a Stripe PaymentIntent for processing payments

**Request Body**:
```json
{
  "orderId": "order_id_here",
  "amount": 5000
}
```

**Response**:
```json
{
  "clientSecret": "pi_xxx_secret_xxx"
}
```

**Features**:
- Validates user authentication
- Ensures order belongs to authenticated user
- Creates Stripe PaymentIntent with order metadata
- Updates order with payment intent ID
- Returns client secret for frontend integration

### 2. Create Checkout Session (Legacy)
**Endpoint**: `POST /api/payments/create-checkout-session`

**Purpose**: Creates a Stripe Checkout Session (existing functionality)

**Request Body**:
```json
{
  "orderId": "order_id_here"
}
```

**Response**:
```json
{
  "clientSecret": "cs_xxx_secret_xxx"
}
```

### 3. Session Status
**Endpoint**: `GET /api/payments/session-status?session_id=xxx`

**Purpose**: Retrieves checkout session status

### 4. Webhook Handler
**Endpoint**: `POST /api/payments/webhook`

**Purpose**: Handles Stripe webhooks for payment status updates

**Events Handled**:
- `checkout.session.completed` - Updates order to paid status
- `checkout.session.async_payment_succeeded` - Handles async payments
- `payment_intent.succeeded` - Updates order to paid status
- `payment_intent.payment_failed` - Updates order to failed status

## Order Schema Updates

The Order schema has been enhanced with the following new fields:

```typescript
interface OrderDoc {
  // ... existing fields ...
  
  // Stripe payment tracking
  paymentIntentId?: string;
  
  // Enhanced payment status
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  
  // Shipping address details
  shippingAddress?: {
    line_1: string;
    line_2?: string;
    city: string;
    phone: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
}
```

## Frontend Integration Flow

### Payment Intent Flow (Recommended)
1. **Create Order**: Frontend creates order with shipping details
2. **Create Payment Intent**: Call `/api/payments/create-payment-intent` with orderId and amount
3. **Process Payment**: Use returned client secret with Stripe Elements
4. **Handle Result**: Redirect to success/failure page based on payment result

### Checkout Session Flow (Legacy)
1. **Create Order**: Frontend creates order
2. **Create Checkout Session**: Call `/api/payments/create-checkout-session`
3. **Redirect to Stripe**: Use returned client secret for Stripe Checkout
4. **Webhook Processing**: Backend automatically updates order status

## Security Features

- **Authentication**: All payment endpoints require user authentication
- **Authorization**: Users can only access their own orders
- **Webhook Verification**: Stripe webhook signatures are verified
- **Input Validation**: Amount validation and order status checks
- **Error Handling**: Comprehensive error responses with appropriate HTTP status codes

## Error Handling

The API returns structured error responses:

```json
{
  "error": "Error message",
  "details": "Additional error details"
}
```

Common HTTP status codes:
- `400` - Bad Request (missing/invalid parameters)
- `401` - Unauthorized (user not authenticated)
- `403` - Forbidden (user cannot access order)
- `404` - Not Found (order not found)
- `500` - Internal Server Error

## Testing

### Test Mode
- Use Stripe test keys for development
- Test with Stripe's test card numbers
- Monitor webhook events in Stripe dashboard

### Test Cards
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Requires Authentication**: 4000 0025 0000 3155

## Webhook Configuration

1. **Set Webhook URL**: Configure webhook endpoint in Stripe dashboard
2. **Select Events**: Choose `payment_intent.succeeded` and `payment_intent.payment_failed`
3. **Get Secret**: Copy webhook signing secret to environment variables
4. **Test**: Use Stripe CLI to test webhook delivery

## Dependencies

The following packages are required:
```bash
npm install stripe
npm install @types/stripe  # TypeScript types
```

## Example Usage

### Frontend Payment Intent Integration
```javascript
// 1. Create payment intent
const response = await fetch('/api/payments/create-payment-intent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ orderId: 'order123', amount: 5000 })
});

const { clientSecret } = await response.json();

// 2. Use with Stripe Elements
const { error } = await stripe.confirmPayment({
  elements,
  confirmParams: {
    return_url: "https://your-site.com/success",
  },
});
```

### Webhook Testing with Stripe CLI
```bash
# Install Stripe CLI
stripe listen --forward-to localhost:8000/api/payments/webhook

# Test payment intent
stripe payment_intents create --amount 5000 --currency usd
```

## Troubleshooting

### Common Issues
1. **Webhook not received**: Check webhook URL and secret configuration
2. **Payment intent creation fails**: Verify Stripe secret key and order status
3. **Authentication errors**: Ensure user is properly authenticated
4. **Order not found**: Verify orderId and user ownership

### Debug Steps
1. Check server logs for detailed error messages
2. Verify environment variables are set correctly
3. Test webhook delivery with Stripe CLI
4. Check Stripe dashboard for payment intent status

## Production Considerations

1. **Live Keys**: Switch to live Stripe keys for production
2. **Webhook Security**: Ensure webhook endpoint is HTTPS
3. **Error Monitoring**: Implement proper logging and monitoring
4. **Rate Limiting**: Consider implementing rate limiting for payment endpoints
5. **PCI Compliance**: Follow Stripe's PCI compliance guidelines
