// src/components/admin/MembersTable.tsx
import React from "react";
import { Edit2, Trash2, Search, RefreshCw } from "lucide-react";
import type { Member } from "../../routes/admin/ManageMembers";

type Props = {
  members: Member[];
  loading: boolean;
  error: string;
  onRefresh: () => Promise<void>;
  handleEdit: (member: Member) => void;
  handleDelete: (id: string) => Promise<void> | void;
};

const getRoleBadgeColor = (role?: string) => {
  const normalized = (role ?? "").toUpperCase();
  if (normalized === "ADMIN" || normalized === "SUPERADMIN") {
    return "bg-purple-50 text-purple-700 border-purple-200/60";
  }
  if (normalized === "MANAGER" || normalized === "MODERATOR") {
    return "bg-blue-50 text-blue-700 border-blue-200/60";
  }
  return "bg-slate-50 text-slate-700 border-slate-200/60";
};

const safeString = (value: unknown) =>
  value === null || value === undefined ? "" : String(value);

const MembersTable = ({
  members,
  loading,
  error,
  onRefresh,
  handleEdit,
  handleDelete,
}: Props) => {
  const [searchTerm, setSearchTerm] = React.useState("");

  const q = (searchTerm ?? "").trim().toLowerCase();

  const filteredMembers = members.filter((member) => {
    const name = safeString(
      (member as any).fullName ??
        (member as any).full_name ??
        (member as any).name,
    ).toLowerCase();
    const email = safeString((member as any).email).toLowerCase();
    const role = safeString((member as any).role).toLowerCase();

    if (!q) return true;
    return name.includes(q) || email.includes(q) || role.includes(q);
  });

  return (
    <div className="space-y-4 w-full">
      {/* Search + Reload */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search members by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors"
          />
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition active:scale-[0.98] disabled:opacity-50">
          <RefreshCw
            size={14}
            className={loading ? "animate-spin text-purple-500" : ""}
          />
          Reload Directory
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 bg-white">
          <h2 className="font-bold text-gray-900 text-lg tracking-tight">
            Members Directory
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage user registration context permissions and accounts.
          </p>
        </div>

        {loading && members.length === 0 ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="animate-spin text-purple-500" size={24} />
            <span className="text-sm font-medium">
              Indexing member registry profiles...
            </span>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-red-500 flex flex-col items-center gap-2">
            <p className="text-sm font-medium">{error}</p>
            <button
              onClick={onRefresh}
              className="mt-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-xs font-semibold">
              Retry Sync
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  <th className="p-4 pl-6">Full Name</th>
                  <th className="p-4">Email Address</th>
                  <th className="p-4">System Role</th>
                  <th className="p-4">Phone Contact</th>
                  <th className="p-4 pr-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-12 text-center text-gray-400 font-medium">
                      No matching records found in database directory.
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => {
                    const id = (member as any).id ?? (member as any)._id ?? "";
                    const name = safeString(
                      (member as any).fullName ??
                        (member as any).full_name ??
                        (member as any).name,
                    );
                    const email = safeString((member as any).email);
                    const role = safeString((member as any).role);
                    const phone = safeString((member as any).phone);

                    return (
                      <tr
                        key={id || Math.random().toString(36).slice(2)}
                        className="hover:bg-slate-50/70 transition-colors group">
                        <td className="p-4 pl-6 font-semibold text-gray-900">
                          {name || "—"}
                        </td>
                        <td className="p-4 text-gray-500 break-all max-w-xs">
                          {email || "—"}
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${getRoleBadgeColor(role)}`}>
                            {role || "—"}
                          </span>
                        </td>
                        <td className="p-4 text-gray-500 font-medium">
                          {phone || "—"}
                        </td>
                        <td className="p-4 pr-6">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() =>
                                handleEdit({
                                  id,
                                  fullName: name,
                                  email,
                                  role: (role as any) || "TASKER",
                                  phone,
                                })
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition active:scale-[0.97]">
                              <Edit2 size={13} className="text-gray-400" /> Edit
                            </button>
                            <button
                              onClick={() => handleDelete(id)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100 transition active:scale-[0.97]">
                              <Trash2 size={13} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MembersTable;