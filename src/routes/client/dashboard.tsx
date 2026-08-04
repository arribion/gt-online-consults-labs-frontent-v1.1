import { useState } from "react";
import { BalanceCard } from "../../components/client/dashboard/BalanceCard";
import { QuickActions } from "../../components/client/dashboard/QuickActions";
import { SendMoneyDialog } from "../../components/CreateInvoiceDialog";
import PaymentMethods from "../../components/client/payments/PaymentMethods";
import ClientStats from "../../components/client/dashboard/ClientStats";

function Dashboard() {
  const [sendOpen, setSendOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-7xl px-6 py-2">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-green-500">Dashboard Overview</p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Welcome back,
            </h1>

            <p className="mt-2 text-slate-500">
              Here's an overview of your invoices, payments and ongoing work.
            </p>
          </div>

          {/* <button
            onClick={() => setSendOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-medium text-white shadow-lg transition hover:bg-green-700">
            <Plus size={18} />
            Create Invoice
          </button> */}
        </div>

        {/* Layout */}
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Main */}
          <section className="space-y-8 lg:col-span-8">
            <BalanceCard />
            <ClientStats />
            {/* Recent Transactions */}
            <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
              <div className="flex items-center justify-between border-b px-6 py-5">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Recent Invoices
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Your latest invoice activity.
                  </p>
                </div>

                <button className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium transition hover:bg-slate-100">
                  View All
                </button>
              </div>
            </div>
          </section>

          {/* Sidebar */}
          <aside className="space-y-6 lg:col-span-4">
            <QuickActions
            // onSendMoney={() => setSendOpen(true)}
            />

            <PaymentMethods />
          </aside>
        </div>
      </main>
      <SendMoneyDialog open={sendOpen} onOpenChange={setSendOpen} />
    </div>
  );
}

export default Dashboard;
