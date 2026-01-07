<div dir="rtl">

# Quickstart - Wedding Planning MVP

**Feature Branch**: `1-wedding-planning-mvp`
**Created**: 2026-01-07

## Prerequisites

- Node.js 20+
- npm or yarn
- Firebase CLI (`npm install -g firebase-tools`)
- Git

## Setup Steps

### 1. Clone and Install

```bash
# Clone the repository
git clone <repo-url>
cd Wedding-Planning-Azure

# Install dependencies
npm install
```

### 2. Environment Configuration

Create `.env.local` in the project root:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Development Settings
NEXT_PUBLIC_USE_FIREBASE_CLOUD=false
```

### 3. Firebase Setup

```bash
# Login to Firebase
firebase login

# Initialize Firebase (if not already done)
firebase init

# Select:
# - Firestore
# - Authentication
# - Emulators (Auth, Firestore)
```

### 4. Start Development

```bash
# Terminal 1: Start Firebase Emulator
firebase emulators:start

# Terminal 2: Start Next.js development server
npm run dev
```

### 5. Access the Application

| Service | URL |
|---------|-----|
| Application | http://localhost:3000 |
| Firebase Emulator UI | http://localhost:4000 |
| Firestore Emulator | http://localhost:8080 |
| Auth Emulator | http://localhost:9099 |

## Test Credentials

Use these credentials in the emulator environment:

| Field | Value |
|-------|-------|
| Email | `test@wedding.dev` |
| Password | `Test123!` |

## Dev Dashboard

On the login page (development mode only), you'll find the Dev Dashboard with:

- **Test User Credentials**: Copy button for quick login
- **Reset DB**: Delete all data in the emulator
- **Seed Data**: Load sample data for testing

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth pages (login, signup, etc.)
│   ├── (dashboard)/       # Protected pages
│   ├── invite/[coupleId]/ # Public guest registration
│   └── layout.tsx         # Root layout with RTL
├── components/            # React components
├── services/              # Business logic layer
│   ├── interfaces/        # Service contracts
│   └── crud/              # Firebase implementations
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript definitions
├── lib/                   # Config (firebase, logger)
└── utils/                 # Utility functions
```

## Common Commands

```bash
# Development
npm run dev                 # Start dev server
npm run build              # Build for production
npm run start              # Start production server
npm run lint               # Run ESLint

# Firebase
firebase emulators:start   # Start emulator suite
firebase deploy            # Deploy to production
```

## Switching to Cloud Firebase

To use the real Firebase (not emulator):

1. Set in `.env.local`:
   ```
   NEXT_PUBLIC_USE_FIREBASE_CLOUD=true
   ```

2. Or start with environment variable:
   ```bash
   NEXT_PUBLIC_USE_FIREBASE_CLOUD=true npm run dev
   ```

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/lib/firebase.ts` | Firebase initialization |
| `src/lib/logger.ts` | Centralized logging |
| `src/lib/constants.ts` | Default categories, test user |
| `src/types/index.ts` | All TypeScript types |
| `firestore.rules` | Firestore security rules |

## Troubleshooting

### Firebase Emulator Issues

```bash
# Check if ports are in use
lsof -i :8080
lsof -i :9099

# Kill processes on ports
kill -9 <PID>

# Clear emulator data
firebase emulators:start --clear
```

### Email Verification in Emulator

The emulator doesn't send real emails. To verify a user:
1. Go to Firebase Emulator UI (http://localhost:4000)
2. Navigate to Authentication
3. Find the user and manually verify email

### RTL Issues

Ensure all styling uses logical properties:
- ✅ `ms-4`, `me-4`, `ps-4`, `pe-4`
- ❌ `ml-4`, `mr-4`, `pl-4`, `pr-4`

### TypeScript Errors

```bash
# Check for type errors
npx tsc --noEmit

# Run ESLint with auto-fix
npm run lint -- --fix
```

</div>
