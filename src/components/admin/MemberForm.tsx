import React, { useState } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export type MemberRole = "TASKER" | "MANAGER" | "ADMIN";

export type FormData = {
  id?: string;
  fullName: string; // mapped to "full_name" for backend
  email: string;
  password?: string;
  role: MemberRole;
  phone: string;
  status?: string; // optional
};

type Props = {
  form: FormData;
  setForm: React.Dispatch<React.SetStateAction<FormData>>;
  onSuccess: () => void;
  resetForm: () => void;
  isEditing: boolean;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL ?? "",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

const MemberForm = ({
  form,
  setForm,
  onSuccess,
  resetForm,
  isEditing,
}: Props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const internalSubmitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");

    const fullName = (form.fullName ?? "").trim();
    const email = (form.email ?? "").trim();
    const phone = (form.phone ?? "").trim();
    let passwordToUse = form.password?.trim();

    if (!fullName) {
      setApiError("Full name is required.");
      return;
    }
    if (!email || !isValidEmail(email)) {
      setApiError("A valid email address is required.");
      return;
    }

    // Auto-generate password if creating and none provided
    if (!isEditing && !passwordToUse) {
      if (phone) {
        const digits = phone.replace(/\D/g, "");
        passwordToUse = `Pass${digits.slice(-6) || digits}`;
      } else {
        setApiError(
          "Provide a password or a phone number to auto-generate one.",
        );
        return;
      }
    }

    if (!isEditing && passwordToUse && passwordToUse.length < 6) {
      setApiError("Password must be at least 6 characters.");
      return;
    }

    try {
      setIsSubmitting(true);

      if (isEditing && form.id) {
        await api.put(`/api/v1/members/${form.id}`, {
          full_name: fullName,
          email,
          role: form.role,
          phone,
          status: form.status,
        });
        toast.success("Member updated.");
      } else {
        await api.post("/api/v1/auth/register", {
          full_name: fullName,
          email,
          password: passwordToUse,
          role: form.role,
          phone,
          status: form.status,
        });
        toast.success("Member registered.");
      }

      onSuccess();
      resetForm();
    } catch (err: any) {
      console.error(err);
      const message =
        err?.response?.data?.message ??
        err?.message ??
        "Failed to commit record changes.";
      setApiError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={internalSubmitHandler} className="space-y-4">
      {/* Full Name */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
          Full Name
        </label>
        <input
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          placeholder="e.g. John Doe"
          required
          disabled={isSubmitting}
          className="w-full rounded border px-4 py-2.5 text-sm"
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
          Email Address
        </label>
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="john@example.com"
          type="email"
          required
          disabled={isSubmitting}
          className="w-full rounded border px-4 py-2.5 text-sm"
        />
      </div>

      {/* Phone */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
          Phone Number
        </label>
        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="+254 700 000 000"
          disabled={isSubmitting}
          className="w-full rounded border px-4 py-2.5 text-sm"
        />
      </div>

      {/* Password (only for new members) */}
      {!isEditing && (
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
            Account Password
          </label>
          <h1 className="text-red-500">
            Tumia the actuall password field kulog
            in wasee i will fix phone number to auto
            generate working initial password
            ==== you can include phone but make sure you have filled the password field use something simple or repeate thair 
            phone number as thier password for security purposes soon i will validate for a strong password.
            ((07)00000000) or ((+254)0000) iko sawa

          </h1>
          <div className="px-1 py-2 border-2 border-yellow-500 rounded bg-yellow-50 my-2 text-xs">
            Leave blank to auto-generate from phone number.
          </div>
          <input
            name="password"
            value={form.password || ""}
            onChange={handleChange}
            placeholder="••••••••"
            type="password"
            disabled={isSubmitting}
            className="w-full rounded border px-4 py-2.5 text-sm"
          />
        </div>
      )}

      {/* Role */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
          Workspace Permissions Role
        </label>
        <select
          name="role"
          value={form.role}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, role: e.target.value as MemberRole }))
          }
          disabled={isSubmitting}
          className="w-full rounded border px-4 py-2.5 text-sm">
          <option value="TASKER">Tasker</option>
          <option value="MANAGER">Manager</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      {apiError && (
        <div className="p-3 text-xs font-medium bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
          {apiError}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t mt-6">
        <button
          type="button"
          onClick={resetForm}
          disabled={isSubmitting}
          className="flex-1 rounded border px-4 py-2.5 text-sm font-semibold">
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 rounded bg-sky-900 hover:bg-sky-800 px-4 py-2.5 text-sm font-semibold text-white">
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin inline-block mr-2" size={14} />
              Saving...
            </>
          ) : isEditing ? (
            "Save Changes"
          ) : (
            "Register Member"
          )}
        </button>
      </div>
    </form>
  );
};

export default MemberForm;