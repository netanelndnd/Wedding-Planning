# Wedding Planning MVP

A comprehensive wedding planning application built with Next.js 15, Firebase, and TypeScript.

## Features

- User authentication with email verification
- Couple profile management
- Task management with categories
- Guest management with self-registration
- Budget tracking and dashboard
- Email reminders
- WhatsApp sharing and calendar export

## Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript 5+ (strict mode)
- **Styling**: Tailwind CSS 4 with RTL support
- **Backend**: Firebase 11+ (Auth + Firestore + Storage)
- **State Management**: react-firebase-hooks 5.1+

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn
- Firebase CLI (`npm install -g firebase-tools`)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Wedding-Planning-Azure
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (already configured for emulator):
```bash
cp .env.example .env.local
```

### 🚀 Quick Start (Development)

**שלב 1: הפעלת Firebase Emulator**
```bash
firebase emulators:start
```
המתן עד שתראה: `All emulators ready!`

**שלב 2: הפעלת שרת הפיתוח** (בטרמינל נפרד)
```bash
npm run dev
```

**שלב 3: פתח את הדפדפן**
- האפליקציה: [http://localhost:3000](http://localhost:3000)
- Firebase Emulator UI: [http://localhost:4000](http://localhost:4000)

### 🎯 VS Code Launch Configurations

ניתן להריץ מתוך VS Code באמצעות `F5`:

| Configuration | תיאור |
|--------------|-------|
| `Dev Server` | הפעלת שרת הפיתוח בלבד |
| `Dev Server (with Emulator)` | שרת פיתוח עם Emulator |
| `Firebase Emulator` | הפעלת Emulator בלבד |
| `Dev + Emulator` | הפעלת שניהם יחד (מומלץ) |

### Firebase Emulator Ports

| Service | Port |
|---------|------|
| Auth | 9099 |
| Firestore | 8080 |
| Storage | 9199 |
| Functions | 5001 |
| Emulator UI | 4000 |

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth pages (login, signup, forgot-password)
│   ├── (dashboard)/       # Protected pages (dashboard, tasks, guests, settings)
│   ├── invite/[coupleId]/ # Public guest registration
│   └── layout.tsx         # Root layout with RTL
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── layout/           # Header, Sidebar, PartnerToggle
│   ├── dashboard/        # Dashboard components
│   ├── tasks/            # Task components
│   ├── guests/           # Guest components
│   └── dev/              # Dev Dashboard (dev only)
├── services/             # Business logic layer
│   ├── interfaces/       # Service contracts
│   └── crud/             # Firebase implementations
├── hooks/                # Custom React hooks
├── types/                # TypeScript definitions
├── lib/                  # Config (firebase, logger, constants)
└── utils/                # Utility functions
```

## Development Guidelines

### RTL Support

This project uses RTL-first design for Hebrew language support. Always use logical CSS properties:

- ✅ Use: `ms-4`, `me-4`, `ps-4`, `pe-4`, `start-0`, `end-0`
- ❌ Avoid: `ml-4`, `mr-4`, `pl-4`, `pr-4`, `left-0`, `right-0`

### TypeScript

- Strict mode is enabled
- No `any` types allowed
- All types are centralized in `src/types/index.ts`

### Services Architecture

- All business logic goes through the service layer
- UI components never access Firebase directly
- Services have interfaces in `services/interfaces/`
- Custom hooks in `hooks/` connect UI to services

### Logging

Use the centralized logger from `lib/logger.ts`:

```typescript
import { logger } from '@/lib/logger';

logger.info('User logged in', { userId: 'abc123' });
logger.error('Failed to create task', { error: err.message, coupleId });
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Contributing

See [CLAUDE.md](./CLAUDE.md) for detailed development guidelines and coding standards.

## License

This project is private and proprietary.
