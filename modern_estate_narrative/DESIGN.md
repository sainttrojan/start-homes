---
name: Modern Estate Narrative
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#4d4635'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#7f7663'
  outline-variant: '#d0c5af'
  surface-tint: '#735c00'
  primary: '#735c00'
  on-primary: '#ffffff'
  primary-container: '#d4af37'
  on-primary-container: '#554300'
  inverse-primary: '#e9c349'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e5e2e1'
  on-secondary-container: '#656464'
  tertiary: '#32618f'
  on-tertiary: '#ffffff'
  tertiary-container: '#8ab7e9'
  on-tertiary-container: '#104874'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffe088'
  primary-fixed-dim: '#e9c349'
  on-primary-fixed: '#241a00'
  on-primary-fixed-variant: '#574500'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c9c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474646'
  tertiary-fixed: '#d0e4ff'
  tertiary-fixed-dim: '#9dcafe'
  on-tertiary-fixed: '#001d35'
  on-tertiary-fixed-variant: '#134975'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
  pure-white: '#FFFFFF'
  border-gray: '#E5E7EB'
  badge-gold-bg: '#FFF8E7'
  badge-gold-text: '#996515'
  success-green: '#00C250'
typography:
  display-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Be Vietnam Pro
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Be Vietnam Pro
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1200px
  gutter: 24px
  margin-desktop: 48px
  margin-mobile: 16px
  base-unit: 8px
---

## Brand & Style
The design system is defined by a **High-Contrast Modern** aesthetic that balances the utilitarian clarity of premium real estate platforms with the prestige of a luxury concierge service. The brand personality is professional, efficient, and sophisticated, designed to instill confidence in high-value transactions.

The visual direction moves away from "dark-mode-first" toward a **Minimalist Corporate** architecture. It utilizes expansive white space, sharp typographic hierarchies, and "Metallic Gold" accents to create a gallery-like environment for property listings. The goal is to evoke a sense of clarity and premium accessibility, ensuring that photography and property data remain the primary focus.

## Colors
This design system utilizes a high-contrast palette to drive user action and establish hierarchy.

- **Backgrounds:** The primary canvas is Pure White (#FFFFFF), using Ultra Light Gray (#F8F9FA) to define secondary sections, such as search filters or layout groupings.
- **Accents & Headers:** Deep Jet Black (#0D0D0D) is reserved for high-impact structural elements including banners, global footers, and primary headings to provide a grounded, authoritative frame.
- **Actions:** Metallic Gold (#D4AF37) is the primary action color, used exclusively for conversion points and interactive states.
- **Functional States:** A deep "Nawy" Navy (#275885) is used for secondary information or trust-based components, while Success Green (#00C250) handles positive status indicators.

## Typography
The system utilizes **Be Vietnam Pro** for its geometric clarity and exceptional readability in both English and modern Arabic contexts. 

The hierarchy emphasizes bold, impactful headers in Deep Jet Black to guide the user's eye. Body text is set with generous line-height to ensure that property descriptions and technical data are easily digestible. For the Egyptian market, all typography and layouts are fully mirrored for **Right-to-Left (RTL)** support, maintaining the same optical weight and spacing logic.

## Layout & Spacing
The layout follows a disciplined **12-column fluid grid** with a maximum container width of **1200px** to ensure content remains focused and readable on large displays.

- **Desktop:** 12 columns, 24px gutters, 48px margins.
- **Tablet:** 8 columns, 24px gutters, 32px margins.
- **Mobile:** 4 columns, 16px gutters, 16px margins.

Spacing follows an 8px rhythmic scale. We use generous vertical padding (64px+) between major sections to maintain a premium, uncluttered feel. RTL alignment is the default state, with all horizontal spacing and grid ordering reversed accordingly.

## Elevation & Depth
This design system prioritizes a flat, architectural depth model over heavy shadows.

- **Tonal Layering:** Hierarchy is primarily established by shifting between Pure White and Ultra Light Gray surfaces.
- **Low-Contrast Outlines:** Subtle 1px borders in Light Gray (#E5E7EB) are used to define cards and containers.
- **Interactive Glow:** Depth is introduced dynamically during interaction. When hovering over cards or buttons, a soft Gold (#D4AF37) outer glow (15-20% opacity) is used instead of a traditional drop shadow to signal engagement.
- **Glassmorphism:** Navigation bars use a 12px backdrop blur with 90% opacity white background to maintain context while scrolling through vibrant property imagery.

## Shapes
The system uses a **Rounded** (0.5rem) shape language to soften the high-contrast color palette, making the interface feel approachable yet modern.

- **Standard Elements:** Inputs, cards, and containers use 0.5rem (8px).
- **Badges:** Utilize a **Pill-shaped** (full) roundedness to distinguish status indicators from functional buttons.
- **Buttons:** Maintain the standard 0.5rem roundedness for a consistent, structured feel.

## Components
- **Buttons:** 
  - *Primary:* Metallic Gold (#D4AF37) background with #0D0D0D text. On hover, the text remains dark, but the background brightness increases slightly with a soft Gold glow.
  - *Secondary:* Transparent with a 1.5px Jet Black border.
- **Cards:** Pure White background with a 1px Light Gray border. Hovering triggers a transition to a subtle Gold border and a soft Gold glow.
- **Badges:** Pill-shaped with a light Gold background (#FFF8E7) and dark Gold text (#996515). These are used for property status (e.g., "Ready to Move," "Exclusive").
- **Input Fields:** Ultra Light Gray (#F8F9FA) fill with a 1px Light Gray border. The border transitions to Gold on focus.
- **Dividers:** 1px solid lines in Light Gray (#E5E7EB), used sparingly to separate content modules.
- **Navigation:** Deep Jet Black background for high-impact global headers with Metallic Gold active states. Desktop navigation should use the "Label-MD" typography.