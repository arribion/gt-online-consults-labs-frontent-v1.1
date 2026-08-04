// App.tsx
import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./routes/ProtectedRoute";

import Index from "./routes/landing";
import Resources from "./routes/client/Resources";
import Invoices from "./routes/client/invoice/Invoices";
import Dashboard from "./routes/client/dashboard";
import Settings from "./routes/client/Settings";
import ClientLayout from "./layout/ClientLayout";

import AdminLayout from "./layout/AdminLayout";
import AdminDashboard from "./routes/admin/AdminDashboard";
import ManageProjects from "./routes/admin/ManageProjects";
import AdminSetting from "./routes/admin/AdminSetting";
import ManageResources from "./routes/admin/ManageResources";
import ManageMembers from "./routes/admin/ManageMembers";

import NotFoundComponent from "./components/NotFound";
import About from "./routes/About";
import Login from "./routes/auth/Login";
import InvoiceViewer from "./routes/client/invoice/InvoiceViewer";
import AuthLayout from "./layout/AuthLayout";
import MainLayout from "./layout/MainLayout";
import Payments from "./routes/client/Payments";
import Projects from "./routes/client/Projects";
import TasksLog from "./routes/client/invoice/TasksLog";
import Task from "./routes/admin/task/Task";
import Invoicing from "./routes/admin/Invoicing";
import Financies from "./routes/admin/Financies";
import MyTask from "./routes/client/tasks/MyTask";

import ContactUs from "./routes/ContactUs";
import Note from "./components/client/Note";

const App = () => {
  return (
    <>
      <Routes>
        {/* Public Auth Layout */}
        <Route element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
        </Route>

        {/* Public Main Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Index />} />
          <Route path="about" element={<About />} />
          <Route path="contact-us" element={<ContactUs />} />
        </Route>

        {/* Client Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={["TASKER"]} />}>
          <Route element={<ClientLayout />}>
            <Route path="/client/dashboard" element={<Dashboard />} />
            <Route path="/client/resources" element={<Resources />} />
            <Route path="/client/invoices" element={<Invoices />} />
            <Route
              path="/client/transactions/:projectID"
              element={<InvoiceViewer />}
            />
            <Route path="/client/tasks-log" element={<TasksLog />} />
            <Route path="/client/my-tasks" element={<MyTask />} />
            <Route path="/client/projects" element={<Projects />} />
            <Route path="/client/payments" element={<Payments />} />
            <Route path="/client/settings" element={<Settings />} />

            <Route path="/client/note" element={<Note />} />
          </Route>
        </Route>

        {/* Manager Protected Routes */}
        {/* <Route  element={<ProtectedRoute allowedRoles={["MANAGER"]} />} > */}
        {/* <Route index element={<ManagerDashboard />} /> */}
        {/* <Route path="tasks" element={<Task />} /> */}
        {/* <Route path="/client/payments" element={<Payments />} /> */}
        {/* <Route path="invoicing" element={<Invoicing />} /> */}
        {/* <Route path="projects" element={<ManageProjects />} /> */}
        {/* <Route path="resources" element={<ManageResources />} /> */}
        {/* <Route path="members" element={<ManageMembers />} /> */}
        {/* <Route path="settings" element={<ManagerSetting />} /> */}
        {/* </Route> */}

        {/* Admin Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="tasks" element={<Task />} />
            <Route path="invoicing" element={<Invoicing />} />
            <Route path="financies" element={<Financies />} />
            <Route path="projects" element={<ManageProjects />} />
            <Route path="resources" element={<ManageResources />} />
            <Route path="members" element={<ManageMembers />} />
            <Route path="settings" element={<AdminSetting />} />
          </Route>
        </Route>

        {/* Global Fallback */}
        <Route path="*" element={<NotFoundComponent />} />
      </Routes>
    </>
  );
};

export default App;
