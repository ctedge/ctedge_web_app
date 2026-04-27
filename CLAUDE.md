# CLAUDE.md — Real Estate, Construction & Investment Company Website

## Project Overview

A full-featured web platform for a Real Estate, Construction & Investment company. The platform serves three key audiences: **property buyers** (land and housing), **investors**, and **site administrators**. It combines a public-facing marketing website with authenticated portals for customers, investors, and admins.

---

## 1. Main Website Pages

The public website consists of the following core pages:

- **Home Page** — Hero section, featured properties, investment highlights, testimonials, CTA buttons
- **About Us** — Company story, team, vision/mission, track record
- **Construction Services Page** — Services offered, process, project types
- **Land Products Page** — All land listings with filters (location, price, size)
- **Housing Products Page** — All housing listings with filters (type, price, bedrooms)
- **Projects / Portfolio Page** — Ongoing, completed, and upcoming projects with status indicators
- **Investment Opportunities Page** — Available investment projects, ROI highlights, CTA to investor portal
- **Blog / Insights Page** — Articles, market insights, company news
- **Contact Us Page** — Contact form, address, phone, email, Google Maps embed, WhatsApp button

---

## 2. Landing Pages (Marketing Campaigns)

Standalone landing pages optimized for paid ads and campaigns:

- **Buy Land Page**
- **Real Estate Investment Page**
- **Construction Services Page**

### Landing Page Features
- Lead capture forms (name, phone, email, interest)
- Property highlights with imagery
- Testimonials / social proof
- Strong CTA buttons (e.g., "Get Started", "Book Inspection")
- WhatsApp chat integration button
- Minimal navigation to reduce drop-off

---

## 3. Land Product Listings

Each individual land listing page must display:

| Field | Details |
|---|---|
| Location | Full address / estate name |
| Plot Size | Square meters or square footage |
| Price | Outright and/or installment price |
| Payment Plan | Outright or installment options with breakdown |
| Estate Features | Amenities, infrastructure, perks |
| Map Location | Embedded Google Map |
| Photo Gallery | Multiple images with lightbox viewer |
| Book Inspection | CTA form or WhatsApp link for scheduling |

---

## 4. Housing Product Listings

Each individual housing listing page must display:

| Field | Details |
|---|---|
| House Type | Bungalow, duplex, terrace, apartment, etc. |
| Property Description | Full description of the property |
| Floor Plan | Uploaded floor plan image(s) |
| Price | Full listing price |
| Payment Plan | Outright or installment breakdown |
| Gallery / Video | Photo gallery and/or video walkthrough |
| Reserve Property | CTA button to reserve or begin purchase |

---

## 5. Customer Account & Dashboard

Registered customers (buyers of land owr housing) have access to a personal dashboard.

### Authentication
- Sign up / Log in with email and password
- Email verification on registration
- Password reset flow

### Dashboard Features
- View purchased property (land or house) details
- Track installment payment schedule
- View full payment history
- View outstanding balance
- Download payment receipts (PDF)
- Upload payment proof (image or PDF)
- Receive payment reminders (in-app + email)
- Download allocation and title documents

---

## 6. Payment System

Integrated online payment gateway supporting:

### Payment Types
- **Outright payment** — Full amount paid at once
- **Installment payments** — Recurring scheduled payments

### Payment Features
- Offline payment using bank transfer.
- System automatically generates an invoice for the customer
- Admin manually generates an invoice for the customer 
- Admin confirms bank transfer manually and then comes to the app to mark invoice as paid
- Automatic receipt generated and sent to customer email
- Payment confirmation notification (email + in-app) after mark as paid
- Full payment history tracking per customer
- Admin visibility into all transactions

---

## 7. Investor Portal

A dedicated section for investors, separate from customer accounts.

### Authentication
- Investor account creation and login
- KYC / document upload (optional, admin-reviewed)

### Investor Dashboard Features
- View available investment projects
- Invest directly into a project online
- Personal investment dashboard showing:
  - Total amount invested
  - Expected return (ROI)
  - Investment duration / maturity date
  - Payment/disbursement updates
- ROI projection display (chart or breakdown)
- Download investment agreements and documents
- Investment maturity reminders

---

## 8. Admin Management System

A backend admin panel accessible only to authorized staff.

### Admin Capabilities
- **Product Management** — Upload, edit, and delete land and housing listings
- **Project Management** — Add and update project portfolio entries (ongoing, completed, upcoming)
- **Customer Management** — View, search, and manage customer accounts and purchases
- **Installment Tracking** — View and manually record installment payments
- **Investor Management** — View investor profiles, investments, and approve/reject applications
- **Financial Reports** — Generate reports on sales, payments, and investment activity (exportable)
- **Notifications** — Send bulk or individual email/SMS/push notifications to users
- **Document Management** — Upload and assign allocation letters, receipts, investment docs

---

## 9. Automation Features

The platform should automate the following:

| Trigger | Action |
|---|---|
| Successful payment | Auto-generate and email receipt |
| Upcoming installment due date | Send payment reminder (email/SMS) |
| Investment maturity approaching | Send maturity reminder to investor |
| New registration | Send welcome email |
| Admin approves investment | Notify investor via email |
| Payment proof uploaded | Notify admin for review |

---

## 10. Additional Features

| Feature | Notes |
|---|---|
| Live Chat / WhatsApp Integration | Floating WhatsApp button site-wide; optional live chat widget |
| Book Site Inspection Form | Standalone form on land/housing pages and contact page |
| Download Brochure | PDF brochure download CTA on key pages |
| Property Gallery & Videos | Lightbox photo gallery; embedded or hosted video support |
| Google Maps Integration | Embedded maps on listing pages and Contact Us |
| Mobile Responsive Design | Fully responsive across all screen sizes |
| SEO Optimization | Meta tags, Open Graph, structured data (schema.org), sitemap.xml, robots.txt |

---

## Tech Stack Recommendations

### Frontend
- **Framework**: Next.js (React) — for SSR/SSG, SEO, and performance
- **Styling**: Tailwind CSS
- **State Management**: Zustand or React Context
- **Forms**: React Hook Form + Zod validation

### Backend
- **Runtime**: Node.js with Express or Next.js API routes
- **Database**: PostgreSQL (via Prisma ORM)
- **Auth**: NextAuth.js or Clerk (customer + investor + admin roles)
- **File Storage**: Cloudinary or AWS S3 (images, PDFs, documents)
- **Email**: Nodemailer + SendGrid or Resend
 

### Hosting & Infrastructure
- **Frontend/Backend**: Vercel or Railway
- **Database**: PostgreSQL
- **CDN**: Cloudflare

---

## User Roles & Access Control

| Role | Access |
|---|---|
| **Public Visitor** | Website pages, landing pages, blog, contact form |
| **Customer** | Customer dashboard, payments, documents |
| **Investor** | Investor portal and dashboard |
| **Admin** | Full admin panel, all data, reports, notifications |

---

## Key Design Principles

- **Mobile-first** design — majority of Nigerian real estate traffic is mobile
- **Speed** — optimized images, lazy loading, CDN delivery
- **Trust signals** — testimonials, project photos, company registration details, SSL badge
- **Conversion-focused** — clear CTAs, WhatsApp accessibility, easy lead capture
- **Security** — encrypted passwords, role-based access, secure payment handling

---

## Notes for Claude (AI Assistant)
sa
- All currency should default to **NGN (₦)** with optional USD display for investors
- WhatsApp integration should use `https://wa.me/<number>` deep links
- The admin panel and customer/investor dashboards are **separate applications or protected routes**, not public pages
- Installment payment logic must support **custom schedules** (e.g., 3-month, 6-month, 12-month plans)
- All uploaded documents (allocation letters, receipts) must be **downloadable as PDF**
- SEO metadata should be **dynamically generated** per listing page (title, description, OG image)
