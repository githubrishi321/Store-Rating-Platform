# Store Rating Platform

A full-stack web application where users can rate registered stores (1–5 stars). Built with Node.js + Express + Prisma (PostgreSQL) on the backend and React (Vite) + TailwindCSS on the frontend.

---

## Prerequisites

- **Node.js** v18+
- **PostgreSQL** v14+ running locally
- **npm** v9+

---

## Project Structure

```
Store-Rating-Platform/
├── backend/        # Node.js + Express + Prisma API
├── frontend/       # React + Vite + TailwindCSS SPA
└── README.md
```

---

## Setup & Running

### 1. Clone / enter the project

```bash
cd "Store-Rating-Platform"
```

### 2. Backend Setup

```bash
cd backend
```

**Create `.env`** (copy from `.env.example` and fill in your values):

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/store_rating_db"
JWT_SECRET="your-secret-key-here"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
```

**Install dependencies:**

```bash
npm install
```

**Create the database** in PostgreSQL:

```sql
CREATE DATABASE store_rating_db;
```

**Run migrations:**

```bash
npm run migrate
```

**Seed the database** (creates default admin):

```bash
npm run seed
```

**Start the development server:**

```bash
npm run dev
```

Backend runs at: `http://localhost:5000`

---

### 3. Frontend Setup

```bash
cd ../frontend
```

**Create `.env`** (copy from `.env.example`):

```
VITE_API_BASE_URL=http://localhost:5000/api
```

**Install dependencies:**

```bash
npm install
```

**Start the development server:**

```bash
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## Default Admin Login

After seeding, log in with:

| Field | Value |
|-------|-------|
| **Email** | `admin@storeratingapp.com` |
| **Password** | `Admin@123456` |

> ⚠️ **Change these credentials after first login!**

---

## User Roles

| Role | Access |
|------|--------|
| `ADMIN` | Dashboard stats, manage all users & stores |
| `NORMAL_USER` | Browse stores, submit/edit ratings |
| `STORE_OWNER` | View own store's average rating and rater list |

Registration via `/register` always creates a `NORMAL_USER`. Admins create `STORE_OWNER` accounts through the store creation form.

---

## Validation Rules

| Field | Rule |
|-------|------|
| Name | 20–60 characters |
| Email | Valid email format |
| Password | 8–16 chars, ≥1 uppercase, ≥1 special character |
| Address | Max 400 characters |
| Rating | Integer 1–5 |

---

## API Overview

### Auth (public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register new Normal User |
| `POST` | `/api/auth/login` | Login, returns JWT |
| `POST` | `/api/auth/logout` | Clear session |
| `PUT`  | `/api/auth/password` | Change own password |

### Admin (`ADMIN` role required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/admin/dashboard` | Platform stats |
| `GET`  | `/api/admin/users` | List users (filterable, sortable) |
| `GET`  | `/api/admin/users/:id` | User detail (with store rating if owner) |
| `POST` | `/api/admin/users` | Create user (ADMIN or NORMAL_USER) |
| `GET`  | `/api/admin/stores` | List stores with avg ratings |
| `POST` | `/api/admin/stores` | Create store + owner account |

### Normal User (`NORMAL_USER` role required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/stores` | List stores (with user's own rating) |
| `POST` | `/api/stores/:storeId/ratings` | Submit or update rating |

### Store Owner (`STORE_OWNER` role required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/store-owner/dashboard` | Store stats + rater list |

### Query Parameters for List Endpoints
- **Filter**: `?name=&email=&address=&role=` (case-insensitive partial match)
- **Sort**: `?sortBy=name&order=asc` (or `desc`)
- **Search** (stores): `?search=` (matches name OR address)

### Error Response Format
All errors return JSON:
```json
{
  "error": "Human-readable error message"
}
```
Validation errors:
```json
{
  "errors": {
    "email": "Invalid email format.",
    "password": "Password must be 8-16 chars..."
  }
}
```

---

## Screenshots

### Admin Dashboard
![Admin Dashboard](docs/screenshots/admin_dashboard.png)

### Admin Users Management
![Admin Users](docs/screenshots/admin_users.png)

### Admin Stores Management
![Admin Stores](docs/screenshots/admin_stores.png)

### Normal User Store Rating & Browsing
![User Stores](docs/screenshots/user_stores.png)

### Store Owner Dashboard
![Store Owner Dashboard](docs/screenshots/store_owner_dashboard.png)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express.js |
| ORM | Prisma |
| Database | PostgreSQL |
| Auth | JWT + bcrypt |
| Validation | express-validator |
| Frontend | React (Vite) |
| Routing | React Router v6 |
| HTTP Client | Axios |
| State | Zustand |
| Styling | TailwindCSS v4 |
