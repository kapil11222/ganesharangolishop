# Flipkart-style "Offer Period" experience

Goal: when a sale/offer campaign is live (or about to start), the whole site should visibly switch into "sale mode" — like Flipkart's Big Billion Days — instead of the offer only living on `/offers`.

## What already exists
- Sitewide rotating offer ticker (`OfferStrip`) with live + upcoming campaigns and countdowns.
- Offer cards on home/shop/product pages (`OfferBlocks`) with Upcoming badge and product targeting.
- `/offers` page with carousel, live + starting-soon sections and product rails.
- Shared countdown hook/pill/boxes (`OfferCountdown`), admin Offers tab with occasion, schedule, product picker, video.

## What we change / add for sale mode

1. Sale mode banner bar (top of every page)
   - Bold gradient strip: occasion name + "Sale is LIVE" or "Starts in 2d 04h 12m", with a big countdown and a "Shop the sale" button.
   - Replaces/upgrades the current thin ticker while a campaign is live; falls back to normal ticker otherwise.

2. Sale theming toggle
   - When a campaign is live, home hero gets a sale ribbon overlay, section headings get sale accent colour, and a subtle festive accent token switch (still light theme, semantic tokens only).
   - Admin can set a campaign accent colour + banner image so each occasion (Diwali, Navratri, custom) looks different.

3. Product-level offer surfacing (biggest Flipkart-like change)
   - Product cards and product page show: struck MRP, sale price, "X% OFF" tag, and a green "Sale price" line with the campaign name.
   - "Deal ends in HH:MM:SS" pill on discounted product cards.
   - Optional "Limited stock / Hurry" urgency label.

4. Sale rails and landing sections on Home
   - "Deals of the Day" row with countdown.
   - "Top offers for you" grid of coupon/campaign tiles.
   - "Sale picks" rails auto-built from each campaign's selected products.

5. Cart & checkout offer awareness
   - Cart shows "You saved ₹X in this sale" and suggests the best applicable coupon.
   - Checkout shows applied campaign name next to the discount line.

6. Upcoming-sale teaser
   - Before start: "Sale starts in …" hero overlay + a "Notify me / Set reminder" button that stores interest (uses signed-in user).

7. After sale ends
   - Everything reverts automatically at end time; ended campaigns disappear from strip/rails without manual work.

## Admin additions
- Per-campaign: accent colour, sale-mode on/off, priority (which campaign owns the sitewide bar), urgency text, discount % applied to targeted products.
- Preview button to see the sale bar before it goes live.

## Technical notes
- Extend `offer_campaigns` with `accent_color`, `sale_mode`, `priority`, `urgency_text`, `discount_percent` (migration with GRANTs unchanged pattern).
- New components: `SaleModeBar`, `SaleProductBadge`, `DealsOfTheDayRail`, `SaleReminderButton`.
- Reuse `useCountdown` from `OfferCountdown.tsx`; keep campaign fetching in one shared query so the bar, cards and rails share cached data.
- All colours via semantic tokens in `src/styles.css`; campaign accent injected as a CSS variable.
