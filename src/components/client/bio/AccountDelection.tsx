import axios from "axios";
import { useState } from "react";

type DeletionForm = {
  reason: string;
  message: string;
};

const AccountDeletion = () => {
  const base = import.meta.env.VITE_BASE_URL || "";
  const deletePath = "/api/v1/members/me"; // DELETE endpoint for current user

  const api = axios.create({
    baseURL: base,
    headers: { "Content-Type": "application/json" },
    withCredentials: true, // ensure cookie-based auth is sent
  });

  // Optional: also send bearer token if you use localStorage tokens in some flows
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("authToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  const [form, setForm] = useState<DeletionForm>({
    reason: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reasons = [
    { value: "privacy", label: "Privacy concerns" },
    { value: "not_using", label: "No longer using the service" },
    { value: "found_better", label: "Found a better alternative" },
    { value: "other", label: "Other (explain below)" },
  ];

  function onChange(e: { target: { name: string; value: string } }) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  function getErrorMessage(
    err: unknown,
    fallback = "An unexpected error occurred.",
  ) {
    if (err instanceof Error) return err.message;
    if (typeof err === "string") return err;
    return fallback;
  }

  async function handleDelete(e: { preventDefault: () => void }) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.reason) {
      setError("Please select a reason for deletion.");
      return;
    }

    const confirmed = window.confirm(
      "Deleting your account is permanent. All your data will be removed. Do you want to continue?",
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      // axios.delete supports sending a request body via the `data` option
      const payload = {
        reason: form.reason,
        message: form.message?.trim() || null,
      };

      const res = await api.delete(deletePath, { data: payload });

      if (res.status >= 200 && res.status < 300) {
        setSuccess("Your account has been deleted. You will be logged out.");
        // Clear local auth state and reload to reflect logout
        try {
          localStorage.removeItem("authToken");
        } catch (err) {
          // ignore
        }
        // small delay so user sees success message
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        const msg =
          (res.data && (res.data.message || res.data.error)) ||
          "Failed to delete account.";
        throw new Error(msg);
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg =
          (err.response?.data &&
            (err.response?.data.message || err.response?.data.error)) ||
          err.message ||
          "Failed to delete account.";
        setError(msg);
      } else {
        setError(getErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="text-slate-950 max-w-xl">
      <h1 className="text-2xl font-semibold mb-3">Account Deletion</h1>
      <p className="text-sm text-slate-600 mb-4">
        Deleting your account is permanent. Your profile, assignments and any
        personal data will be removed.
      </p>

      <form
        onSubmit={handleDelete}
        className="bg-white rounded-lg shadow p-4 border">
        <div className="mb-4">
          <label
            htmlFor="reason"
            className="block text-sm font-medium text-slate-700">
            Select reason for deletion
          </label>
          <select
            id="reason"
            name="reason"
            value={form.reason}
            onChange={onChange}
            className="mt-2 block w-full rounded border-2 border-slate-300 p-2"
            disabled={loading}
            required>
            <option value="">-- Select reason --</option>
            {reasons.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label
            htmlFor="message"
            className="block text-sm font-medium text-slate-700">
            Leave a message (optional)
          </label>
          <textarea
            id="message"
            name="message"
            value={form.message}
            onChange={onChange}
            rows={4}
            className="mt-2 block w-full rounded border-2 border-slate-300 p-2"
            placeholder="If you want, tell us why you're leaving (optional)."
            disabled={loading}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="flex items-center justify-center bg-red-600 text-white px-4 py-2 rounded disabled:opacity-60"
            disabled={loading}>
            {loading ? "Deleting..." : "Delete account"}
          </button>

          <button
            type="button"
            onClick={() => {
              // reset form
              setForm({ reason: "", message: "" });
              setError(null);
              setSuccess(null);
            }}
            className="bg-gray-200 text-slate-800 px-4 py-2 rounded"
            disabled={loading}>
            Reset
          </button>
        </div>

        <div className="mt-4">
          {success && <p className="text-green-600">{success}</p>}
          {error && <p className="text-red-600">{error}</p>}
        </div>
      </form>
    </div>
  );
};

export default AccountDeletion;