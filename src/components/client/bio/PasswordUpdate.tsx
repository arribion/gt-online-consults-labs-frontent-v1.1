import axios from "axios";
import { useState } from "react";

type PasswordForm = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const PasswordUpdate = () => {
  const base = import.meta.env.VITE_BASE_URL || "";
  const memberPath = "/api/v1/members/me";

  const api = axios.create({
    baseURL: base,
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });

  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("authToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  const [form, setForm] = useState<PasswordForm>({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function onChange(e: { target: { name: string; value: string } }) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  async function changePassword(e: { preventDefault: () => void }) {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!form.oldPassword || !form.newPassword) {
      setError("Please provide both old and new passwords.");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
      };
      const res = await api.put(`${memberPath}/password`, payload);
      if (res.status >= 200 && res.status < 300) {
        setMessage("Password changed successfully.");
        setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        const msg =
          (res.data && (res.data.message || res.data.error)) ||
          "Failed to change password.";
        throw new Error(msg);
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg =
          (err.response?.data &&
            (err.response?.data.message || err.response?.data.error)) ||
          err.message ||
          "An unexpected error occurred.";
        setError(msg);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <article className="text-slate-800 bg-white rounded-2xl shadow-lg border p-4">
      <h1 className="mt-4 text-2xl text-slate-900 font-semibold">
        Update Password
      </h1>
      <form onSubmit={changePassword} className="bg-white p-4 my-4">
        <div className="grid grid-cols-3 gap-6">
          <div>
            <label htmlFor="oldPassword">Old Password: </label>
            <br />
            <input
              id="oldPassword"
              name="oldPassword"
              value={form.oldPassword}
              onChange={onChange}
              type="password"
              placeholder="Old Password"
              className="my-2 border-2 border-slate-300 p-1 rounded w-full"
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="newPassword">New Password: </label>
            <br />
            <input
              id="newPassword"
              name="newPassword"
              value={form.newPassword}
              onChange={onChange}
              type="password"
              placeholder="New Password"
              className="my-2 border-2 border-slate-300 p-1 rounded w-full"
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="confirmPassword">Confirm:</label>
            <br />
            <input
              id="confirmPassword"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={onChange}
              type="password"
              placeholder="Confirm New Password"
              className="my-2 border-2 border-slate-300 p-1 rounded w-full"
              disabled={loading}
            />
          </div>
        </div>

        {message && <p className="mt-4 text-green-600">{message}</p>}
        {error && <p className="mt-4 text-red-600">{error}</p>}

        <div className="flex gap-3 mt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-sky-600 text-white px-4 py-2 rounded">
            {loading ? "Updating..." : "Change password"}
          </button>
        </div>
      </form>
    </article>
  );
};

export default PasswordUpdate;