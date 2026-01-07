<div dir="rtl">

# תוכנית מימוש - Wedding Planning MVP

**Feature Branch**: `1-wedding-planning-mvp`
**Created**: 2026-01-07
**Status**: Planning

## Technical Context

### Technology Stack (From Constitution)

| Technology | Version | Role |
|------------|---------|------|
| Next.js | 15+ | Framework with App Router |
| Tailwind CSS | 4 | RTL-first styling |
| Firebase | 11+ | Auth + Firestore |
| react-firebase-hooks | 5.1+ | React Hooks for Firebase |
| TypeScript | 5+ | Type Safety |

### Architecture Decisions

- **Services-First Architecture**: All business logic through service layer
- **RTL-First Design**: Logical properties only (ms-, me-, ps-, pe-)
- **Firebase Emulator**: Default for development
- **Minimal Logging**: Only at critical points

### Key Constraints

- No `any` types - strict TypeScript
- No direct Firebase access from UI components
- Mobile-first responsive design
- WCAG 2.1 accessibility compliance

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| א. Services-First Architecture | ✅ COMPLIANT | All services defined with interfaces |
| ב. RTL-First & Accessible Design | ✅ COMPLIANT | Hebrew primary, logical properties |
| ג. Firebase as Foundation | ✅ COMPLIANT | Firebase v11 modular SDK |
| ד. Strict TypeScript | ✅ COMPLIANT | All types in types/index.ts |
| ה. Simplicity & MVP | ✅ COMPLIANT | No vendor management, no Excel import |
| ו. Minimal Meaningful Logs | ✅ COMPLIANT | Logs at CRUD, auth, errors only |

## Implementation Phases

### Phase 1: Infrastructure Setup (Foundation)

**Goal**: Working development environment with Firebase emulator

#### Tasks:
1. **Project Setup**
   - Create Next.js 15 project with App Router
   - Configure Tailwind CSS v4 with RTL support
   - Setup TypeScript strict mode
   - Configure ESLint

2. **Firebase Configuration**
   - Setup Firebase project connection
   - Configure emulator for development
   - Create `src/lib/firebase.ts` with emulator toggle
   - Create `src/lib/logger.ts` for centralized logging

3. **Type Definitions**
   - Create `src/types/index.ts` with all entities:
     - `Couple`, `Epic`, `Task`, `Guest`
     - Status enums: `TaskStatus`, `RsvpStatus`, `AssignedTo`

4. **Service Interfaces**
   - `IAuthService` - authentication operations
   - `ICoupleService` - couple profile CRUD
   - `IEpicService` - category management
   - `ITaskService` - task CRUD with filtering
   - `IGuestService` - guest management

#### Deliverables:
- [ ] Working Next.js project on port 3000
- [ ] Firebase emulator connection
- [ ] All TypeScript types defined
- [ ] Service interfaces in place

---

### Phase 2: Authentication (P1 - User Story 1)

**Goal**: Complete auth flow with email verification

#### Tasks:
1. **Auth Service Implementation**
   - `signUp(email, password)` with email verification
   - `signIn(email, password)`
   - `signOut()`
   - `sendPasswordReset(email)`
   - `getCurrentUser()`

2. **Auth Pages**
   - `/login` - login form with dev dashboard
   - `/signup` - registration with email verification
   - `/forgot-password` - password reset flow

3. **Auth Hook**
   - `useAuth()` - user state, loading, error
   - Protected route wrapper component

4. **Dev Dashboard**
   - Test user credentials display with copy button
   - DB reset functionality
   - Seed data loader

#### Acceptance Criteria:
- [ ] FR-001: Register with email/password
- [ ] FR-002: Email verification sent
- [ ] FR-003: Only verified users access app
- [ ] FR-004: Password reset via email
- [ ] FR-005: Secure logout

---

### Phase 3: Couple Profile & Initial Setup (P1)

**Goal**: Couple can set up their profile after registration

#### Tasks:
1. **Couple Service Implementation**
   - `createCouple(userId, data)`
   - `getCouple(coupleId)`
   - `updateCouple(coupleId, data)`

2. **Profile Setup Page**
   - `/setup` - initial profile wizard
   - Partner names input
   - Wedding date picker
   - Target budget input

3. **Layout Components**
   - `Header` with partner toggle
   - `PartnerToggle` component
   - `usePartner()` hook for toggle state

#### Acceptance Criteria:
- [ ] FR-006: Set partner names
- [ ] FR-007: Set wedding date
- [ ] FR-008: Set target budget
- [ ] FR-009: Partner toggle in header

---

### Phase 4: Categories & Tasks (P1 - User Story 2)

**Goal**: Full task management with categories

#### Tasks:
1. **Epic Service Implementation**
   - `createDefaultEpics(coupleId)` - 10 default categories
   - `getEpics(coupleId)`
   - `createEpic(coupleId, data)`
   - `updateEpic(epicId, data)`

2. **Task Service Implementation**
   - `createTask(coupleId, data)`
   - `getTasks(coupleId, filters)`
   - `updateTask(taskId, data)`
   - `deleteTask(taskId)`
   - `getTasksByPartner(coupleId, partner)`

3. **Tasks Page**
   - `/tasks` - task list grouped by category
   - Task creation modal
   - Task edit modal
   - Status change buttons
   - Partner filter based on header toggle

4. **Task Components**
   - `TaskList` - grouped by epic
   - `TaskCard` - individual task display
   - `TaskForm` - create/edit form
   - `StatusBadge` - visual status indicator

#### Default Categories (Epics):
1. צילום ווידאו (Photography & Video)
2. קייטרינג (Catering)
3. אולם/מקום (Venue)
4. מוזיקה ודי-ג'יי (Music & DJ)
5. שמלת כלה (Bride's Dress)
6. חליפת חתן (Groom's Suit)
7. פרחים ועיצוב (Flowers & Decor)
8. הזמנות (Invitations)
9. רבנות ואישורים (Rabbinate & Permits)
10. אחר (Other)

#### Acceptance Criteria:
- [ ] FR-010: Default categories displayed
- [ ] FR-011: Add custom categories
- [ ] FR-012: Optional budget per category
- [ ] FR-013: Create tasks with all fields
- [ ] FR-014: Task statuses work
- [ ] FR-015: Tasks associated with categories
- [ ] FR-016: Edit and delete tasks
- [ ] FR-017: Filter by partner toggle

---

### Phase 5: Dashboard & KPIs (P2 - User Story 3)

**Goal**: Visual dashboard with budget and progress tracking

#### Tasks:
1. **Dashboard Service**
   - `getDashboardStats(coupleId)` - aggregated metrics
   - `getBudgetBreakdown(coupleId)` - by category
   - `getTaskProgress(coupleId)` - completion rates

2. **Dashboard Page**
   - `/dashboard` - main dashboard view

3. **Dashboard Components**
   - `ProgressBar` - task completion percentage
   - `BudgetCard` - target vs actual with warning
   - `CategoryBreakdown` - spending per category
   - `StatsCards` - quick metrics

#### Acceptance Criteria:
- [ ] FR-023: Task completion percentage
- [ ] FR-024: Budget comparison with overspend warning
- [ ] FR-025: Category breakdown

---

### Phase 6: Guest Management (P2 - User Story 4)

**Goal**: Guest self-registration via shareable link

#### Tasks:
1. **Guest Service Implementation**
   - `createGuest(coupleId, data)`
   - `getGuests(coupleId)`
   - `updateGuest(guestId, data)`
   - `deleteGuest(guestId)`
   - `getGuestStats(coupleId)` - totals

2. **Public Guest Registration**
   - `/invite/[coupleId]` - public page (no auth)
   - Guest registration form
   - Success confirmation

3. **Guest Management Page**
   - `/guests` - guest list for couple
   - Share link generator
   - WhatsApp share button
   - Manual guest add form
   - Edit/delete guest entries
   - RSVP summary stats

#### Acceptance Criteria:
- [ ] FR-018: Generate unique shareable links
- [ ] FR-019: Guest registration fields
- [ ] FR-020: Public access without auth
- [ ] FR-021: Guest list with summaries
- [ ] FR-022: Manage guest entries (add manually, edit, delete)

---

### Phase 7: Sharing & Calendar Export (P3 - User Story 6)

**Goal**: WhatsApp sharing and ICS calendar export

#### Tasks:
1. **Utility Functions**
   - `generateWhatsAppLink(task)` - wa.me URL
   - `generateIcs(task)` - ICS file content
   - `downloadIcs(task)` - trigger download

2. **Share Components**
   - `WhatsAppShareButton` - share task
   - `CalendarExportButton` - download ICS
   - `WeddingDateExport` - wedding date ICS

#### Acceptance Criteria:
- [ ] FR-028: WhatsApp share links
- [ ] FR-029: ICS calendar files

---

### Phase 8: Email Reminders (P3 - User Story 5)

**Goal**: Automated email reminders for tasks

#### Tasks:
1. **Cloud Functions Setup**
   - Firebase Cloud Functions project
   - Scheduled function for weekly summary
   - Scheduled function for day-before reminders

2. **Email Templates**
   - Weekly summary template
   - Day-before reminder template

3. **Reminder Logic**
   - Query upcoming tasks
   - Filter incomplete tasks
   - Send via Firebase/SendGrid

#### Acceptance Criteria:
- [ ] FR-026: Weekly summary emails
- [ ] FR-027: Day-before reminders

---

### Phase 9: Polish & Security

**Goal**: Production-ready application

#### Tasks:
1. **Firestore Security Rules**
   - Couple data access rules
   - Guest registration rules (public write)
   - Validation rules

2. **Error Handling**
   - Global error boundary
   - User-friendly error messages
   - Offline indicator

3. **UI Polish**
   - Loading states
   - Empty states
   - Success/error toasts
   - Accessibility audit

4. **Testing**
   - Manual testing checklist
   - Edge case verification

## File Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── forgot-password/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx (protected)
│   │   ├── dashboard/page.tsx
│   │   ├── tasks/page.tsx
│   │   ├── guests/page.tsx
│   │   └── settings/page.tsx
│   ├── invite/[coupleId]/page.tsx
│   ├── setup/page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/
│   ├── layout/
│   ├── dashboard/
│   ├── tasks/
│   ├── guests/
│   └── dev/
├── services/
│   ├── interfaces/
│   ├── crud/
│   └── dev/
├── hooks/
├── types/
├── lib/
└── utils/
```

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Firebase emulator issues | Low | Medium | Clear setup docs, cloud fallback |
| RTL styling bugs | Medium | Low | Use logical properties consistently |
| Email delivery delays | Low | Low | Use reliable provider (Firebase/SendGrid) |
| Large guest lists performance | Low | Medium | Pagination, query optimization |

## Success Metrics Alignment

| Metric | Implementation Approach |
|--------|------------------------|
| SC-001: Registration < 3 min | Minimal required fields, clear flow |
| SC-002: Task creation < 30 sec | Quick-add form, sensible defaults |
| SC-003: 95% guest registration success | Simple public form, clear feedback |
| SC-004: Dashboard load < 2 sec | Efficient queries, caching |
| SC-005: Real-time budget updates | Firestore real-time listeners |
| SC-006: 500 tasks, 1000 guests | Proper indexing, pagination |

</div>
