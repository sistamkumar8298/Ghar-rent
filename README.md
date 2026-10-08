# Ghar Rent V4 — Backend Ready

This package is the next engineering step after the V3 browser prototype.

## Recommended stack
- Next.js / React
- Supabase Auth + PostgreSQL + Storage
- Server-side API routes
- A PCI-compliant payment provider such as Razorpay/PhonePe/PayU, configured by the owner
- Vercel/Render for deployment

## Important
This package is NOT a deployed production backend and does not contain real OTP/payment credentials.
Those require the user's own service accounts and secrets.

## 0.5% platform fee
The database starts with `platform_fee_percent = 0.50`.
The final amount must always be calculated on the server:
`fee = rent × 0.50 / 100`.

Example:
₹9,000 rent → ₹45 platform fee → ₹9,045 total.

## Next implementation order
1. Create Supabase project.
2. Run schema.sql.
3. Enable RLS policies.
4. Connect OTP authentication.
5. Connect V4 frontend to API/database.
6. Add real photo storage.
7. Add payment order + verified webhook.
8. Add agreement PDF/e-sign workflow.
9. Create admin dashboard.
10. Deploy and run security/payment tests.
