# Bingo AI Academy — "AI-Powered Education Franchise" Web Optimization Recommendations

> Based on the "AI-Powered Education Franchise Entry" design doc, refined for **web (brand site)** implementation. App, PC admin, and offline touchpoints are briefly noted; not expanded here.

---

## 1. Web Positioning & Principles

- **Positioning**: Core public-channel lead magnet; converts "show franchise value → capture interest → redirect to app/consultation."
- **Principles**: B2B focus, light content, visual value, minimal friction; emphasize **AI empowerment, asset-light franchise, end-to-end support**.
- **Multi-channel**: Site and app franchise content aligned; footer: "Jump to app application" and "Contact now" for public → private conversion.

---

## 2. Entry Points (Changes on Current Site)

### 2.1 Homepage

| Location | Current | Recommendation |
|----------|---------|----------------|
| **Hero carousel** | 5 items (courses, events, charity, industry-edu, referral) | **Add 1**: Franchise item, e.g. "AI-Powered Education Franchise", sub-title "Asset-light entry, full support", link to `/join`. |
| **Fixed banner** | None | **Optional**: Fixed franchise banner below carousel or above mission, e.g. "AI-powered education franchise, asset-light entry into huge market", link `/join`. |
| **Core entry cards** | 6 cards | **Optional**: Add **"Franchise"** card, main copy "AI-Powered Franchise", sub "For institutions / startups", link `/join`. |

### 2.2 Top Nav

| Item | Recommendation |
|------|----------------|
| **Primary nav** | Add **"Franchise"** (e.g. between "Industry-Education" and "AI Mall"), path `/join`. |
| **Dropdown** | On hover/click: Advantages, Partnership Modes, Support Policy, Apply. |

### 2.3 Footer

- In "B2B" area, add **"Education Franchise"** link to `/join`, alongside Schools, Franchisees, Event Partners.

---

## 3. Franchise Landing Page Structure

**Routes**: `/join` (main), optional `/join/apply`, `/join/consult`; or single page with anchors.

**Flow**: Value → Modes → Support → Apply → Status/Contact.

### 3.1 Hero (Value Overview)

- **Header**: Brand logo + slogan (e.g. "Bingo AI Academy · AI-powered education, one-stop upgrade").
- **3 value tags**: AI empowerment / Asset-light / Full support.
- **CTAs**: **"Apply now"** (primary), **"Contact"** (secondary); sticky where appropriate.

### 3.2 AI Core Value

- 4 cards: AI curriculum, AI teaching tools, AI operations, AI brand.

### 3.3 Franchise Benefits

- 6 short points (e.g. 0 franchise fee, AI tech included, full support, asset-light, brand license, data-driven).

### 3.4 Partnership Modes

- 3 tiers: Basic / Standard / Premium; conditions, support stages, investment vs return, FAQ.

### 3.5 Case Studies

- 3–5 cases: institution, region, before/after, outcomes.

### 3.6 Application Flow

- 5 steps: Apply → Review → Site visit → Contract → Launch.

### 3.7 Application Form

- ≤8 required fields, validation; post-submit: success message + consultant contact (WeChat QR).

### 3.8 Bottom Conversion

- Repeat **Apply** + **Contact**; hotline; "Jump to app to apply" for public → private.

---

## 4. Online Consult & Status

- In-app or embedded chat; or "Book 1-on-1" form.
- PDF downloads (handbook, policy) without lead gate.
- If logged in: "My Franchise Application" with status; otherwise redirect to app.

---

## 5. Visual & UX

- Keep brand colors; add **red** for conversion; B2B, clean; click targets ≥48px; responsive; fast load.

---

## 6. Multi-Channel Alignment

- Content aligned across site and app; data synced with admin; app URL Scheme / QR for redirects; backend account creation for new leads.

---

## 7. Implementation Checklist

| # | Task |
|---|------|
| 1 | Add "Franchise" to nav + dropdown |
| 2 | Add franchise carousel item on homepage |
| 3 | Optional banner/card on homepage |
| 4 | Footer franchise link |
| 5 | Build `/join` landing (hero, value, benefits, modes, cases, flow, form, CTAs) |
| 6 | Form validation, success modal, consultant QR |
| 7 | "Jump to app" button |
| 8 | Optional: "My Franchise Application" for logged-in users |
| 9 | Visual & responsive QA |
