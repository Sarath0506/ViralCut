# ViralCut — Stitch prompts: Brand Web Portal

**Use in a new Stitch project:** “ViralCut — Brand Portal (Web)”  
**Viewport:** Desktop **1440×900** (also note tablet **1024×768** in prompts where layout matters)  
**Reference:** Creator mobile screens in sibling project / `design/stitch/mobile-creator/` — **match purple + green system, Inter typography, professional India fintech tone**

**How to use**

1. Paste **§0 Master context** once at project start (or into DESIGN.md).
2. Paste **§1 DESIGN.md prompt** → export DESIGN.md from Stitch.
3. Generate screens in order **§3** (auth → dashboard → campaign wizard → review → settings).
4. For each screen, use the **full prompt block** (includes UX, business, data, and edge cases).
5. Optional: paste **§4 Stitch Loop** to batch-generate remaining pages with consistency.

---

## §0 — Master context (paste first)

```
You are designing the ViralCut BRAND PORTAL — a desktop web application (NOT mobile).

PRODUCT
ViralCut is an India-first creator monetization platform. Creators (clippers) use a MOBILE app to discover campaigns, post Instagram Reels / YouTube Shorts, and earn ₹ per 1,000 views. BRANDS use THIS WEB PORTAL to create campaigns, set budgets, write briefs, review creator submissions, approve content, and track spend vs performance.

BRAND USERS (personas)
1. Brand Marketing Manager — creates campaigns, writes briefs, reviews clips daily.
2. Agency Operator — manages multiple brand accounts, needs fast queues and filters.
3. Finance / Admin — cares about budget caps, invoices, export, who approved payouts.
4. Legal / Compliance — needs audit trail, DO/AVOID rules, content policy visibility.

CORE BRAND JOBS-TO-BE-DONE
- Post a campaign with CPV (₹ per 1K views), max payout, total budget pool, deadline.
- Upload or link brand assets (logo, product page, reference reel).
- Review creator submissions in two phases: (A) creative draft approval, (B) live reel URL verification.
- Monitor pool consumption (% budget claimed), views, estimated creator earnings.
- Pause / close campaigns; reject with reason; request resubmission.
- Invite teammates; manage roles (Admin, Reviewer, Viewer).

DESIGN SYSTEM (match creator app)
- Primary purple: #630ED4 / #7C3AED — CTAs, active nav, links.
- Success / money green: #006C49, earnings #16A34A — positive metrics, “Live”, “Approved”.
- Warning orange: urgency, budget low, pending KYC-style alerts.
- Error red: rejections, validation.
- Neutrals: surface #F8F9FF, deep navy #0F172A for dark cards, text #0B1C30.
- Fonts: Inter (UI), Plus Jakarta Sans (headlines). Material Symbols Outlined icons.
- Style: Clean B2B SaaS + consumer fintech polish; rounded-xl cards; subtle shadows; data-dense tables on desktop; NO playful cartoon UI.

LOCALIZATION
- Currency: Indian Rupee (₹) everywhere. Use “L” for lakhs in summaries (e.g. 4.1L views).
- Example brands in mock data: boAt, Zepto, CRED, Myntra (Indian market).
- Date format: 10 May 2026, 2:30 PM IST.

LAYOUT PATTERNS (web)
- Left sidebar navigation (collapsible): Dashboard, Campaigns, Submissions, Analytics, Billing, Settings.
- Top bar: global search, notifications bell, brand switcher (agency), user avatar.
- Content max-width ~1200px inside main area; use tables, filters, split panels for review.
- Wizards: horizontal stepper for Create Campaign (4 steps).

DO NOT
- Design mobile-first frames (this is desktop brand portal only).
- Copy creator bottom-tab navigation.
- Use USD or generic Western placeholder brands.

OUTPUT
High-fidelity desktop UI, production-ready, Tailwind-friendly HTML. Include realistic Indian mock data.
```

---

## §1 — DESIGN.md prompt

```
Create a DESIGN.md for the ViralCut Brand Web Portal that an AI coding agent can follow.

Include:
- Brand voice (professional, clear, India market)
- Color tokens with hex (primary purple, green money, orange warning, semantic backgrounds)
- Typography scale (Inter + Plus Jakarta Sans)
- Spacing, radius, shadow rules
- Components: sidebar, top bar, data table, status pills (DRAFT, LIVE, PAUSED, UNDER REVIEW, APPROVED, REJECTED), progress bars for budget pool, stepper, empty states, modals, toast notifications
- Form patterns: labels, validation, helper text
- Chart style for analytics (line/bar, purple + green)
- Accessibility: contrast, focus rings, min touch 44px for tablet
- Do / Don’t examples

Align visually with ViralCut creator mobile app (purple CTAs, green rupee amounts, dark earnings-style cards adapted for dashboard KPI strips).
```

---

## §2 — Information architecture (reference)

| # | Screen | Route (suggested) |
|---|--------|-------------------|
| 1 | Marketing landing (optional) | `/` |
| 2 | Brand login | `/login` |
| 3 | Brand sign up | `/signup` |
| 4 | Forgot password | `/forgot-password` |
| 5 | Dashboard | `/dashboard` |
| 6 | Campaigns list | `/campaigns` |
| 7 | Create campaign — Step 1 Basics | `/campaigns/new` |
| 8 | Create campaign — Step 2 Brief & rules | `/campaigns/new/brief` |
| 9 | Create campaign — Step 3 Payout & budget | `/campaigns/new/payout` |
| 10 | Create campaign — Step 4 Review & publish | `/campaigns/new/review` |
| 11 | Campaign detail (live) | `/campaigns/[id]` |
| 12 | Submissions queue | `/submissions` |
| 13 | Submission review (split view) | `/submissions/[id]` |
| 14 | Analytics | `/analytics` |
| 15 | Billing & invoices | `/billing` |
| 16 | Settings — Brand profile | `/settings/brand` |
| 17 | Settings — Team & roles | `/settings/team` |
| 18 | Settings — Notifications | `/settings/notifications` |
| 19 | Empty: no campaigns | (state) |
| 20 | Empty: no submissions | (state) |

---

## §3 — Screen prompts (copy one block per Stitch screen)

### 3.1 Brand login

```
Screen: Brand Login — ViralCut Brand Portal
Viewport: 1440×900 desktop

Design a split-layout login page for brand partners (not creators).
Left panel (40%): ViralCut logo, headline "Run campaigns. Get authentic clips.", subcopy about performance-based creator marketing in India, purple gradient or product illustration showing campaign → creators → views.
Right panel (60%): Form with WORK EMAIL, PASSWORD, "Remember me", "Forgot password?", primary CTA "Log in to Brand Portal", divider "or", secondary "Continue with Google" (Workspace style). Footer link "New brand partner? Request access" / "Sign up".

Perspectives to satisfy:
- UX: clear error state under fields; show password toggle; disabled CTA until valid.
- Security: "Your session is secure" subtle note; no phone OTP (brands use email).
- Business: distinguish from creator app — badge "Brand Portal" in header.
- Edge: account locked message; wrong-domain email hint (@company.com).

Match ViralCut purple #630ED4, Inter font, professional SaaS.
```

### 3.2 Brand sign up / request access

```
Screen: Brand Sign Up — Request Access
Viewport: 1440×900

Multi-field registration for new brand partners:
Company name, Brand display name, Website URL, Industry category (dropdown: Electronics, Quick Commerce, Fintech, Fashion, Entertainment, Other), Work email, Phone (+91), Password, How did you hear about us?
Checkbox: agree to Terms & Brand Guidelines.
Primary CTA: "Submit application" (approval workflow — not instant access).
Side panel explains: CPV campaigns, review workflow, India creators.

Perspectives:
- Legal: Terms + Privacy links.
- Ops: "Applications reviewed within 24–48 hours" expectation.
- UX: inline validation, industry icons optional.
- Business: optional GSTIN / Company PAN field for Indian invoicing (collapsed "Billing details").
```

### 3.3 Brand dashboard

```
Screen: Brand Dashboard — ViralCut Brand Portal
Viewport: 1440×900 with left sidebar + top bar

SIDEBAR: Dashboard (active), Campaigns, Submissions, Analytics, Billing, Settings.
TOP BAR: search "Search campaigns, creators…", notifications (3), brand avatar "boAt Marketing".

MAIN:
- Greeting: "Good afternoon, Priya" + brand logo boAt
- KPI row (4 cards): Active campaigns (4), Total spend this month (₹8.4L), Pending reviews (12), Avg CPV (₹52/1K views)
- Chart: Spend vs views last 30 days (line chart)
- Table "Campaigns needing attention": columns Campaign, Status, Pool used, Pending submissions, Ends in, Action — rows with URGENT tag, progress bars 82% pool used
- Right column: "Review queue" list — 5 items with creator handle, campaign name, status UNDER REVIEW, "Review" button
- Quick action FAB or button: "+ New campaign"

Perspectives:
- Marketing manager: scannable priorities, red/orange for urgent.
- Finance: spend MTD prominent, link to Billing.
- Agency: brand switcher in top bar (dropdown "boAt | Zepto | CRED").
- Empty state variant note in corner: "No campaigns yet — Create your first"

Dark KPI card optional for "Total spend" mirroring creator app earnings card style.
Indian ₹, realistic data.
```

### 3.4 Campaigns list

```
Screen: Campaigns List — Brand Portal
Viewport: 1440×900, sidebar nav

Header: "Campaigns" + primary "+ New campaign" + secondary "Export CSV"
Filters row: Status (All, Draft, Live, Paused, Ended), Category, Date range, Search.
Data table columns:
- Campaign (thumb + name + category)
- Status pill (LIVE green, DRAFT gray, PAUSED orange, ENDED slate)
- CPV rate (₹50/1K)
- Budget cap (₹50,000)
- Pool used (progress bar %)
- Submissions (approved / total)
- Ends in
- Row actions menu (⋯): View, Edit, Pause, Duplicate, Close

Show 6 rows mock: boAt Airdopes, Zepto 10-min delivery, CRED fintech, etc.

Perspectives:
- Ops: bulk select checkboxes, bulk pause.
- UX: sortable column headers, pagination "1–6 of 24".
- Business: "Pool used 82%" explains creator-side scarcity.
- Edge: empty state illustration "No campaigns match filters".
```

### 3.5 Create campaign — Step 1: Basics

```
Screen: Create Campaign — Step 1 of 4: Basics
Viewport: 1440×900, wizard stepper highlighted step 1

Stepper: 1 Basics → 2 Brief & rules → 3 Payout & budget → 4 Review & publish

Form:
- Campaign name (e.g. "boAt Airdopes 800 — Reels Push")
- Category (Electronics)
- Campaign type: Performance CPV | Flat fee (radio)
- Target platforms: checkboxes Instagram Reels (default on), YouTube Shorts
- Start date / End date pickers
- Internal campaign ID (optional, auto-generated preview)
- Campaign cover image upload dropzone

Footer: Cancel | Next (primary purple)

Perspectives:
- Marketing: character count on title; tooltip on campaign type.
- Legal: "Public campaign" vs "Invite-only creators" toggle.
- UX: save draft link top-right.
- Dev: show auto-save "Saved 2 min ago".
```

### 3.6 Create campaign — Step 2: Brief & rules

```
Screen: Create Campaign — Step 2 of 4: Brief & Rules
Viewport: 1440×900

Two-column layout:
LEFT — Creative brief rich text area with placeholder structure:
  Hook, Product focus, Tone (hype/lifestyle), Mandatory mentions, Hashtags
  Example filled for boAt Airdopes 800.

RIGHT — 
- DO THIS (green card): bullet list — new content only, show product naturally, trending audio, high energy
- AVOID THIS (red card): no reposts, no price mentions, no competitor comparisons
- Reference assets: upload video (0:45), PDF brief, product URL field
- Creator tier requirement: Any | Silver+ | Gold+ (dropdown)

Footer: Back | Next

Perspectives:
- Compliance: required DO/AVOID before publish (validation).
- Creator alignment: matches mobile "Campaign guidelines" screen semantics.
- Brand: character limit 2000, preview how creators see brief.
```

### 3.7 Create campaign — Step 3: Payout & budget

```
Screen: Create Campaign — Step 3 of 4: Payout & Budget
Viewport: 1440×900

Form sections:
1. Payout model: "₹ per 1,000 eligible views" input (₹50) with calculator preview "At 1M views ≈ ₹50,000"
2. Max payout per creator (₹50,000 cap)
3. Total campaign budget pool (₹500,000) — determines % pool bar on creator app
4. Estimated creators supported (auto calc, read-only)
5. Platform fee disclosure (12% or "Contact sales") — finance perspective
6. Payout schedule: On verification | Weekly batch

Visual: large progress bar mock "If pool fills, campaign auto-pauses"

Toggle: Auto-approve live reel links under X views (advanced, collapsed)

Perspectives:
- Finance: budget hard cap, alert at 80% / 95%.
- Fraud: "Eligible views" definition link/tooltip.
- Business: match creator app "₹50/1K views, up to ₹50,000".
Footer: Back | Next
```

### 3.8 Create campaign — Step 4: Review & publish

```
Screen: Create Campaign — Step 4 of 4: Review & Publish
Viewport: 1440×900

Summary card sections (read-only recap):
- Basics, Brief excerpt, DO/AVOID chips, Payout terms, Budget pool
- Preview panel: "How creators see this" mini mobile frame mock (optional)

Checklist before publish:
☑ Brief includes DO and AVOID
☑ Budget pool funded (or "Invoice later" for enterprise)
☑ Platform selected
☐ Legal approval (optional checkbox)

Primary CTA: "Publish campaign" (green or purple)
Secondary: "Save as draft"

Perspectives:
- Legal: link to brand content policy.
- Ops: publish confirmation modal "Campaign will go LIVE to all creators".
- UX: edit links per section jump back to step.
```

### 3.9 Campaign detail (live)

```
Screen: Campaign Detail — Live Campaign (boAt)
Viewport: 1440×900

Header: back link, campaign name, status LIVE pill, actions Pause | Edit | Close campaign
Hero stats row: Pool used 82% (orange bar), ₹50/1K CPV, Ends in 2 days, 156 submissions, 89 approved, ₹4.2L spent of ₹5L

Tabs: Overview | Submissions | Creators | Settings

Overview tab:
- Performance chart: views over time
- Top performing clips table (thumbnail, creator, views, est. payout)
- Brief summary expandable
- Product link

Right sidebar: Campaign health checklist, recent activity log "Creator @x submitted draft"

Perspectives:
- Marketing: compare vs goals.
- Finance: spent vs budget, export.
- Moderation: quick link to review queue filtered to this campaign.
```

### 3.10 Submissions queue

```
Screen: Submissions Review Queue — Brand Portal
Viewport: 1440×900

Header: "Submissions" with tabs: Needs action (12) | In review (8) | Approved (89) | Rejected (4) | All
Filters: Campaign, Status, Date, Platform, Sort by urgency

Table:
Columns: Creator (avatar + @handle), Campaign, Type (Draft video | Live reel link), Submitted, Views (if live), Status pill, SLA timer, Action

Status types matching creator app:
- PENDING REVIEW (blue)
- UNDER REVIEW (orange)  
- IN REVIEW (green outline)
- AWAITING LIVE LINK (purple) — creative approved, need Instagram URL
- LIVE TRACKING (green)
- PAID (gray-green)

Bulk actions: Assign reviewer, Export

Perspectives:
- Agency: assignee column + filter "Assigned to me".
- SLA: "Review within 24h" overdue in red.
- Ops: keyboard shortcuts hint "?".
```

### 3.11 Submission review — split detail

```
Screen: Submission Review Detail — Split View
Viewport: 1440×900

LEFT 55%: Media player — creator draft video OR embedded Instagram reel preview placeholder; tabs "Draft" | "Live reel"; metadata: submitted date, campaign, creator tier Silver Clipper.

RIGHT 45%:
- Status banner: "Creative approved — waiting for live reel URL" OR "New draft needs review"
- Checklist against DO/AVOID (auto highlight violations placeholder)
- Metrics if live: views, est. payout ₹2,436.80
- Text area: Internal notes (team only)
- Rejection reason dropdown + comment (required if reject)
- CTAs: Reject (outline red) | Request changes (orange) | Approve creative (green) | Approve live link & start payout tracking (purple, when URL present)

Activity timeline: Submitted → Under review → Approved → Link submitted

Perspectives:
- Moderator: full-screen video, frame-by-frame note.
- Legal: reject reasons (off-brand, missing product, copyright).
- Finance: payout estimate read-only until verified.
- Creator fairness: SLA + clear rejection message preview "What creator sees".
```

### 3.12 Analytics

```
Screen: Campaign Analytics — Brand Portal
Viewport: 1440×900

Date range picker, campaign filter multi-select.
KPIs: Total views (4.2M), Total spend (₹8.4L), Avg CPV (₹48), Creators participated (340), Approval rate (72%)
Charts: Views & spend dual axis; Funnel: Impressions → Submissions → Approved → Paid
Table: Campaign breakdown exportable
Section: "Top creators" leaderboard for this brand

Perspectives:
- Marketing ROI: cost per approved clip.
- Executive: PDF export button.
- Data: note "Estimated vs verified views" disclaimer like creator app.
```

### 3.13 Billing & invoices

```
Screen: Billing — Brand Portal
Viewport: 1440×900

Wallet-style but brand-facing:
- Account balance / prepaid credits (₹2,00,000)
- Payment method: Invoice NET-30 | UPI | Bank transfer
- Table: Invoices #, period, amount, status Paid/Pending
- Button "Add funds" | "Download GST invoice"

Perspectives:
- Finance: GSTIN on file, billing email.
- Indian compliance: rupee formatting, invoice PDF.
- UX: low balance warning banner.
```

### 3.14 Settings — Brand profile

```
Screen: Settings — Brand Profile
Viewport: 1440×900, settings sub-nav

Logo upload, Brand name, Legal entity, Website, Industry, Support email, Billing GSTIN, Brand guidelines PDF upload.
Save changes CTA.

Perspectives:
- Brand identity: logo used in creator campaign cards.
- Support: creator-visible support link field.
```

### 3.15 Settings — Team & roles

```
Screen: Settings — Team & Roles
Viewport: 1440×900

Table: Member, Email, Role (Admin, Reviewer, Viewer, Finance), Last active, Actions remove.
Invite member modal fields: email, role.
Role permission matrix tooltip: who can publish, approve payouts, edit budget.

Perspectives:
- Security: Admin-only for budget.
- Agency: multiple domains allowed.
```

### 3.16 Settings — Notifications

```
Screen: Settings — Notifications
Viewport: 1440×900

Toggle groups: Email / In-app
- New submission
- Campaign 80% budget
- Campaign ended
- Daily digest
- Payout processed

Perspectives:
- Ops: urgent submissions SMS optional (enterprise).
```

### 3.17 Empty & error states (generate as variants)

```
Variant A — Empty campaigns:
"No campaigns yet" illustration, CTA Create first campaign, help link.

Variant B — Empty submissions queue:
"All caught up" with checkmark, link to active campaigns.

Variant C — Campaign pool 100% depleted:
Banner "Budget exhausted — campaign auto-paused", CTA Add budget or Close.

Variant D — Submission rejected confirmation modal:
Show creator-facing message preview.

Variant E — 403 / session expired:
Professional error page, re-login CTA.
```

---

## §4 — Stitch Loop prompt (batch generate all pages)

```
Using the ViralCut Brand Portal DESIGN.md and master context already in this project:

Generate a consistent desktop web UI (1440×900) for ALL brand portal pages in order. Match creator mobile app colors (purple #630ED4 primary, green for money/success, Inter + Plus Jakarta Sans).

Pages to generate as separate screens:
1. Brand Login
2. Brand Sign Up (request access)
3. Brand Dashboard
4. Campaigns List
5. Create Campaign Step 1 Basics
6. Create Campaign Step 2 Brief & Rules
7. Create Campaign Step 3 Payout & Budget
8. Create Campaign Step 4 Review & Publish
9. Campaign Detail (live, boAt example)
10. Submissions Queue
11. Submission Review Detail (split view, approve/reject)
12. Analytics
13. Billing & Invoices
14. Settings — Brand Profile
15. Settings — Team & Roles
16. Settings — Notifications

Each screen must include:
- Left sidebar + top bar (except auth pages)
- Realistic Indian brand mock data (boAt, Zepto, CRED)
- ₹ currency, status pills, data tables where appropriate
- One primary CTA per screen
- Accessible contrast and clear hierarchy

Do NOT design mobile phone frames. This is B2B web only.
After each screen, maintain identical sidebar, spacing, and token usage.
```

---

## §5 — Perspective checklist (use when reviewing Stitch output)

| Perspective | Must appear somewhere in portal |
|-------------|----------------------------------|
| **Brand marketer** | Campaign wizard, brief DO/AVOID, performance charts |
| **Moderator** | Submission queue, split review, reject reasons |
| **Finance** | Budget pool, spend MTD, billing, CPV calculator |
| **Legal / compliance** | Terms, content policy, audit timeline |
| **Agency** | Brand switcher, team roles, assign reviewer |
| **Creator fairness** | Preview "what creator sees", clear rejection copy |
| **Platform ops** | Pause/close campaign, pool %, SLA timers |
| **Engineering** | Realistic table columns = API fields; status enums match mobile |
| **Accessibility** | Focus states, labels, not color-only status |
| **India market** | ₹, +91, GSTIN, local brands, lakh notation |

---

## §6 — Creator ↔ Brand alignment (keep in sync)

| Creator mobile (exists) | Brand web must control |
|-------------------------|-------------------------|
| Campaigns list CPV, % claimed | Payout step + pool budget |
| Campaign detail brief | Brief & rules step |
| Guidelines DO/AVOID | Same rules in wizard step 2 |
| Submit work (draft) | Appears in submission queue |
| Submission details (reel URL) | Approve → await live link flow |
| Performance & earnings | Analytics + submission detail metrics |
| Wallet / withdraw | Billing (brand pays platform) |

---

## §7 — After design: export to repo

```powershell
$env:STITCH_API_KEY = "your-key"
$env:STITCH_PROJECT_ID_VIRALCUT = "your-brand-project-id"
.\scripts\export-stitch-project.ps1 -OutMobile "design\stitch\web-brand" -OutWeb "design\stitch\web-brand"
```

(Update script paths or use a second project ID in `.env` for brand-only exports.)

---

*Generated for ViralCut monorepo — `apps/web-brand` (Next.js).*
