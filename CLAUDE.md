# Wedding Planning MVP Development Guidelines

Auto-generated from feature plans. Last updated: 2026-01-07

## Active Technologies

- Next.js 15+ with App Router (1-wedding-planning-mvp)
- Tailwind CSS 4 with RTL support (1-wedding-planning-mvp)
- Firebase 11+ Auth + Firestore (1-wedding-planning-mvp)
- react-firebase-hooks 5.1+ (1-wedding-planning-mvp)
- TypeScript 5+ strict mode (1-wedding-planning-mvp)

## Project Structure

```text
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

## Commands

```bash
# Development
npm run dev                 # Start dev server (port 3000)
npm run build              # Build for production
npm run lint               # Run ESLint

# Firebase
firebase emulators:start   # Start emulator suite
firebase deploy            # Deploy to production

# Testing
npm test                   # Run tests
```

## Code Style

### TypeScript
- Strict mode enabled, no `any` types
- All types centralized in `src/types/index.ts`
- Use `Timestamp` from Firebase for dates in Firestore

### RTL / Tailwind
- **Always use logical properties**:
  - ✅ `ms-4`, `me-4`, `ps-4`, `pe-4`, `start-0`, `end-0`
  - ❌ `ml-4`, `mr-4`, `pl-4`, `pr-4`, `left-0`, `right-0`
- Root layout: `<html lang="he" dir="rtl">`

### Services Architecture
- All business logic through service layer
- UI components never access Firebase directly
- Services have interfaces in `services/interfaces/`
- Custom hooks in `hooks/` connect UI to services

### Logging
- Use centralized logger from `lib/logger.ts`
- Levels: ERROR, WARN, INFO, DEBUG (DEBUG dev only)
- Always include context: `{ coupleId, taskId }`
- Log at: CRUD operations, auth events, errors

## Recent Changes

- 1-wedding-planning-mvp: Initial MVP implementation plan

## Constitution Reference

See `.specify/memory/constitution.md` for:
- Services-First Architecture principles
- RTL-First design requirements
- Firebase configuration standards
- Logging guidelines

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
