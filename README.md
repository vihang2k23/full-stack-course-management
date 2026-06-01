# Course Manager — Full Stack Learning Project

A full-stack **course management** application built with **Node.js, Express, MongoDB, and React**. Users can register with a profile photo, manage their own courses with images, and reset passwords via email OTP.

---

## Features

### Authentication & users
- **Sign up** with name, email, password, role (`user` / `admin`), and **profile photo** (required)
- **Login / logout** with JWT (7-day expiry)
- **Single active session** — new login invalidates the previous token stored in the database
- **Protected routes** — `isTokenVerified` policy checks Bearer token + DB session
- **Profile page** — update display name and change profile photo
- **Navbar** — shows profile picture (or initials fallback) and role badge
- **Role-based demo endpoints** — user dashboard vs admin dashboard

### Courses (per-user)
- Each user sees and manages **only their own courses** (`createdBy` on every course)
- **Create** course with name, duration, fees, and **thumbnail image** (required)
- **Read** all own courses (newest first) and get one course by ID
- **Update** course fields; image optional on update (keeps current if omitted)
- **Delete** own courses
- **Card grid UI** with image previews and formatted fees

### File uploads (Multer)
- **User images** → `backend/uploads/users/`
- **Course images** → `backend/uploads/courses/`
- Allowed types: JPEG, PNG, WebP (max **5 MB**)
- Images served at `http://localhost:3000/uploads/...`
- Old profile image removed from disk when a new one is uploaded

### Password reset (email)
- **Forgot password** — sends 6-digit OTP + reset link to email
- **Verify OTP** — validates code, issues short-lived reset JWT
- **Reset password** — set new password within the configured window
- **Welcome email** on successful signup (non-blocking if SMTP fails)
- Gmail-friendly SMTP setup (App Password recommended)

### Validation & errors
- **express-validator** rules for auth, courses, and uploads
- **Multipart checks** — signup/profile/course create require `FormData`
- **Upload validation** — ensures `req.file` exists when an image is required
- **Global error handler** — MongoDB duplicate key, CastError, Multer errors, validation errors

### Frontend (React + Vite)
- Modern UI with responsive layout
- Pages: Home, Login, Signup, Forgot Password, Verify OTP, Reset Password, Courses, Profile
- **Protected routes** for courses and profile
- Central **API client** with JWT in `Authorization` header
- **Auth context** — persists user/token in `localStorage`, refreshes profile via `GET /auth/me`

---

## Tech stack

| Layer | Technologies |
|--------|----------------|
| **Backend** | Node.js, Express 5, MongoDB (Mongoose), JWT, bcrypt |
| **Uploads** | Multer (disk storage) |
| **Email** | Nodemailer |
| **Validation** | express-validator |
| **Frontend** | React 19, React Router, Vite |
| **Database** | MongoDB Atlas or local MongoDB |

---

## Project structure

```
mongo/
├── backend/
│   ├── config/           # database, mailer, multer, paths
│   ├── constants/        # roles, reset, upload
│   ├── controllers/      # UserController, CourseController, PasswordController
│   ├── middleware/       # validateMiddleware, errorHandler
│   ├── models/           # User.js, Course.js
│   ├── policies/         # isTokenVerified.js (JWT auth)
│   ├── routers/          # AuthRouter.js, CourseRouter.js
│   ├── validators/       # *ValidationRules.js
│   ├── utils/            # authUtils, generateToken, resetPassword
│   ├── uploads/          # users/, courses/ (runtime)
│   └── server.js
└── frontend/
    └── src/
        ├── api/          # client, auth, courses, uploads
        ├── components/   # Navbar, ProtectedRoute
        ├── context/      # AuthContext
        └── pages/        # Login, Signup, Courses, Profile, etc.
```

Naming follows a clear convention (aligned with a reference Express layout):
- Controllers: `UserController.js`
- Routers: `AuthRouter.js`
- Policies: `isTokenVerified.js`
- Validators: `authValidationRules.js`

---

## API reference

Base URL: `http://localhost:3000/api/v1`

### Auth (`/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/signup` | No | Register (multipart: `name`, `email`, `password`, `role`, `image`) |
| POST | `/auth/login` | No | Login (JSON: `email`, `password`) |
| GET | `/auth/me` | Yes | Current user profile |
| PUT | `/auth/profile` | Yes | Update name + photo (multipart) |
| POST | `/auth/logout` | Yes | Clear session token |
| POST | `/auth/forgot-password` | No | Send reset OTP email |
| POST | `/auth/verify-otp` | No | Verify OTP (`token`, `otp`) |
| POST | `/auth/reset-password` | No | Set new password (`resetToken`, `password`) |
| GET | `/auth/user-dashboard` | Yes (user) | RBAC demo |
| GET | `/auth/admin-dashboard` | Yes (admin) | RBAC demo |

### Courses (`/courses`) — all require auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/courses` | List current user's courses |
| POST | `/courses` | Create course (multipart + `image`) |
| GET | `/courses/:id` | Get one own course |
| PUT | `/courses/:id` | Update course (multipart, image optional) |
| DELETE | `/courses/:id` | Delete own course |

---

## Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- Gmail App Password (optional, for email features)

### 1. Backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

| Variable | Description |
|----------|-------------|
| `PORT` | API port (default `3000`) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing JWTs |
| `CLIENT_URL` | Frontend origin(s) for CORS (e.g. `http://localhost:5173`) |
| `RESET_EXPIRY_MINUTES` | OTP validity (default `60`) |
| `RESET_JWT_EXPIRES` | Reset JWT expiry (e.g. `1h`) |
| `SMTP_*` / `MAIL_FROM` | Email for OTP and welcome mail |

```bash
npm install
npm run dev
```

API: `http://localhost:3000`

### 2. Frontend

```bash
cd frontend
cp .env.example .env
```

Set in `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000/api/v1
```

```bash
npm install
npm run dev
```

App: `http://localhost:5173`

---

## Environment notes

- Never commit `.env` or real credentials to git.
- For **Gmail SMTP**, use an [App Password](https://myaccount.google.com/apppasswords) (2FA required), not your normal Gmail password.
- **CORS**: `CLIENT_URL` must include your frontend URL (e.g. `http://localhost:5173`).
- **Login returns 401** if the email exists but the password is wrong — use Forgot Password or the password from signup.

---

## Password reset flow

1. User submits email on **Forgot password**
2. Server stores hashed OTP + sends email with OTP and link (`/verify-otp?token=...`)
3. User enters OTP on **Verify OTP** → receives `resetToken` (JWT)
4. User sets new password on **Reset password**

---

## Security highlights

- Passwords hashed with **bcrypt** (salt rounds: 10)
- JWT stored in DB for session invalidation on logout / new login
- Reset OTP stored **hashed** in the database
- Generic login errors (no email enumeration)
- Course access scoped by `createdBy` (users cannot edit others' courses)
- Password-reset JWTs rejected for normal API auth (`purpose: password_reset`)

---

## Scripts

| Location | Command | Description |
|----------|---------|-------------|
| `backend/` | `npm run dev` | Start API with nodemon |
| `backend/` | `npm start` | Start API (production) |
| `frontend/` | `npm run dev` | Start Vite dev server |
| `frontend/` | `npm run build` | Production build |

---

## License

ISC (learning project)
