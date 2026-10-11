---
name: Logistics Express Matrix
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#5b3f46'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#8f6e76'
  outline-variant: '#e4bdc5'
  surface-tint: '#ba005c'
  primary: '#b60059'
  on-primary: '#ffffff'
  primary-container: '#e30071'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb1c5'
  secondary: '#5e5e65'
  on-secondary: '#ffffff'
  secondary-container: '#e4e1ea'
  on-secondary-container: '#64636b'
  tertiary: '#006947'
  on-tertiary: '#ffffff'
  tertiary-container: '#00855b'
  on-tertiary-container: '#f5fff6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffd9e1'
  primary-fixed-dim: '#ffb1c5'
  on-primary-fixed: '#3f001b'
  on-primary-fixed-variant: '#8f0045'
  secondary-fixed: '#e4e1ea'
  secondary-fixed-dim: '#c8c5cd'
  on-secondary-fixed: '#1b1b21'
  on-secondary-fixed-variant: '#47464d'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
  brand-magenta-deep: '#C80062'
  brand-magenta-light: '#FDF2F8'
  surface-canvas: '#F8F9FA'
  surface-card: '#FFFFFF'
  border-card: '#E5E7EB'
  border-selected: '#ED0677'
  badge-cheapest-bg: '#ECFDF5'
  badge-cheapest-text: '#047857'
  badge-fastest-bg: '#EFF6FF'
  badge-fastest-text: '#1D4ED8'
  status-warning-bg: '#FFFBEB'
  status-warning-text: '#B45309'
  service-disabled: '#94A3B8'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 44px
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '800'
    lineHeight: 36px
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 30px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '700'
    lineHeight: 24px
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 22px
  title-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  rate-display:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '800'
    lineHeight: 28px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
  caption:
    fontFamily: Plus Jakarta Sans
    fontSize: 10px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-lg: 1.5rem
  margin: 1rem
  margin-md: 1.5rem
  margin-lg: 2.5rem
  space-2xs: 0.125rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
  space-2xl: 2rem
---

## Brand & Style

This design system is tailored for high-efficiency shipping calculations, side-by-side logistics comparison, and decision engine interfaces serving Indonesian MSME (UMKM) merchants, e-commerce sellers, and retail dispatchers.

The visual style embraces **Modern Logistics Precision**: an interplay of clean functional utility, high information density, and decisive visual hierarchy. The emotional experience balances the punchy, energetic velocity of signature magenta with structured slate-neutral data surfaces. Interfaces eliminate visual noise, enabling fast, high-confidence decisions between delivery tiers (e.g., Reguler, NextDay, SameDay, Cargo).

Key aesthetic principles:
- **Clarity over ornament:** Crisp data tables, scannable rate badges, and transparent pricing breakdowns take center stage.
- **Side-by-side comparability:** Visual weight and vertical alignment harmonize identical data points across multiple tiers (lead times, pickup cutoffs, per-kg surcharges, SLA guarantees).
- **Functional signaling:** Vibrant accent badges instantly highlight optimal choices (cheapest, fastest, best-value) without cluttering the primary operational flow.

## Colors

The color palette is calibrated for fast operational scanning, high-contrast readability under bright warehouse or counter environments, and consistent brand attribution.

- **Primary (`#ED0677`):** The signature electric magenta serves as the singular brand anchor, reserved for primary CTAs ("Pilih Layanan", "Request Pickup"), key selected states, active radio selections, and active pricing emphasis.
- **Secondary (`#1E1E24`):** A deep charcoal slate that grounds typography, primary headers, and rates. It prevents the visual fatigue associated with pure black (`#000000`) while preserving maximum readability.
- **Tertiary (`#10B981`):** Functional emerald green dedicated to economic badges ("Harga Termurah", "Diskon Ongkir", "Hemat 15%").
- **Neutral (`#64748B`):** Cool slate for secondary meta-labels, weight descriptions, ETA subtitles, and structural iconography.

Contextual helper tokens guarantee distinct differentiation during multi-card comparison:
- `badge-fastest-*` provides a crisp sky/indigo indicator for SLA-driven options.
- `status-warning-*` alerts merchants to pickup cutoff limits, COD constraints, or holiday delays.
- `service-disabled` flags out-of-coverage destinations or exceeded weight/dimension limits gracefully.

## Typography

The type scale utilizes **Plus Jakarta Sans** for its exceptional numeric legibility, contemporary geometric balance, and native Indonesian linguistic ergonomics. 

Typography rules for side-by-side comparison:
- **Price Figures (`rate-display`):** Currency symbols (`Rp`) are formatted in weight 600 at a slightly reduced scale (`14px`), while shipping fee figures stay bold and prominent (`24px`, weight 800) to enable instant cost comparisons across columns.
- **Estimated Time of Arrival (ETA):** Displayed prominently under service titles using `title-md` and `headline-sm` with tabular numerals to preserve horizontal alignment across columns.
- **Micro-Copy & Disclaimers:** Restrictions (e.g., "Maks. 50kg", "Cutoff 15:00 WIB") use `body-sm` and `caption` tokens with balanced opacity to prevent information clutter.

## Layout & Spacing

The layout is built upon an 8pt spatial grid designed for high-density logistics dashboards and responsive multi-column shipping cards.

### Desktop & Large Tablet Grid
- **Form Factor (≥ 1024px):** 12-column grid with a centered container (max-width `1200px`), `margin-lg` outer gutter, and `gutter-lg` column separations.
- **Side-by-Side Comparison Layout:** Shipping options display as a 3- or 4-column equal-height comparison matrix. Each column locks internal sections (Header, Delivery Estimate, Price & Discount, Features & Surcharges, Action CTA) to identical vertical baselines using grid subgrid or strict min-height boundaries.

### Mobile & Compact Formats
- **Form Factor (< 768px):** Adapts to a horizontal card carousel with a visible snap-scroll peek (`calc(100% - 48px)`) or a vertical stacked view with collapsible detail drawers, ensuring that UMKM owners can toggle between birds-eye comparison and detailed cost breakdown without horizontal fatigue.
- Internal component density leverages `space-sm` and `space-md` for tighter packing of tabular logistics specs (volumetric weight, insurance fee, COD fee).

## Elevation & Depth

Visual hierarchy uses a refined hybrid of **low-contrast borders** and **targeted ambient drop shadows**, avoiding heavy skeuomorphism in favor of clear data prioritization.

1. **Resting State Cards:** Flat surface (`#FFFFFF`) framed by a subtle 1px border (`#E5E7EB`). No drop shadow is applied to avoid clutter when 3 to 4 cards are viewed side by side.
2. **Hover & Interactive State:** The border shifts toward neutral slate (`#CBD5E1`), accompanied by an ambient soft shadow: `box-shadow: 0 4px 14px -2px rgba(30, 30, 36, 0.08)`.
3. **Selected / Recommended State:** Marked with an active brand border (`2px solid #ED0677`) and an extra-soft magenta-tinted ambient glow: `box-shadow: 0 8px 24px -4px rgba(237, 6, 119, 0.12)`.
4. **Sticky Quick-Summary Bar / Floating Actions:** Uses an elevated surface layer with crisp separation: `box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.06)` and a 1px top border.

## Shapes

The interface balances sharp enterprise clarity with modern approachable curves through level-2 roundedness (`0.5rem` / `8px` baseline).

- **Standard Cards & Side-by-Side Tiers:** `0.75rem` (12px) corner radius to create self-contained structural cards.
- **Form Inputs, Search Selectors, & Location Selectors:** `0.5rem` (8px) corner radius.
- **Badges & Tags ("Harga Termurah", "Same Day SLA"):** Pill-style `624rem` (9999px) or semi-rounded `0.375rem` (6px) to cleanly contrast against standard card corners.
- **Action Buttons:** `0.5rem` (8px) for secondary and inline buttons; fully rounded pills are avoided on primary transaction controls to maintain the professional utility feel.

## Components

### 1. Comparison Cards (Side-by-Side Matrix)
- **Structure:** Equal-height vertical card with 5 standardized zones:
  - *Zone A (Header):* Service logo/title (e.g., "Anteraja Reguler", "Anteraja Next Day"), speed indicator, and floating badge slots ("Termurah", "Paling Cepat").
  - *Zone B (Lead Time & SLA):* Visual route timeline with estimated arrival date and guaranteed delivery window.
  - *Zone C (Pricing Display):* Primary nominal fee, crossed-out original rates (if discounted), and volumetric vs. actual chargeable weight pill.
  - *Zone D (Service Highlights):* Bulleted feature matrix with check/cross icons (Free Pickup, COD Support, Asuransi Barang, Real-time Tracking).
  - *Zone E (CTA Anchor):* "Pilih Layanan" button, consistently anchored at the card bottom across all columns.
- **States:** Default, Hover, Selected (Magenta border + soft tint header), and Disabled/Unavailable (50% opacity, descriptive reason chip: "Melebihi Kapasitas Wilayah").

### 2. Service Highlight Badges & Chips
- **Cheapest ("Harga Termurah"):** Background `#ECFDF5`, text `#047857`, icon `CheckCircle` or `TrendingDown`.
- **Fastest Delivery:** Background `#EFF6FF`, text `#1D4ED8`, icon `Zap`.
- **Promo / Merchant Special:** Background `#FDF2F8`, text `#ED0677`, border `#FCE7F3`.

### 3. Rate Inputs & Route Selectors
- Origin & destination selector with inline badge tags (e.g., "Kec. Tebet, Jaksel -> Kec. Sukasari, Bandung").
- Weight & Dimension calculator with quick-toggle tabs: "Paket Kecil (< 1kg)", "Sedang (1-5kg)", "Kargo (> 10kg)".
- Focus state: Ring `2px solid #ED0677` with an offset of `2px`.

### 4. Interactive Radios & Select Checkpoints
- Custom radio selector positioned in the upper right corner of each card column.
- Selected state turns vibrant `#ED0677` with an inner white pip, triggering the card active frame.

### 5. Quick-Filter Bar
- Top-level sorting toggles: "Semua", "Termurah", "Tercepat", "Bisa COD", "Layanan Kargo".
- Active pills use `#1E1E24` background with white text; unselected pills use `#FFFFFF` with `#E5E7EB` border.