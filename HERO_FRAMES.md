# Hero Frames (Desktop & Mobile)

## Desktop (reference: 1200x600)
- Full-bleed imagery with top-to-bottom gradient overlay (60%→0%)
- Headline: 32–44px bold; Subhead: 14–18px
- CTA primary button aligned with text block
- Dots centered bottom; Prev/Next top-right (sm)

## Mobile
- Height: ~44vw (min 240px)
- Headline: 24–28px, Subhead: 14–16px
- Safe padding: 16–24px
- Dots comfortably tappable

## Implementation
- Component: `components/hero/HeroCarousel.tsx`
- Data: `/api/hero` and `public/hero/slides.json`
- Priority: first 1–2 images use Next/Image `priority`
- Pause on hover and respects `prefers-reduced-motion`