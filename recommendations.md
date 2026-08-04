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
- `src/routes/client/Invoices.tsx` & `src/components/client/invoices/InvoiceViewer.tsx`
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

## 4. Reviewer Checklist & Discussion Points

Please review the proposed structure and confirm:

- [ ] **Deprecation of `src/context/AuthContext.tsx`**: Can you confirm no untracked dependencies rely on this file before it is deleted?
- [ ] **Service Layer Structure**: Does the modular `src/services/<domain>.service.ts` layout align with your preferred architecture, or would you prefer a single consolidated services file?
- [ ] **Credential Issues in Forms**: Have you noticed authentication issues in `ManageProjects.tsx` or `ProjectUploadForm.tsx` that will be resolved by enforcing `withCredentials: true`?
- [ ] **PR Sequencing**: Are you happy to proceed in the proposed 4-stage PR sequence?
