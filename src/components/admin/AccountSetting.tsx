import { useState, type ChangeEvent, type FormEvent } from "react";
import { Mail, Save, User, Lock, ShieldCheck } from "lucide-react";

const AccountSetting = () => {
  const [settings, setSettings] = useState({
    adminName: "",
    username: "",
    adminEmail: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (settings.newPassword && settings.newPassword !== settings.confirmPassword) {
      alert("New passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      console.log(settings);

      alert("Settings updated successfully.");

      setSettings((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (error) {
      console.error(error);
      alert("Failed to update settings.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <ShieldCheck size={24} className="text-green-600" />

          <div>
            <h2 className="text-xl font-semibold text-gray-900">Account & Security</h2>
            <p className="text-sm text-gray-500">
              Update your administrator account and login credentials.
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium">
              <User size={16} />
              Full Name
            </label>
            <input
              name="adminName"
              value={settings.adminName}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-green-500"
            />
          </div>

          <div>
            <label className="mb-2 text-sm font-medium">Username</label>
            <input
              name="username"
              value={settings.username}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-green-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 flex items-center gap-2 text-sm font-medium">
              <Mail size={16} />
              Login Email
            </label>
            <input
              type="email"
              name="adminEmail"
              value={settings.adminEmail}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-green-500"
            />
          </div>
        </div>

        <hr className="my-8" />

        <h3 className="mb-5 text-lg font-semibold">Change Password</h3>

        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium">
              <Lock size={16} />
              Current Password
            </label>
            <input
              type="password"
              name="currentPassword"
              value={settings.currentPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-green-500"
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium">
              <Lock size={16} />
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              value={settings.newPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-green-500"
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium">
              <Lock size={16} />
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={settings.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-green-500"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save size={18} />
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
};

export default AccountSetting;
