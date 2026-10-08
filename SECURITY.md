# Ghar Rent V4 security checklist

1. OTP/authentication handled by a real auth provider.
2. Server-side authorization on every protected endpoint.
3. Admin role assigned only by trusted admin/server process.
4. 0.5% platform fee calculated on the server.
5. Payment secrets never exposed in frontend code.
6. Verify payment-provider webhook signatures.
7. Validate every input and uploaded file.
8. Restrict image MIME types and file sizes.
9. Rate-limit OTP, login, request and payment endpoints.
10. Use HTTPS in production.
11. Enable database RLS.
12. Keep audit logs for admin/fee/payment/role changes.
13. Back up database and define recovery procedure.
14. Store only required personal information.
15. Do not claim the app is “100% hack-proof”; security needs ongoing testing and monitoring.
