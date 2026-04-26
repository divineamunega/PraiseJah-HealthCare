# Design System Strategy: Clinical Precision

## 1. Overview & Creative North Star: "The Digital Surgeon"

The Creative North Star for this system is **The Digital Surgeon**. This is not a generic SaaS interface; it is a high-performance instrument. It balances the "high-fidelity" aesthetic of Linear with the uncompromising clarity of medical-grade hardware.

We break the "template" look through **intentional density**. While most modern apps fear data, this system embraces it, treating information as a premium asset. We use a "Clinical Layout" strategy: generous perimeter breathing room to reduce cognitive load, paired with hyper-efficient, dense data centers. The experience should feel like a sterile, well-lit operating room: dark, focused peripheries focusing the eye onto brilliantly lit, high-contrast diagnostic surfaces.

---

## 2. Colors & Surface Logic

The palette is rooted in a deep, nocturnal base that makes the "Medical Blue" and "Crisp White" surfaces pop with surgical intensity.

### The "No-Line" Rule

Traditional 1px borders are artifacts of old design. In this system, **borders are prohibited for sectioning.** Physical boundaries must be established through tonal shifts. A sidebar is not "lined" off; it is simply `surface_container_low` sitting against a `background` floor. This creates a seamless, more architectural feel.

### Surface Hierarchy & Nesting

Treat the UI as a series of nested trays.

- **The Floor (`background` / #111319):** The primary canvas.
- **The Workstation (`surface_container_low` / #191b22):** Used for large navigation or grouping areas.
- **The Diagnostic Card (`surface` / #FFFFFF):** For critical content areas where "Clinical Precision" is required.
- **The Interaction Layer (`surface_bright` / #373940):** For temporary states like hovered items or active command palette rows.

### The "Glass & Tonal" Rule

While the user requested "no gradients," we apply **Signature Textures** through depth. Use Glassmorphism (60% opacity with 12px backdrop-blur) for floating command palettes and modal overlays. This ensures that even in a dark environment, the user never loses their spatial orientation.

---

## 3. Typography: Authoritative Clarity

We utilize a dual-type system to bridge the gap between "Modern SaaS" and "Technical Tool."

- **Primary:** **Inter Variable** (75% usage). This is our clinical workhorse.
  - _Display & Headlines:_ Use tighter letter-spacing (-0.02em) and Semi-Bold weights to create an editorial, "Linear-esque" feel.
  - _Body:_ Use `body-md` (#0.875rem) with a 1.5 line-height for maximum readability in data-heavy views.
- **Secondary:** **Berkeley Mono** (25% usage). This is our "Technical Signature." Use this for IDs, timestamps, status codes, and data-table values. It signals to the user that this specific information is precise and immutable.

**Hierarchy Goal:** Large, low-contrast headlines (`headline-sm` in `on_surface_variant`) paired with high-contrast, compact data labels.

---

## 4. Elevation & Depth: Tonal Layering

We move away from the "shadow-heavy" look of 2010s SaaS. Depth is achieved via **Tonal Stacking**.

- **The Layering Principle:** To lift a component, don't add a shadow; shift its token. A `surface_container_highest` element placed on a `surface_container_low` background creates a natural, sophisticated "lift."
- **Ambient Shadows:** For floating elements (Modals, Popovers), use "Surgical Shadows."
  - _Shadow:_ `0 20px 50px -12px rgba(0, 0, 0, 0.5)`
  - _Tint:_ Ensure the shadow has a 2% blue tint to match the `primary` accent.
- **The Ghost Border:** If a boundary is required for accessibility (e.g., in high-density tables), use `outline_variant` at **15% opacity**. It should be felt, not seen.

---

## 5. Components: Functional Purity

### Buttons

- **Primary:** `primary_container` (#2563EB) background with `on_primary_container` text. Hard corners (`DEFAULT` 0.25rem). No gradients.
- **Tertiary:** Purely text-based. Use `Berkeley Mono` for an "Action Code" feel.

### Status & Role Badges

Forgo the "pill" shape. Use **Rectangular Clips** with a `sm` (0.125rem) radius.

- _Styling:_ Subtle background (`secondary_container`) with high-contrast text. Use `label-sm` in Berkeley Mono for a "Medical Tag" aesthetic.

### Command Palette & Navigation

- **Sidebar:** Use `surface_container_lowest` for the background. Active states should be indicated by a `primary` (#2563EB) vertical sliver (2px) on the left—no background fill change.
- **Command Palette:** High-blur glassmorphism (`surface_variant` at 80% opacity). Minimal Lucide icons.

### Data Tables & Lists

- **The Divider Ban:** Strictly forbid horizontal lines between rows. Use `8px` of vertical padding and a subtle `surface_container_high` background shift on hover.
- **Density:** Use `body-sm` for table content to maximize "At-a-glance" diagnostic capability.

### Clinical Modals

Slide-in panels from the right should use `surface` (#FFFFFF) to provide a stark, high-contrast focus shift from the dark application background.

---

## 6. Do’s and Don’ts

### Do

- **Do** use `Berkeley Mono` for any value that can be measured or counted.
- **Do** use negative letter-spacing on headlines for a premium, "compressed" editorial look.
- **Do** allow content to hit the edges of containers if it creates a clean, "flush" alignment.
- **Do** use "Medical Blue" (#2563EB) sparingly as a surgical laser—only for primary calls to action or critical status.

### Don't

- **Don't** use standard 400-weight Inter for everything; it looks "out-of-the-box." Lean into 500 and 600 for hierarchy.
- **Don't** use large corner radii. Stick to `DEFAULT` (4px) or `sm` (2px) to maintain a professional, "tooled" feel.
- **Don't** use pure black (#000000). Use `surface_container_lowest` (#0c0e14) to maintain tonal depth.
- **Don't** use dividers. If the layout feels messy, increase the `spacing` scale rather than adding a line.
