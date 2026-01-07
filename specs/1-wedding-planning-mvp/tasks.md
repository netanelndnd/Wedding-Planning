# Tasks: Wedding Planning MVP

**Input**: Design documents from `/specs/1-wedding-planning-mvp/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Tests**: Not included (not explicitly requested in feature specification)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/` at repository root (Next.js App Router structure)
- Paths follow the structure defined in plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic Next.js/Firebase structure

- [X] T001 Create Next.js 15 project with App Router and TypeScript strict mode
- [X] T002 [P] Configure Tailwind CSS v4 with RTL support in src/app/globals.css
- [X] T003 [P] Configure ESLint in eslint.config.mjs
- [X] T004 [P] Setup root layout with RTL (lang="he" dir="rtl") in src/app/layout.tsx
- [X] T005 [P] Create Firebase project configuration in src/lib/firebase.ts
- [X] T006 [P] Create centralized logger in src/lib/logger.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core types, service interfaces, and base infrastructure that MUST be complete before ANY user story

**CRITICAL**: No user story work can begin until this phase is complete

- [X] T007 Create all TypeScript types (Couple, Epic, Task, Guest, enums) in src/types/index.ts
- [X] T008 [P] Create IAuthService interface in src/services/interfaces/IAuthService.ts
- [X] T009 [P] Create ICoupleService interface in src/services/interfaces/ICoupleService.ts
- [X] T010 [P] Create IEpicService interface in src/services/interfaces/IEpicService.ts
- [X] T011 [P] Create ITaskService interface in src/services/interfaces/ITaskService.ts
- [X] T012 [P] Create IGuestService interface in src/services/interfaces/IGuestService.ts
- [X] T013 Create service interfaces barrel export in src/services/interfaces/index.ts
- [X] T014 [P] Create base LoadingSpinner component in src/components/ui/LoadingSpinner.tsx
- [X] T015 [P] Create base Button component in src/components/ui/Button.tsx
- [X] T016 [P] Create base Input component in src/components/ui/Input.tsx
- [X] T017 [P] Create base Card component in src/components/ui/Card.tsx
- [X] T018 Create UI components barrel export in src/components/ui/index.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Couple Registration and Authentication (Priority: P1)

**Goal**: Complete auth flow with email verification and initial profile setup

**Independent Test**: Register new user, verify email, log in, complete profile setup, view empty dashboard

### Implementation for User Story 1

#### Auth Service & Hook
- [X] T019 [US1] Implement AuthService (signUp, signIn, signOut, resetPassword, getCurrentUser) in src/services/crud/authService.ts
- [X] T020 [US1] Create useAuth hook (user state, loading, error) in src/hooks/useAuth.ts

#### Auth Pages
- [X] T021 [P] [US1] Create login page with form and dev dashboard in src/app/(auth)/login/page.tsx
- [X] T022 [P] [US1] Create signup page with email verification in src/app/(auth)/signup/page.tsx
- [X] T023 [P] [US1] Create forgot-password page in src/app/(auth)/forgot-password/page.tsx
- [X] T024 [US1] Create useLoginForm hook in src/hooks/useLoginForm.ts
- [X] T025 [US1] Create useSignupForm hook in src/hooks/useSignupForm.ts
- [X] T026 [US1] Create useForgotPassword hook in src/hooks/useForgotPassword.ts

#### Couple Profile
- [X] T027 [US1] Implement CoupleService (createCouple, getCouple, updateCouple) in src/services/crud/coupleService.ts
- [X] T028 [US1] Create initial profile setup page (names, date, budget) in src/app/setup/page.tsx

#### Layout Components
- [X] T029 [US1] Create Header component with partner toggle in src/components/layout/Header.tsx
- [X] T030 [US1] Create PartnerToggle component in src/components/layout/PartnerToggle.tsx
- [X] T031 [US1] Create usePartner hook for toggle state in src/hooks/usePartner.ts
- [X] T032 [US1] Create protected dashboard layout with auth guard redirect in src/app/(dashboard)/layout.tsx

#### Settings Page
- [X] T032B [US1] Create settings page with profile update form (names, date, budget) in src/app/(dashboard)/settings/page.tsx

#### Dev Dashboard
- [X] T033 [P] [US1] Create DevDashboard component (test credentials, DB reset) in src/components/dev/DevDashboard.tsx
- [X] T034 [P] [US1] Create mock data service for seeding in src/services/dev/mockDataService.ts

#### Services Barrel Exports
- [X] T035 [US1] Create services barrel export in src/services/crud/index.ts
- [X] T036 [US1] Create main services barrel export in src/services/index.ts

**Acceptance Criteria**:
- [ ] FR-001: Register with email/password
- [ ] FR-002: Email verification sent
- [ ] FR-003: Only verified users access app
- [ ] FR-004: Password reset via email
- [ ] FR-005: Secure logout
- [ ] FR-006: Set partner names
- [ ] FR-007: Set wedding date
- [ ] FR-008: Set target budget
- [ ] FR-009: Partner toggle in header
- [ ] FR-030: Update profile on settings page

**Checkpoint**: User Story 1 fully functional - users can register, verify, login, setup profile, update settings

---

## Phase 4: User Story 2 - Task Management with Categories (Priority: P1)

**Goal**: Full task management with categories (epics), status tracking, and partner filtering

**Independent Test**: Create categories, add tasks with due dates and costs, change task status, filter by category/assignee

### Implementation for User Story 2

#### Epic Service
- [X] T037 [US2] Implement EpicService (createDefaultEpics, getEpics, createEpic, updateEpic) in src/services/crud/epicService.ts

#### Task Service
- [X] T038 [US2] Implement TaskService (createTask, getTasks, updateTask, deleteTask, getTasksByPartner) in src/services/crud/taskService.ts

#### Task Hooks
- [X] T039 [US2] Create useTasks hook in src/hooks/useTasks.ts
- [X] T040 [US2] Create useEpics hook in src/hooks/useEpics.ts

#### Task Components
- [X] T041 [P] [US2] Create TaskList component (grouped by epic) in src/components/tasks/TaskList.tsx
- [X] T042 [P] [US2] Create TaskCard component in src/components/tasks/TaskCard.tsx
- [X] T043 [P] [US2] Create TaskForm component (create/edit modal) in src/components/tasks/TaskForm.tsx
- [X] T044 [P] [US2] Create StatusBadge component in src/components/tasks/StatusBadge.tsx
- [X] T045 [P] [US2] Create CategoryList component in src/components/tasks/CategoryList.tsx
- [X] T046 [US2] Create tasks components barrel export in src/components/tasks/index.ts

#### Tasks Page
- [X] T047 [US2] Create tasks page with category grouping and partner filter in src/app/(dashboard)/tasks/page.tsx

#### Default Categories Data
- [X] T048 [US2] Create default categories constant (10 Hebrew categories) in src/lib/constants.ts

**Acceptance Criteria**:
- [ ] FR-010: Default categories displayed
- [ ] FR-011: Add custom categories
- [ ] FR-012: Optional budget per category
- [ ] FR-013: Create tasks with all fields
- [ ] FR-014: Task statuses work
- [ ] FR-015: Tasks associated with categories
- [ ] FR-016: Edit and delete tasks
- [ ] FR-017: Filter by partner toggle

**Checkpoint**: User Story 2 fully functional - full task management available

---

## Phase 5: User Story 3 - Budget Tracking and Dashboard KPIs (Priority: P2)

**Goal**: Visual dashboard with budget comparison, completion percentage, and category breakdown

**Independent Test**: Set target budgets, add actual costs to tasks, view dashboard metrics

### Implementation for User Story 3

#### Dashboard Hook
- [X] T049 [US3] Create useDashboard hook (stats, budget, progress) in src/hooks/useDashboard.ts

#### Dashboard Components
- [X] T050 [P] [US3] Create ProgressBar component (task completion %) in src/components/dashboard/ProgressBar.tsx
- [X] T051 [P] [US3] Create BudgetCard component (target vs actual with warning) in src/components/dashboard/BudgetCard.tsx
- [X] T052 [P] [US3] Create CategoryBreakdown component in src/components/dashboard/CategoryBreakdown.tsx
- [X] T053 [P] [US3] Create StatsCards component (quick metrics) in src/components/dashboard/StatsCards.tsx
- [X] T054 [P] [US3] Create DashboardHeader component in src/components/dashboard/DashboardHeader.tsx
- [X] T055 [US3] Create dashboard components barrel export in src/components/dashboard/index.ts

#### Dashboard Page
- [X] T056 [US3] Create dashboard page with all KPI components in src/app/(dashboard)/dashboard/page.tsx

**Acceptance Criteria**:
- [X] FR-023: Task completion percentage
- [X] FR-024: Budget comparison with overspend warning
- [X] FR-025: Category breakdown

**Checkpoint**: User Story 3 fully functional - dashboard shows all KPIs

---

## Phase 6: User Story 4 - Guest Management with Self-Registration (Priority: P2)

**Goal**: Guest self-registration via shareable link and guest list management

**Independent Test**: Generate guest registration link, guest fills form, couple views updated guest list

### Implementation for User Story 4

#### Guest Service
- [X] T057 [US4] Implement GuestService (createGuest, getGuests, updateGuest, deleteGuest, getGuestStats) in src/services/crud/guestService.ts

#### Guest Hook
- [X] T058 [US4] Create useGuests hook in src/hooks/useGuests.ts

#### Guest Components
- [X] T059 [P] [US4] Create GuestList component in src/components/guests/GuestList.tsx
- [X] T060 [P] [US4] Create GuestForm component (add/edit) in src/components/guests/GuestForm.tsx
- [X] T061 [P] [US4] Create GuestStats component (totals, attending) in src/components/guests/GuestStats.tsx
- [X] T062 [P] [US4] Create ShareLinkGenerator component (WhatsApp share) in src/components/guests/ShareLinkGenerator.tsx
- [X] T063 [US4] Create guest components barrel export in src/components/guests/index.ts

#### Guest Pages
- [X] T064 [US4] Create guest management page in src/app/(dashboard)/guests/page.tsx
- [X] T065 [US4] Create public guest registration page (no auth) in src/app/invite/[coupleId]/page.tsx

**Acceptance Criteria**:
- [X] FR-018: Generate unique shareable links
- [X] FR-019: Guest registration fields
- [X] FR-020: Public access without auth
- [X] FR-021: Guest list with summaries
- [X] FR-022: Manage guest entries (add manually, edit, delete)

**Checkpoint**: User Story 4 fully functional - guest self-registration works

---

## Phase 7: User Story 6 - Sharing and Calendar Export (Priority: P3)

**Goal**: WhatsApp sharing and ICS calendar export for tasks

**Independent Test**: Generate WhatsApp link for a task, download ICS file

### Implementation for User Story 6

#### Utility Functions
- [X] T066 [P] [US6] Create WhatsApp link generator utility in src/utils/whatsappShare.ts
- [X] T067 [P] [US6] Create ICS calendar file generator utility in src/utils/icsExport.ts

#### Share Components
- [X] T068 [P] [US6] Create WhatsAppShareButton component in src/components/sharing/WhatsAppShareButton.tsx
- [X] T069 [P] [US6] Create CalendarExportButton component in src/components/sharing/CalendarExportButton.tsx
- [X] T070 [US6] Create sharing components barrel export in src/components/sharing/index.ts

#### Integration
- [X] T071 [US6] Add share buttons to TaskCard component in src/components/tasks/TaskCard.tsx
- [X] T072 [US6] Add wedding date export to settings page in src/app/(dashboard)/settings/page.tsx

**Acceptance Criteria**:
- [X] FR-028: WhatsApp share links
- [X] FR-029: ICS calendar files

**Checkpoint**: User Story 6 fully functional - sharing and export work

---

## Phase 8: User Story 5 - Email Reminders for Tasks (Priority: P3)

**Goal**: Automated email reminders via Firebase Cloud Functions

**Independent Test**: Create tasks with upcoming due dates, verify emails are sent at correct times

### Implementation for User Story 5

#### Cloud Functions Setup
- [X] T073 [US5] Initialize Firebase Cloud Functions project in functions/
- [X] T074 [US5] Create weekly summary scheduled function in functions/src/weeklyReminder.ts
- [X] T075 [US5] Create day-before reminder scheduled function in functions/src/dayBeforeReminder.ts

#### Email Templates
- [X] T076 [P] [US5] Create weekly summary email template in functions/src/templates/weeklySummary.ts
- [X] T077 [P] [US5] Create day-before reminder email template in functions/src/templates/dayBeforeReminder.ts

#### Notification Settings
- [X] T078 [US5] Add notification preferences to settings page in src/app/(dashboard)/settings/page.tsx

**Acceptance Criteria**:
- [X] FR-026: Weekly summary emails
- [X] FR-027: Day-before reminders

**Checkpoint**: User Story 5 fully functional - email reminders configured

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Security, error handling, and production readiness

### Security
- [X] T079 [P] Create Firestore security rules (couple access, public guest write) in firestore.rules
- [X] T080 [P] Create Storage security rules in storage.rules

### Error Handling & UX
- [X] T081 [P] Create global error boundary component in src/components/ErrorBoundary.tsx
- [X] T082 [P] Create toast notification system in src/components/ui/Toast.tsx
- [X] T083 [P] Create offline indicator component in src/components/ui/OfflineIndicator.tsx
- [X] T084 [P] Create empty state components in src/components/ui/EmptyState.tsx

### Accessibility
- [X] T085 Create accessibility menu component in src/components/AccessibilityMenu.tsx
- [X] T086 Audit and fix WCAG 2.1 compliance issues across all pages

### Configuration
- [X] T087 [P] Create Firebase configuration file in firebase.json
- [X] T088 [P] Create Next.js configuration in next.config.ts
- [X] T089 [P] Create package.json with all dependencies in package.json

### Landing Page
- [X] T090 Create landing/home page (redirect to login or dashboard) in src/app/page.tsx

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - User stories can proceed in priority order (P1 -> P2 -> P3)
  - Or in parallel if team capacity allows
- **Polish (Phase 9)**: Can run in parallel with later user stories or after all stories complete

### User Story Dependencies

- **User Story 1 (P1)**: Foundation only - No dependencies on other stories
- **User Story 2 (P1)**: Foundation only - Can run parallel with US1, shares layout components
- **User Story 3 (P2)**: Depends on US1 (auth) and US2 (tasks for metrics)
- **User Story 4 (P2)**: Depends on US1 (auth, couple profile for invite link)
- **User Story 5 (P3)**: Depends on US1 (auth, email) and US2 (tasks for reminders)
- **User Story 6 (P3)**: Depends on US2 (tasks to share/export)

### Within Each User Story

- Services before pages
- Hooks before components
- Core components before pages
- All [P] marked tasks can run in parallel within their phase
- T072 (US6) and T078 (US5) depend on T032B (settings page creation)

### Parallel Opportunities

**Phase 1 (Setup)**:
```
T002, T003, T004, T005, T006 can run in parallel after T001
```

**Phase 2 (Foundational)**:
```
T008-T012 can run in parallel after T007
T014-T017 can run in parallel
```

**Phase 3 (US1)**:
```
T021, T022, T023 can run in parallel (auth pages)
T033, T034 can run in parallel (dev tools)
```

**Phase 4 (US2)**:
```
T041-T045 can run in parallel (task components)
```

**Phase 5 (US3)**:
```
T050-T054 can run in parallel (dashboard components)
```

**Phase 6 (US4)**:
```
T059-T062 can run in parallel (guest components)
```

**Phase 7 (US6)**:
```
T066, T067 can run in parallel (utilities)
T068, T069 can run in parallel (share buttons)
```

**Phase 8 (US5)**:
```
T076, T077 can run in parallel (email templates)
```

**Phase 9 (Polish)**:
```
T079-T084, T087-T089 can all run in parallel
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Auth + Profile)
4. Complete Phase 4: User Story 2 (Tasks)
5. **STOP and VALIDATE**: Test auth flow and task management independently
6. Deploy/demo as MVP

### Incremental Delivery

1. Setup + Foundational -> Foundation ready
2. Add User Story 1 -> Test -> Deploy (Auth MVP)
3. Add User Story 2 -> Test -> Deploy (Tasks MVP)
4. Add User Story 3 -> Test -> Deploy (Dashboard)
5. Add User Story 4 -> Test -> Deploy (Guests)
6. Add User Story 6 -> Test -> Deploy (Sharing)
7. Add User Story 5 -> Test -> Deploy (Reminders)
8. Polish -> Final release

---

## Summary

| Phase | Story | Task Count | Parallel Opportunities |
|-------|-------|------------|----------------------|
| Phase 1 | Setup | 6 | 5 tasks |
| Phase 2 | Foundational | 12 | 9 tasks |
| Phase 3 | US1 (Auth) | 19 | 7 tasks |
| Phase 4 | US2 (Tasks) | 12 | 5 tasks |
| Phase 5 | US3 (Dashboard) | 8 | 5 tasks |
| Phase 6 | US4 (Guests) | 9 | 4 tasks |
| Phase 7 | US6 (Sharing) | 7 | 4 tasks |
| Phase 8 | US5 (Reminders) | 6 | 2 tasks |
| Phase 9 | Polish | 12 | 9 tasks |
| **Total** | | **91** | |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- RTL: Always use logical properties (ms-, me-, ps-, pe-, start-, end-)
- TypeScript: No `any` types, strict mode
- Services: Never access Firebase directly from UI components
