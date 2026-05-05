---
name: Student Finance Wallet
colors:
  surface: '#faf9fc'
  surface-dim: '#dbd9dd'
  surface-bright: '#faf9fc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f6'
  surface-container: '#efedf0'
  surface-container-high: '#e9e7eb'
  surface-container-highest: '#e3e2e5'
  on-surface: '#1a1c1e'
  on-surface-variant: '#43474e'
  inverse-surface: '#2f3033'
  inverse-on-surface: '#f2f0f3'
  outline: '#74777f'
  outline-variant: '#c4c6cf'
  surface-tint: '#476083'
  primary: '#000613'
  on-primary: '#ffffff'
  primary-container: '#001f3f'
  on-primary-container: '#6f88ad'
  inverse-primary: '#afc8f0'
  secondary: '#50606f'
  on-secondary: '#ffffff'
  secondary-container: '#d1e1f4'
  on-secondary-container: '#556474'
  tertiary: '#000802'
  on-tertiary: '#ffffff'
  tertiary-container: '#00250e'
  on-tertiary-container: '#119b50'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d4e3ff'
  primary-fixed-dim: '#afc8f0'
  on-primary-fixed: '#001c3a'
  on-primary-fixed-variant: '#2f486a'
  secondary-fixed: '#d4e4f6'
  secondary-fixed-dim: '#b8c8da'
  on-secondary-fixed: '#0d1d2a'
  on-secondary-fixed-variant: '#394857'
  tertiary-fixed: '#83fba5'
  tertiary-fixed-dim: '#66dd8b'
  on-tertiary-fixed: '#00210c'
  on-tertiary-fixed-variant: '#005227'
  background: '#faf9fc'
  on-background: '#1a1c1e'
  surface-variant: '#e3e2e5'
typography:
  h1:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h2:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  h3:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: '0'
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  body-sm:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  label-bold:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.05em
  data-mono:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: -0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin: 24px
  container-max: 1200px
---

## Brand & Style

This design system is engineered to bridge the gap between academic life and financial maturity. The brand personality is **authoritative yet accessible**, aiming to instill a sense of fiscal responsibility in students without the intimidating opacity of traditional banking. 

The aesthetic follows a **Modern Corporate** direction. It prioritizes clarity and high-density information management through a structured, systematic approach. By utilizing a restrained color palette and generous whitespace, the interface reduces the cognitive load associated with complex financial data, such as tuition tracking, student loan balances, and daily spending. The emotional response should be one of "controlled clarity"—users should feel that their finances are organized, transparent, and securely managed.

## Colors

The color strategy centers on **Deep Navy (#001F3F)** as the anchor, providing the "trust factor" essential for financial applications. **Slate Grey (#708090)** serves as the primary functional color for secondary information, borders, and UI iconography, ensuring the interface feels modern rather than dated.

**Emerald Green (#50C878)** is reserved strictly for "Cleared" statuses, positive balances, and successful transaction confirmations. This high-signal usage ensures that "green" is always synonymous with financial health. The neutral palette uses soft off-whites and cool greys to maintain a crisp, clean environment that allows the primary navy and emerald accents to stand out effectively.

## Typography

**Manrope** is the sole typeface for this design system, chosen for its modern, geometric construction and exceptional legibility in data-heavy contexts. It strikes a balance between professional banking and a contemporary tech startup.

- **Headlines:** Use Bold weights with slight negative letter-spacing to create a strong visual anchor for page titles and account totals.
- **Data Display:** For currency and balances, use the semi-bold weight to ensure these figures are the first thing a user sees.
- **Micro-copy:** Labels for status updates and transaction dates utilize a small, bold, uppercase style to differentiate metadata from primary body text.

## Layout & Spacing

This design system employs a **12-column fluid grid** for desktop and a **4-column fluid grid** for mobile. The layout philosophy relies on a strict 8px rhythmic scale to ensure consistent alignment of complex data tables and transaction lists.

Spacing is used as a tool for grouping: tight spacing (8px) for related data points (e.g., merchant name and date), and larger spacing (24px+) to separate distinct financial modules (e.g., "Monthly Budget" vs. "Recent Activity"). Content should be contained within clear margins to prevent information from feeling cluttered or overwhelming.

## Elevation & Depth

To maintain a "Professional FinTech" look, depth is achieved through **Tonal Layering** supplemented by **Ambient Shadows**. 

- **Level 0 (Background):** The base layer is a soft neutral grey (#F8FAFC).
- **Level 1 (Cards):** Primary containers for information use a pure white surface with a 1px Slate Grey border at 10% opacity.
- **Level 2 (Interaction):** Active elements or hovered cards utilize a subtle, diffused shadow (Blur: 12px, Y: 4px, Color: Deep Navy at 5% opacity) to signify lift without appearing "gamey" or overly soft.
- **Floating Elements:** Modals and dropdowns use a more pronounced shadow (Blur: 24px, Y: 8px, Color: Deep Navy at 10% opacity) to provide clear separation from the data layers below.

## Shapes

The shape language for this design system is defined as **Rounded (Level 2)**. This means a base border-radius of **8px (0.5rem)** for standard components like buttons, input fields, and small cards.

Larger containers, such as the main wallet dashboard or educational modules, utilize **16px (1rem)** for a softer, more modern structural feel. This level of roundedness avoids the coldness of sharp corners while maintaining enough structure to feel like a serious financial institution. It is approachable for students but disciplined enough for banking.

## Components

### Buttons
- **Primary:** Deep Navy background with white text. High contrast, reserved for the "Main Action" (e.g., Transfer Funds, Pay Bill).
- **Secondary:** Transparent background with a 1px Slate Grey border. Used for "Cancel" or "View Details."
- **Success:** Emerald Green background used sparingly for "Submit Payment" or "Resolve Issue."

### Chips & Status Indicators
- **Cleared Chip:** Emerald Green background (15% opacity) with Emerald Green text. Used for processed transactions.
- **Pending Chip:** Slate Grey background (15% opacity) with Slate Grey text.
- **Overdue Chip:** Error Red background (10% opacity) with Error Red text.

### Input Fields
- Inputs feature a 1px border in Slate Grey. On focus, the border shifts to Deep Navy with a 2px soft glow in the same color (at 10% opacity). Labels are always persistent to ensure students understand exactly what information is being requested.

### Cards
- Financial summaries are housed in cards with an 8px radius. Use a light Slate Grey top-border (2px) to denote different categories of finance (e.g., Savings vs. Checking).

### Lists
- Transaction lists use a "Zebra" stripe pattern or 1px bottom borders in Slate Grey (at 5% opacity) to maintain horizontal scanability across large amounts of data.

### Additional Components
- **Progress Bars:** Thin, 4px tall bars in Emerald Green to track savings goals or budget limits.
- **Data Sparklines:** Small, simplified line charts in Deep Navy used within cards to show 7-day spending trends.