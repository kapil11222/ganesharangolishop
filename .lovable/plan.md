# Delhivery Full Integration — Ganesha Rangoli

End-to-end Delhivery shipping inside your website and admin dashboard. All API calls run server-side; your token never touches the browser.

## What ships in each phase

### Phase 1 — Customer essentials (launch first)
- **Pincode serviceability widget** on Product Page and Cart:
  - "Enter pincode → Check delivery"
  - Shows: available / not serviceable, COD eligible?, prepaid-only?, expected delivery date.
- **Live shipping rate** at Checkout:
  - Calculates real shipping cost from warehouse pincode → customer pincode based on order weight (sum of product weights).
  - Free shipping above ₹999 still applied on top.
- **Live Order Tracking page** (`/track-order`):
  - Beautiful timeline: Manifested → Picked → In Transit → Out for Delivery → Delivered.
  - Auto-fetches Delhivery status by AWB; shows current location & last scan.
- **"Get it by <date>"** badge on Product Cards & PDP (uses serviceability API + cutoff time).

### Phase 2 — Admin shipping automation
New **"Shipping"** tab in `/admin` plus per-order actions:
- **Create Shipment (AWB)** — one click on any order → generates Delhivery waybill.
- **Download Waybill PDF** — print-ready label with barcode & address.
- **Schedule Pickup** — request Delhivery to pick up from your warehouse (single or bulk).
- **Bulk AWB creation** — select multiple orders → generate all at once (Diwali rush saver).
- **Warehouse settings page** — configure pickup address, phone, default package weight/dimensions.

### Phase 3 — Advanced ops
- **NDR dashboard** — see failed deliveries with reason; re-attempt / update address / mark RTO from panel.
- **RTO / Return tracking** — full return journey visible per order.
- **COD Remittance tracker** — which COD orders are collected, expected remittance date, reconciliation view.
- **Auto status sync** — scheduled job pulls latest tracking for all active shipments every 30 min; updates order status + optional email/SMS to customer.

---

## Technical Design

### Secrets
- `DELHIVERY_API_TOKEN` — production token (stored via `add_secret`, server-only).
- `DELHIVERY_CLIENT_NAME` — your registered client/warehouse name.
- `DELHIVERY_WAREHOUSE_PINCODE` — origin pincode (also editable in admin).

### Server layer (TanStack)
All Delhivery calls happen in server functions — never from the browser.

`src/lib/delhivery/`
- `delhivery.server.ts` — thin HTTP client wrapping Delhivery REST endpoints (serviceability, rate, create shipment, track, pickup, NDR, cancel). Handles auth header & error normalization.
- `delhivery.functions.ts` — server functions callable from routes:
  - `checkPincode({ pincode, weight })` — public.
  - `calculateShippingRate({ pincode, weight, cod })` — public.
  - `trackShipmentPublic({ awb })` — public (for `/track-order`).
  - `createShipmentForOrder({ orderId })` — admin only.
  - `downloadWaybill({ awb })` — admin only, returns PDF URL.
  - `schedulePickup({ orderIds, pickupDate })` — admin only.
  - `bulkCreateShipments({ orderIds })` — admin only.
  - `syncTracking({ awb })` / `syncAllActive()` — admin/scheduled.
  - `updateNDR({ awb, action, notes })` — admin only.

Admin functions use `requireSupabaseAuth` + `has_role('admin')` check.

### Database changes (Supabase migration)

**New tables:**
- `shipments` — `order_id`, `awb`, `courier` (delhivery), `status`, `current_location`, `expected_delivery`, `label_url`, `pickup_id`, `weight`, `dimensions`, `payment_mode`, `raw_status_payload`, timestamps.
- `shipment_events` — `shipment_id`, `status`, `location`, `event_time`, `remark` (full tracking history).
- `pickup_requests` — `pickup_date`, `pickup_id`, `count`, `status`, `warehouse_id`.
- `warehouses` — `name`, `pincode`, `address`, `phone`, `is_default` (start with one row).
- `ndr_records` — `shipment_id`, `attempt_no`, `reason`, `action_taken`, `resolved`.
- `cod_remittance` — `awb`, `order_id`, `amount`, `collected_at`, `remitted_at`, `utr`, `status`.

**Extensions to existing tables:**
- `products` → add `weight_grams`, `length_cm`, `width_cm`, `height_cm` (for accurate rate calc).
- `orders` → add `awb`, `shipping_status`, `expected_delivery_at`, `shipping_cost_actual`, `warehouse_id`.

All new tables get RLS: admin full access, users read their own via `orders.user_id` join.

### Public API routes
- `POST /api/public/webhooks/delhivery` — receives Delhivery status push (if enabled on your account). HMAC-verified using `DELHIVERY_WEBHOOK_SECRET`. Falls back to polling if webhook not configured.

### Scheduled job (Phase 3)
- `pg_cron` job → hits `/api/public/cron/sync-shipments` every 30 min → updates all active shipments' tracking.

### UI additions
- `src/components/site/PincodeCheck.tsx` — reusable widget (product page + cart).
- `src/routes/track-order.tsx` — upgrade existing page to live tracking with AWB input.
- `src/routes/checkout.tsx` — inject live rate line.
- `src/routes/admin.tsx` — new **Shipping**, **Warehouse**, **NDR**, **COD Remittance** tabs.
- Product form → add weight/dimension fields.

### Order flow after integration
```text
User places order (COD / Prepaid)
   → order saved
   → (optional) auto-create AWB if setting enabled, else appears in admin "To Ship" queue
Admin clicks "Create Shipment"
   → Delhivery AWB generated
   → label PDF ready to print
   → pickup scheduled (bulk or per-day)
Delhivery picks up
   → tracking auto-updates every 30 min
   → customer sees live status on /track-order
   → NDR/RTO handled from admin if issues
   → COD remittance tracked till payout
```

---

## Delivery order

1. **Migration** — add all shipping tables, columns, RLS, grants.
2. **Save secrets** — `add_secret` prompts for the 3 Delhivery values.
3. **Server layer** — Delhivery client + all server functions.
4. **Phase 1 UI** — pincode widget, live rate at checkout, live tracking page, delivery-date badges.
5. **Phase 2 UI** — admin Shipping tab (AWB, waybill, pickup, bulk), Warehouse settings, product weight/dimension fields.
6. **Phase 3 UI** — NDR dashboard, COD remittance, scheduled auto-sync, optional webhook route.
7. **Test** — end-to-end with your live token on one real order (COD + Prepaid).

Each phase is independently shippable, so you can start using Phase 1 immediately while Phase 2 & 3 build in parallel.

Confirm and I'll start with the database migration + secrets.
