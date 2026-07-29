## Goal

1. Replace the 3D rangoli hero with a real image slider whose banners you upload from the admin panel.
2. Remove "Watch Demo" from the whole site.
3. Make offers management advanced — occasion-based offer campaigns in admin, and a rich Flipkart/Meesho-style offers experience for customers.

## 1. Hero slider (replaces the 3D section)

- Delete `RangoliShowcase` (the rotating rangoli, sparkles, petals, tilt) and the "Watch Demo" button.
- New `HeroSlider` component on the home page:
  - Full-width responsive banner carousel, autoplay ~5s, pause on hover, swipe on mobile, arrows + dot indicators, smooth fade/slide transitions (Framer Motion), reduced-motion safe.
  - Each slide supports: desktop image, optional mobile image, headline, subtext, CTA label + link, and a placement/eyebrow tag.
  - Images lazy-loaded, first slide eager for LCP; text overlay uses existing theme tokens so it stays readable.
- If no slides are configured, show a clean branded fallback (headline + Shop Now) instead of a blank area.

## 2. Admin: Banners / Slider tab

- New "Banners" tab in `/admin` with full CRUD:
  - Upload image via the existing ImageUpload component (Supabase storage), optional separate mobile image.
  - Fields: title, subtitle, CTA text, CTA link, display order, active toggle, optional start/end dates.
  - Drag-free ordering via a numeric order field + up/down controls, live preview thumbnail.

## 3. Advanced offers

**Admin — new "Offers" tab (separate from Coupons):**

- Offer campaigns tied to an occasion (Diwali, Navratri, Wedding Season, Holi, Raksha Bandhan, custom).
- Per campaign: name, occasion, banner image, description, discount badge text (e.g. "Up to 40% OFF"), start/end date, active toggle, display order, optional linked coupon code, and product/category targeting.
- Coupons tab stays as-is for code-level rules; offers can reference a coupon so the customer sees "Use code X".
- Live status pill: Scheduled / Live / Expired based on dates.

**Customer `/offers` page — Flipkart/Meesho style:**

- Top offer-banner carousel (from active campaigns).
- "Deals of the Day" strip with a live countdown to the campaign end time.
- Coupon cards with one-tap Copy Code and eligibility line.
- Occasion tabs/chips (Diwali, Wedding, Navratri…) filtering the products below.
- Discount rails: "Under ₹299", "Up to 30% Off", "Best Sellers on Sale", each a horizontal scroll rail.
- Product cards show MRP strike-through, discount % badge, and the offer tag.
- Empty/loading skeletons so the page never looks broken.
- Home page also gets a compact "Festive Offers" strip linking to `/offers`.

## Technical notes

- New Supabase tables (public read for active rows, admin-only writes, with GRANTs):
  - `hero_slides` — image_url, mobile_image_url, title, subtitle, cta_label, cta_link, display_order, is_active, starts_at, ends_at.
  - `offer_campaigns` — name, slug, occasion, banner_url, description, badge_text, coupon_code, discount_percent, starts_at, ends_at, display_order, is_active.
  - `offer_products` — links a campaign to specific products/categories (optional targeting).
- Reuse existing `product-images` / add a `banner-images` storage bucket for slider and offer banners.
- All queries via TanStack Query; SEO head metadata updated on `/offers`.

&nbsp;

And The Home pAge Compunet Also Upadete And Make Profationa And Main Thing Is Make Best For Meta Ads Ecommesrs .

&nbsp;