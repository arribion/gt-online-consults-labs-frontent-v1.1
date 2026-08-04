import axios from "axios";
import { useEffect, useState } from "react";

type FormState = {
  fullname: string;
  email: string;
  phone: string;
};

export function SettingsOverview() {
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

  const [form, setForm] = useState<FormState>({
    fullname: "",
    email: "",
    phone: "",
  });

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function onChange(e: { target: { name: string; value: string } }) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  useEffect(() => {
    let mounted = true;
    async function fetchProfile() {
      setLoadingProfile(true);
      setError(null);
      try {
        const res = await api.get(memberPath);
        // backend returns { success: true, data: user }
        const data = res.data?.data ?? {};
        if (!mounted) return;
        setForm({
          fullname: data.full_name ?? "",
          email: data.email ?? "",
          phone: data.phone ?? "",
        });
      } catch (err) {
        if (!mounted) return;
        if (axios.isAxiosError(err)) {
          const msg =
            (err.response?.data &&
              (err.response?.data.message || err.response?.data.error)) ||
            err.message ||
            "Failed to load profile.";
          setError(msg);
        } else {
          setError("Unable to fetch profile.");
        }
      } finally {
        if (mounted) setLoadingProfile(false);
      }
    }

    fetchProfile();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base]);

  async function updateMember(e: { preventDefault: () => void }) {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!form.fullname || !form.email) {
      setError("Full name and email are required.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        full_name: form.fullname,
        email: form.email,
        phone: form.phone,
      };
      const res = await api.put(memberPath, payload);
      if (res.status >= 200 && res.status < 300) {
        setMessage("Profile updated successfully.");
        const updated = res.data?.data;
        if (updated) {
          setForm({
            fullname: updated.full_name ?? form.fullname,
            email: updated.email ?? form.email,
            phone: updated.phone ?? form.phone,
          });
        }
      } else {
        const msg =
          (res.data && (res.data.message || res.data.error)) ||
          "Failed to update profile.";
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
      setSaving(false);
    }
  }

  return (
    <article className="bg-white shadow-card p-4 rounded-[15px] border text-slate-950">
      <div>
        <h1 className="mt-4 text-2xl text-slate-900 font-semibold">
          Personal Information
        </h1>
        <p className="text-slate-500">Update your bio</p>
      </div>

      <form onSubmit={updateMember} className="bg-white p-4 my-4">
        {loadingProfile ? (
          <p className="text-slate-500">Loading profile...</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label htmlFor="fullname">Full Name:</label>
                <br />
                <input
                  id="fullname"
                  name="fullname"
                  value={form.fullname}
                  onChange={onChange}
                  type="text"
                  placeholder="John Doe"
                  className="my-2 border p-1 rounded w-full"
                  disabled={saving}
                />
              </div>
              <div>
                <label htmlFor="email">Email:</label>
                <br />
                <input
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  type="email"
                  placeholder="John@example.com"
                  className="my-2 border p-1 rounded w-full"
                  disabled={saving}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 my-5">
              <div>
                <label htmlFor="phone">Phone:</label>
                <br />
                <input
                  id="phone"
                  name="phone"
                  value={form.phone}
                  onChange={onChange}
                  type="text"
                  placeholder="Phone"
                  className="my-2 border p-1 rounded w-full"
                  disabled={saving}
                />
              </div>
            </div>

            <div className="mb-4">
              {message && <p className="mt-3 text-green-600">{message}</p>}
              {error && <p className="mt-3 text-red-600">{error}</p>}
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-sky-600 text-white px-4 py-2 rounded">
                {saving ? "Saving..." : "Save profile"}
              </button>
              <button
                type="button"
                onClick={() => {
                  // reset to last fetched values by reloading profile
                  setLoadingProfile(true);
                  setMessage(null);
                  setError(null);
                  api
                    .get(memberPath)
                    .then((res) => {
                      const data = res.data?.data ?? {};
                      setForm({
                        fullname: data.full_name ?? "",
                        email: data.email ?? "",
                        phone: data.phone ?? "",
                      });
                    })
                    .catch(() => {})
                    .finally(() => setLoadingProfile(false));
                }}
                className="bg-gray-200 px-4 py-2 rounded">
                Reset
              </button>
            </div>
          </>
        )}
      </form>
    </article>
  );
}

export default SettingsOverview;