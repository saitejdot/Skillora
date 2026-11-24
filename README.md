# Skillora — College Student Freelance Marketplace

> **Tagline:** *Your skills. Your opportunities. Your marketplace.*

Skillora is a modern full-stack web marketplace inspired by Fiverr, connecting talented university and college students with customers seeking affordable, high-quality digital services (graphic design, software development, video editing, photography, tutoring, writing, and event support).

---

## 🌟 Key Features

### 1. Dual Mode System (Fiverr-Inspired)
- **One Account, Dual Identities:** Any registered user can switch seamlessly between **Student (Provider)** and **Customer (Buyer)** modes without having to create multiple accounts.
- Mode-aware navigation bar, dashboard sidebar, and context-dependent actions.

### 2. Comprehensive Marketplace & Discovery
- **Fiverr-Style Navbar & Category Carousel:** Explore 9 campus service categories (Graphic Design, Programming & Tech, Video Editing, Photography, Tutoring, Content Creation, Writing & Translation, Event Support, Marketing).
- **Advanced Explore Page:** Full-text search, filter by category, budget range slider, minimum rating filter (4.0+, 4.5+), and sorting (Popular, Rating, Price Low to High, Price High to Low, Newest).
- **Service Details Page:** Image gallery, clear fixed-price pricing card, estimated delivery timeline, detailed descriptions, student profile card, and verified customer reviews.

### 3. Complete Order Management Lifecycle
Full state transition machine with role-based access control and notifications:
1. **PENDING:** Customer submits project requirements & attachments.
2. **ACCEPTED / REJECTED:** Student reviews requirements and accepts or declines.
3. **IN_PROGRESS:** Work is underway.
4. **DELIVERED:** Student uploads completed work links and delivery notes.
5. **COMPLETED:** Customer reviews submitted files and confirms completion.
6. **REVIEWS & RATINGS:** Customer leaves a 1–5 star rating with written feedback, automatically recalculating the student's rating and service statistics.

### 4. Campus Trust & Verification
- Students can submit their College/University ID card and student roll number for verification.
- **Admin Review Queue:** Administrators manually review student credentials and approve or reject requests.
- **Verified Student Badge:** Approved students receive a green verified campus badge displayed across their profile and service cards.

### 5. Protected Administrative Console
- Accessible only to authorized admin accounts (`admin@skillora.edu`).
- Platform analytics: total users, students, buyers, services, orders, completed GMV volume.
- User management: search users, suspend/unblock accounts, toggle roles.
- Service moderation: monitor all service listings, pause inappropriate gigs.
- Category management: add and prioritize marketplace categories.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 with Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS + Lucide Icons + Tailwind Animate |
| **UI Components** | Modular Shadcn/UI-inspired component architecture |
| **Database & ORM** | PostgreSQL with Prisma ORM |
| **Authentication** | Auth.js / NextAuth with JWT sessions & bcrypt password hashing |
| **Data Validation** | Zod schemas |
| **Image Storage** | Cloudinary integration with preset previews |
| **Deployment Targets** | Vercel (Next.js), Neon or Supabase (PostgreSQL), Cloudinary (Images) |

---

## 🚀 Getting Started Locally

### 1. Prerequisites
- Node.js 18+ (tested on Node 20 / 24)
- npm or pnpm
- PostgreSQL database (Local PostgreSQL or a free instant database from [Neon.tech](https://neon.tech) / [Supabase](https://supabase.com))

### 2. Installation
```bash
git clone https://github.com/your-username/skillora.git
cd Skillora
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Configure your environment variables:
```env
# PostgreSQL connection string (Neon, Supabase, or Local PostgreSQL)
DATABASE_URL="postgresql://username:password@ep-xxxx.neon.tech/neondb?sslmode=require"

# NextAuth secret & URL
NEXTAUTH_SECRET="your-super-secret-random-key"
NEXTAUTH_URL="http://localhost:3000"

# Cloudinary (Optional - presets and demo previews are built-in)
CLOUDINARY_CLOUD_NAME="demo"
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
```

### 4. Database Setup & Seeding
Push the Prisma schema to your PostgreSQL database and seed sample data:
```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👥 Demo Accounts (Pre-Seeded)

| Role | Email | Password | Access / Features |
|---|---|---|---|
| **Admin** | `admin@skillora.edu` | `admin123` | Full administrative console at `/admin`, verification review, user moderation |
| **Student** | `alex.rivera@berkeley.edu` | `password123` | UC Berkeley student, published services, manage orders, view deliveries |
| **Buyer** | `emily.buyer@gmail.com` | `password123` | Service seeker, order tracking, completion confirmation, reviews |

---

## 🌐 Production Deployment Guide

### Deploying Database on Neon (Free 1-Click PostgreSQL)
1. Go to [Neon.tech](https://neon.tech) and create a free account.
2. Create a new project (e.g. `skillora-db`).
3. Copy the **Connection string** (choose `Prisma` or `Direct connection`).
4. Set `DATABASE_URL="postgresql://...neon.tech/neondb?sslmode=require"` in your `.env`.
5. Run `npx prisma db push && npm run db:seed`.

### Deploying to Vercel
1. Push your repository to GitHub.
2. Sign in to [Vercel](https://vercel.com) and click **Add New Project**.
3. Import your `Skillora` repository.
4. Under **Environment Variables**, add:
   - `DATABASE_URL`: Your production PostgreSQL URL from Neon / Supabase.
   - `NEXTAUTH_SECRET`: A generated 32-character random string (`openssl rand -base64 32`).
   - `NEXTAUTH_URL`: Your custom production domain or Vercel URL (e.g. `https://skillora.vercel.app`).
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: (Optional).
5. Click **Deploy**. Vercel will run `prisma generate && next build` and deploy your production marketplace!

---

## 📁 Project Architecture

```
src/
├── app/
│   ├── (auth)/             # Login, Register, Forgot Password, Reset Password
│   ├── admin/              # Admin console (Overview, Users, Verifications, Services, Categories)
│   ├── api/                # Route handlers (auth, services, orders, reviews, verifications, admin)
│   ├── categories/[slug]/  # Dedicated category service listings
│   ├── dashboard/          # Student & Customer unified dashboards (Overview, Services, Orders, etc.)
│   ├── explore/            # Marketplace search, category filters, budget sliders, sorting
│   ├── services/[slug]/    # Service details, image gallery, pricing card, request modal
│   ├── students/[id]/      # Student public portfolio & verified profile
│   ├── globals.css         # Tailwind tokens & base styles
│   └── layout.tsx          # Root layout with Navbar, CategoryNav, and Footer
├── components/
│   ├── forms/              # ServiceForm, OrderRequestModal
│   ├── layout/             # Navbar, CategoryNav, Footer, ModeToggle, NotificationBell
│   ├── marketplace/        # ServiceCard, CategoryCard, HeroSearch, HowItWorks, CtaBanner
│   └── ui/                 # Reusable buttons, inputs, cards, avatars, badges
├── lib/
│   ├── auth.ts             # Session helpers (getCurrentUser, requireAuth, requireAdmin)
│   ├── auth-options.ts     # NextAuth credentials & JWT callbacks
│   ├── cloudinary.ts       # Cloudinary upload client & fallback handlers
│   ├── prisma.ts           # Prisma client instance with hot-reload guard
│   ├── utils.ts            # Formatting helpers (formatPrice, formatDate, slugify, cn)
│   └── validations.ts      # Zod validation schemas
├── prisma/
│   └── schema.prisma       # 16 database entities & relationships
└── scripts/
    └── seed.mjs            # Realistic seed script with colleges, students, gigs, and reviews
```

---

## 🔒 Security Measures
- **Password Protection:** Salted password hashing with `bcryptjs`.
- **Server-Side Validation:** All forms and API requests strictly validated with `zod`.
- **Authorization & Ownership:** Strict server-side ownership checks ensure buyers can only modify their own orders and students can only manage their own services.
- **Admin Isolation:** Admin routes and endpoints enforce `session.user.role === "ADMIN"` server-side.
- **Environment Isolation:** Zero client exposure of database credentials or API secrets.

