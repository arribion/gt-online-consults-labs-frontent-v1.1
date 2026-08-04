import { useState } from 'react'

const Invoicing = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  // Example invoice data
  const invoices = [
    {
      id: "INV001",
      client: "Acme Corp",
      amount: 5000,
      status: "Pending",
      method: "M-PESA",
    },
    {
      id: "INV002",
      client: "Beta Ltd",
      amount: 3200,
      status: "Paid",
      method: "Bank",
    },
    {
      id: "INV003",
      client: "Gamma Inc",
      amount: 1500,
      status: "Pending",
      method: "PayPal",
    },
  ];

  const openInvoiceModal = (invoice: any) => {
    setSelectedInvoice(invoice);
    setShowModal(true);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <h1 className="text-2xl text-sky-500 font-bold mb-6">
        Invoice Management
      </h1>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8 text-center">
        <div className="shadow-card border-yellow-100 p-4 rounded shadow">
          <h2 className="font-semibold">Pending Invoices</h2>
          <p className="text-2xl font-bold">2</p>
        </div>
        <div className="shadow-card border-green-100 p-4 rounded shadow">
          <h2 className="font-semibold">Paid Invoices</h2>
          <p className="text-2xl font-bold">1</p>
        </div>
        <div className="shadow-card border-red-100 p-4 rounded shadow">
          <h2 className="font-semibold">Overdue Invoices</h2>
          <p className="text-2xl font-bold">0</p>
        </div>
      </div>

      {/* Invoices Table */}
      <table className="w-full border-collapse border">
        <thead className="bg-gray-200">
          <tr>
            <th className="border p-2">Invoice ID</th>
            <th className="border p-2">Client</th>
            <th className="border p-2">Amount</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Method</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv.id}>
              <td className="border p-2">{inv.id}</td>
              <td className="border p-2">{inv.client}</td>
              <td className="border p-2">KES {inv.amount}</td>
              <td
                className={`border p-2 ${inv.status === "Pending" ? "text-yellow-600" : "text-green-600"}`}>
                {inv.status}
              </td>
              <td className="border p-2">{inv.method}</td>
              <td className="border p-2">
                {inv.status === "Pending" ? (
                  <button
                    onClick={() => openInvoiceModal(inv)}
                    className="bg-blue-600 text-white px-3 py-1 rounded">
                    Record Payment
                  </button>
                ) : (
                  <span className="text-green-600 font-bold">✓</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Payment Modal */}
      {showModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Record Payment</h2>
            <p>
              <strong>Invoice:</strong> {selectedInvoice.id}
            </p>
            <p>
              <strong>Client:</strong> {selectedInvoice.client}
            </p>
            <p>
              <strong>Amount:</strong> KES {selectedInvoice.amount}
            </p>
            <p>
              <strong>Method:</strong> {selectedInvoice.method}
            </p>

            <label className="block mt-4 mb-2 font-semibold">
              Reference Code
            </label>
            <input
              type="text"
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
                onClick={() => setShowModal(false)}
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

export default Invoicing;
