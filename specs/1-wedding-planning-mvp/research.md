<div dir="rtl">

# מחקר טכני - Wedding Planning MVP

**Feature Branch**: `1-wedding-planning-mvp`
**Created**: 2026-01-07

## Technology Decisions

### 1. Frontend Framework: Next.js 15 with App Router

**Decision**: Next.js 15+ with App Router

**Rationale**:
- App Router provides modern React patterns (Server Components, Streaming)
- Built-in routing based on file structure
- Excellent TypeScript support
- Easy deployment options (Vercel, Firebase Hosting)
- Strong community and documentation

**Alternatives Considered**:
- Vite + React Router: Lighter but less integrated routing
- Remix: Good SSR but smaller ecosystem
- Plain React: Would need additional setup for routing, SSR

**Implementation Notes**:
- Use Server Components for static content and data fetching
- Use Client Components (`'use client'`) for interactive elements
- Layout files for shared UI (Header, Sidebar)

---

### 2. Styling: Tailwind CSS v4 with RTL

**Decision**: Tailwind CSS v4 with logical properties

**Rationale**:
- Utility-first approach speeds development
- Native RTL support via logical properties (`ms-`, `me-`, `ps-`, `pe-`)
- No separate RTL stylesheet needed
- Excellent responsive design utilities
- Small bundle size with purging

**Alternatives Considered**:
- CSS Modules: More traditional, but slower development
- Styled Components: Runtime overhead, complex RTL
- Material UI: Opinionated, larger bundle

**Implementation Notes**:
- Always use logical properties instead of directional
- Configure `dir="rtl"` and `lang="he"` in root layout
- Use `ltr:` and `rtl:` prefixes only when truly needed

**RTL Property Mapping**:
| Physical | Logical |
|----------|---------|
| `ml-*` | `ms-*` (margin-start) |
| `mr-*` | `me-*` (margin-end) |
| `pl-*` | `ps-*` (padding-start) |
| `pr-*` | `pe-*` (padding-end) |
| `left-*` | `start-*` |
| `right-*` | `end-*` |
| `text-left` | `text-start` |
| `text-right` | `text-end` |

---

### 3. Backend: Firebase (Auth + Firestore)

**Decision**: Firebase v11 Modular SDK

**Rationale**:
- Complete auth solution with email verification
- Real-time database with offline support
- Serverless - no backend to maintain
- Free tier sufficient for MVP
- Easy cloud functions for reminders

**Alternatives Considered**:
- Supabase: PostgreSQL-based, steeper learning curve
- Custom Node.js + PostgreSQL: More control but more maintenance
- AWS Amplify: More complex setup

**Implementation Notes**:
- Use modular imports (`import { getAuth } from 'firebase/auth'`)
- Connect to emulator in development by default
- Use `NEXT_PUBLIC_USE_FIREBASE_CLOUD=true` for cloud connection
- Use `Timestamp` type for dates in Firestore

---

### 4. React Firebase Integration: react-firebase-hooks v5

**Decision**: react-firebase-hooks v5.1+

**Rationale**:
- Simplifies Firebase usage in React components
- Automatic loading/error state management
- Automatic listener cleanup
- Reduces boilerplate significantly

**Alternatives Considered**:
- Manual useEffect + listeners: More code, error-prone cleanup
- TanStack Query + Firebase: Overkill for MVP
- SWR + Firebase: Good but less Firebase-specific

**Key Hooks**:
```typescript
// Auth state
const [user, loading, error] = useAuthState(auth);

// Collection data with real-time updates
const [tasks, loading, error] = useCollectionData(query);

// Single document
const [couple, loading, error] = useDocumentData(coupleRef);
```

---

### 5. Email Reminders: Firebase Cloud Functions + SendGrid

**Decision**: Firebase Cloud Functions with scheduled triggers

**Rationale**:
- Native Firebase integration
- Scheduled functions (cron-like)
- Pay-per-use pricing
- Easy to deploy with Firebase CLI

**Alternatives Considered**:
- Vercel Cron: Limited on free tier
- External cron service: Additional infrastructure
- Client-side scheduling: Unreliable

**Implementation Notes**:
- Weekly summary: Run every Sunday at 9:00 AM
- Day-before reminders: Run daily at 9:00 AM
- Use SendGrid or Firebase Email Extension for delivery

---

### 6. Calendar Export: ICS File Generation

**Decision**: Client-side ICS generation

**Rationale**:
- No server-side processing needed
- Works with all calendar applications
- Simple format to generate
- Standard RFC 5545 compliance

**Alternatives Considered**:
- Google Calendar API: Complex OAuth, overkill
- Server-side generation: Unnecessary complexity

**ICS Format Example**:
```
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Wedding Planning//Task//HE
BEGIN:VEVENT
UID:task-{taskId}@wedding-planning
DTSTAMP:{now}
DTSTART:{dueDate}
SUMMARY:{taskTitle}
DESCRIPTION:{taskDescription}
END:VEVENT
END:VCALENDAR
```

---

### 7. WhatsApp Sharing: wa.me Links

**Decision**: Standard wa.me URL format

**Rationale**:
- No API integration needed
- Works on mobile and desktop
- Native WhatsApp experience
- URL-encoded text message

**Format**:
```
https://wa.me/?text={encodeURIComponent(message)}
```

---

### 8. State Management: React Context + Hooks

**Decision**: React Context for global state, hooks for local

**Rationale**:
- Built into React, no additional library
- Sufficient for MVP scope
- Firebase real-time listeners handle data sync
- Context for user/couple info, partner toggle

**Alternatives Considered**:
- Redux: Overkill for MVP
- Zustand: Good but unnecessary dependency
- Jotai/Recoil: Atomic state not needed

**Contexts Needed**:
- `AuthContext`: Current user state
- `CoupleContext`: Couple profile data
- `PartnerContext`: Header toggle state

---

### 9. Form Handling: Native React

**Decision**: Native React forms with controlled inputs

**Rationale**:
- MVP has simple forms
- No complex validation logic
- Keeps bundle size small

**Alternatives Considered**:
- React Hook Form: Good but extra dependency
- Formik: More features than needed
- Zod for validation: Add if validation gets complex

---

### 10. Development Environment

**Decision**: Firebase Emulator as default

**Rationale**:
- No cloud costs during development
- Fast iteration
- Full feature parity
- Easy data reset

**Setup**:
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Start emulator
firebase emulators:start

# Access UI at http://localhost:4000
```

**Test User**:
- Email: `test@wedding.dev`
- Password: `Test123!`

---

## Open Questions (Resolved)

| Question | Resolution |
|----------|------------|
| Guest link expiration? | Links never expire (simple implementation) |
| Guest self-update after registration? | No, one-time submission only |
| Can couple manually add guests? | Yes, manual add supported |
| RTL framework support? | Tailwind logical properties |
| Email provider? | SendGrid via Firebase extension |

## Dependencies Summary

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "firebase": "^11.0.0",
    "react-firebase-hooks": "^5.1.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "tailwindcss": "^4.0.0",
    "@types/react": "^19.0.0",
    "@types/node": "^20.0.0",
    "eslint": "^9.0.0"
  }
}
```

</div>
