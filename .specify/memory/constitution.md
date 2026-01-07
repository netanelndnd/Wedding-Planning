# Wedding Planning MVP Constitution

## Core Principles

### א. Services-First Architecture
- All business logic MUST go through service layer
- UI components MUST NOT access Firebase directly
- Services MUST have interfaces defined in `services/interfaces/`
- Custom hooks in `hooks/` connect UI to services

### ב. RTL-First & Accessible Design
- Hebrew is the primary language (lang="he" dir="rtl")
- MUST use logical CSS properties only: ms-, me-, ps-, pe-, start-, end-
- MUST NOT use physical properties: ml-, mr-, pl-, pr-, left-, right-
- WCAG 2.1 compliance required

### ג. Firebase as Foundation
- Firebase v11+ modular SDK
- Firebase Emulator for development (default)
- Firestore for data persistence
- Firebase Auth for authentication

### ד. Strict TypeScript
- TypeScript strict mode enabled
- No `any` types allowed
- All types centralized in `src/types/index.ts`
- Use `Timestamp` from Firebase for dates

### ה. Simplicity & MVP
- Start simple, YAGNI principles
- No vendor management in MVP
- No Excel import in MVP
- Minimal required fields in forms

### ו. Minimal Meaningful Logs
- Use centralized logger from `lib/logger.ts`
- Log at: CRUD operations, auth events, errors only
- Levels: ERROR, WARN, INFO, DEBUG (DEBUG dev only)
- Always include context: `{ coupleId, taskId }`

## Governance

Constitution principles are NON-NEGOTIABLE during implementation.
Amendments require explicit user approval and documentation update.

**Version**: 1.0.0 | **Ratified**: 2026-01-07
