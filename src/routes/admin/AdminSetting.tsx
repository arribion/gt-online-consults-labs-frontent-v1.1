import { useState } from "react";
import { Settings } from "lucide-react";
import GeneralSetting from "../../components/admin/GeneralSetting";
import AccountSetting from "../../components/admin/AccountSetting";

const AdminSetting = () => {
  const [settings, setSettings] = useState({
    // General Settings
    companyName: "Arribion Technologies",
    contactEmail: "admin@example.com",
    supportPhone: "+254700000000",
    websiteUrl: "https://example.com",
    maintenanceMode: false,

    // Admin Account
    adminName: "Jeff Mutethia",
    username: "admin",
    adminEmail: "admin@example.com",

    // Password Change
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [_loading, setLoading] = useState(false);

  // const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const { name, value, type } = e.target;

  //   setSettings((prev) => ({
  //     ...prev,
  //     [name]:
  //       type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
  //   }));
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      settings.newPassword &&
      settings.newPassword !== settings.confirmPassword
    ) {
      alert("New passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      /*
      await axios.put("/admin/settings", {
        companyName: settings.companyName,
        contactEmail: settings.contactEmail,
        supportPhone: settings.supportPhone,
        websiteUrl: settings.websiteUrl,
        maintenanceMode: settings.maintenanceMode,
      });

      await axios.put("/admin/profile", {
        adminName: settings.adminName,
        username: settings.username,
        adminEmail: settings.adminEmail,
        currentPassword: settings.currentPassword,
        newPassword: settings.newPassword,
      });
      */

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
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <Settings className="text-green-600" size={30} />
          <h1 className="text-2xl font-bold text-sky-500">Admin Settings</h1>
        </div>

        <p className="mt-2 text-gray-600">
          Manage your application settings and administrator account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/*  GENERAL SETTINGS  */}
        <GeneralSetting />
        {/* ACCOUNT SETTINGS  */}
        <AccountSetting />
      </form>
    </div>
  );
};

export default AdminSetting;
