# Tiptoe Sports Hub

Nepal's #1 private football & futsal academy website — built with React + Vite, Firebase, and Tailwind CSS.

---

## Tech Stack

- **Frontend**: React 18 + Vite 5, Tailwind CSS v3, Framer Motion
- **Backend**: Firebase v10 (Firestore, Authentication, Storage)
- **Routing**: React Router DOM v6
- **Forms**: React Hook Form
- **Blog Editor**: React Quill (snow theme)
- **SEO**: React Helmet Async
- **Deployment**: Vercel

---

## Local Setup

### 1. Prerequisites

- Node.js 18+ (tested on 24.x)
- A Firebase project (see below)

### 2. Clone & install

```bash
cd tiptoe-sports-hub
npm install
```

### 3. Configure environment

Copy `.env.example` to `.env.local` and fill in your Firebase values:

```bash
copy .env.example .env.local
```

Edit `.env.local`:

```
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_WHATSAPP_NUMBER=9779800000000
```

### 4. Run dev server

```bash
npm run dev
```

Visit `http://localhost:5173`

---

## Firebase Setup

### Step 1 — Create project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project (e.g. `tiptoe-sports-hub`)
3. Add a **Web App** and copy the SDK config into `.env.local`

### Step 2 — Enable Authentication

1. Firebase Console → Authentication → Sign-in method
2. Enable **Email/Password**
3. Go to Users → Add User: create the admin account (use your email + a strong password)

### Step 3 — Create Firestore database

1. Firebase Console → Firestore Database → Create database
2. Choose **Production mode**
3. Select region (e.g. `asia-south1` for Nepal)
4. Apply the security rules below

**Firestore Security Rules** (Firestore → Rules):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read on all content collections
    match /programs/{id}   { allow read: if true; allow write: if request.auth != null; }
    match /coaches/{id}    { allow read: if true; allow write: if request.auth != null; }
    match /schedule/{id}   { allow read: if true; allow write: if request.auth != null; }
    match /events/{id}     { allow read: if true; allow write: if request.auth != null; }
    match /gallery/{id}    { allow read: if true; allow write: if request.auth != null; }
    match /blog/{id}       { allow read: if true; allow write: if request.auth != null; }
    match /testimonials/{id} { allow read: if true; allow write: if request.auth != null; }
    match /settings/{id}   { allow read: if true; allow write: if request.auth != null; }

    // Inquiries: public can create (enroll/contact forms), admin can read/update
    match /inquiries/{id} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }
  }
}
```

### Step 4 — Enable Storage

1. Firebase Console → Storage → Get started
2. Start in **Production mode**
3. Select same region as Firestore
4. Apply storage rules (Storage → Rules):

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## Admin Panel

URL: `/admin`  
Login: `/admin/login`

Use the Firebase Auth email/password you created in Step 2.

**Admin sections:**
| Path | Description |
|------|-------------|
| `/admin` | Dashboard — stats + recent inquiries |
| `/admin/programs` | CRUD training programs |
| `/admin/coaches` | CRUD coaching staff + photo upload |
| `/admin/schedule` | Weekly schedule slots by day |
| `/admin/events` | Upcoming & past events + banner upload |
| `/admin/gallery` | Multi-photo upload with category |
| `/admin/blog` | Full blog editor with React Quill |
| `/admin/testimonials` | Manage & toggle testimonial visibility |
| `/admin/inquiries` | View enroll/contact inquiries + CSV export |
| `/admin/settings` | Academy info, logo, WhatsApp, social links |

---

## Deploy to Vercel

### Option A — Vercel CLI

```bash
npm i -g vercel
vercel
```

### Option B — Vercel Dashboard

1. Push the repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import repo
3. Framework: **Vite**
4. Add all `VITE_*` environment variables from `.env.local`
5. Deploy

The `vercel.json` SPA rewrite is already configured — all routes return `index.html`.

---

## Content Collections

All content is managed via Firestore. The site ships with hardcoded fallback data so every page renders even before Firestore is populated.

| Collection | Fields |
|---|---|
| `programs` | name, sport, ageGroup, description, schedule, fee, active, order |
| `coaches` | name, role, bio, achievements[], photoURL, active, order |
| `schedule` | day, timeStart, timeEnd, sport, ageGroup, venue, coach |
| `events` | title, description, date, location, bannerURL, isUpcoming |
| `gallery` | url, category, caption, order |
| `blog` | title, slug, category, author, excerpt, content, imageURL, status, publishedAt |
| `testimonials` | name, role, text, rating, photoURL, visible |
| `inquiries` | name, age, parentName, phone, email, sport, ageGroup, preferredSchedule, message, status |
| `settings/main` | academyName, tagline, phone, email, address, whatsapp, logoURL, socialLinks |
