<div dir="rtl">

# Data Model - Wedding Planning MVP

**Feature Branch**: `1-wedding-planning-mvp`
**Created**: 2026-01-07

## Firestore Structure

```
couples/{coupleId}
├── epics/{epicId}
├── tasks/{taskId}
└── guests/{guestId}
```

## Entities

### 1. Couple

**Collection**: `couples`
**Document ID**: Firebase Auth UID (user.uid)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `partner1Name` | string | Yes | First partner name |
| `partner2Name` | string | Yes | Second partner name |
| `weddingDate` | Timestamp | Yes | Wedding date |
| `targetBudget` | number | Yes | Total target budget (ILS) |
| `createdAt` | Timestamp | Yes | Document creation time |
| `updatedAt` | Timestamp | Yes | Last update time |

**Validation Rules**:
- `partner1Name`: 1-100 characters
- `partner2Name`: 1-100 characters
- `targetBudget`: 0 - 10,000,000

**TypeScript Interface**:
```typescript
interface Couple {
  id: string;
  partner1Name: string;
  partner2Name: string;
  weddingDate: Timestamp;
  targetBudget: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// For API/UI usage (converted dates)
interface CoupleDTO {
  id: string;
  partner1Name: string;
  partner2Name: string;
  weddingDate: Date;
  targetBudget: number;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### 2. Epic (Category)

**Collection**: `couples/{coupleId}/epics`
**Document ID**: Auto-generated

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Category name |
| `icon` | string | Yes | Emoji icon |
| `color` | string | Yes | Hex color code |
| `targetBudget` | number | No | Optional budget limit |
| `order` | number | Yes | Display order |
| `isDefault` | boolean | Yes | Is default category |
| `createdAt` | Timestamp | Yes | Creation time |

**Default Categories**:
| Order | Title | Icon | Color |
|-------|-------|------|-------|
| 1 | צילום ווידאו | 📸 | #3B82F6 |
| 2 | קייטרינג | 🍽️ | #EF4444 |
| 3 | אולם/מקום | 🏛️ | #8B5CF6 |
| 4 | מוזיקה ודי-ג'יי | 🎵 | #EC4899 |
| 5 | שמלת כלה | 👗 | #F472B6 |
| 6 | חליפת חתן | 🤵 | #6366F1 |
| 7 | פרחים ועיצוב | 💐 | #10B981 |
| 8 | הזמנות | 💌 | #F59E0B |
| 9 | רבנות ואישורים | 📋 | #6B7280 |
| 10 | אחר | 📦 | #9CA3AF |

**Validation Rules**:
- `title`: 1-100 characters
- `icon`: 1-4 characters (emoji)
- `color`: Valid hex color (#RRGGBB)
- `targetBudget`: 0 - 10,000,000 (if provided)
- `order`: 1-100

**TypeScript Interface**:
```typescript
interface Epic {
  id: string;
  title: string;
  icon: string;
  color: string;
  targetBudget?: number;
  order: number;
  isDefault: boolean;
  createdAt: Timestamp;
}
```

---

### 3. Task

**Collection**: `couples/{coupleId}/tasks`
**Document ID**: Auto-generated

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `epicId` | string | Yes | Reference to epic |
| `title` | string | Yes | Task title |
| `description` | string | No | Task description |
| `dueDate` | Timestamp | No | Due date |
| `assignedTo` | AssignedTo | Yes | Who is responsible |
| `estimatedCost` | number | No | Estimated cost |
| `actualCost` | number | No | Actual cost |
| `status` | TaskStatus | Yes | Current status |
| `notes` | string | No | Additional notes |
| `createdAt` | Timestamp | Yes | Creation time |
| `updatedAt` | Timestamp | Yes | Last update time |

**Enums**:
```typescript
type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';
type AssignedTo = 'partner1' | 'partner2' | 'both';
```

**Status Display**:
| Status | Hebrew | Color |
|--------|--------|-------|
| pending | ממתין | gray |
| in-progress | בתהליך | blue |
| completed | הושלם | green |
| cancelled | בוטל | red |

**Validation Rules**:
- `title`: 1-200 characters
- `description`: 0-1000 characters
- `estimatedCost`: 0 - 10,000,000
- `actualCost`: 0 - 10,000,000
- `notes`: 0-1000 characters

**TypeScript Interface**:
```typescript
interface Task {
  id: string;
  epicId: string;
  title: string;
  description?: string;
  dueDate?: Timestamp;
  assignedTo: AssignedTo;
  estimatedCost?: number;
  actualCost?: number;
  status: TaskStatus;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**State Transitions**:
```
pending ──► in-progress ──► completed
   │             │              │
   │             ▼              │
   └────────► cancelled ◄──────┘
```

All transitions allowed. Status can be changed at any time.

---

### 4. Guest

**Collection**: `couples/{coupleId}/guests`
**Document ID**: Auto-generated

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Guest full name |
| `phone` | string | No | Phone number |
| `partySize` | number | Yes | Number of people |
| `notes` | string | No | Special notes |
| `rsvp` | RsvpStatus | Yes | RSVP status |
| `source` | GuestSource | Yes | How guest was added |
| `createdAt` | Timestamp | Yes | Registration time |

**Enums**:
```typescript
type RsvpStatus = 'attending' | 'not-attending' | 'maybe' | 'pending';
type GuestSource = 'self-registration' | 'manual';
```

**RSVP Display**:
| Status | Hebrew | Color |
|--------|--------|-------|
| attending | מגיע | green |
| not-attending | לא מגיע | red |
| maybe | אולי | yellow |
| pending | ממתין לאישור | gray |

**Validation Rules**:
- `name`: 1-100 characters
- `phone`: Israeli phone format (optional)
- `partySize`: 1-20
- `notes`: 0-500 characters

**TypeScript Interface**:
```typescript
interface Guest {
  id: string;
  name: string;
  phone?: string;
  partySize: number;
  notes?: string;
  rsvp: RsvpStatus;
  source: GuestSource;
  createdAt: Timestamp;
}
```

---

## Indexes

### Required Firestore Indexes

```javascript
// Tasks by status and due date
{
  collectionGroup: "tasks",
  fields: [
    { fieldPath: "status", order: "ASCENDING" },
    { fieldPath: "dueDate", order: "ASCENDING" }
  ]
}

// Tasks by epicId and status
{
  collectionGroup: "tasks",
  fields: [
    { fieldPath: "epicId", order: "ASCENDING" },
    { fieldPath: "status", order: "ASCENDING" }
  ]
}

// Tasks by assignedTo and status
{
  collectionGroup: "tasks",
  fields: [
    { fieldPath: "assignedTo", order: "ASCENDING" },
    { fieldPath: "status", order: "ASCENDING" }
  ]
}

// Guests by RSVP status
{
  collectionGroup: "guests",
  fields: [
    { fieldPath: "rsvp", order: "ASCENDING" },
    { fieldPath: "createdAt", order: "DESCENDING" }
  ]
}

// Epics by order
{
  collectionGroup: "epics",
  fields: [
    { fieldPath: "order", order: "ASCENDING" }
  ]
}
```

---

## Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Couple document - only owner can read/write
    match /couples/{coupleId} {
      allow read, write: if request.auth != null
                         && request.auth.uid == coupleId;

      // Subcollections inherit couple access
      match /epics/{epicId} {
        allow read, write: if request.auth != null
                           && request.auth.uid == coupleId;
      }

      match /tasks/{taskId} {
        allow read, write: if request.auth != null
                           && request.auth.uid == coupleId;
      }

      match /guests/{guestId} {
        // Couple can read/write
        allow read, write: if request.auth != null
                           && request.auth.uid == coupleId;
        // Public can create (self-registration)
        allow create: if request.auth == null
                      && request.resource.data.source == 'self-registration'
                      && request.resource.data.name is string
                      && request.resource.data.partySize is number
                      && request.resource.data.partySize >= 1
                      && request.resource.data.partySize <= 20;
      }
    }
  }
}
```

---

## Aggregations (Computed)

These are not stored but computed from queries:

### Dashboard Stats
```typescript
interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  completionPercentage: number;
  targetBudget: number;
  estimatedTotal: number;
  actualTotal: number;
  budgetStatus: 'under' | 'at' | 'over';
}
```

### Guest Stats
```typescript
interface GuestStats {
  totalGuests: number;
  totalHeadcount: number;
  attendingCount: number;
  notAttendingCount: number;
  maybeCount: number;
  pendingCount: number;
}
```

### Category Budget
```typescript
interface CategoryBudget {
  epicId: string;
  epicTitle: string;
  targetBudget?: number;
  estimatedTotal: number;
  actualTotal: number;
  taskCount: number;
  completedCount: number;
}
```

---

## Entity Relationships

```
┌─────────────┐
│   Couple    │
│  (coupleId) │
└──────┬──────┘
       │
       │ 1:N
       ▼
┌──────┴──────┬────────────────┐
│             │                │
▼             ▼                ▼
┌─────┐   ┌──────┐       ┌─────────┐
│ Epic │◄──│ Task │       │  Guest  │
└─────┘   └──────┘       └─────────┘
  1:N        N:1
```

- **Couple ↔ Epic**: One couple has many epics
- **Couple ↔ Task**: One couple has many tasks
- **Couple ↔ Guest**: One couple has many guests
- **Epic ↔ Task**: One epic contains many tasks
- **Task references Epic**: via `epicId` field

</div>
