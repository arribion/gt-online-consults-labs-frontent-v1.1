// src/routes/admin/Financies.tsx
import { useState, useEffect } from "react";
// import axios from "axios";

export type PaymentStatus = "Pending" | "Completed" | "Overdue";
export type PaymentMethod = "M-PESA" | "Till" | "Bank" | "PayPal";

export interface Member {
  id: string;
  name: string;
  phone: string;
  status: PaymentStatus;
  amount: number;
  method: PaymentMethod;
  referenceCode?: string;
}

const Financies = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [referenceCode, setReferenceCode] = useState("");

  // const api = axios.create({
  //   baseURL: import.meta.env.VITE_BASE_URL,
  //   headers: { "Content-Type": "application/json" },
  // });

  // Mock data
  const mockMembers: Member[] = [
    {
      id: "1",
      name: "Jeff Mutethia",
      phone: "07xx xxx xxx",
      status: "Pending",
      amount: 2500,
      method: "M-PESA",
    },
    {
      id: "2",
      name: "Jane Doe",
      phone: "07xx xxx xxx",
      status: "Completed",
      amount: 0,
      method: "PayPal",
    },
    {
      id: "3",
      name: "Mark Smith",
      phone: "07xx xxx xxx",
      status: "Pending",
      amount: 1200,
      method: "Bank",
    },
  ];

  // Fetch members (kept for future DB integration, but using mock data now)
  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError("");
      // const { data } = await api.get("/api/v1/payments");
      // setMembers(Array.isArray(data) ? data : data?.data || []);
      setMembers(mockMembers); //  use mock data for now
    } catch (err) {
      setError("Failed to load payments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const openPaymentModal = (member: Member) => {
    setSelectedMember(member);
    setReferenceCode("");
    setShowModal(true);
  };

  const confirmPayment = () => {
    if (!selectedMember) return;
    // For now, just update local state
    setMembers((prev) =>
      prev.map((m) =>
        m.id === selectedMember.id
          ? { ...m, status: "Completed", referenceCode }
          : m,
      ),
    );
    setShowModal(false);
  };

  const pendingCount = members.filter((m) => m.status === "Pending").length;
  const completedCount = members.filter((m) => m.status === "Completed").length;
  const overdueCount = members.filter((m) => m.status === "Overdue").length;

  return (
    <div className="p-6 bg-gray-50">
      <h1 className="text-2xl text-sky-500 font-bold mb-6">Member Payments</h1>

      {/* Quick Stats */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 mb-12">
        <div className="bg-white border border-slate-300/50 p-4 rounded-lg shadow">
          <h2 className="font-semibold text-gray-700">Pending Payments</h2>
          <p className="text-4xl mb-3 font-bold">{pendingCount}</p>
          <p className="mt-3 text-slate-500">Unpaid Taskers</p>
        </div>
        <div className="bg-white border border-slate-300/50 p-4 rounded-lg shadow">
          <h2 className="font-semibold text-gray-700">Completed Payments</h2>
          <p className="text-4xl font-bold">{completedCount}</p>
          <p className="mt-3 text-slate-500">Unpaid Taskers</p>
        </div>
        <div className="bg-white border border-slate-300/50 p-4 rounded-lg shadow">
          <h2 className="font-semibold text-gray-700">Overdue Payments</h2>
          <p className="text-4xl font-bold">{overdueCount}</p>
          <p className="mt-3 text-slate-500">Unpaid Taskers</p>
        </div>
        {/*  */}
        <div className="bg-white border border-slate-300/50 p-4 rounded-lg shadow">
          <h2 className="font-semibold text-gray-700">Total Revenue</h2>
          <p className="text-4xl font-bold">{pendingCount}</p>
          <p className="mt-3 text-slate-500">Unpaid Taskers</p>
        </div>
        <div className="bg-white border border-slate-300/50 p-4 rounded-lg shadow">
          <h2 className="font-semibold text-gray-700">Total Payout</h2>
          <p className="text-4xl font-bold">{completedCount}</p>
          <p className="mt-3 text-slate-500">Unpaid Taskers</p>
        </div>
        <div className="bg-white border border-slate-300/50 p-4 rounded-lg shadow">
          <h2 className="font-semibold text-gray-700">Net Profit</h2>
          <p className="text-4xl font-bold">{overdueCount}</p>
          <p className="mt-3 text-slate-500">Unpaid Taskers</p>
        </div>
        <div className="bg-white border border-slate-300/50 p-4 rounded-lg shadow">
          <h2 className="font-semibold text-gray-700">Tips</h2>
          <p className="text-4xl font-bold">{overdueCount}</p>
          <p className="mt-3 text-slate-500">Unpaid Taskers</p>
        </div>
        <div className="bg-white border border-slate-300/50 p-4 rounded-lg shadow">
          <h2 className="font-semibold text-gray-700">Net Profit</h2>
          <p className="text-4xl font-bold">{overdueCount}</p>
          <p className="mt-3 text-slate-500">Unpaid Taskers</p>
        </div>
      </div>

      {/* Members Table */}
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <>
          <div className="bg-white border border-slate-300/50 p-4 rounded-lg shadow mb-4">
            <form action="">
              <label htmlFor=""></label>
              <input
                type="search"
                placeholder="Search..."
                className="bg-gray-100 py-2 px-1 w-[50%] rounded"
              />
            </form>
          </div>

          <div className="bg-white border border-slate-300/50 rounded-lg shadow mb-4">
            <table className="w-full">
              <thead className="bg-slate-100 my-8  text-slate-700">
                <tr className="rounded-t-2xl my-4">
                  <th className="p-3 pt-8 text-left text-sm font-semibold">
                    Name
                  </th>
                  <th className="p-3 text-left text-sm font-semibold">Phone</th>
                  <th className="p-3 text-left text-sm font-semibold">
                    Status
                  </th>
                  <th className="p-3 text-left text-sm font-semibold">
                    Amount Due
                  </th>
                  <th className="p-3 text-left text-sm font-semibold">
                    Method
                  </th>
                  <th className="p-3 text-center text-sm font-semibold">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {members.map((m) => (
                  <tr
                    key={m.id}
                    className="hover:bg-sky-200 transition-colors duration-150">
                    <td className="p-3 font-medium text-gray-900">{m.name}</td>
                    <td className="p-3 text-gray-600">{m.phone}</td>
                    <td
                      className={`p-3 font-semibold ${
                        m.status === "Pending"
                          ? "text-yellow-600"
                          : m.status === "Completed"
                            ? "text-green-600"
                            : "text-red-600"
                      }`}>
                      {m.status}
                    </td>
                    <td className="p-3 text-gray-700">KES {m.amount}</td>
                    <td className="p-3 text-gray-700">{m.method}</td>
                    <td className="p-3 text-center">
                      {m.status === "Pending" ? (
                        <button
                          onClick={() => openPaymentModal(m)}
                          className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-1 rounded text-sm font-semibold transition active:scale-[0.97]">
                          Pay
                        </button>
                      ) : (
                        <span className="text-sky-600 font-bold">✓</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Payment Modal */}
      {showModal && selectedMember && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Record Payment</h2>
            <p>
              <strong>Member:</strong> {selectedMember.name}
            </p>
            <p>
              <strong>Amount:</strong> KES {selectedMember.amount}
            </p>
            <p>
              <strong>Method:</strong> {selectedMember.method}
            </p>
            <label className="block mt-4 mb-2 font-semibold">
              Reference Code
            </label>
            <input
              type="text"
              value={referenceCode}
              onChange={(e) => setReferenceCode(e.target.value)}
              placeholder="Enter M-PESA/Bank Ref Code"
              className="border p-2 w-full rounded mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded">
                Cancel
              </button>
              <button
                onClick={confirmPayment}
                className="bg-green-600 text-white px-4 py-2 rounded">
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Financies;
