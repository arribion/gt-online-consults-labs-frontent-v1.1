import { useMemo, useState, useEffect } from "react";
import MembersTable from "../../components/admin/MembersTable";
import AddMemberForm from "../../components/admin/MemberForm";
import { Plus, X } from "lucide-react";
import axios from "axios";

export type MemberRole = "TASKER" | "MANAGER" | "ADMIN";

export type Member = {
  id: string;
  fullName: string;
  email: string;
  role: MemberRole;
  phone?: string;
};

type FormData = {
  id?: string;
  fullName: string;
  email: string;
  password?: string;
  role: MemberRole;
  phone: string;
};

const ManageMembers = () => {
  const [showMemberAddForm, setShowMemberAddForm] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>({
    fullName: "",
    email: "",
    password: "",
    role: "TASKER",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEditing = useMemo(() => editingId !== null, [editingId]);

  // Axios instance
  const api = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });

  // Fetch members from backend
  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await api.get("/api/v1/members");

      if (Array.isArray(data)) {
        setMembers(data);
      } else if (Array.isArray(data?.data)) {
        setMembers(data.data);
      } else {
        setMembers([]);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load members from server.");
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset form and close modal
  const resetForm = () => {
    setForm({
      fullName: "",
      email: "",
      password: "",
      role: "TASKER",
      phone: "",
    });
    setEditingId(null);
    setShowMemberAddForm(false);
  };

  // Called when user clicks Edit in the table
  const handleEdit = (member: Member) => {
    setEditingId(member.id);
    setForm({
      id: member.id,
      fullName: member.fullName,
      email: member.email,
      password: "",
      role: member.role,
      phone: member.phone ?? "",
    });
    setShowMemberAddForm(true);
  };

  // Delete handler: calls backend then updates local state
  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this member entry?")) return;
    try {
      await api.delete(`/api/v1/members/${id}`);
      setMembers((prev) =>
        prev.filter((m) => m.id !== id && (m as any)._id !== id),
      );
      if (editingId === id) resetForm();
    } catch (err) {
      console.error(err);
      alert("Failed to delete member. Try again.");
      throw err;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 relative">
      {/* Top Banner Toolbar */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-sky-500 tracking-tight">
            Manage Members
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Create, update permissions, and manage organization profile
            directories.
          </p>
        </div>
        <button
          onClick={() => {
            setShowMemberAddForm(true);
            setEditingId(null);
            setForm({
              fullName: "",
              email: "",
              password: "",
              role: "TASKER",
              phone: "",
            });
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition active:scale-[0.98]">
          <Plus size={16} />
          Add Member
        </button>
      </div>

      {/* Members Table */}
      <div className="w-full">
        <MembersTable
          members={members}
          loading={loading}
          error={error}
          onRefresh={fetchMembers}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
        />
      </div>

      {/* Modal Form */}
      {showMemberAddForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in"
          onClick={resetForm}>
          <div
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  {isEditing ? "Modify Member Credentials" : "Register Member"}
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Fill out authorization parameters below.
                </p>
              </div>
              <button
                onClick={resetForm}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition">
                <X size={16} />
              </button>
            </div>

            {/* Form Body */}
            <div className="p-6 overflow-y-auto">
              <AddMemberForm
                form={form}
                setForm={setForm}
                resetForm={resetForm}
                isEditing={isEditing}
                onSuccess={fetchMembers}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageMembers;