# Zakiah Mosaics AI Surface & Floor Studio 🏛️✨

> **Production-Ready, Full-Stack Architectural Surface & Floor Design Application** for Zakiah Mosaics Studio. Built with Next.js (App Router), TypeScript, Tailwind CSS, Prisma ORM, Auth.js (v5), and AI Image Inpainting Integration.

---

## 🌟 Core Features & Modules

### 🎨 1. AI Mosaic Design Studio & Interactive Mask Canvas (`/studio`)
- **Dual-Mode Canvas**: Upload room photography or sketch custom mask boundaries on an interactive HTML5 Canvas with adjustable brush sizes, eraser, clear mask, and room backdrops (*Foyer Rotunda*, *Master Bath*, *Chef Kitchen*, *Infinity Pool*).
- **Architectural Placement Pills**: Select surface placement (*Auto-detect*, *Floor Medallion*, *Backsplash*, *Accent Wall*, *Pool & Wellness*, *Entryway & Rotunda*).
- **Style & Texture Reference Catalog**: Select material anchors from Italian marble medallions, Byzantine glass, and waterjet floor carpets.
- **Surface Specs Controls**: Polish finishes (*Polished High-Gloss*, *Satin Honed*, *Antiqued Tumbled*, *Textured Matte*) and grout accents (*Champagne Gold*, *Pure Thassos White*, *Charcoal Slate*, *Platinum Silver*).

### 🔑 2. Email OTP Verification Pipeline (5-Minute Expiry)
- **Pre-Generation Verification**: Intercepts the generation trigger with a 6-digit verification code sent via email.
- **5-Minute Countdown Expiry**: Enforces a strict 5-minute expiration timer with a live countdown clock (`05:00`).
- **Resend Code**: Instant code regeneration option for clients.
- **Image Generation Phase**: Unlocks the AI image rendering engine upon 6-digit verification.

### 💬 3. Dual Frontend Action Modals
- **Request Quote & Sample Box**: Order physical mesh tesserae sample boxes and architectural cost breakdowns.
- **Talk to Surface Specialist**: Book direct phone consultations with Italian marble engineers (selectable phone number, preferred time slot, and call notes).

### 📄 4. Dynamic CMS Architectural Showcase (`/[slug]`)
- Render dynamic architectural pages from PostgreSQL / Prisma DB records using the high-impact **Architectural Hero Showcase Template**:
  - Full-width editorial parallax hero banner with custom headline, storytelling copy, and studio CTAs.
  - Bespoke value proposition section highlighting Italian tesserae craftsmanship and waterjet engineering.
  - Dynamically configured product catalog showcase grid.
  - Integrated quote inquiry drawer for high-value client acquisition.

### 🛡️ 5. Dedicated NextJS App Admin Portal (`/nextjs-app`)
- **Protected Route Middleware**: Protects all `/nextjs-app/*` routes using Auth.js (v5) JWT role verification (`role: "ADMIN"` or `"CONTENT_EDITOR"`). Unauthenticated attempts automatically open `/login`.
- **Analytics Overview (`/nextjs-app`)**: Monitors registered users, total AI renderings, API compute cost estimates ($0.04/render), and active lead inquiries.
- **Pages CMS (`/nextjs-app/pages`)**: Seamlessly edit dynamic architectural showcase landing pages with live hero WebP upload and product showcase selection.
- **Aesthetic Finder CMS (`/nextjs-app/finder`)**: Configure the 5-step aesthetic finder wizard styles, shapes, and color swatches.
- **Products Catalog (`/nextjs-app/products`)**: Manage tile reference images, categories, specs JSON, and prices per sq.ft.
- **AI Generations (`/nextjs-app/generations`)**: Inspect full renders, view verified client emails, download high-res files, and manage trash/restores.
- **Client Inquiries (`/nextjs-app/inquiries`)**: Track incoming quote inquiries and specialist calls with lead status management.
- **Appearance & Navigation (`/nextjs-app/appearance`)**: Manage brand names, header menus, and footer specifications.

### 🌓 6. Luxury Theme Switcher
- **Obsidian Dark & Pearl Light Modes**: Smooth theme toggle with `localStorage` state persistence.
- Obsidian black (`#08080A`) with brushed gold accents (`#CBA741`) in Dark mode, and champagne alabaster (`#FAF8F5`) with soft pearl cards in Light mode.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 14/15 (App Router) with TypeScript |
| **Styling & UI** | Tailwind CSS, Lucide Icons, Custom Glassmorphism, Google Fonts (*Cinzel* & *Inter*) |
| **Database & ORM** | SQLite / PostgreSQL with Prisma ORM |
| **Authentication** | Auth.js (NextAuth v5) Credentials Provider with `bcryptjs` hashing & RBAC |
| **Canvas & Sketching** | HTML5 Canvas API with brush masking & room image compositing |
| **Storage & AI Engine** | AWS S3 / Cloudflare R2 SDK, OpenAI DALL-E 3 / fal.ai SDK |

---

## 🔑 Initial Demo Credentials

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@mosaic.com` | `admin123` | Full Access to `/nextjs-app` Admin Portal |
| **Demo User** | `user@mosaic.com` | `user123` | Standard Client Account |

---

## 🚀 Quick Start Guide

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Abdul-rehmanSHK/MosaicGen-AI.git
cd MosaicGen-AI
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```env
# Database Connection
DATABASE_URL="file:./dev.db"

# NextAuth Configuration
AUTH_SECRET="ai-mosaic-luxury-studio-secret-key-2026-super-secure"
NEXTAUTH_URL="http://localhost:3000"

# AI Engine Credentials (Optional: Engine will fallback to luxury mosaic neural shader when missing)
OPENAI_API_KEY=""

# Cloud Storage Credentials (Optional: Engine will fallback to encoded canvas storage when missing)
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_REGION="us-east-1"
AWS_S3_BUCKET_NAME="ai-mosaic-bucket"
```

### 3. Initialize & Seed Database
```bash
npx prisma db push
npx prisma db seed
```

### 4. Run Local Development Server
```bash
npm run dev
```
Navigate to `http://localhost:3000` to launch the app!
- **Studio & Frontend**: `http://localhost:3000/studio`
- **NextJS App Admin Login**: `http://localhost:3000/nextjs-app`

---

## 📄 License
© 2026 Zakiah Mosaics Studio. All Rights Reserved.
