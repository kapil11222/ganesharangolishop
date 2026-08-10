# Premium home, sitewide offers & video support

## 1. Home page — more premium
- Keep the admin-managed carousel on the home page, but make it full-bleed (edge-to-edge on mobile, rounded inset on desktop) with taller cinematic aspect ratios, gradient scrim, animated eyebrow/title/CTA reveal, progress-bar autoplay indicator and refined arrows/dots.
- Upgrade the sections below it: a marquee trust bar, a "Shop by occasion" collection grid with hover reveal, a new "Deals live now" rail pulling active offer campaigns, a festive editorial band, and polished testimonial/stat blocks with softer shadows, gold accents and consistent spacing.
- Keep everything responsive and use existing design tokens (no hardcoded colors).

## 2. Offers visible on every page (Flipkart/Meesho style)
- New `OfferStrip` component mounted in the site layout, under the navbar on all pages: auto-rotating one-line offer/coupon ticker with copy-code action, dismissible for the session.
- New `OfferBlocks` component reused on Home, Shop and Product pages: horizontally scrollable campaign banner cards (badge, title, discount, coupon, CTA) built from live campaigns.
- Both read the same `offer_campaigns` data with the existing live/scheduled filtering.

## 3. Offer mode — more functionality
- Offers page gains: countdown timers per campaign, "grab now" coupon cards, occasion filter chips, sorting of deal rails by discount depth, and a video block per campaign.
- Admin Offers tab gains: video (link or upload), priority ordering with quick up/down, duplicate-campaign action, live/scheduled/expired filtering, and per-campaign preview.

## 4. Video support
- Offers: each campaign can have a video — paste a YouTube/Vimeo link or upload an MP4. Shown as an autoplay-muted inline player on the offers page and inside offer banner blocks.
- Products: each product can have a video — link or upload. Shown as an extra thumbnail in the product gallery that opens the player, plus a small play badge on product cards that have video.
- Admin: a reusable `MediaUpload` control (link field + upload button) added to both the Offer dialog and the Product dialog.

## Technical notes
- Migration: add `video_url text` and `video_type text` (`link` | `upload`) to `public.offer_campaigns` and `public.products`; no policy changes needed beyond the existing ones.
- New private storage bucket `offer-videos` (used for both offer and product uploads, path-prefixed), with RLS on `storage.objects`: admins can write, signed URLs for reads — matching the existing `banner-images` pattern.
- Files: new `src/components/site/OfferStrip.tsx`, `src/components/site/OfferBlocks.tsx`, `src/components/site/VideoPlayer.tsx`, `src/components/admin/MediaUpload.tsx`; edits to `HeroSlider.tsx`, `SiteLayout.tsx`, `routes/index.tsx`, `routes/shop.tsx`, `routes/products.$slug.tsx`, `routes/offers.tsx`, `components/admin/OffersTab.tsx`, `routes/admin.tsx` (product dialog), `src/lib/offers.ts` (types).
- Uploads capped (~30 MB) with type validation; players are muted/lazy so they never block page load.
