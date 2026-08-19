# [RFC / Proposal] Frontend API Integration Architecture & Codebase Cleanup

| Metadata | Details |
| :--- | :--- |
| **Target Area** | `client/` (Frontend React / Vite Application) |
| **Status** | 📝 Open for Review / RFC |
| **Proposed PR Breakdown** | PR #1: Services Layer • PR #2: Auth Cleanup • PR #3: Types Unification • PR #4: Mock Layer |
| **Related Issues/Topics** | API Centralization, Session Auth, Type Deduplication, Contract Alignment |

---

## 1. Summary & Motivation

During an architectural audit of the frontend (`client/`) against the API endpoints, several opportunities were identified to simplify maintenance, eliminate code duplication, fix subtle session bugs, and align data contracts.

### Key Objectives
1. **Centralize Networking**: Replace scattered, ad-hoc `axios.create()` and `fetch()` calls across components with a dedicated `src/services/` layer.
2. **Standardize Auth & Credentials**: Consolidate cookie-based session handling, remove dead token-storage logic and unreferenced context files, and ensure consistent credential transmission (`withCredentials: true`).
3. **Unify TypeScript Data Contracts**: Standardize entity interfaces (`Member`, `ProjectAssignment`, `MemberRole`) to use a single source of truth with consistent UUID `id` fields.
4. **Clarify Ahead-of-Backend Features**: Identify UI views built ahead of backend ledger/invoice endpoints and isolate mock data cleanly.

---

## 2. Proposed Changes & PR Breakdown

To keep review and testing manageable, the recommended changes are organized into 4 incremental, PR-sized deliverables:

```mermaid
graph LR
    PR1["PR 1: Services Layer<br/>(Centralized Axios & APIs)"] --> PR2["PR 2: Auth Consistency<br/>(Clean dead context & token code)"]
    PR2 --> PR3["PR 3: Types Consolidation<br/>(Single Source of Truth)"]
    PR3 --> PR4["PR 4: Mock & Contract Audits<br/>(Ahead-of-backend views)"]
```

---

### 📦 PR 1: Centralize API Client & Domain Services Layer

#### Problem
Currently, around ten components independently instantiate their own `axios.create(...)` clients with duplicated base URLs and configuration:
- `src/routes/admin/ManageProjects.tsx`
- `src/routes/admin/ManageMembers.tsx`
- `src/routes/client/tasks/MyTask.tsx`
- `src/routes/client/Resources.tsx`
- `src/components/client/bio/SettingsOverview.tsx`
- `src/components/client/bio/PasswordUpdate.tsx`
- `src/components/client/bio/AccountDelection.tsx`
- `src/components/admin/MemberForm.tsx`
- `src/components/admin/ProjectUploadForm.tsx`
- `src/components/admin/ResourceTable.tsx`
- `src/hooks/useAdminApi.tsx`

Additionally, several components call raw `fetch()` directly:
- `src/components/client/tasks/TaskForm.tsx`
- `src/components/client/tasks/RecentTaskLogs.tsx`
- `src/components/client/tasks/TaskLogExcelUpload.tsx`

#### Proposed Solution
1. Create a shared Axios instance in `src/services/api.ts` configuring the base URL (from `VITE_API_URL` environment variable) and global defaults (`withCredentials: true`, JSON headers, and uniform error interceptors).
2. Create modular domain service files under `src/services/` exporting strongly typed async functions:
   - `src/services/auth.service.ts`
   - `src/services/members.service.ts`
   - `src/services/projects.service.ts`
   - `src/services/projectAssignments.service.ts`
   - `src/services/tasks.service.ts`
   - `src/services/resources.service.ts`
3. Refactor components to import service methods rather than constructing HTTP requests directly.

#### Implementation Pattern Example
```typescript
// src/services/api.ts
import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for consistent error extraction
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.detail || error.message || "An unexpected error occurred";
    return Promise.reject(new Error(message));
  }
);
```

```typescript
// src/services/projects.service.ts
import { apiClient } from "./api";
import type { Project, CreateProjectDto } from "../types/projects";

export const projectsService = {
  getAll: async (): Promise<Project[]> => {
    const res = await apiClient.get<Project[]>("/projects");
    return res.data;
  },
  getById: async (id: string): Promise<Project> => {
    const res = await apiClient.get<Project>(`/projects/${id}`);
    return res.data;
  },
  create: async (payload: CreateProjectDto): Promise<Project> => {
    const res = await apiClient.post<Project>("/projects", payload);
    return res.data;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/projects/${id}`);
  },
};
```

---

### 📦 PR 2: Auth Architecture & Credential Consistency Cleanup

#### Problem
- **Dead Context**: `src/context/AuthContext.tsx` is completely unused. The active authentication flow across `ProtectedRoute.tsx`, `Login.tsx`, and other routes uses `src/hooks/useAuth.tsx`.
- **Dead Token Interceptors**: Some ad-hoc axios instances attach an `Authorization: Bearer localStorage.getItem("authToken")` interceptor. However, the application uses HTTP-only cookie session authentication, and no code sets or maintains an `authToken` in `localStorage`.
- **Missing Credentials on Certain Calls**: `ManageProjects.tsx` and `ProjectUploadForm.tsx` omit `withCredentials: true`, which can lead to session authentication failing silently on those requests.

#### Proposed Solution
- [x] Remove `src/context/AuthContext.tsx` to prevent developer confusion.
- [x] Strip out dead `localStorage.getItem("authToken")` interceptor logic.
- [x] Ensure all API requests route through the shared `apiClient` where `withCredentials: true` is universally enforced.

---

### 📦 PR 3: TypeScript Type Definitions & Contract Standardization

#### Problem
- **Duplicate & Inconsistent Entity Types**:
  - `Member` is declared in `src/types/members.ts` (camelCase `id`, `fullName`) and in `src/types/task.ts` (snake_case `_id`, `full_name`), plus inline variations in `SettingsOverview.tsx` and `Financies.tsx`.
  - `ProjectAssignment` is declared with different fields in `src/types/projectAssignment.ts` and `src/types/task.ts`.
  - `MemberRole` is declared independently in both `src/types/role.ts` and `src/types/members.ts`.
- **Legacy ID Field Shapes**: Some types still specify MongoDB-style `_id`, whereas the API standardizes on UUID `id`.

#### Proposed Solution
- [x] Establish `src/types/` as the single source of truth for domain models.
- [x] Standardize all primary identifiers to `id: string` (UUID).
- [x] Remove `src/types/role.ts` and consolidate role definitions under `src/types/members.ts` (or `src/types/auth.ts`).
- [x] Remove duplicate type declarations from `src/types/task.ts` and import shared types from `src/types/members.ts` and `src/types/projectAssignment.ts`.

#### Target Type Structure Example
```typescript
// src/types/members.ts
export type MemberRole = "TASKER" | "MANAGER" | "ADMIN";

export type Member = {
  id: string;
  fullName: string;
  email: string;
  role: MemberRole;
  phone?: string;
  avatar?: string;
  status?: string;
  activeProjects?: number;
  meta?: Record<string, unknown>;
};
```

```typescript
// src/types/projectAssignment.ts
export type AssignmentStatus =
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "REMOVED";

export type ProjectAssignment = {
  id: string;
  project_id: string;
  tasker_id: string;
  status: AssignmentStatus;
  custom_rate?: number | null;
  assigned_at?: string;
  removed_at?: string | null;
  meta?: Record<string, unknown>;
};
```

---

### 📦 PR 4: Mock Data Isolation & Ahead-of-Backend UI Gating

#### Context
Several UI pages and widgets currently feature static mock data or UI chrome without backing API endpoints:
- `src/routes/admin/Financies.tsx` (uses hardcoded `mockMembers`)
- ~~`src/routes/client/Invoices.tsx` & `src/components/client/invoices/InvoiceViewer.tsx`~~
  **Resolved 2026-08-04** — real invoicing endpoints now exist, see §5 below.
  `Financies.tsx`'s `mockMembers` and the dashboard cards are still unaddressed
  (those depend on the separate admin-side payments/stats work, not yet built).
- `src/routes/admin/TasksLog.tsx`
- `src/components/client/billing/PaymentMethods.tsx`
- Client dashboard cards: `QuickActions.tsx`, `BalanceCard.tsx`, `ClientStats.tsx`

#### Proposed Solution
- Keep these views isolated and cleanly stubbed with typed mock handlers until ledger and invoicing endpoints become available.
- Avoid building complex ad-hoc data-fetching logic for these views until their respective API schemas are officially published.

---

## 3. Security & Authorization Architecture Notes

| Layer | Responsibility | Notes |
| :--- | :--- | :--- |
| **Client-Side RBAC** | UI/UX Convenience | Role-based conditional rendering (e.g. hiding admin tabs/buttons) prevents confusion but is **not** a security boundary. |
| **Server-Side RBAC** | Authorization & Security | The API validates session cookies and enforces role permissions on all write/read operations. |
| **Transport** | Session Management | Session cookies require `withCredentials: true` on all client cross-origin HTTP requests. |

---

## 4a. ⚠️ Backend Role-Model Changes (Action Required)

The backend has finalized its authorization model on a 3-tier role set —
`TASKER`, `ADMIN`, `SUPERADMIN` — and enforces it server-side on every
protected route. This is a breaking change for a few things the frontend
currently does. None of the frontend code was touched as part of this —
flagging it here instead.

### 1. `MANAGER` role is gone

`role.ts`, `members.ts`, and `MemberForm.tsx` all declare
`MemberRole = "TASKER" | "MANAGER" | "ADMIN"`. The backend `User.role` enum is
now `SUPERADMIN | ADMIN | TASKER` — `MANAGER` was never produced by any real
flow and has been dropped; `SUPERADMIN` is new.

- [x] Update `MemberRole` (all three declarations — see PR 3 above about
      consolidating them into one) to `"TASKER" | "ADMIN" | "SUPERADMIN"`.
- [x] Update `MemberForm.tsx`'s role `<select>` to offer `SUPERADMIN` instead
      of `MANAGER`, gated appropriately (see next point).
- [x] `ProtectedRoute.tsx`'s `allowedRoles` prop is typed
      `("TASKER" | "ADMIN")[]` — extend to include `"SUPERADMIN"` once there's
      a superadmin-facing route to protect.

### 2. `POST /api/v1/auth/register` no longer exists

`MemberForm.tsx` currently creates new members by POSTing to
`/api/v1/auth/register` — a public, unauthenticated endpoint that accepted an
arbitrary `role` in the body. That was a live privilege-escalation hole (any
caller, logged in or not, could mint themselves an `ADMIN` account) and has
been removed outright, not just tightened.

Account creation now goes exclusively through the already-existing
(now role-gated) `POST /api/v1/members`, which takes the same
`full_name`/`email`/`password`/`role`/`phone`/`status` shape `MemberForm.tsx`
already sends — so this should be close to a one-line endpoint swap:

- [x] In `MemberForm.tsx`, change the create-member call from
      `api.post("/api/v1/auth/register", …)` to
      `api.post("/api/v1/members", …)` (the update path already correctly
      uses `PUT /api/v1/members/{id}`).
- [x] `POST /api/v1/members` now requires the caller to be authenticated as
      `ADMIN` or `SUPERADMIN` (cookie-based, so this should just work given
      `withCredentials: true` is already set — but worth confirming in
      testing).
- [x] Role-tier rule to reflect in the UI: an `ADMIN` caller can only create
      `TASKER` accounts — attempting to create/edit an `ADMIN` or
      `SUPERADMIN` account returns `403`. Only `SUPERADMIN` can manage
      `ADMIN`/`SUPERADMIN` accounts. Consider hiding the `ADMIN`/`SUPERADMIN`
      role options in `MemberForm.tsx`'s dropdown when the logged-in user
      isn't a `SUPERADMIN`, so the 403 isn't the first the user hears of it.

### 3. `DELETE /api/v1/projects/{id}` no longer deletes

Per the finalized role decision, hard project deletion has been disabled
entirely. The route (same path, same HTTP verb — `ManageProjects.tsx`'s
`api.delete(...)` call doesn't need to change) now **deactivates** the
project instead: it purges the project's Cloudinary resources, sets
`status = "DEACTIVATED"`, and leaves assignments and historical task/payment
data untouched. Taskers still see the project, now showing status
"Deactivated".

- [x] `ManageProjects.tsx`'s delete-confirmation copy/toast should say
      "deactivate" rather than "delete" — the current wording will be
      misleading now that the row isn't actually removed.
- [x] Anywhere that renders `project.status`, add a `"DEACTIVATED"` case to
      the status badge/label logic (project status enum is now `DRAFT |
      PENDING | ACTIVE | PAUSED | CLOSED | DEACTIVATED`).
- [x] `ManageProjects.tsx` likely removes the row from its local list on a
      successful delete — since the project still exists (just deactivated),
      confirm whether it should instead re-fetch/update the row's status in
      place.

---

## 4b. 📚 Full API Reference Is Now Available — Don't Rely on This Doc Alone

Everything above is a summary written by hand, which means it can drift out
of date or miss a field. For the authoritative, always-current list of every
endpoint, request/response shape, and enum, use one of these instead of
waiting on the next `recommendations.md` update:

### Option 1 — Static snapshot (no backend setup required)

An exported `openapi.json` has been placed at `openapi.json` in this repo — the OpenAPI 3.1.0 schema for the live `backend-python` API surface
(all `/api/v1/...` routes). You can:

- Import it into Postman or Insomnia to get a ready-made, runnable request
  collection instead of hand-building one.
- Feed it to an OpenAPI codegen tool (e.g. `openapi-typescript`,
  `openapi-generator`) to generate typed request/response interfaces —
  this could remove most of the manual guesswork described in PR 3
  (`Member`, `ProjectAssignment`, etc.) and pairs naturally with the
  `src/services/` layer proposed in PR 1.

It's a point-in-time snapshot, not a live feed — treat it as stale the
moment a new backend change lands, until it's re-exported and re-dropped
here.

### Option 2 — Live interactive docs (requires running the backend)

You can also clone and run `backend-python` yourself:

```bash
git clone git@github.com:gt-consults/gt-backend-fastapi.git
cd gt-backend-fastapi
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
# configure .env.development (DB URL, JWT secret, etc.) — see the repo's README
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Once it's running, FastAPI serves interactive Swagger UI docs at
`http://localhost:8000/docs` (and ReDoc at `/redoc`), generated straight
from the running code — so it's always accurate, lets you fire real
requests against a local database, and shows the exact role/auth
requirement per route. This is the fastest way to answer "does this need
SUPERADMIN or just ADMIN?" or "what does the response body actually look
like?" without waiting on this doc.

---

## 4c. Reviewer Checklist & Discussion Points

**Answered 2026-08-19** — these were open questions; here's how each was
resolved in the implementation. See §7 below.

- **Deprecation of `src/context/AuthContext.tsx`** — confirmed unused
  (nothing in `src/` imported it) and deleted. `src/context/CurrencyContext.tsx`
  turned out to be dead too, and went with it.
- **Service Layer Structure** — went with the modular
  `src/services/<domain>.service.ts` layout as proposed, over one consolidated
  file. Nine domain services over a single shared axios instance.
- **Credential Issues in Forms** — moot now: every request goes through the one
  `apiClient`, which sets `withCredentials: true` globally, so
  `ManageProjects.tsx`/`ProjectUploadForm.tsx` can no longer omit it.
- **PR Sequencing** — *not* followed. The 4-PR sequence assumed incremental
  refactoring of the existing screens; the work ended up being a rebuild of the
  authenticated app instead (mobile-first redesign on the landing palette, plus
  the §5/§6 surfaces that had no UI at all), so PRs 1–4 landed together rather
  than in sequence. Everything each PR called for is done.
- **§4a urgency** — resolved. `MemberForm`'s create call now goes to
  `POST /api/v1/members`; there is no remaining reference to `/auth/register`
  anywhere in `client/`.

---

## 5. [2026-08-04] Task Upload, Dispute & Invoicing — New Endpoints

The backend just shipped the real task-log upload → invoice pipeline
(`backend-python/task-planning.md` P7). None of the frontend was touched —
flagging the new/changed surface here. Full behavioral rules (upload format,
duplicate/dispute handling, invoice math) are documented server-side in
`backend-python/INVOICING_RULES.md` if you need the detail behind any of this.

### 1. New `User.payment_rate` field

`Member`/`User` gained a `payment_rate: number` field (0–100, a percentage) —
each tasker's negotiated revenue-share rate, used as the default on their
generated invoices. It's returned by `GET /members/*` and accepted by
`POST /members` and `PUT /members/{id}`, but **deliberately not accepted by
`PUT /members/me`** — a tasker can't self-edit their own rate.

- [x] Add `payment_rate` to wherever `Member`/`User` types are declared
      (see PR 3 above about consolidating those declarations).
- [x] `MemberForm.tsx`'s create/edit form should expose a `payment_rate`
      input (admin-only, which it already is since that form is admin-gated).

### 2. Task upload & task-list endpoints

Replaces whatever `TaskForm.tsx`/`RecentTaskLogs.tsx`/`TaskLogExcelUpload.tsx`
currently call — the shape is new (see the required-headers list in
`INVOICING_RULES.md` §1 if wiring up a CSV/XLSX upload form).

```
POST /api/v1/tasks/import   multipart: file (.csv/.xlsx) + projectId form field
POST /api/v1/tasks          { projectId, taskId, taskStatus, taskingDate, taskDuration, paidDuration, account }
GET  /api/v1/tasks/mine     ?projectId=  — own entries, includes dispute_state, account
```

Upload responses include a human-readable `message` plus structured
`duplicates_skipped`/`disputes_raised` fields — worth surfacing directly
rather than re-deriving, since the dispute message names the other tasker.

### 3. Dispute endpoints (new UI surface, no existing screen for this)

```
GET  /api/v1/disputes/mine                          (tasker's own)
POST /api/v1/disputes/{id}/claim
POST /api/v1/disputes/{id}/confirm   { confirm_task_id, transfer_to_user_id }
GET  /api/v1/disputes                                (admin, filterable)
GET  /api/v1/disputes/export/pdf                     (admin)
```

- [x] There's currently no tasker-facing UI for "you have a disputed task" —
      worth a small banner/badge wherever `dispute_state` shows up as
      `DISPUTED` on a task-list row, since there's no email/push notification
      backing this (the tasker only finds out by checking the app).
- [x] Admin needs a disputes table view — `GET /api/v1/disputes` returns
      task ID, both parties, raised date, status, and resolution info
      directly, so this should be a fairly thin table component.

### 4. Invoicing endpoints (replaces the old ledger-based route entirely)

`GET /api/v1/invoices/{projectId}/{periodId}` **no longer exists** — it was
never functional (nothing ever populated the ledger it read from). Replaced by:

```
POST /api/v1/invoices/generate   { project_id, period_start, period_end, invoice_number? }
GET  /api/v1/invoices            ?projectId=&status=   (role-scoped)
GET  /api/v1/invoices/{id}
GET  /api/v1/invoices/{id}/pdf
```

- [x] This unblocks §4 PR 4's `Invoices.tsx`/`InvoiceViewer.tsx` — they were
      isolated behind mock data specifically pending this. See the checked-off
      item in §4 above.
- [x] One invoice = one tasker + one project + one billing period — a tasker
      working multiple projects needs one `generate` call per project, not
      a combined multi-project invoice (the PDF template has a single
      rate/cap per invoice, so this was a deliberate constraint, not a gap).
- [x] `TASKER` callers generating their own invoice never send `rate` or
      `payment_rate` — those are always server-computed. Only an `ADMIN`
      generating on someone else's behalf can pass overrides.

---

## 6. [2026-08-05] `ACCOUNT` field added to task upload & invoices

A new mandatory `ACCOUNT` field was added to the task-log upload pipeline —
a short client/account code (e.g. `GT`, `JW`, `FD`), **max 4 characters**.
If §5.2's task-upload UI is already in progress, this needs to be added to it.

- [x] **Bulk upload** (`POST /api/v1/tasks/import`): the CSV/XLSX file's
      header row must now include an `ACCOUNT` column alongside the existing
      five (full list in `backend-python/INVOICING_RULES.md` §1). Missing or
      >4-character values reject the whole file/row with a 400, same as the
      other required columns.
- [x] **Single entry** (`POST /api/v1/tasks`): body now requires an
      `account: string` field (see the updated shape in §5.2 above).
- [x] `GET /api/v1/tasks/mine` rows now include `account` — worth showing
      alongside `task_id` in whatever table/list renders task entries.
- [x] Generated invoices (`GET /api/v1/invoices/{id}` `items[]`, and the PDF
      at `GET /api/v1/invoices/{id}/pdf`) now include `account` per line item.
      No frontend action needed unless you're rendering `items[]` yourself
      outside of just linking to the PDF — if so, add a narrow Account
      column, it's short by design (initials, 4 chars worst case).

---

## 7. [2026-08-19] Everything above is implemented — plus two new endpoints

Two things happened in this pass, and it's worth being clear about which is
which.

**First: this document is now a record, not a to-do list.** Every checklist item
in §2 (PR 1–4), §4a, §5 and §6 has been implemented in `client/`, and §4c's open
questions are answered inline above. The work was done as one rebuild of the
authenticated app rather than the proposed 4-PR sequence — see the note under
§4c. Full detail is in `client/changes.md` (untracked, local).

Headline: types are centralised in `src/types/` and imported from `@/types`
everywhere; all networking goes through `src/services/`; the dashboards were
redesigned mobile-first on the landing page's palette; and the surfaces §5 and
§6 described — task upload, disputes, invoicing, the `ACCOUNT` field — now have
real screens rather than mock data.

**Second: the backend gained two endpoints and lost two bugs.** Those are new
information, and are the part worth reading if you only read one thing.

### 1. New: `GET /api/v1/tasks` (ADMIN/SUPERADMIN)

```
GET /api/v1/tasks?projectId=&taskerId=&taskStatus=&disputeState=&dateFrom=&dateTo=&limit=
→ { summary: TaskOverviewSummary, entries: TaskEntryWithParties[] }
```

`summary` carries `total_entries`, `completed`, `disputed`, `forfeited`,
`total_paid_minutes`, `taskers`, `projects` — all computed over the same filter
set as the rows. Each entry is a normal task entry plus `tasker_name` and
`project_name`, so an admin table doesn't have to join every row against
`/members` and `/projects`.

Added because admins previously had **no** view of task entries at all:
`/tasks/mine` is tasker-scoped, the duplicate and dispute logs only show
exceptions, and invoices don't exist until someone generates one. `limit`
defaults to 500, capped at 1000.

- [x] Used by `src/routes/admin/TaskLog.tsx` and `src/routes/admin/Dashboard.tsx`.

### 2. New: `PATCH /api/v1/invoices/{id}/status` (ADMIN/SUPERADMIN)

```
PATCH /api/v1/invoices/{invoice_id}/status   { "status": "Draft|Issued|Paid|Overdue" }
→ InvoiceResponse
```

Moving to `Paid` stamps `paid_at`; moving away from `Paid` clears it. The frozen
`items`, `exclusions` and money fields are never rewritten.

Added because nothing could move an invoice out of `Issued`, which made `Paid`,
`Overdue` and `paid_at` unreachable — so `GET /invoices?status=` could filter on
values that never occurred, and "outstanding" could never go down.

- [x] Used by `src/routes/shared/InvoiceDetail.tsx` (admin-only control).

### 3. Fixed: `POST /api/v1/projects/` 500'd on any revenue split

Creating a project with a `revenue_split` body returned a 500 — the backend
handed SQLAlchemy a Pydantic model for a JSON column. **Project creation from
the UI was impossible.** Fixed; `POST /projects/` with a split now works. No
contract change — if you had worked around this by omitting `revenue_split`, you
can stop.

### 4. Fixed: a task upload that raised a dispute returned 500

`POST /api/v1/tasks` and `POST /api/v1/tasks/import` returned a 500 whenever the
upload collided with another tasker's task ID — *after* committing, so the
dispute was created and both entries flagged, but the uploader saw a generic
error instead of the summary.

This mattered more than it looks: per §5.3 there is no email or push behind
disputes, so that response is the **only** moment a tasker is told who they
collided with. Both endpoints now return their `TaskImportSummary` correctly,
with `disputes_raised[].disputed_with.full_name` populated and the other party
named in `message`.

- [x] Surfaced by `src/components/tasks/ImportSummary.tsx`, which separates rows
      recorded / duplicates skipped / disputes raised and links to the disputes
      screen.

### 5. `openapi.json` re-exported

The snapshot in this repo was from 2026-08-07 and predated
`PUT /members/{id}/reset-password` as well as items 1 and 2 above. It has been
regenerated from the running app, so §4b's Option 1 is accurate again.

---

## 8. [2026-08-19] Dispute revocation, auto-forfeit, invoice carry-over & bulk generation

All four are implemented in `client/` already — this section is the contract
record, not a to-do list. The one item that changes a shape you may already be
reading is §8.3.

### 1. New: `POST /api/v1/disputes/{id}/revoke` (TASKER)

Undoes a confirmation. The dispute returns to `PENDING`, the claim is cleared,
and both entries go back to `DISPUTED` — either party can then claim again.

Refused with a reason in three cases:
- `403` — the caller is the resolved owner (only the *confirming* party may
  revoke; the winner undoing their own win would defeat the handshake)
- `409` — the 5-day window has closed, so the resolution is final
- `409` — either entry has already been billed on an invoice

The deadline is **not** extended by a revoke; it still runs from `raised_at`.

- [x] Wired in `src/components/disputes/DisputeCard.tsx` and
      `src/routes/client/Disputes.tsx`.

### 2. Changed: `DisputeResponse` gained four fields

```
expires_at: string        // ISO — raised_at + 5 days
days_remaining: int
hours_remaining: int
can_revoke: bool          // whether revoke would succeed right now
```

Prefer these over computing the countdown client-side — the server's clock is
the one that decides, and `can_revoke` saves re-deriving the three rules above.

- [x] `disputeDaysRemaining()` was removed from `src/types/dispute.ts` in favour
      of the server fields; `disputeCountdown()` / `disputeUrgency()` replace it.

### 3. ⚠️ Changed: invoice generation now sweeps up carry-over work

**This changes which tasks land on an invoice, so it's worth knowing about even
though no request shape broke.**

The problem: a task disputed on 10 Aug is correctly excluded from the 1–15 Aug
invoice; the dispute resolves on 20 Aug; under a strict period window that task
would **never** be billed, because its date sits in an already-invoiced period.

`TaskEntry` now carries `invoice_id`, stamped when an entry is billed, and
generation asks for entries that are *unbilled and dated on or before
`period_end`* rather than entries *inside the period*. So:

- work that becomes billable after its own period was invoiced appears on the
  **next** invoice, dated in the past;
- nothing is ever billed twice, however many overlapping periods you generate;
- **re-running a generation for the same period is safe** — it simply finds
  nothing and returns `404`.

`POST /api/v1/invoices/generate` accepts `include_carryover` (default `true`);
pass `false` for a strict period-only invoice.

Exclusion counts still describe the stated period only, so an old forfeited task
isn't re-counted as an exclusion forever.

- [x] Carried-over line items are surfaced on the invoice document in
      `src/routes/shared/InvoiceDetail.tsx` — derived from `items[].task_date`
      being before `period_start`, so no new response field was needed.

### 4. New: `POST /api/v1/invoices/generate-bulk` (ADMIN/SUPERADMIN)

```
{ period_start, period_end, project_ids?, tasker_ids?, include_carryover?, dry_run? }
→ { dry_run, period_start, period_end, generated_count, skipped_count,
    total_value, lines: BulkInvoiceLine[] }
```

One invoice per tasker × project — a tasker on three projects gets three
invoices, for the same reason a combined invoice was rejected in §5.4 (the PDF
carries a single rate and cap). Pairs with nothing billable are returned as
skipped **with a reason** rather than failing the run.

`dry_run: true` costs the whole run and writes nothing. There are no rate
overrides on this endpoint; single generation still has them.

- [x] `src/components/invoices/BulkInvoiceDialog.tsx`, reached from
      `/admin/invoices`. Two-step: preview, then commit.

### 5. Behavioural: disputes now forfeit on an hourly schedule

Previously the 5-day deadline was only evaluated when someone hit a dispute
endpoint. There is now an hourly background sweep as well (plus one at startup),
so entries flip even when nobody opens the app. The lazy check remains, so a
read is never stale in between.

Practical effect for the frontend: a dispute's `status` can change to
`FORFEITED` without any user action, so don't cache dispute lists across long
sessions.

### 6. Schema note

`task_entries.invoice_id` is a new nullable, indexed FK. Migration
`24a1efebb0de` adds it and **backfills** existing invoices' entries by matching
`(project, tasker, task_id)` against the frozen `items` — without that, the
first generation after deploying would have re-billed the entire history.

Run `alembic upgrade head` (the Docker entrypoint already does).
