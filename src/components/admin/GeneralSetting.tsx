import React, { useState } from "react";
import axios from "axios";
import { Settings, Building2, Mail, Phone, Globe } from "lucide-react";

const GeneralSetting = () => {
  const [settings, setSettings] = useState({
    companyName: "",
    contactEmail: "",
    supportPhone: "",
    websiteUrl: "",
    maintenanceMode: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const target = e.target as HTMLInputElement;
    const { name, type, value, checked } = target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    } as any));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Replace with your mock API or placeholder
      await axios.post("/api/v1/settings", settings);
      alert("Settings saved successfully!");
    } catch (err: any) {
      console.error(err);
      alert("Failed to save settings.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <Settings size={24} className="text-green-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              General Settings
            </h2>
            <p className="text-sm text-gray-500">
              Configure your application information.
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Company */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
              <Building2 size={16} />
              Company Name
            </label>
            <input
              type="text"
              name="companyName"
              value={settings.companyName}
              onChange={handleChange}
              className="w-full rounded-xl border px-4 py-3 focus:border-green-500"
            />
          </div>

          {/* Contact Email */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
              <Mail size={16} />
              Contact Email
            </label>
            <input
              type="email"
              name="contactEmail"
              value={settings.contactEmail}
              onChange={handleChange}
              className="w-full rounded-xl border px-4 py-3 focus:border-green-500"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
              <Phone size={16} />
              Support Phone
            </label>
            <input
              type="text"
              name="supportPhone"
              value={settings.supportPhone}
              onChange={handleChange}
              className="w-full rounded-xl border px-4 py-3 focus:border-green-500"
            />
          </div>

          {/* Website */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
              <Globe size={16} />
              Website URL
            </label>
            <input
              type="url"
              name="websiteUrl"
              value={settings.websiteUrl}
              onChange={handleChange}
              className="w-full rounded-xl border px-4 py-3 focus:border-green-500"
            />
          </div>

          {/* Rates */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
              <Globe size={16} />
              Payment Rates
            </label>
            <input
              type="url"
              name="websiteUrl"
              value={settings.websiteUrl}
              onChange={handleChange}
              className="w-full rounded-xl border px-4 py-3 focus:border-green-500"
            />
          </div>

          {/* application */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
              <Globe size={16} />
              Application Default Currency
            </label>
            <input
              type="url"
              name="websiteUrl"
              value={settings.websiteUrl}
              onChange={handleChange}
              className="w-full rounded-xl border px-4 py-3 focus:border-green-500"
            />
          </div>
        </div>

        {/* Maintenance */}
        <div className="mt-8 rounded-xl border bg-gray-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Maintenance Mode</h3>
              <p className="text-sm text-gray-500">
                Prevent users from accessing the application while maintenance
                is in progress.
              </p>
            </div>
            <input
              type="checkbox"
              name="maintenanceMode"
              checked={settings.maintenanceMode}
              onChange={handleChange}
              className="h-5 w-5"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            className="rounded bg-green-600 px-6 py-2 text-white hover:bg-green-500">
            Save Settings
          </button>
        </div>
      </div>
    </form>
  );
};

export default GeneralSetting;