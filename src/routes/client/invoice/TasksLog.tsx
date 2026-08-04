import { X as Cancel, PlusCircle } from "lucide-react";
import TaskForm from "../../../components/client/task-invoice/TaskForm";
import TaskLogExcelUpload from "../../../components/client/task-invoice/TaskLogExcelUpload";
import { useState } from "react";
import RecentTaskLogs from "../../../components/client/task-invoice/RecentTaskLogs";

const TasksLog = () => {
  const [showManualTaskForm, setShowManualTaskForm] = useState(false);
  return (
    <div className="p-2">
      {" "}
      <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium text-green-600">
            Dashboard / Tasks
          </p>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            PROJECT <span className="text-sky-500">TASKS</span>
          </h1>

          <p className="mt-2 text-slate-500">
            Track invoices, payments and money transfers in one place.
          </p>
        </div>
        <div>
          <button
            onClick={() => setShowManualTaskForm(!showManualTaskForm)}
            className="bg-sky-500 hover:bg-sky-600 text-white flex gap-2 items-center font-semibold py-2 px-6 rounded">
            <PlusCircle />
            Create Task
          </button>
        </div>
      </div>
      <section className="min-h-[80.8vh] border rounded-2xl border-gray-200 px-4 py-4 relative">
        <TaskLogExcelUpload />

        {showManualTaskForm && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <article className="rounded-2xl shadow-xl p-8 max-w-lg w-full relative">
              <button
                onClick={() => setShowManualTaskForm(false)}
                className="absolute text-white top-3 right-3  hover:text-slate-300">
                <Cancel />
              </button>

              <TaskForm />
            </article>
          </div>
        )}

        <RecentTaskLogs />
      </section>
    </div>
  );
};

export default TasksLog;
