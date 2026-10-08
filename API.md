# Ghar Rent V4 API contract

## Auth
POST /api/auth/send-otp
POST /api/auth/verify-otp
POST /api/auth/logout

## Properties
GET    /api/properties
POST   /api/properties
GET    /api/properties/:id
PATCH  /api/properties/:id
DELETE /api/properties/:id
POST   /api/properties/:id/photos

## Rental requests
POST  /api/rental-requests
GET   /api/rental-requests/mine
PATCH /api/rental-requests/:id/status

## Agreements
POST /api/agreements
GET  /api/agreements/mine
GET  /api/agreements/:id

## Payments
POST /api/payments/create-order
POST /api/payments/webhook
GET  /api/payments/mine

## Admin
GET   /api/admin/settings
PATCH /api/admin/settings/platform-fee
GET   /api/admin/audit-logs

IMPORTANT:
- Never trust the fee supplied by the browser.
- Server reads platform_fee_percent from platform_settings.
- Fee = round(rent_amount * fee_percent / 100, 2).
- Payment webhooks must verify the provider signature.
- Admin role must never be selected by an ordinary signup form.
