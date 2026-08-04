import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useState } from "react";

declare global {
  interface Window {
    CURRENT_TASKER_ID?: string | null;
    CURRENT_PROJECT_ID?: string | null;
  }
}

const schema = yup.object().shape({
  id: yup.string().optional(),
  submission_id: yup.string().required("Submission ID is required"),
  task_ref: yup.string().required("Task Reference is required"),
  units_hours: yup
    .number()
    .typeError("Must be a number")
    .positive("Must be greater than 0")
    .required("Units/Hours is required"),
  entry_date: yup
    .date()
    .typeError("Invalid date")
    .required("Entry date is required"),
  flag_reason: yup.string().optional(),
});

const TaskForm = () => {
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: yup.InferType<typeof schema>) => {
    setIsSubmitting(true);
    setServerError("");

    try {
      const baseUrl = import.meta.env.VITE_BASE_URL || window.location.origin;
      const cleanBaseUrl = baseUrl.endsWith("/")
        ? baseUrl.slice(0, -1)
        : baseUrl;
      const endpoint = `${cleanBaseUrl}/api/v1/tasks/entry`;

      // Map your form fields to backend expected shape
      const payload = {
        id: data.id || `te_${Date.now()}`,
        submissionId: data.submission_id,
        taskRef: data.task_ref,
        unitsHours: Number(data.units_hours),
        entryDate: data.entry_date,
        flagReason: data.flag_reason || null,
        taskerId: window.CURRENT_TASKER_ID || null,
        projectId: window.CURRENT_PROJECT_ID || null,
      };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => null);
        throw new Error(
          `Server returned ${res.status}${text ? `: ${text}` : ""}`,
        );
      }

      alert("Task log submitted");
      reset();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to submit task log";
      setServerError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="text-gray-700 shadow-card max-w-md p-6 rounded-lg bg-white">
        <h2 className="text-slate-800 my-4  font-bold text-center">
          Create Task Log Directly
        </h2>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Submission ID
          </label>
          <input
            type="text"
            {...register("submission_id")}
            className="border rounded p-1 w-full"
          />
          {errors.submission_id && (
            <p style={{ color: "red", fontSize: "12px" }}>
              {errors.submission_id.message}
            </p>
          )}
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Task Reference
          </label>
          <input
            type="text"
            {...register("task_ref")}
            className="border rounded p-1 w-full"
          />
          {errors.task_ref && (
            <p style={{ color: "red", fontSize: "12px" }}>
              {errors.task_ref.message}
            </p>
          )}
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Units / Hours
          </label>
          <input
            type="number"
            step="0.1"
            {...register("units_hours")}
            className="border rounded p-1 w-full"
          />
          {errors.units_hours && (
            <p style={{ color: "red", fontSize: "12px" }}>
              {errors.units_hours.message}
            </p>
          )}
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Entry Date
          </label>
          <input
            type="date"
            {...register("entry_date")}
            className="border rounded p-1 w-full"
          />
          {errors.entry_date && (
            <p style={{ color: "red", fontSize: "12px" }}>
              {errors.entry_date.message}
            </p>
          )}
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Flag Reason (Optional)
          </label>
          <textarea
            {...register("flag_reason")}
            className="w-full p-2 border rounded"
          />
        </div>

        {serverError && (
          <p className="text-rose-500 text-sm mb-2">{serverError}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-sky-500 w-full text-white py-2 px-4 rounded hover:bg-sky-600 transition">
          {isSubmitting ? "Submitting..." : "Submit Log"}
        </button>
      </form>
    </div>
  );
};

export default TaskForm;
