# Walkthrough: Odisha Seeding, Modular Styling, Homepage & SWC Layout Fixes

I have successfully updated the database models, generalized the spatial containment resolving logic, split the CSS styles into modular component files, fixed the homepage layout slideshow, resolved layout collision/overlapping bugs, restored correct SWC component colors/states, and reverted the sidebar navigation design to its original solid-green active state.

---

## 1. SWC Page Top Banner Image & Text Alignment Fixed (No Cutoff)

We resolved a styling conflict and layout alignment bugs highlighted on the SWC (Report Issue) tab inside **[`SwcPage.jsx`](file:///c:/Users/krish/OneDrive/Desktop/swachsahyog/frontend/src/pages/SwcPage/SwcPage.jsx)** and **[`SwcPage.css`](file:///c:/Users/krish/OneDrive/Desktop/swachsahyog/frontend/src/pages/SwcPage/SwcPage.css)**:
- **Class Collision Resolved**: Renamed the container class `.hero-copy` on the SWC Page to `.swc-hero-copy`. This stops it from inheriting the layout rule `.hero-copy { position: absolute; top: 50%; transform: translateY(-50%); max-width: 440px; }` from the Homepage dashboard stylesheet (`DashboardPage.css`), which was overriding the SWC page's relative positioning, reducing its width, causing text to wrap heavily, and clipping it.
- **Restored Background Image**: Restored the `.hero-visual` container and the background `swcHero` image (green bins photo) on the right side of the banner, matching the mockup image design.
- **Dynamic Sizing to Prevent Text Cutoff**: Changed the media query breakpoint inside `SwcPage.css` from `@media(max-width:1100px)` to `@media(max-width:1200px)` and added a `.hero-title { font-size: 42px; }` rule. On laptop screens (where the open sidebar compresses the content width), the title font-size shrinks to `42px`, preventing the text block from overflowing and getting clipped at the top, while keeping the background photo fully visible.
- **Lowered Written Part in Banner**: Increased the `.hero-banner` default `min-height` to `440px` and reduced its padding to `24px 44px` (and `min-height: 440px; padding: 24px 32px 24px 44px;` under `1200px`). Set `margin-top: 36px;` on the renamed `.swc-hero-copy`. This increases the available vertical space inside the banner and shifts the entire written block (eyebrow, title, description, buttons) lower, matching the correct mockup alignment and preventing clipping on all viewports.
- **Card Spacing Restored**: Added a `margin-bottom: 22px !important;` rule to the `.stepper-card` selector inside `SwcPage.css` to restore the required spacing between the stepper card and the main columns below it.

---

## 2. Restored SWC Form Themes, Outline Borders, and Disabled Button Colors

We solved the button and outline color mismatches on the SWC page (Image 2 vs Image 4) by scoping Goutam Soni's original mockup color palette:
- **SWC Theme Variable Scoping**: Scoped Goutam Soni's color variables (such as `--green: #1E8449;`, `--lime: #8ED957;`, `--mint: #EAF6EC;`, and `--border: #E2EFE4;`) directly inside the SWC page's root container `.wrap` selector inside **[`SwcPage.css`](file:///c:/Users/krish/OneDrive/Desktop/swachsahyog/frontend/src/pages/SwcPage/SwcPage.css)**.
- **Why this worked**: In our main design system, `--border` is configured as `#DED9CB` (a sandy-grey color), which caused the `Camera` button outline, disabled state buttons (e.g. `Upload a photo to continue`, `Submit Complaint`), and card borders to render as sandy-grey/brown. Scoping the mockup variables inside `.wrap` restores the correct light mint-green outline border `#E2EFE4` and green text colors `#1E8449` for all input controls and buttons on the SWC page, matching your mockup.

---

## 3. Resolved Sidebar and Dashboard Layout Collisions

We resolved a style namespace collision that was causing the main content area to slide underneath the sidebar:
- **Redundant Global Overrides Cleaned**: Deleted Goutam Soni's monolithic layout styles (resets, body, scrollbars, `.app`, `.sidebar`, `.topbar`, `.hamburger`, and header brand logo selectors) from the beginning of **[`SwcPage.css`](file:///c:/Users/krish/OneDrive/Desktop/swachsahyog/frontend/src/pages/SwcPage/SwcPage.css)**.
- **Why this worked**: `SwcPage.css` was overriding the main layout container `.app` (changing its layout from `display: grid` to `display: flex`) and styling the `.sidebar` to be `position: fixed` globally. Removing these duplicate styles allows the main content to align side-by-side with the sidebar inside the grid columns.

---

## 4. Homepage Layout & Slideshow Overlay Fixes

We resolved the slideshow copy issues inside **[`DashboardPage.jsx`](file:///c:/Users/krish/OneDrive/Desktop/swachsahyog/frontend/src/pages/DashboardPage/DashboardPage.jsx)**:
- **Slide Overlay Restored**: Moved `.hero-overlay`, `.hero-copy`, and `.hero-dots` back inside the `.hero-slideshow` wrapper div, and applied explicit inline layout styles (`position: absolute`, `zIndex`, and gradient background rules) to them. This ensures they stack above the sliding container.
- **Vector CTA Icons**: Replaced the placeholder emojis in the hero action CTA buttons with high-fidelity vector outline SVGs for "Report Waste" and "Give / Sell an Item".

---

## 5. Reverted Sidebar Navigation to Solid Green Active State

We updated **[`sidebar.css`](file:///c:/Users/krish/OneDrive/Desktop/swachsahyog/frontend/src/shared/styles/sidebar.css)**:
- **Restored Active Style**: Reverted the active menu item background back to the solid forest-green gradient (`linear-gradient(135deg, #25A05A, #136B3E) !important`) and white text (`#fff !important`).
- **Restored Icons**: Removed the colorful icon overrides, restoring the clean, unified `currentColor` look for the sidebar menu icons.

---

## 6. Modular CSS Refactoring (CSS Split)

We split the monolithic `style.css` stylesheet into clean, individual, component-level CSS files inside **[`frontend/src/shared/styles/`](file:///c:/Users/krish/OneDrive/Desktop/swachsahyog/frontend/src/shared/styles/)**:
1. **[`global.css`](file:///c:/Users/krish/OneDrive/Desktop/swachsahyog/frontend/src/shared/styles/global.css)**: Resets, typography, variables, buttons, and scrollbars.
2. **[`sidebar.css`](file:///c:/Users/krish/OneDrive/Desktop/swachsahyog/frontend/src/shared/styles/sidebar.css)**: Navigation lists, active state shadows.
3. **[`navbar.css`](file:///c:/Users/krish/OneDrive/Desktop/swachsahyog/frontend/src/shared/styles/navbar.css)**: Topbar loc-pills, badges, mode toggles, and user chips.
4. **[`footer.css`](file:///c:/Users/krish/OneDrive/Desktop/swachsahyog/frontend/src/shared/styles/footer.css)**: Sidebar footer card styling.
5. **[`DashboardPage.css`](file:///c:/Users/krish/OneDrive/Desktop/swachsahyog/frontend/src/pages/DashboardPage/DashboardPage.css)**: Slideshow carousels, maps, categories, and impact stats.
6. **`SwcPage.css`**: Scanner lasers, steppers, and location lock overlays.

---

## 7. Administrative Area Choices & Spatial Resolver

- **Choices Expanded**: Added `ULB_CORP`, `ULB_MUNI`, `ULB_NAC`, `WARD`, `BLOCK`, `PANCHAYAT`, and `VILLAGE` to **[`geography.models.AdministrativeArea`](file:///c:/Users/krish/OneDrive/Desktop/swachsahyog/backend/apps/geography/models.py)** to represent both Odisha's urban municipal wards and rural village/GP administrative hierarchies.
- **PostGIS Resolver**: Updated `resolve_administrative_area(point)` in **[`geography/services.py`](file:///c:/Users/krish/OneDrive/Desktop/swachsahyog/backend/apps/geography/services.py)** to query containing polygons or find the nearest node for both wards and rural villages.
- **Odisha Dataset Seeder**: Added a seed command to populate Khordha district administrative units, departments, authorities, and assigned government officers.
- **End-to-End API Integration**: Connected the SWC page forms to POST image uploads to `/api/v1/evidence/upload/` and tickets to `/api/v1/incidents/reports/`, fully integrated with our local-storage offline fallback interceptor.
