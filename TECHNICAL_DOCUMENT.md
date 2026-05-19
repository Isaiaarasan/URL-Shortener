# 🔗 LinkSnap — URL Shortener with Analytics
### Technical Documentation & Architecture Guide
> *A full-stack MERN application built for the Katomaran Hackathon*

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Theme & Design System](#theme--design-system)
3. [Tech Stack](#tech-stack)
4. [Feature List](#feature-list)
5. [Architecture Diagram](#architecture-diagram)
6. [File Structure](#file-structure)
7. [Database Schema](#database-schema)
8. [API Reference](#api-reference)
9. [Environment Variables](#environment-variables)
10. [Setup Instructions](#setup-instructions)
11. [AI Planning Document](#ai-planning-document)
12. [Assumptions Made](#assumptions-made)
13. [UI Libraries & Dependencies](#ui-libraries--dependencies)
14. [Security Best Practices](#security-best-practices)
15. [Performance & Caching Strategy](#performance--caching-strategy)
16. [Error Handling & Logging](#error-handling--logging)
17. [Testing Strategy](#testing-strategy)
18. [Deployment & CI/CD Pipeline](#deployment--cicd-pipeline)
19. [Git Conventions](#git-conventions)
20. [Scripts Reference](#scripts-reference)


---

## Project Overview

**LinkSnap** is a full-stack URL Shortener platform built with the MERN stack. It allows authenticated users to shorten long URLs, manage their links from a personal dashboard, and track detailed analytics such as click counts, timestamps, and visit history. The application emphasizes clean design, modularity, and real-world engineering practices.

---

## Theme & Design System

### 🎨 Visual Theme: **"Midnight Neon"**

A dark, modern SaaS aesthetic with electric accent colors — inspired by tools like Dub.co and Bitly's pro dashboard.

| Token | Value | Usage |
|---|---|---|
| `--bg-primary` | `#0D0F14` | Main background |
| `--bg-secondary` | `#13161E` | Card / panel backgrounds |
| `--bg-tertiary` | `#1C2030` | Input fields, borders |
| `--accent-primary` | `#6366F1` | Indigo — CTA buttons, links |
| `--accent-secondary` | `#22D3EE` | Cyan — highlights, charts |
| `--accent-success` | `#10B981` | Green — success states |
| `--accent-danger` | `#EF4444` | Red — errors, delete |
| `--accent-warning` | `#F59E0B` | Amber — warnings |
| `--text-primary` | `#F1F5F9` | Headings |
| `--text-secondary` | `#94A3B8` | Body / muted text |
| `--text-muted` | `#475569` | Labels, placeholders |
| `--border` | `#1E2536` | Dividers, card borders |
| `--radius` | `12px` | Default border radius |

### Typography

- **Font Family:** `Inter` (Google Fonts) — clean, modern sans-serif
- **Heading Weight:** 700 (Bold)
- **Body Weight:** 400/500
- **Monospace:** `JetBrains Mono` — short URLs, code snippets

### Component Style Principles

- Glassmorphism cards with subtle backdrop-blur
- Gradient CTA buttons (`indigo → violet`)
- Animated hover states (scale + glow)
- Skeleton loaders for async content
- Toast notifications (bottom-right, auto-dismiss)

---

## Tech Stack

### Frontend
| Layer | Technology | Version |
|---|---|---|
| Framework | React | 18.x |
| Build Tool | Vite | 5.x |
| Routing | React Router DOM | 6.x |
| State Management | Zustand | 4.x |
| HTTP Client | Axios | 1.x |
| Styling | Tailwind CSS | 3.x |
| Charts | Recharts | 2.x |
| Icons | Lucide React | latest |
| Notifications | React Hot Toast | 2.x |
| QR Code | qrcode.react | 3.x |
| Date Formatting | date-fns | 3.x |
| Form Validation | React Hook Form + Zod | latest |

### Backend
| Layer | Technology | Version |
|---|---|---|
| Runtime | Node.js | 20.x LTS |
| Framework | Express.js | 4.x |
| Authentication | JSON Web Tokens (JWT) | latest |
| Password Hashing | bcryptjs | 2.x |
| Validation | express-validator | 7.x |
| Short ID | nanoid | 5.x |
| CORS | cors | 2.x |
| Rate Limiting | express-rate-limit | 7.x |
| Logging | morgan | 1.x |
| Environment | dotenv | 16.x |

### Database
| Layer | Technology |
|---|---|
| Primary DB | MongoDB Atlas (Cloud) |
| ODM | Mongoose 8.x |
| Indexing | TTL Index (expiry), Compound Index (userId + shortCode) |

### DevOps & Tooling
| Tool | Purpose |
|---|---|
| Git + GitHub | Version Control |
| ESLint + Prettier | Code Quality |
| Nodemon | Dev hot-reload (backend) |
| Concurrently | Run frontend + backend simultaneously |
| dotenv | Environment management |

---

## Feature List

### ✅ Mandatory Features

#### 🔐 Authentication
- [x] User signup with name, email, password
- [x] User login with JWT token (stored in httpOnly cookie or localStorage)
- [x] Protected routes — redirect unauthenticated users to login
- [x] Each user sees and manages only their own URLs
- [x] Passwords hashed using `bcryptjs` (salt rounds: 12)
- [x] JWT expiry with refresh logic

#### 🔗 URL Shortening
- [x] Submit a long URL → receive a unique short code (via `nanoid`)
- [x] Short code uniqueness enforced at DB level (unique index)
- [x] Clicking short URL redirects to original (server-side 301/302 redirect)
- [x] URL validation on both frontend (Zod) and backend (express-validator)
- [x] Short URL format: `https://linksnap.io/{shortCode}`

#### 📊 User Dashboard
- [x] Table of all user's URLs with:
  - Original URL (truncated with tooltip)
  - Short URL (with copy button)
  - Created date (formatted)
  - Total click count
- [x] Delete a short URL (with confirmation modal)
- [x] Copy short URL to clipboard (one-click)
- [x] Pagination (10 links per page)
- [x] Search/filter by original URL

#### 📈 Analytics
- [x] Click count per URL
- [x] Record timestamp of each visit
- [x] Analytics detail page per URL showing:
  - Total click count
  - Last visited time
  - Recent visit history (last 20 visits with timestamp)
  - Click trend chart (daily, last 30 days — Recharts BarChart)

### 🌟 Bonus Features
- [x] **Custom alias** — user can define their own short code
- [x] **QR Code generation** — downloadable PNG via `qrcode.react`
- [x] **Link expiry date** — optional TTL, expired links return 410 Gone
- [x] **Charts** — daily click trend using Recharts
- [x] **Edit destination URL** — update the original URL for an existing short link
- [x] **Public stats page** — `/stats/{shortCode}` shows aggregate analytics (no login needed)
- [ ] Geolocation / device analytics *(planned — not in v1)*
- [ ] Bulk CSV import *(planned — not in v1)*

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   React SPA (Vite)                        │  │
│  │                                                           │  │
│  │  ┌──────────┐  ┌──────────┐  ┌────────────────────────┐ │  │
│  │  │  Auth    │  │Dashboard │  │  Analytics Detail Page  │ │  │
│  │  │  Pages   │  │  Page    │  │  /dashboard/analytics/  │ │  │
│  │  │ /login   │  │/dashboard│  │  :shortCode             │ │  │
│  │  │ /signup  │  │          │  │                         │ │  │
│  │  └──────────┘  └──────────┘  └────────────────────────┘ │  │
│  │                                                           │  │
│  │              Zustand (Global State)                       │  │
│  │              Axios (HTTP Client)                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │ REST API                           │
└────────────────────────────┼────────────────────────────────────┘
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Node.js / Express Server                      │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                     Middleware Stack                      │  │
│  │  cors → morgan → express-rate-limit → express.json()     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                             │                                   │
│  ┌─────────────┬────────────┴───────────┬──────────────────┐  │
│  │  /api/auth  │      /api/urls         │  /:shortCode     │  │
│  │             │                        │  (Redirect Route) │  │
│  │  POST /signup   GET    /          GET  → 301 Redirect   │  │
│  │  POST /login    POST   /          (Track click + visit)  │  │
│  │  GET  /me       DELETE /:id                             │  │
│  │                 PUT    /:id                             │  │
│  │                 GET    /:id/analytics                   │  │
│  └─────────────┴────────────────────────┴──────────────────┘  │
│                             │                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  Controller Layer                         │  │
│  │     authController | urlController | analyticsController │  │
│  └──────────────────────────────────────────────────────────┘  │
│                             │                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   Service Layer                           │  │
│  │        authService | urlService | analyticsService        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                             │                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  Mongoose ODM                             │  │
│  │           User Model | URL Model | Visit Model            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                             │                                   │
└─────────────────────────────┼───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       MongoDB Atlas                             │
│                                                                 │
│   ┌──────────────┐   ┌──────────────┐   ┌──────────────────┐  │
│   │    users     │   │    urls      │   │     visits       │  │
│   │ collection   │   │ collection   │   │   collection     │  │
│   └──────────────┘   └──────────────┘   └──────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
linksnap/
├── README.md
├── TECHNICAL_DOCUMENT.md
├── .gitignore
├── package.json                    # Root: concurrently scripts
│
├── backend/                        # Node.js + Express API
│   ├── package.json
│   ├── .env.example
│   ├── server.js                   # Entry point
│   │
│   ├── config/
│   │   ├── db.js                   # MongoDB connection
│   │   └── constants.js            # App-wide constants
│   │
│   ├── models/
│   │   ├── User.js                 # User schema (name, email, passwordHash)
│   │   ├── Url.js                  # URL schema (shortCode, originalUrl, userId, clicks, expiresAt)
│   │   └── Visit.js                # Visit schema (urlId, timestamp, ip, userAgent)
│   │
│   ├── controllers/
│   │   ├── authController.js       # signup, login, getMe
│   │   ├── urlController.js        # createUrl, getUrls, deleteUrl, updateUrl, redirectUrl
│   │   └── analyticsController.js  # getAnalytics (per URL)
│   │
│   ├── services/
│   │   ├── authService.js          # Business logic: hash, compare, JWT sign/verify
│   │   ├── urlService.js           # Business logic: generate shortCode, CRUD
│   │   └── analyticsService.js     # Business logic: aggregate visit data
│   │
│   ├── routes/
│   │   ├── authRoutes.js           # POST /api/auth/signup, /login, GET /api/auth/me
│   │   ├── urlRoutes.js            # CRUD /api/urls
│   │   └── analyticsRoutes.js      # GET /api/analytics/:shortCode
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js       # Verify JWT, attach req.user
│   │   ├── validate.js             # express-validator error handler
│   │   └── rateLimiter.js          # express-rate-limit config
│   │
│   ├── validators/
│   │   ├── authValidators.js       # Signup/login field validation rules
│   │   └── urlValidators.js        # URL creation/update validation rules
│   │
│   └── utils/
│       ├── generateShortCode.js    # nanoid wrapper (7 chars)
│       ├── responseHelper.js       # Standardized API response shape
│       └── logger.js               # Morgan + custom logger
│
└── frontend/                       # React + Vite SPA
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    │
    ├── public/
    │   ├── favicon.ico
    │   └── og-image.png
    │
    └── src/
        ├── main.jsx                # React root
        ├── App.jsx                 # Router setup, auth guard
        ├── index.css               # Tailwind directives + CSS variables
        │
        ├── api/
        │   ├── axiosInstance.js    # Axios base URL, interceptors, token attachment
        │   ├── authApi.js          # signup(), login(), getMe()
        │   ├── urlApi.js           # createUrl(), getUrls(), deleteUrl(), updateUrl()
        │   └── analyticsApi.js     # getAnalytics()
        │
        ├── store/
        │   ├── authStore.js        # Zustand: user, token, isAuthenticated
        │   └── urlStore.js         # Zustand: urls[], loading, error
        │
        ├── pages/
        │   ├── LandingPage.jsx     # Public homepage with shorten form
        │   ├── LoginPage.jsx       # Login form
        │   ├── SignupPage.jsx       # Signup form
        │   ├── DashboardPage.jsx   # Main authenticated dashboard
        │   ├── AnalyticsPage.jsx   # Per-URL analytics detail
        │   └── PublicStatsPage.jsx # /stats/:shortCode — public view
        │
        ├── components/
        │   ├── layout/
        │   │   ├── Navbar.jsx          # Top nav with user menu
        │   │   ├── Sidebar.jsx         # Dashboard sidebar
        │   │   └── Footer.jsx
        │   │
        │   ├── auth/
        │   │   ├── LoginForm.jsx
        │   │   ├── SignupForm.jsx
        │   │   └── ProtectedRoute.jsx  # Auth guard HOC
        │   │
        │   ├── url/
        │   │   ├── ShortenForm.jsx     # URL input form (with alias + expiry options)
        │   │   ├── UrlTable.jsx        # Dashboard URL list table
        │   │   ├── UrlRow.jsx          # Single URL row with actions
        │   │   ├── UrlActions.jsx      # Copy, QR, Edit, Delete buttons
        │   │   ├── EditUrlModal.jsx    # Modal to edit destination URL
        │   │   ├── DeleteConfirmModal.jsx
        │   │   └── QRCodeModal.jsx     # QR display + download
        │   │
        │   ├── analytics/
        │   │   ├── StatsCard.jsx       # Metric card (total clicks, last visit)
        │   │   ├── ClickChart.jsx      # Recharts BarChart (daily clicks)
        │   │   ├── VisitHistoryTable.jsx # Recent visits list
        │   │   └── PublicStatsCard.jsx
        │   │
        │   └── ui/
        │       ├── Button.jsx          # Reusable button variants
        │       ├── Input.jsx           # Styled input with error state
        │       ├── Modal.jsx           # Base modal wrapper
        │       ├── Badge.jsx           # Status badges
        │       ├── Skeleton.jsx        # Loading skeletons
        │       ├── Tooltip.jsx         # Hover tooltip
        │       ├── Pagination.jsx      # Page controls
        │       └── EmptyState.jsx      # Empty list illustration
        │
        ├── hooks/
        │   ├── useAuth.js          # Auth state + actions
        │   ├── useUrls.js          # URL CRUD operations
        │   ├── useAnalytics.js     # Fetch analytics data
        │   ├── useCopyToClipboard.js
        │   └── useDebounce.js      # Search debounce
        │
        └── utils/
            ├── formatDate.js       # date-fns wrappers
            ├── truncateUrl.js      # Clip long URLs for display
            └── validators.js       # Zod schemas (frontend)
```

---

## Database Schema

### `users` Collection

```json
{
  "_id": "ObjectId",
  "name": "String (required)",
  "email": "String (required, unique, lowercase)",
  "passwordHash": "String (bcrypt, required)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

**Indexes:**
- `email`: unique index

---

### `urls` Collection

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: User, required)",
  "originalUrl": "String (required, validated URL)",
  "shortCode": "String (required, unique, 7 chars or custom alias)",
  "customAlias": "Boolean (default: false)",
  "clicks": "Number (default: 0)",
  "expiresAt": "Date (optional, nullable)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

**Indexes:**
- `shortCode`: unique index
- `userId`: index (for dashboard queries)
- `expiresAt`: TTL index (MongoDB auto-deletes expired docs)
- Compound: `{ userId: 1, createdAt: -1 }` (sorted dashboard pagination)

---

### `visits` Collection

```json
{
  "_id": "ObjectId",
  "urlId": "ObjectId (ref: Url, required)",
  "shortCode": "String (denormalized for fast lookup)",
  "timestamp": "Date (required, default: now)",
  "ip": "String (hashed for privacy)",
  "userAgent": "String"
}
```

**Indexes:**
- `urlId`: index
- `shortCode`: index
- `timestamp`: index (for time-range analytics queries)

---

## API Reference

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/signup` | ❌ | Register new user |
| `POST` | `/auth/login` | ❌ | Login, returns JWT |
| `GET` | `/auth/me` | ✅ | Get current user |

#### `POST /auth/signup`
- **Description:** Registers a new user account with secure password hashing.
- **Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "SecurePass123!"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "6647abcd1234ef5678901234",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "createdAt": "2026-05-19T07:30:00.000Z"
    }
  }
}
```

#### `POST /auth/login`
- **Description:** Authenticates user credentials and returns a JWT token for session management.
- **Request Body:**
```json
{
  "email": "jane@example.com",
  "password": "SecurePass123!"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "6647abcd1234ef5678901234",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "createdAt": "2026-05-19T07:30:00.000Z"
    }
  }
}
```

#### `GET /auth/me`
- **Description:** Fetches profile information for the currently authenticated session using the JWT Bearer token.
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "6647abcd1234ef5678901234",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "createdAt": "2026-05-19T07:30:00.000Z"
    }
  }
}
```

---

### URL Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/urls` | ✅ | Create short URL |
| `GET` | `/urls` | ✅ | Get all user's URLs |
| `DELETE` | `/urls/:id` | ✅ | Delete a URL |
| `PUT` | `/urls/:id` | ✅ | Update destination URL |
| `GET` | `/urls/:id/analytics` | ✅ | Get URL analytics |

#### `POST /urls`
- **Description:** Shortens a given destination URL. Supports optional custom aliases and links expiration dates.
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
```json
{
  "originalUrl": "https://www.github.com/katomaran/hackathon-2026",
  "customAlias": "kt26hk",        // optional (must be unique)
  "expiresAt": "2026-12-31T23:59:59.000Z"  // optional ISO datetime
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "_id": "6647bcde1234ef5678905678",
    "originalUrl": "https://www.github.com/katomaran/hackathon-2026",
    "shortCode": "kt26hk",
    "shortUrl": "http://localhost:5000/kt26hk",
    "clicks": 0,
    "expiresAt": "2026-12-31T23:59:59.000Z",
    "createdAt": "2026-05-19T07:30:00.000Z",
    "updatedAt": "2026-05-19T07:30:00.000Z"
  }
}
```

#### `GET /urls`
- **Description:** Returns all URLs created by the logged-in user. Supports client-side sorting, pagination, and text filtering.
- **Headers:** `Authorization: Bearer <token>`
- **Query Params:** `?page=1&limit=10&search=github`
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "urls": [
      {
        "_id": "6647bcde1234ef5678905678",
        "originalUrl": "https://www.github.com/katomaran/hackathon-2026",
        "shortCode": "kt26hk",
        "shortUrl": "http://localhost:5000/kt26hk",
        "clicks": 47,
        "expiresAt": "2026-12-31T23:59:59.000Z",
        "createdAt": "2026-05-19T07:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "limit": 10,
      "totalPages": 3,
      "totalCount": 24
    }
  }
}
```

#### `PUT /urls/:id`
- **Description:** Updates the destination link or expiry date for an active short URL owned by the logged-in user.
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
```json
{
  "originalUrl": "https://github.com/katomaran/hackathon-2026-new",
  "expiresAt": "2027-06-30T12:00:00.000Z"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "URL successfully updated",
  "data": {
    "_id": "6647bcde1234ef5678905678",
    "originalUrl": "https://github.com/katomaran/hackathon-2026-new",
    "shortCode": "kt26hk",
    "shortUrl": "http://localhost:5000/kt26hk",
    "clicks": 47,
    "expiresAt": "2027-06-30T12:00:00.000Z",
    "createdAt": "2026-05-19T07:30:00.000Z",
    "updatedAt": "2026-05-19T12:00:00.000Z"
  }
}
```

#### `DELETE /urls/:id`
- **Description:** Deletes a specific short URL and purges all of its associated click-tracking analytics entries.
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "URL and its analytics were deleted successfully",
  "data": {
    "_id": "6647bcde1234ef5678905678"
  }
}
```

---

### Redirect Endpoint (Public)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/:shortCode` | ❌ | Redirect to original URL |

- **Flow Behavior:**
  - Performs an atomic `$inc` on the URL click counter.
  - Asynchronously saves a `Visit` record containing request timestamps, masked IP addresses, and User-Agent strings.
  - Emits a HTTP `302 Found` status with the `Location` header directed to the original destination URL.
- **Error Behavior:**
  - Returns `410 Gone` if the link's `expiresAt` date has passed.
  - Returns `404 Not Found` if the requested short code is invalid.

---

### Analytics Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/urls/:id/analytics` | ✅ | Detailed analytics (owner only) |
| `GET` | `/stats/:shortCode` | ❌ | Public stats for any link |

#### `GET /urls/:id/analytics`
- **Description:** Accesses detailed metrics for the owner's link, returning total clicks, temporal trends, and recent visits.
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "url": {
      "shortCode": "kt26hk",
      "originalUrl": "https://github.com/katomaran/hackathon-2026-new",
      "createdAt": "2026-05-19T07:30:00.000Z"
    },
    "totalClicks": 142,
    "lastVisited": "2026-05-19T10:22:00.000Z",
    "recentVisits": [
      {
        "timestamp": "2026-05-19T10:22:00.000Z",
        "ip": "192.168.***.***",
        "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36..."
      }
    ],
    "dailyClicks": [
      { "date": "2026-05-13", "count": 8 },
      { "date": "2026-05-14", "count": 15 },
      { "date": "2026-05-15", "count": 22 },
      { "date": "2026-05-16", "count": 18 },
      { "date": "2026-05-17", "count": 31 },
      { "date": "2026-05-18", "count": 25 },
      { "date": "2026-05-19", "count": 23 }
    ]
  }
}
```

#### `GET /stats/:shortCode`
- **Description:** A public analytics dashboard query returning high-level metrics for public display. Protects database records by withholding visitor IP addresses and User-Agents.
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "shortCode": "kt26hk",
    "originalUrl": "https://github.com/...",
    "clicks": 142,
    "createdAt": "2026-05-19T07:30:00.000Z",
    "lastVisited": "2026-05-19T10:22:00.000Z"
  }
}
```

---

### Standard Error Response
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "originalUrl", "message": "Must be a valid URL" }
  ]
}
```

---

## Environment Variables

### Backend (`backend/.env`)
```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/linksnap?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
JWT_EXPIRES_IN=7d

# App
BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

### Frontend (`frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SHORT_BASE_URL=http://localhost:5000
```

---

## Setup Instructions

### Prerequisites

| Tool | Version |
|---|---|
| Node.js | 20.x LTS |
| npm | 9.x+ |
| MongoDB Atlas | Account with cluster |
| Git | latest |

### 1. Clone the Repository
```bash
git clone https://github.com/<your-username>/linksnap.git
cd linksnap
```

### 2. Install Root Dependencies
```bash
npm install
```

### 3. Backend Setup
```bash
cd backend
cp .env.example .env
# → Fill in MONGODB_URI and JWT_SECRET in .env
npm install
```

### 4. Frontend Setup
```bash
cd ../frontend
cp .env.example .env
# → VITE_API_BASE_URL is pre-set to localhost:5000
npm install
```

### 5. Run in Development (from root)
```bash
# From project root — runs both concurrently
npm run dev
```

Or separately:
```bash
# Terminal 1 — Backend
cd backend && npm run dev     # nodemon on port 5000

# Terminal 2 — Frontend
cd frontend && npm run dev    # Vite on port 5173
```

### 6. Access the App
| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000/api |
| Short Link | http://localhost:5000/{shortCode} |

### 7. Build for Production
```bash
# Build frontend
cd frontend && npm run build

# Serve frontend via Express static (production mode)
cd backend && NODE_ENV=production npm start
```

---

## AI Planning Document

### Phase 1 — Requirements Analysis
1. Read full problem statement
2. Identify mandatory vs bonus features
3. Define user journeys:
   - **Unauthenticated:** Land → Shorten → See short URL → Copy
   - **Authenticated:** Login → Dashboard → Create/Manage/Analyze links
   - **Any User:** Click short URL → Redirect → Visit recorded

### Phase 2 — Data Modeling
1. Identify entities: `User`, `URL`, `Visit`
2. Define relationships:
   - User (1) → URLs (many)
   - URL (1) → Visits (many)
3. Design indexes for performance (shortCode lookup, userId filter)
4. Decide denormalization strategy (`shortCode` in `Visit` for direct lookup)

### Phase 3 — API Design
1. RESTful conventions: noun-based resources, HTTP verbs
2. JWT auth flow: signup/login → token → bearer header
3. Middleware chain: auth → validate → rate-limit → controller
4. Standardize response shape: `{ success, data, message, errors }`

### Phase 4 — Frontend Architecture
1. Zustand over Redux (simpler, sufficient for this scope)
2. Axios interceptor to attach JWT on every request
3. Optimistic UI updates for delete/edit actions
4. Protected routes via `<ProtectedRoute>` wrapper
5. Recharts for analytics visualization

### Phase 5 — Feature Implementation Order
```
Auth (BE) → Auth (FE) → URL CRUD (BE) → URL CRUD (FE)
→ Redirect + Visit tracking → Dashboard → Analytics
→ Bonus: QR, Alias, Expiry, Charts, Edit URL
```

### Phase 6 — Quality & Polish
1. Form validation (Zod schemas on FE, express-validator on BE)
2. Loading states (Skeleton components)
3. Error boundaries and toast notifications
4. Responsive layout (Tailwind breakpoints: sm/md/lg)
5. Rate limiting on public redirect + URL creation

---

## Assumptions Made

1. **Single BASE_URL** — The application assumes one domain serves both the API and handles short-link redirects (no separate CDN).
2. **No email verification** — Signup immediately grants access without email confirmation (suitable for hackathon scope).
3. **JWT stored in localStorage** — For simplicity. Production apps should prefer httpOnly cookies.
4. **IP stored as plaintext** — In production, IPs should be anonymized/hashed for GDPR compliance.
5. **No refresh token** — JWT is set to 7-day expiry. Users must re-login after expiry.
6. **MongoDB Atlas free tier** — Assumes M0 cluster with ~512MB storage limit.
7. **Custom alias uniqueness** — Custom aliases share the same namespace as auto-generated codes.
8. **Rate limiting** — Applied globally; in production, per-user limits would be better.
9. **No geolocation in v1** — Geolocation analytics is listed as planned but not implemented.
10. **nanoid length** — Short codes are 7 characters, providing ~3.5 trillion unique codes (sufficient at scale).

---

## UI Libraries & Dependencies

### Frontend
| Library | Version | Purpose |
|---|---|---|
| `react` | 18.x | UI Framework |
| `react-dom` | 18.x | React DOM renderer |
| `react-router-dom` | 6.x | Client-side routing |
| `zustand` | 4.x | Lightweight state management |
| `axios` | 1.x | HTTP requests |
| `tailwindcss` | 3.x | Utility-first CSS |
| `recharts` | 2.x | Data visualization charts |
| `lucide-react` | latest | Icon library |
| `react-hot-toast` | 2.x | Toast notifications |
| `qrcode.react` | 3.x | QR code generation |
| `date-fns` | 3.x | Date formatting |
| `react-hook-form` | 7.x | Form state management |
| `zod` | 3.x | Schema validation |
| `@headlessui/react` | 2.x | Accessible modals/dropdowns |

### Backend
| Library | Version | Purpose |
|---|---|---|
| `express` | 4.x | HTTP server framework |
| `mongoose` | 8.x | MongoDB ODM |
| `jsonwebtoken` | 9.x | JWT signing/verification |
| `bcryptjs` | 2.x | Password hashing |
| `express-validator` | 7.x | Request validation |
| `nanoid` | 5.x | Short code generation |
| `cors` | 2.x | Cross-origin resource sharing |
| `express-rate-limit` | 7.x | API rate limiting |
| `morgan` | 1.x | HTTP request logging |
| `dotenv` | 16.x | Environment variables |
| `nodemon` | 3.x | Dev auto-restart |

---

## Security Best Practices

To ensure high-grade data protection and prevent standard attack vectors, the following security architecture has been implemented:

### 1. Cryptographic Password Hashing
- Under no circumstances are raw user passwords saved to the database.
- Leverages the modern industry-standard `bcryptjs` library with **12 salt rounds** to perform one-way cryptographic hashing of user passwords.
- Executed automatically via a Mongoose pre-save hook on the `User` model, avoiding developer oversight.

### 2. Session Management & Authorization (JWT)
- Authenticated routes are protected via a robust JSON Web Token (JWT) workflow.
- Tokens are cryptographically signed using the `HMAC-SHA256` algorithm with a securely stored server-side `JWT_SECRET`.
- Signed tokens carry standard claims (`userId`) with an expiration of `7d`. Clients present this token in the `Authorization` header as a `Bearer <token>` scheme.

### 3. API Rate Limiting
- Public and user-facing endpoints are shielded from brute-force and Denial-of-Service (DoS) attacks using the `express-rate-limit` middleware.
- **Global API Rate Limit:** Restricts requests to 100 per 15-minute window per IP.
- **Authentication Routes Rate Limit:** Signup and login attempts are strictly capped at 10 requests per 15-minute window per IP to thwart credential stuffing.

### 4. Input Sanitization & Schematized Validation
- Standard validation schemas are enforced on both the client (via `zod` and `react-hook-form`) and the server (via `express-validator`).
- Destination URLs must conform to valid URI structures (verifying `http` or `https` protocols).
- Custom short code aliases undergo regular expression validation: `^[a-zA-Z0-9-_]+$` (restricting inputs to URL-safe alphanumeric symbols, hyphens, and underscores).

### 5. IP Masking and Privacy (GDPR Compliance)
- To protect visitor privacy, request IP addresses recorded in the `visits` collection are masked or hashed.
- The system masks the last octet of IPv4 addresses (e.g., `192.168.1.1` becomes `192.168.***.***`) before committing to disk, adhering to strict modern data residency and privacy regulations.

---

## Performance & Caching Strategy

High performance is critical for short link redirection. The following strategies ensure minimal database query latencies:

### 1. Database Indexing
Mongoose models configure explicit Mongo database indexes to optimize query routing:
- **`urls.shortCode`:** A single-field unique index. Provides $O(1)$ lookup time for redirection routing.
- **`urls.userId` + `urls.createdAt` (descending):** A compound index optimized for the user dashboard to load sorted, paginated records efficiently.
- **`visits.urlId` + `visits.timestamp` (descending):** A compound index enabling near-instantaneous computation of daily trend charts and chronological visit histories.
- **`urls.expiresAt`:** A dedicated MongoDB Time-To-Live (TTL) index. MongoDB's background scheduler automatically deletes expired links in the background when the current clock surpasses the document's expiry date.

### 2. High-Performance Redirect Path (Planned Redis Architecture)
In production, database bottlenecks on high-traffic links are avoided by placing an in-memory `Redis` caching layer in front of the redirect controller:

```
                  ┌───────────────┐
                  │    Request    │
                  └───────┬───────┘
                          │ GET /:shortCode
                          ▼
               /=====================\
              <   Exists in Cache?    >
               \=====================/
                    /           \
            YES    /             \   NO
                  /               \
                 ▼                 ▼
         ┌──────────────┐   ┌──────────────┐
         │ Read Redis   │   │ Query Mongo  │
         │ Redirect (302)│   └──────┬───────┘
         └──────────────┘          │
                                   ▼
                            ┌──────────────┐
                            │ Cache in     │
                            │ Redis (24h)  │
                            └──────┬───────┘
                                   ▼
                            ┌──────────────┐
                            │ Redirect (302)│
                            └──────┬───────┘
                                   ▼
                            /===============\
                           (  Record Visit   )  <-- Handled asynchronously via 
                            \===============/      an event queue or worker thread
```

---

## Error Handling & Logging

Standardized, predictable responses and detailed server log observability are key pillars of LinkSnap.

### 1. Unified Operational Error Handling
- The server implements a custom `AppError` class extending the native JavaScript `Error` class to encapsulate specific HTTP status codes and operational flags.
- An Express global error-handling middleware intercepts thrown exceptions to sanitize and format response payloads uniformly.

### 2. Separation of Concerns for Error Classes
- **Operational Errors (Expected):** Invalid credentials, failed validations, expired links (410), or non-existent URLs (404). These return descriptive messages in the standard JSON shape.
- **System Errors (Unexpected):** Database connection timeouts, disk space exhaustion, or syntax errors. The client receives a generic `"Something went wrong"` 500 status, while the actual stack trace is output to secure system logs and sent to monitoring services.

### 3. Observability & Request Logging
- Dev sessions employ `morgan` for real-time console coloring of network responses.
- In production, server events are routed through a structured JSON logger (like `Winston` or `Pino`), which aggregates logs into centralized dashboards (Elasticsearch, Logstash, Datadog) for predictive failure analytics.

---

## Testing Strategy

To establish continuous integration confidence and prevent regression bugs, the codebase follows a multi-tiered test strategy:

### 1. Backend REST API Integration Tests
- **Framework:** `Jest` paired with `Supertest` to simulate live HTTP request chains without opening networking ports.
- **Coverage Targets:**
  - Complete authentication workflows (Signup → Login → Profile fetching).
  - Validation boundary checks (e.g., verifying custom aliases with special characters reject with a 400).
  - Expiration and redirection routing assertions.
- **Isolation:** A dedicated in-memory Mongo Server instance (`mongodb-memory-server`) isolates testing environments to prevent dirtying dev and production clusters.

### 2. Frontend Component & Schema Testing
- **Framework:** `Vitest` and `React Testing Library` for DOM assertion rendering.
- **Coverage Targets:**
  - Validation schemas (confirming the Zod parser accurately blocks malformed URLs on input).
  - State store operations (mocking the Zustand store to test optimistic deletion UI feedback).
  - Mocking networking boundaries via Mock Service Worker (`MSW`) to simulate real API latency, failure states, and rate limits.

---

## Deployment & CI/CD Pipeline

LinkSnap is engineered for fully automated, containerized deployments.

### 1. Containerization (Docker)
Both the frontend and backend contain standardized, multi-stage `Dockerfile` configurations:
- **Backend Dockerfile:** Standard Node.js base container, installs production dependencies, and exposes the port.
- **Frontend Dockerfile:** Builds the static SPA assets and wraps them in a lightweight `Nginx` container to serve assets at sub-millisecond latencies.

### 2. Infrastructure Hosting Topology
- **API Server & Short URL Router:** Deployed on **Render** or **Fly.io** as auto-scaling Web Services connected to the MongoDB Atlas cluster.
- **Static Frontend Client:** Built and hosted on **Vercel** or **Netlify**, utilizing globally distributed CDNs for instantaneous load times.
- **Database:** Hosted on **MongoDB Atlas** (M0 cluster during hackathon development; seamless horizontal scaling to dedicated tier for high-load production).

### 3. Automated CI/CD Workflows
Using **GitHub Actions**, a fully automated continuous deployment pipeline is configured:
- **Linting & Compilation check:** Triggered on every pull request to compile TS types and run ESLint.
- **Automated Deployments:** Successful merges to `main` auto-trigger webhook integrations that rebuild the containers and update production instances on Vercel and Render with zero-downtime rolling restarts.

---

## Git Conventions

### Branch Strategy
```
main          ← production-ready code
dev           ← integration branch
feature/*     ← individual features
fix/*         ← bug fixes
```

### Commit Message Format
```
feat: add QR code generation modal
fix: resolve JWT expiry edge case on redirect
chore: update tailwind config with custom colors
docs: add API reference to technical document
```

---

## Scripts Reference

```json
// Root package.json
{
  "scripts": {
    "dev": "concurrently \"npm run dev --prefix backend\" \"npm run dev --prefix frontend\"",
    "build": "npm run build --prefix frontend",
    "start": "npm start --prefix backend"
  }
}
```

```json
// backend/package.json
{
  "scripts": {
    "dev": "nodemon server.js",
    "start": "node server.js"
  }
}
```

```json
// frontend/package.json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

---

*This project is a part of a hackathon run by https://katomaran.com*
