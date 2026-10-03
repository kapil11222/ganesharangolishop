# Festival and Offer Special UI

## Goal
Create a Flipkart/Meesho-style festival experience that automatically turns on for the scheduled offer period and fully returns to the normal shop design when the campaign ends.

## Customer experience
1. **Automatic festival mode**
   - Use the highest-priority active campaign to control the special design.
   - Show an upcoming state with “Offer starts in…” and a live state with “Offer ends in…”.
   - Remove the special theme automatically after the end date or when the admin disables it.
   - Keep product prices, coupons, offer cards, and countdowns connected to the same campaign.

2. **Festival welcome animation**
   - Show a full-screen, mobile-first welcome animation on every fresh website visit, without repeating during normal page-to-page navigation.
   - Support customizable greeting, subtitle, call-to-action, artwork, animation style, duration, and skip button.
   - Upcoming campaigns show the starting countdown; live campaigns show the sale message and ending countdown.
   - Respect reduced-motion accessibility settings and keep the animation short so shopping is not delayed.

3. **Festival-specific visuals**
   - Include polished built-in themes for Diwali, Navratri, Holi, Ganesh Chaturthi, Raksha Bandhan, wedding, New Year, and a neutral sale theme.
   - Examples include diya artwork for Diwali and approved Devi artwork for Navratri.
   - Allow separate desktop/mobile artwork uploads to replace the built-in visual.
   - Apply the selected theme consistently to the welcome screen, top offer bar, home banner accents, offer cards, countdowns, and sale highlights.

## Admin experience
1. Add a **Festival UI** section inside each offer campaign with:
   - Festival theme and built-in artwork selector.
   - Desktop/mobile custom artwork uploads.
   - Welcome animation on/off, animation style, greeting, supporting text, button text, and display duration.
   - Theme colors and decorative effect intensity.
   - Live preview for desktop and mobile before saving.

2. Add a **ChatGPT Template Assistant**:
   - “Copy prompt for ChatGPT” creates a ready-to-use prompt containing the supported template format, campaign details, and validation rules.
   - A paste box accepts only safe JSON generated from that prompt.
   - Validate every field, reject unknown or unsafe content, and show a visual preview before “Apply template”.
   - Never execute pasted HTML, CSS, JavaScript, scripts, external embeds, or event handlers.
   - Include a reset action that restores the selected built-in theme.

3. Add campaign status controls showing exactly when the special UI is upcoming, live, expired, or disabled.

## Data and behavior
- Extend offer campaigns with a validated festival-template JSON object and the required welcome/artwork settings.
- Store only an approved schema: theme preset, semantic color choices, copy, asset URLs, animation preset, duration, and effect intensity.
- Continue using the current campaign priority and scheduling logic so only one campaign owns the sitewide festival experience.
- Ensure expired campaigns cannot leave colors, overlays, or animations active.

## Quality and verification
- Build the welcome overlay as a reusable, lazy visual layer so it does not slow product browsing.
- Test upcoming, live, disabled, and expired campaign transitions.
- Test built-in and uploaded artwork, valid/invalid ChatGPT JSON, preview/reset, skip behavior, and campaign priority.
- Verify the complete experience on mobile first, then desktop, including no clipped text or blocked shopping controls.
- Preserve the current light theme, existing product-offer pricing, translations, and policy behavior.

## Technical notes
- Reuse the existing campaign query, countdown helpers, `sale_mode`, `priority`, and automatic date status.
- Render only predefined React animation/layout presets; the JSON selects values but cannot add executable code.
- Add new Supabase columns with an additive migration and update generated campaign types.
- Use semantic design tokens and CSS variables for campaign styling; clear them whenever festival mode is inactive.
