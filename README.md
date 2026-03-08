# Post Management – Frontend

Next.js frontend for the Post Management API. Production-ready structure with App Router, auth (login/register), and httpOnly cookie–based sessions.

## Folder structure

```
src/
├── app/
│   ├── (auth)/              # Auth route group (login, register)
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── api/auth/            # Next.js API routes (proxy to backend + cookies)
│   │   ├── login/route.ts
│   │   ├── register/route.ts
│   │   ├── logout/route.ts
│   │   └── session/route.ts
│   ├── layout.tsx
│   ├── page.tsx             # Protected home
│   └── globals.css
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   └── ui/
│       ├── Button.tsx
│       └── Input.tsx
├── contexts/
│   └── AuthContext.tsx
├── lib/
│   ├── api.ts               # Client API (calls /api/* with credentials)
│   └── constants.ts         # Cookie names and options
├── types/
│   └── auth.ts
└── middleware.ts            # Protects routes; redirects by auth state
```

## Setup

1. **Environment**

   ```bash
   cp .env.local.example .env.local
   ```

   Set `API_URL` to your backend base URL (e.g. `http://localhost:3000`). In production, use your deployed API URL.

2. **Run backend**

   From the project root (post-management):

   ```bash
   npm run dev
   # or: node src/server.js
   ```

   Ensure the backend is listening on the same host/port as in `API_URL`.

3. **Run frontend**

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

   Open [http://localhost:4000](http://localhost:4000). Sign up or sign in; you’ll be redirected to the home page with a session stored in an httpOnly cookie.

## Production

- **Build:** `npm run build`
- **Start:** `npm start`
- Set `API_URL` to the production API (e.g. `https://api.example.com`). Use HTTPS in production so the cookie can be set with `secure: true`.

## Auth flow

- **Login/Register:** Forms submit to Next.js routes `/api/auth/login` and `/api/auth/register`, which proxy to the backend and set an httpOnly cookie with the access token.
- **Session:** The app calls `/api/auth/session`, which reads the cookie and calls the backend `GET /api/auth/me`.
- **Logout:** `POST /api/auth/logout` clears the cookie.
- **Middleware:** Redirects unauthenticated users to `/login` and authenticated users away from `/login` and `/register` to `/`.
