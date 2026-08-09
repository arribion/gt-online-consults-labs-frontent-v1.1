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
- [ ] Remove `src/context/AuthContext.tsx` to prevent developer confusion.
- [ ] Strip out dead `localStorage.getItem("authToken")` interceptor logic.
- [ ] Ensure all API requests route through the shared `apiClient` where `withCredentials: true` is universally enforced.

---

### 📦 PR 3: TypeScript Type Definitions & Contract Standardization

#### Problem
- **Duplicate & Inconsistent Entity Types**:
  - `Member` is declared in `src/types/members.ts` (camelCase `id`, `fullName`) and in `src/types/task.ts` (snake_case `_id`, `full_name`), plus inline variations in `SettingsOverview.tsx` and `Financies.tsx`.
  - `ProjectAssignment` is declared with different fields in `src/types/projectAssignment.ts` and `src/types/task.ts`.
  - `MemberRole` is declared independently in both `src/types/role.ts` and `src/types/members.ts`.
- **Legacy ID Field Shapes**: Some types still specify MongoDB-style `_id`, whereas the API standardizes on UUID `id`.

#### Proposed Solution
- [ ] Establish `src/types/` as the single source of truth for domain models.
- [ ] Standardize all primary identifiers to `id: string` (UUID).
- [ ] Remove `src/types/role.ts` and consolidate role definitions under `src/types/members.ts` (or `src/types/auth.ts`).
- [ ] Remove duplicate type declarations from `src/types/task.ts` and import shared types from `src/types/members.ts` and `src/types/projectAssignment.ts`.

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

- [ ] Update `MemberRole` (all three declarations — see PR 3 above about
      consolidating them into one) to `"TASKER" | "ADMIN" | "SUPERADMIN"`.
- [ ] Update `MemberForm.tsx`'s role `<select>` to offer `SUPERADMIN` instead
      of `MANAGER`, gated appropriately (see next point).
- [ ] `ProtectedRoute.tsx`'s `allowedRoles` prop is typed
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

- [ ] In `MemberForm.tsx`, change the create-member call from
      `api.post("/api/v1/auth/register", …)` to
      `api.post("/api/v1/members", …)` (the update path already correctly
      uses `PUT /api/v1/members/{id}`).
- [ ] `POST /api/v1/members` now requires the caller to be authenticated as
      `ADMIN` or `SUPERADMIN` (cookie-based, so this should just work given
      `withCredentials: true` is already set — but worth confirming in
      testing).
- [ ] Role-tier rule to reflect in the UI: an `ADMIN` caller can only create
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

- [ ] `ManageProjects.tsx`'s delete-confirmation copy/toast should say
      "deactivate" rather than "delete" — the current wording will be
      misleading now that the row isn't actually removed.
- [ ] Anywhere that renders `project.status`, add a `"DEACTIVATED"` case to
      the status badge/label logic (project status enum is now `DRAFT |
      PENDING | ACTIVE | PAUSED | CLOSED | DEACTIVATED`).
- [ ] `ManageProjects.tsx` likely removes the row from its local list on a
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

Please review the proposed structure and confirm:

- [ ] **Deprecation of `src/context/AuthContext.tsx`**: Can you confirm no untracked dependencies rely on this file before it is deleted?
- [ ] **Service Layer Structure**: Does the modular `src/services/<domain>.service.ts` layout align with your preferred architecture, or would you prefer a single consolidated services file?
- [ ] **Credential Issues in Forms**: Have you noticed authentication issues in `ManageProjects.tsx` or `ProjectUploadForm.tsx` that will be resolved by enforcing `withCredentials: true`?
- [ ] **PR Sequencing**: Are you happy to proceed in the proposed 4-stage PR sequence?
- [ ] **§4a urgency**: The `/auth/register` removal breaks `MemberForm.tsx`'s
      create-member flow as soon as this backend change deploys — treat that
      one endpoint swap as higher priority than the 4-PR sequence above, even
      if the rest of §4a's cleanup (role types, deactivate copy) rides along
      with PR 3 / PR 1 respectively.

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

- [ ] Add `payment_rate` to wherever `Member`/`User` types are declared
      (see PR 3 above about consolidating those declarations).
- [ ] `MemberForm.tsx`'s create/edit form should expose a `payment_rate`
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

- [ ] There's currently no tasker-facing UI for "you have a disputed task" —
      worth a small banner/badge wherever `dispute_state` shows up as
      `DISPUTED` on a task-list row, since there's no email/push notification
      backing this (the tasker only finds out by checking the app).
- [ ] Admin needs a disputes table view — `GET /api/v1/disputes` returns
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

- [ ] This unblocks §4 PR 4's `Invoices.tsx`/`InvoiceViewer.tsx` — they were
      isolated behind mock data specifically pending this. See the checked-off
      item in §4 above.
- [ ] One invoice = one tasker + one project + one billing period — a tasker
      working multiple projects needs one `generate` call per project, not
      a combined multi-project invoice (the PDF template has a single
      rate/cap per invoice, so this was a deliberate constraint, not a gap).
- [ ] `TASKER` callers generating their own invoice never send `rate` or
      `payment_rate` — those are always server-computed. Only an `ADMIN`
      generating on someone else's behalf can pass overrides.

---

## 6. [2026-08-05] `ACCOUNT` field added to task upload & invoices

A new mandatory `ACCOUNT` field was added to the task-log upload pipeline —
a short client/account code (e.g. `GT`, `JW`, `FD`), **max 4 characters**.
If §5.2's task-upload UI is already in progress, this needs to be added to it.

- [ ] **Bulk upload** (`POST /api/v1/tasks/import`): the CSV/XLSX file's
      header row must now include an `ACCOUNT` column alongside the existing
      five (full list in `backend-python/INVOICING_RULES.md` §1). Missing or
      >4-character values reject the whole file/row with a 400, same as the
      other required columns.
- [ ] **Single entry** (`POST /api/v1/tasks`): body now requires an
      `account: string` field (see the updated shape in §5.2 above).
- [ ] `GET /api/v1/tasks/mine` rows now include `account` — worth showing
      alongside `task_id` in whatever table/list renders task entries.
- [ ] Generated invoices (`GET /api/v1/invoices/{id}` `items[]`, and the PDF
      at `GET /api/v1/invoices/{id}/pdf`) now include `account` per line item.
      No frontend action needed unless you're rendering `items[]` yourself
      outside of just linking to the PDF — if so, add a narrow Account
      column, it's short by design (initials, 4 chars worst case).
