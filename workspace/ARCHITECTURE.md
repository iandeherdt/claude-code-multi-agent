# Architecture — Nail Stylist Appointment & Customer Management Website

## Overview

A Next.js 14 App Router application for a nail stylist business. The app manages customers, schedules appointments, and stores post-treatment notes. All data is served from an in-memory fake data layer hidden behind repository interfaces, ensuring a clean migration path to any real database (PostgreSQL, SQLite, etc.) in the future.

The visual aesthetic is elegant and feminine — rose/blush tones, soft backgrounds, and clean typography appropriate for a boutique nail salon brand.

---

## File / Folder Tree

```
/workspace/
├── src/
│   ├── app/
│   │   ├── layout.tsx                          # Root layout (sidebar + bottom nav)
│   │   ├── page.tsx                            # Dashboard "/"
│   │   ├── globals.css                         # Tailwind base directives only
│   │   ├── customers/
│   │   │   ├── page.tsx                        # "/customers" — customer list
│   │   │   ├── new/
│   │   │   │   └── page.tsx                    # "/customers/new" — registration form
│   │   │   └── [id]/
│   │   │       └── page.tsx                    # "/customers/[id]" — customer detail
│   │   ├── appointments/
│   │   │   ├── page.tsx                        # "/appointments" — appointment list
│   │   │   ├── new/
│   │   │   │   └── page.tsx                    # "/appointments/new" — booking form
│   │   │   └── [id]/
│   │   │       └── page.tsx                    # "/appointments/[id]" — appointment detail
│   │   └── calendar/
│   │       └── page.tsx                        # "/calendar" — monthly calendar
│   │
│   ├── components/
│   │   ├── ui/                                 # shadcn/ui auto-installed components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── select.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── form.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── calendar.tsx
│   │   │   └── toast.tsx
│   │   │
│   │   ├── AppointmentCard.tsx                 # Compact appointment summary
│   │   ├── AppointmentForm.tsx                 # Create / edit appointment form
│   │   ├── CalendarView.tsx                    # Monthly calendar grid
│   │   ├── CustomerCard.tsx                    # Compact customer summary card
│   │   ├── CustomerForm.tsx                    # Create / edit customer form
│   │   ├── Navigation.tsx                      # Sidebar (desktop) + bottom nav (mobile)
│   │   ├── NoteCard.tsx                        # Single post-treatment note display
│   │   ├── NoteForm.tsx                        # Inline add/edit note form
│   │   ├── PageHeader.tsx                      # Reusable page title + breadcrumb bar
│   │   ├── StatsCard.tsx                       # Dashboard KPI card
│   │   └── StatusBadge.tsx                     # Colored badge for appointment status
│   │
│   └── lib/
│       ├── data/
│       │   ├── types.ts                        # All TypeScript interfaces & enums
│       │   └── fake-data.ts                    # In-memory seed data store
│       ├── repositories/
│       │   ├── customerRepository.ts           # ICustomerRepository + FakeCustomerRepository
│       │   ├── appointmentRepository.ts        # IAppointmentRepository + FakeAppointmentRepository
│       │   └── noteRepository.ts               # INoteRepository + FakeNoteRepository
│       └── utils.ts                            # Shared helpers (date formatting, etc.)
│
├── public/
│   └── logo.svg                                # Salon logo placeholder
├── tailwind.config.ts                          # Extended palette with rose/blush tokens
├── components.json                             # shadcn/ui config
├── tsconfig.json
└── package.json
```

---

## Color Palette & Design Tokens

The Tailwind config extends the default palette with the following custom tokens. All components use only these classes — no inline hex values.

```typescript
// tailwind.config.ts  —  theme.extend.colors
{
  brand: {
    50:  "#fff1f2",   // lightest blush (page backgrounds)
    100: "#ffe4e6",   // card backgrounds
    200: "#fecdd3",   // subtle borders, hover states
    300: "#fda4af",   // badge fills, chip backgrounds
    400: "#fb7185",   // secondary actions
    500: "#f43f5e",   // primary brand (rose-500)
    600: "#e11d48",   // primary hover
    700: "#be123c",   // active / pressed
    800: "#9f1239",   // dark text on light backgrounds
    900: "#881337",   // darkest — used sparingly
  },
  neutral: {          // maps to slate-* for clean grays
    50:  "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
  }
}
```

**CSS variables** (used by shadcn/ui in `globals.css`):
- `--background`: brand-50
- `--foreground`: neutral-800
- `--primary`: brand-500
- `--primary-foreground`: white
- `--muted`: neutral-100
- `--muted-foreground`: neutral-500
- `--border`: neutral-200
- `--card`: white

---

## Data Models — `src/lib/data/types.ts`

```typescript
// ─── Enumerations ────────────────────────────────────────────────────────────

export type AppointmentStatus =
  | "scheduled"
  | "completed"
  | "cancelled"
  | "no-show";

export type ServiceType =
  | "manicure"
  | "pedicure"
  | "gel-manicure"
  | "gel-pedicure"
  | "acrylic-full"
  | "acrylic-fill"
  | "nail-art"
  | "nail-repair"
  | "combo-mani-pedi";

export type NailStyle =
  | "natural"
  | "gel"
  | "acrylic"
  | "dip-powder"
  | "nail-art"
  | "french"
  | "ombre"
  | "chrome";

// ─── Core Entities ───────────────────────────────────────────────────────────

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  preferredNailStyle: NailStyle;
  allergies: string;          // free text, empty string if none
  notes: string;              // general stylist notes about this customer
  createdAt: string;          // ISO 8601 date string
}

export interface Appointment {
  id: string;
  customerId: string;
  dateTime: string;           // ISO 8601 date-time string
  duration: number;           // minutes
  serviceType: ServiceType;
  status: AppointmentStatus;
  totalPrice: number;         // USD, stored as number (e.g. 65.00)
  notes: string;              // pre-service notes / special requests
  createdAt: string;          // ISO 8601 date string
}

export interface Note {
  id: string;
  appointmentId: string;
  customerId: string;
  content: string;
  createdAt: string;          // ISO 8601 date string
}

// ─── Derived / View Types ────────────────────────────────────────────────────

/** Appointment enriched with the related Customer object — used in list/detail views */
export interface AppointmentWithCustomer extends Appointment {
  customer: Customer;
}

/** Customer enriched with their appointment history — used in detail views */
export interface CustomerWithHistory extends Customer {
  appointments: Appointment[];
  notes: Note[];
}

// ─── Form Payload Types (omit system-generated fields) ───────────────────────

export type CreateCustomerPayload = Omit<Customer, "id" | "createdAt">;
export type UpdateCustomerPayload = Partial<CreateCustomerPayload>;

export type CreateAppointmentPayload = Omit<Appointment, "id" | "createdAt">;
export type UpdateAppointmentPayload = Partial<CreateAppointmentPayload>;

export type CreateNotePayload = Omit<Note, "id" | "createdAt">;

// ─── Filter / Query Types ─────────────────────────────────────────────────────

export interface AppointmentFilters {
  customerId?: string;
  status?: AppointmentStatus;
  fromDate?: string;          // ISO date string
  toDate?: string;            // ISO date string
  serviceType?: ServiceType;
}

export interface CustomerFilters {
  search?: string;            // matches name, email, or phone
  preferredNailStyle?: NailStyle;
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export interface DashboardStats {
  totalCustomers: number;
  appointmentsThisMonth: number;
  upcomingAppointments: number;
  revenueThisMonth: number;
  completedThisMonth: number;
  cancellationsThisMonth: number;
}
```

---

## Repository Interfaces — `src/lib/repositories/`

### `customerRepository.ts`

```typescript
export interface ICustomerRepository {
  findAll(filters?: CustomerFilters): Promise<Customer[]>;
  findById(id: string): Promise<Customer | null>;
  findWithHistory(id: string): Promise<CustomerWithHistory | null>;
  create(payload: CreateCustomerPayload): Promise<Customer>;
  update(id: string, payload: UpdateCustomerPayload): Promise<Customer | null>;
  delete(id: string): Promise<boolean>;
}
```

**FakeCustomerRepository** — implements the interface against the in-memory array in `fake-data.ts`. Uses `crypto.randomUUID()` for new IDs.

### `appointmentRepository.ts`

```typescript
export interface IAppointmentRepository {
  findAll(filters?: AppointmentFilters): Promise<AppointmentWithCustomer[]>;
  findById(id: string): Promise<AppointmentWithCustomer | null>;
  findByCustomerId(customerId: string): Promise<Appointment[]>;
  findByDateRange(from: string, to: string): Promise<AppointmentWithCustomer[]>;
  findUpcoming(limit?: number): Promise<AppointmentWithCustomer[]>;
  create(payload: CreateAppointmentPayload): Promise<Appointment>;
  update(id: string, payload: UpdateAppointmentPayload): Promise<Appointment | null>;
  delete(id: string): Promise<boolean>;
  getStats(): Promise<DashboardStats>;
}
```

**FakeAppointmentRepository** — joins with the in-memory customer array to return `AppointmentWithCustomer`. All filtering is done in-memory with array methods.

### `noteRepository.ts`

```typescript
export interface INoteRepository {
  findByAppointmentId(appointmentId: string): Promise<Note[]>;
  findByCustomerId(customerId: string): Promise<Note[]>;
  findById(id: string): Promise<Note | null>;
  create(payload: CreateNotePayload): Promise<Note>;
  update(id: string, content: string): Promise<Note | null>;
  delete(id: string): Promise<boolean>;
}
```

**FakeNoteRepository** — operates against the in-memory notes array.

---

## Fake Data Plan — `src/lib/data/fake-data.ts`

### Customers (12 records)

| Name | Phone | Email | Style |
|---|---|---|---|
| Sofia Ramirez | 555-0101 | sofia@email.com | gel |
| Madison Chen | 555-0102 | madison@email.com | acrylic |
| Olivia Thompson | 555-0103 | olivia@email.com | french |
| Ava Nguyen | 555-0104 | ava@email.com | nail-art |
| Isabella Kim | 555-0105 | isabella@email.com | gel |
| Emma Patel | 555-0106 | emma@email.com | dip-powder |
| Charlotte Brooks | 555-0107 | charlotte@email.com | natural |
| Amelia Torres | 555-0108 | amelia@email.com | acrylic |
| Harper Williams | 555-0109 | harper@email.com | ombre |
| Evelyn Davis | 555-0110 | evelyn@email.com | chrome |
| Lily Johnson | 555-0111 | lily@email.com | french |
| Zoe Martinez | 555-0112 | zoe@email.com | gel |

Several customers have allergies noted (e.g., "Sensitive to acetone", "Latex allergy").

### Appointments (35 records)

Spread across:
- 15 past appointments (completed, some cancelled, one no-show) — spread over the past 3 months
- 5 appointments today or yesterday (mixed statuses)
- 15 future appointments — spread over the next 6 weeks

Services include all `ServiceType` values. Prices range from $35 (basic manicure) to $120 (acrylic full set + nail art). Durations: 30, 45, 60, 75, 90 minutes.

### Notes (20 records)

Attached to completed past appointments. Realistic content:
- "Customer loved the rose gold chrome. Requested extra top coat."
- "Used OPI Bubble Bath as base. Slightly thick cuticles — recommend weekly cuticle oil."
- "First-time acrylic client. Length: medium coffin. Color: French with glitter ring finger."
- etc.

---

## Component Specifications

### `Navigation.tsx`

**Purpose:** App-wide navigation. Renders as a sidebar on `md+` screens and as a fixed bottom tab bar on mobile.

**Props:**
```typescript
interface NavigationProps {
  // No props — reads current pathname via usePathname()
}
```

**Nav items:**
| Label | Route | Icon (lucide-react) |
|---|---|---|
| Dashboard | `/` | LayoutDashboard |
| Customers | `/customers` | Users |
| Appointments | `/appointments` | CalendarCheck |
| Calendar | `/calendar` | CalendarDays |

**Tailwind strategy:**
- Sidebar: `hidden md:flex flex-col w-64 min-h-screen bg-white border-r border-neutral-200`
- Bottom nav: `flex md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200`
- Active item: `bg-brand-100 text-brand-700 font-semibold`
- Inactive item: `text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800`

---

### `PageHeader.tsx`

**Purpose:** Consistent title bar with optional breadcrumbs and right-side action slot.

**Props:**
```typescript
interface PageHeaderProps {
  title: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  action?: React.ReactNode;  // e.g. <Button>New Appointment</Button>
}
```

**Tailwind strategy:**
- `flex items-center justify-between py-6 px-4 md:px-8 border-b border-neutral-200 bg-white`
- Breadcrumbs: `text-sm text-neutral-400 hover:text-brand-500`

---

### `StatsCard.tsx`

**Purpose:** Dashboard KPI tile. Shows an icon, label, and number with optional trend indicator.

**Props:**
```typescript
interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;       // e.g. "+3 from last month"
  icon: React.ReactNode;
  variant?: "default" | "highlight";  // highlight uses brand-100 bg
}
```

**shadcn components:** `Card`, `CardContent`

**Tailwind strategy:**
- Card: `rounded-2xl border border-neutral-200 shadow-sm`
- Icon container: `rounded-xl bg-brand-100 text-brand-600 p-2`
- Value: `text-3xl font-bold text-neutral-800`
- Description: `text-sm text-neutral-500 mt-1`

---

### `CustomerCard.tsx`

**Purpose:** Compact customer summary used in the customer list page.

**Props:**
```typescript
interface CustomerCardProps {
  customer: Customer;
  appointmentCount?: number;
  lastVisit?: string;         // ISO date string
  onClick?: () => void;
}
```

**shadcn components:** `Card`, `CardContent`, `Badge`, `Avatar`

**Tailwind strategy:**
- Card: `flex items-center gap-4 p-4 rounded-xl border border-neutral-200 hover:border-brand-300 hover:shadow-md cursor-pointer transition-all`
- Avatar fallback: initials from `customer.name`, bg `brand-200`
- Style badge: `bg-brand-100 text-brand-700 text-xs`

---

### `AppointmentCard.tsx`

**Purpose:** Compact appointment tile used in lists and the calendar popover.

**Props:**
```typescript
interface AppointmentCardProps {
  appointment: AppointmentWithCustomer;
  showCustomer?: boolean;     // default true
  compact?: boolean;          // smaller layout for calendar cells
  onClick?: () => void;
}
```

**shadcn components:** `Card`, `CardContent`

**Tailwind strategy:**
- Card: `rounded-xl border-l-4 p-4 bg-white shadow-sm hover:shadow-md transition-shadow`
- Border color determined by status (see StatusBadge color map)
- Date/time: `text-sm font-medium text-neutral-700`
- Service: `text-xs text-neutral-500 capitalize`

---

### `StatusBadge.tsx`

**Purpose:** Colored `Badge` for appointment status.

**Props:**
```typescript
interface StatusBadgeProps {
  status: AppointmentStatus;
  className?: string;
}
```

**Color map:**
| Status | Tailwind classes |
|---|---|
| scheduled | `bg-blue-100 text-blue-700` |
| completed | `bg-emerald-100 text-emerald-700` |
| cancelled | `bg-neutral-100 text-neutral-500` |
| no-show | `bg-rose-100 text-rose-700` |

**shadcn components:** `Badge`

---

### `CalendarView.tsx`

**Purpose:** Full monthly calendar grid. Shows appointment dots per day. Clicking a day shows a popover list of that day's appointments.

**Props:**
```typescript
interface CalendarViewProps {
  appointments: AppointmentWithCustomer[];
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  onAppointmentClick: (appointment: AppointmentWithCustomer) => void;
  onDayClick?: (date: Date) => void;
}
```

**shadcn components:** `Button`, `Popover`, `PopoverContent`, `PopoverTrigger`

**Tailwind strategy:**
- Grid: `grid grid-cols-7 gap-px bg-neutral-200`
- Day cell: `bg-white min-h-[80px] md:min-h-[100px] p-1 md:p-2`
- Today: `ring-2 ring-brand-400`
- Appointment dot: `w-1.5 h-1.5 rounded-full inline-block` with status color
- Month nav: `flex items-center justify-between mb-4`

---

### `CustomerForm.tsx`

**Purpose:** Controlled form for creating and editing a customer. Used on `/customers/new` and optionally in an edit dialog on `/customers/[id]`.

**Props:**
```typescript
interface CustomerFormProps {
  initialValues?: Partial<Customer>;
  onSubmit: (payload: CreateCustomerPayload) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}
```

**Fields:** name (required), phone (required), email (required), preferredNailStyle (Select), allergies (Textarea), notes (Textarea)

**shadcn components:** `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`, `Input`, `Select`, `Textarea`, `Button`

**Validation:** Uses `react-hook-form` + `zod` schema. Name min 2 chars, email format, phone min 10 digits.

---

### `AppointmentForm.tsx`

**Purpose:** Controlled form for booking or editing an appointment.

**Props:**
```typescript
interface AppointmentFormProps {
  customers: Customer[];
  initialValues?: Partial<Appointment>;
  preselectedCustomerId?: string;
  onSubmit: (payload: CreateAppointmentPayload) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}
```

**Fields:** customer (Select, searchable), date (Calendar popover), time (Select — 15-min slots 8am–8pm), serviceType (Select), duration (Select: 30/45/60/75/90 min), totalPrice (Input number), notes (Textarea)

**shadcn components:** `Form`, `FormField`, `Input`, `Select`, `Textarea`, `Button`, `Popover`, `Calendar`

---

### `NoteCard.tsx`

**Purpose:** Display a single post-treatment note.

**Props:**
```typescript
interface NoteCardProps {
  note: Note;
  onEdit?: (note: Note) => void;
  onDelete?: (noteId: string) => void;
}
```

**shadcn components:** `Card`, `CardContent`

**Tailwind strategy:**
- Card: `rounded-xl bg-brand-50 border border-brand-200 p-4`
- Date: `text-xs text-neutral-400`
- Content: `text-sm text-neutral-700 mt-1 whitespace-pre-wrap`
- Action buttons: small ghost icon buttons in top-right corner

---

### `NoteForm.tsx`

**Purpose:** Inline textarea form to add or edit a note.

**Props:**
```typescript
interface NoteFormProps {
  appointmentId: string;
  customerId: string;
  initialContent?: string;
  onSubmit: (payload: CreateNotePayload) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}
```

**shadcn components:** `Textarea`, `Button`, `Form`

---

## Page Specifications

### `app/layout.tsx` — Root Layout

**Purpose:** Wraps all pages with the shell: sidebar navigation (desktop), bottom navigation (mobile), and a `Toaster` for notifications.

**Structure:**
```
<html>
  <body className="bg-brand-50 text-neutral-800">
    <div className="flex min-h-screen">
      <Navigation />                    {/* sidebar on md+ */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        {children}
      </main>
    </div>
    <Toaster />
  </body>
</html>
```

---

### `app/page.tsx` — Dashboard `/`

**Data required:**
- `DashboardStats` from `appointmentRepository.getStats()`
- `findUpcoming(5)` — next 5 appointments with customer info
- Recent 5 completed appointments for activity feed

**Components used:**
- `PageHeader` (title: "Dashboard", no breadcrumbs, action: "New Appointment" button)
- `StatsCard` x6: Total Customers, Appointments This Month, Upcoming, Revenue This Month, Completed, Cancellations
- `AppointmentCard` x5 in "Upcoming Appointments" section
- `AppointmentCard` x5 in "Recent Activity" section

**Layout:**
```
PageHeader
Stats grid (2 cols mobile / 3 cols desktop)
Two-column section (md+): Upcoming | Recent Activity
Quick action buttons: New Customer, New Appointment, View Calendar
```

---

### `app/customers/page.tsx` — Customer List `/customers`

**Data required:**
- `customerRepository.findAll()` — full list
- Appointment count per customer (aggregated client-side from appointments)

**Components used:**
- `PageHeader` (action: "New Customer" button)
- Search Input (controlled, filters client-side by name/email/phone)
- Style filter (Select — NailStyle values + "All")
- `CustomerCard` mapped over filtered results

**Behavior:**
- Search is client-side filtering against the loaded array
- Sort options: Name A-Z, Most Recent Visit, Most Appointments

---

### `app/customers/new/page.tsx` — New Customer `/customers/new`

**Data required:** None (creates new)

**Components used:**
- `PageHeader` (breadcrumbs: Dashboard > Customers > New Customer)
- `CustomerForm`

**Behavior:**
- On submit: calls `customerRepository.create()`, redirects to `/customers/[newId]`
- On cancel: navigates back to `/customers`

---

### `app/customers/[id]/page.tsx` — Customer Detail `/customers/[id]`

**Data required:**
- `customerRepository.findWithHistory(id)` — customer + appointments + notes
- Appointments sorted descending by dateTime

**Components used:**
- `PageHeader` (breadcrumbs: Dashboard > Customers > [name], action: "Edit Customer" + "New Appointment" buttons)
- Customer info card (two-column grid: contact info left, preferences right)
- `AppointmentCard` list with `StatusBadge` — grouped: Upcoming / Past
- `NoteCard` list — all notes for this customer
- "Add Note" triggers inline `NoteForm`

**Tabs structure (shadcn Tabs):**
- Tab 1: Overview (info + upcoming appointments)
- Tab 2: Appointment History (all past)
- Tab 3: Notes

---

### `app/appointments/page.tsx` — Appointment List `/appointments`

**Data required:**
- `appointmentRepository.findAll()` — full list with customer info

**Components used:**
- `PageHeader` (action: "New Appointment" button)
- Status filter tabs (All / Scheduled / Completed / Cancelled / No-Show)
- Date range pickers (from/to) using shadcn Calendar popover
- `AppointmentCard` mapped over filtered results, sorted by dateTime desc

**Behavior:**
- Filtering by status is client-side
- Date range filter applied client-side
- Clicking a card navigates to `/appointments/[id]`

---

### `app/appointments/new/page.tsx` — New Appointment `/appointments/new`

**Data required:**
- `customerRepository.findAll()` — for customer selector

**Components used:**
- `PageHeader` (breadcrumbs: Dashboard > Appointments > New Appointment)
- `AppointmentForm`

**Behavior:**
- Accepts `?customerId=` query param to pre-select customer (from customer detail page)
- On submit: calls `appointmentRepository.create()`, redirects to `/appointments/[newId]`

---

### `app/appointments/[id]/page.tsx` — Appointment Detail `/appointments/[id]`

**Data required:**
- `appointmentRepository.findById(id)` — appointment + customer
- `noteRepository.findByAppointmentId(id)` — all notes for this appointment

**Components used:**
- `PageHeader` (breadcrumbs: Dashboard > Appointments > [date], action: Edit + Status-change buttons)
- Appointment detail card: customer link, date/time, service, duration, price, status
- `StatusBadge` prominently displayed
- Status action buttons (e.g., "Mark Completed", "Mark No-Show", "Cancel") — conditional on current status
- Notes section: `NoteCard` list + inline `NoteForm`

**Behavior:**
- Status change calls `appointmentRepository.update()`
- New note calls `noteRepository.create()`
- Notes appear immediately (optimistic update from state)

---

### `app/calendar/page.tsx` — Calendar View `/calendar`

**Data required:**
- `appointmentRepository.findByDateRange(startOfMonth, endOfMonth)` — for current viewed month

**Components used:**
- `PageHeader` (action: "New Appointment" button)
- `CalendarView` (full-width)
- Month navigation (prev/next) updates date state, triggers data refetch

**Behavior:**
- Server-side: load initial month's appointments as a server component
- Client-side month navigation re-fetches via a Server Action or client-side repository call
- Clicking a day shows a popover with `AppointmentCard` (compact) list
- Clicking an appointment navigates to `/appointments/[id]`

---

## Navigation Structure

```
Top-level routes (all accessible from main nav):
  /               Dashboard
  /customers      Customer List
  /appointments   Appointment List
  /calendar       Calendar View

Child routes (not in main nav, accessed contextually):
  /customers/new              Via "New Customer" button
  /customers/[id]             Via CustomerCard click
  /appointments/new           Via "New Appointment" button (or ?customerId=X)
  /appointments/[id]          Via AppointmentCard click
```

---

## shadcn/ui Installation Commands

Run these from `/workspace` to install all required shadcn components:

```bash
npx shadcn@latest init
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add badge
npx shadcn@latest add select
npx shadcn@latest add textarea
npx shadcn@latest add separator
npx shadcn@latest add avatar
npx shadcn@latest add dialog
npx shadcn@latest add form
npx shadcn@latest add popover
npx shadcn@latest add calendar
npx shadcn@latest add toast
npx shadcn@latest add tabs
npx shadcn@latest add sonner
```

Or as a single command:
```bash
npx shadcn@latest add button card input label badge select textarea separator avatar dialog form popover calendar toast tabs sonner
```

Additional npm packages required:
```bash
npm install react-hook-form zod @hookform/resolvers date-fns lucide-react
```

---

## Data Flow Pattern

```
Page (Server Component)
  └─ calls Repository (async, returns typed data)
       └─ FakeRepository (reads/writes in-memory arrays in fake-data.ts)
            └─ [Future] RealRepository (reads/writes database)

Client Components (forms, interactive lists)
  └─ receive initial data as props from Server Component
  └─ mutations call Server Actions → Repository → re-render or redirect
```

**Key rule:** Pages are Server Components by default. Only components requiring `useState`, `useEffect`, or event handlers are marked `"use client"`. Forms and interactive filters are client components.

---

## Future Database Migration Path

To migrate from fake data to a real database:

1. Create `src/lib/repositories/prisma/customerRepository.ts` (implements `ICustomerRepository` using Prisma client)
2. Replace the `FakeCustomerRepository` import in each page/server-action with the Prisma version
3. The fake data file can be used as a database seed script
4. No component or page code changes required

All repositories are accessed via their interface type, never the concrete fake class, ensuring zero coupling to the fake implementation.
