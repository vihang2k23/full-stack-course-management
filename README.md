# Course Management (Full Stack)

## Project structure

```
mongo/
├── backend/     Express + MongoDB API
└── frontend/    React (Vite)
```

## Setup

### Backend

```bash
cd backend
cp .env.example .env
# edit .env with your MongoDB URI and JWT_SECRET
npm install
npm run dev
```

API runs on `http://localhost:3000`

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

App runs on `http://localhost:5173`

### Run both from root

```bash
npm install
npm run install:all
npm run dev
```

## API base URL

`http://localhost:3000/api/v1`

Frontend uses `VITE_API_URL` from `frontend/.env`.

## Forgot password

1. `POST /auth/forgot-password` — sends OTP email
2. `POST /auth/verify-otp` — verify OTP, get short reset JWT
3. `POST /auth/reset-password` — set new password

Add SMTP settings to `backend/.env` (see `backend/.env.example`).
Gmail: use an [App Password](https://myaccount.google.com/apppasswords), not your normal password.
