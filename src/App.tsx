import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";

import MainLayout from "@/layout/MainLayout";
import AppShell from "@/layout/AppShell";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { FullPageLoader } from "@/components/common/States";

import Landing from "@/routes/landing/Landing";
import Login from "@/routes/auth/Login";
import NotFound from "@/components/NotFound";

/*
 * The dashboards pull in the charting library and every dialog in the app, so
 * they are split out of the entry bundle: a visitor who only ever sees the
 * landing page or the login form never downloads them.
 */
const About = lazy(() => import("@/routes/landing/About"));
const ContactUs = lazy(() => import("@/routes/landing/ContactUs"));

const Dashboard = lazy(() => import("@/routes/client/dashboard"));
const MyTasks = lazy(() => import("@/routes/client/MyTasks"));
const LogTasks = lazy(() => import("@/routes/client/LogTasks"));
const ClientDisputes = lazy(() => import("@/routes/client/Disputes"));
const ClientProjects = lazy(() => import("@/routes/client/Projects"));
const ClientInvoices = lazy(() => import("@/routes/client/Invoices"));
const ClientResources = lazy(() => import("@/routes/client/Resources"));
const ClientSettings = lazy(() => import("@/routes/client/Settings"));

const AdminDashboard = lazy(() => import("@/routes/admin/Dashboard"));
const AdminProjects = lazy(() => import("@/routes/admin/Projects"));
const AdminMembers = lazy(() => import("@/routes/admin/Members"));
const AdminTaskLog = lazy(() => import("@/routes/admin/TaskLog"));
const AdminDisputes = lazy(() => import("@/routes/admin/Disputes"));
const AdminDuplicates = lazy(() => import("@/routes/admin/Duplicates"));
const AdminAdjustments = lazy(() => import("@/routes/admin/Adjustments"));
const AdminInvoicing = lazy(() => import("@/routes/admin/Invoicing"));
const AdminResources = lazy(() => import("@/routes/admin/Resources"));
const AdminSettings = lazy(() => import("@/routes/admin/Settings"));

const InvoiceDetail = lazy(() => import("@/routes/shared/InvoiceDetail"));

/**
 * Both authenticated areas render through the same `AppShell`; only the nav and
 * the role guard differ. The invoice document is one component mounted under
 * both prefixes rather than two near-identical pages.
 */
const App = () => (
  <Suspense fallback={<FullPageLoader />}>
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="about" element={<About />} />
        <Route path="contact-us" element={<ContactUs />} />
      </Route>

      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute allowedRoles={["TASKER"]} />}>
        <Route path="/client" element={<AppShell variant="tasker" />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="tasks" element={<MyTasks />} />
          <Route path="log" element={<LogTasks />} />
          <Route path="disputes" element={<ClientDisputes />} />
          <Route path="projects" element={<ClientProjects />} />
          <Route path="invoices" element={<ClientInvoices />} />
          <Route path="invoices/:invoiceId" element={<InvoiceDetail />} />
          <Route path="resources" element={<ClientResources />} />
          <Route path="settings" element={<ClientSettings />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]} />}>
        <Route path="/admin" element={<AppShell variant="admin" />}>
          <Route index element={<AdminDashboard />} />
          <Route path="projects" element={<AdminProjects />} />
          <Route path="members" element={<AdminMembers />} />
          <Route path="tasks" element={<AdminTaskLog />} />
          <Route path="disputes" element={<AdminDisputes />} />
          <Route path="duplicates" element={<AdminDuplicates />} />
          <Route path="invoices" element={<AdminInvoicing />} />
          <Route path="adjustments" element={<AdminAdjustments />} />
          <Route path="invoices/:invoiceId" element={<InvoiceDetail />} />
          <Route path="resources" element={<AdminResources />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  </Suspense>
);

export default App;
