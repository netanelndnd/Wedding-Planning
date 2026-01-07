# Feature Specification: Wedding Planning MVP

**Feature Branch**: `1-wedding-planning-mvp`
**Created**: 2026-01-06
**Status**: Draft
**Input**: User description: "MVP wedding planning application with authentication, couple profiles, categories/epics, tasks, guest management, dashboard KPIs, email reminders, and sharing features based on PLAN.md"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Couple Registration and Authentication (Priority: P1)

A couple wants to register for the wedding planning application to start organizing their wedding. They create an account with email verification, set up their profile with basic information, and can securely log in and out.

**Why this priority**: This is the foundation for all other features. Without authentication and profile setup, no other functionality is accessible.

**Independent Test**: Can be fully tested by registering a new user, verifying email, logging in, and viewing the empty dashboard. Delivers value by providing secure access to the platform.

**Acceptance Scenarios**:

1. **Given** an unregistered user, **When** they submit a valid email and password, **Then** they receive a verification email and see a confirmation message
2. **Given** a user who clicked the verification link, **When** they attempt to log in with correct credentials, **Then** they are redirected to the initial profile setup page
3. **Given** a logged-in user, **When** they complete the initial profile setup (names, wedding date, budget), **Then** their couple profile is created and they are redirected to the dashboard
4. **Given** a user on the login page, **When** they click "forgot password" and enter their email, **Then** they receive a password reset email
5. **Given** a logged-in user, **When** they click logout, **Then** they are signed out and redirected to the login page

---

### User Story 2 - Task Management with Categories (Priority: P1)

A couple wants to organize their wedding tasks by categories (epics) such as photography, catering, venue, etc. They can create, view, edit, and delete tasks, assign them to either partner, and track progress with status updates.

**Why this priority**: Task management is the core functionality of wedding planning. Categories provide organization and the ability to filter and track progress by area.

**Independent Test**: Can be fully tested by creating categories, adding tasks with due dates and costs, changing task status, and filtering by category/assignee. Delivers value by helping couples track and manage all wedding-related tasks.

**Acceptance Scenarios**:

1. **Given** a logged-in couple, **When** they view the tasks page, **Then** they see default categories (photography, catering, venue, music, bride's dress, groom's suit, flowers, invitations, rabbinate, other)
2. **Given** a couple viewing tasks, **When** they create a new task with title, due date, and assignee, **Then** the task appears in the appropriate category
3. **Given** a task exists, **When** the user updates its status from "pending" to "in-progress" or "completed", **Then** the status change is immediately reflected in the UI
4. **Given** a couple with multiple tasks, **When** they use the partner toggle in the header, **Then** they see only tasks assigned to the selected partner (or both)
5. **Given** a category, **When** the user adds a custom category, **Then** it appears in the category list and can receive tasks

---

### User Story 3 - Budget Tracking and Dashboard KPIs (Priority: P2)

A couple wants to track their wedding budget, see how much they've spent per category, and view key metrics about their planning progress. The dashboard shows completion percentage, budget comparison, and category breakdown.

**Why this priority**: Budget visibility prevents overspending and helps couples make informed decisions. KPIs provide motivation and progress awareness.

**Independent Test**: Can be fully tested by setting target budgets, adding actual costs to tasks, and viewing dashboard metrics. Delivers value by providing financial oversight and progress tracking.

**Acceptance Scenarios**:

1. **Given** a couple with a target budget set, **When** they view the dashboard, **Then** they see total budget vs actual spending with visual indicator
2. **Given** tasks with estimated and actual costs, **When** viewing the dashboard, **Then** the budget breakdown shows spending per category
3. **Given** a category with a target budget, **When** actual costs exceed the target, **Then** a visual warning indicator appears
4. **Given** a couple with tasks, **When** viewing the dashboard, **Then** they see the percentage of completed tasks
5. **Given** tasks with various statuses, **When** viewing the dashboard, **Then** they see a breakdown by category showing progress in each area

---

### User Story 4 - Guest Management with Self-Registration (Priority: P2)

A couple wants to manage their guest list efficiently. Instead of manually entering all guests, they share a unique link with guests who then register themselves with their RSVP status, party size, and contact details.

**Why this priority**: Guest management is essential for venue capacity, catering, and seating. Self-registration reduces data entry burden on the couple.

**Independent Test**: Can be fully tested by generating a guest registration link, having a "guest" fill the form, and viewing the updated guest list. Delivers value by automating guest data collection and RSVP tracking.

**Acceptance Scenarios**:

1. **Given** a logged-in couple, **When** they navigate to guest management, **Then** they see their current guest list with RSVP status
2. **Given** a couple on the guest page, **When** they click "share invite link", **Then** they get a unique URL that can be shared via WhatsApp
3. **Given** a person with the invite link (no login required), **When** they fill in their name, phone, party size, and RSVP status, **Then** they are added to the couple's guest list
4. **Given** a guest list exists, **When** the couple views it, **Then** they see total headcount, attending count, and pending RSVPs
5. **Given** a guest entry, **When** the couple edits the guest's details or deletes the entry, **Then** the changes are immediately saved

---

### User Story 5 - Email Reminders for Tasks (Priority: P3)

A couple wants to receive automated email reminders about upcoming tasks so they don't miss important deadlines. The system sends weekly summaries and day-before reminders for pending tasks.

**Why this priority**: Reminders improve completion rates and reduce stress, but the core planning can work without them.

**Independent Test**: Can be fully tested by creating tasks with upcoming due dates and verifying emails are sent at the correct times. Delivers value by proactively alerting couples about deadlines.

**Acceptance Scenarios**:

1. **Given** a couple with tasks due in the coming week, **When** the weekly summary time arrives, **Then** they receive an email listing tasks due that week
2. **Given** a pending task with a due date tomorrow, **When** the reminder time arrives, **Then** the couple receives an email reminder about that task
3. **Given** a task marked as completed, **When** reminder time arrives, **Then** no reminder is sent for that task
4. **Given** a couple's profile, **When** they check notification settings, **Then** they can see reminder preferences

---

### User Story 6 - Sharing and Calendar Export (Priority: P3)

A couple wants to share their wedding tasks with others and export important dates to their calendar. They can generate WhatsApp share messages and download ICS files for calendar apps.

**Why this priority**: Sharing and export enhance usability but are convenience features that don't block core functionality.

**Independent Test**: Can be fully tested by generating a WhatsApp link for a task and downloading an ICS file. Delivers value by integrating wedding planning with everyday tools.

**Acceptance Scenarios**:

1. **Given** a task with a due date, **When** the user clicks "share via WhatsApp", **Then** a wa.me link opens with pre-formatted task details
2. **Given** a task with a due date, **When** the user clicks "add to calendar", **Then** an ICS file is downloaded that can be imported into any calendar app
3. **Given** the wedding date is set, **When** the user requests a calendar event, **Then** they can download an ICS file for the wedding date itself

---

### Edge Cases

- What happens when a user tries to register with an already-used email? (Show error: "Email already registered")
- What happens when a user submits a task without a title? (Prevent submission, show validation error)
- What happens when a guest tries to register after the couple deleted their account? (Show "invite link no longer valid" message)
- How does the system handle tasks with past due dates? (Display as overdue with visual indicator)
- What happens when estimated/actual costs have very large numbers? (Support reasonable budget amounts up to 10 million currency units)
- What happens if a user loses network connectivity while editing? (Show offline indicator, queue changes for sync when reconnected)
- What happens when the partner toggle is used but all tasks are assigned to "both"? (Show all tasks regardless of toggle state)
- What happens when a guest wants to change their RSVP after submitting? (Guest must contact the couple directly; couple can edit guest entry manually)

## Requirements *(mandatory)*

### Functional Requirements

#### Authentication & Authorization
- **FR-001**: System MUST allow new users to register with email and password
- **FR-002**: System MUST send email verification upon registration
- **FR-003**: System MUST only allow verified users to access the application
- **FR-004**: System MUST provide password reset via email
- **FR-005**: System MUST maintain user sessions with secure logout functionality

#### Couple Profile
- **FR-006**: System MUST allow couples to set both partner names (partner 1 / partner 2)
- **FR-007**: System MUST allow setting the wedding date
- **FR-008**: System MUST allow setting a total target budget
- **FR-009**: System MUST provide a partner toggle (partner 1 / partner 2) in the header for filtering views

#### Categories (Epics)
- **FR-010**: System MUST provide default categories: Photography & Video, Catering, Venue, Music & DJ, Bride's Dress, Groom's Suit, Flowers & Decor, Invitations, Rabbinate & Permits, Other
- **FR-011**: System MUST allow adding custom categories
- **FR-012**: System MUST allow setting an optional target budget per category

#### Tasks
- **FR-013**: System MUST allow creating tasks with: title (required), description (optional), due date, assignee (partner 1/partner 2/both), estimated cost, actual cost, status, notes
- **FR-014**: System MUST support task statuses: pending, in-progress, completed, cancelled
- **FR-015**: System MUST associate each task with a category
- **FR-016**: System MUST allow editing and deleting tasks
- **FR-017**: System MUST filter tasks by selected partner based on header toggle

#### Guest Management
- **FR-018**: System MUST generate unique shareable links for guest self-registration
- **FR-019**: System MUST allow guests to register with: name, phone, party size, notes, RSVP status (attending/not attending/maybe). Guest registration is one-time only (no self-updates after submission)
- **FR-020**: Guest registration pages MUST be publicly accessible without authentication. Links do not expire and have no rate limiting
- **FR-021**: System MUST display guest list with RSVP summaries (total headcount, confirmed attending)
- **FR-022**: System MUST allow couples to manage guest entries (add manually, edit, delete)

#### Dashboard & KPIs
- **FR-023**: Dashboard MUST show task completion percentage
- **FR-024**: Dashboard MUST show budget comparison: target vs actual (with overspend warning)
- **FR-025**: Dashboard MUST show breakdown by category

#### Reminders
- **FR-026**: System MUST send weekly summary emails of upcoming tasks
- **FR-027**: System MUST send reminder emails one day before task due date (for incomplete tasks)

#### Sharing
- **FR-028**: System MUST generate WhatsApp share links (wa.me) with pre-formatted text
- **FR-029**: System MUST generate ICS calendar files for task export

#### Settings
- **FR-030**: System MUST provide a settings page for couples to update their profile (partner names, wedding date, budget)
- **FR-031**: System MUST allow couples to configure notification preferences (enable/disable email reminders)

### Key Entities

- **User**: Firebase Auth user account (email, verification status, uid)
- **Couple**: Represents a registered couple profile linked to User, with partner names, wedding date, and target budget
- **Epic (Category)**: A grouping for tasks (e.g., Photography, Catering) with optional budget and ordering
- **Task**: An individual to-do item with title, description, dates, costs, status, and assignment
- **Guest**: An invited person with contact info, party size, and RSVP status

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: New couples can complete registration and initial profile setup in under 3 minutes
- **SC-002**: Couples can create a new task in under 30 seconds
- **SC-003**: 95% of guests successfully complete self-registration using the shared link
- **SC-004**: Dashboard loads and displays all KPIs within 2 seconds of page load
- **SC-005**: Budget tracking shows real-time accuracy (actual spending updates immediately after task cost changes)
- **SC-006**: System supports couples with up to 500 tasks and 1000 guests without performance degradation
- **SC-007**: Email reminders are delivered within 5 minutes of scheduled time
- **SC-008**: 90% of users can locate and use the partner toggle without assistance
- **SC-009**: ICS calendar files successfully import into major calendar applications (Google Calendar, Apple Calendar, Outlook)
- **SC-010**: Mobile users can complete all core tasks (create task, view dashboard, manage guests) as efficiently as desktop users

## Clarifications

### Session 2026-01-06

- Q: מה מודל האבטחה של לינקים לאורחים? → A: לינקים לא פגים לעולם, ללא הגבלת קצב (פשוט למימוש)
- Q: האם אורח יכול לעדכן את הפרטים שלו אחרי הרשמה? → A: לא, הגשה חד-פעמית בלבד
- Q: האם הזוג יכול להוסיף אורחים ידנית? → A: כן, הזוג יכול להוסיף אורחים ידנית

## Assumptions

- The application supports Hebrew (RTL) as the primary language
- One user account represents one couple (no separate accounts per partner)
- Default categories are sufficient for most users; custom categories are a secondary feature
- Firebase Authentication and Firestore are the backend services
- Email reminders require scheduled cloud functions
- The WhatsApp sharing format follows standard wa.me URL structure
- Guest registration links use a unique couple identifier in the URL path
- Currency is displayed in local format (assumed ILS for Israeli market)
- Development environment uses Firebase Emulator for testing
