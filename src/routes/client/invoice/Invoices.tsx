import { Plus } from "lucide-react";


function Invoices() {
  return (
    <section className="min-h-screen mx-auto max-w-7xl px-6 pb-10 pt-3 bg-slate-50">
      <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-sky-500">
            INVOICES
          </h1>
          <p className="mt-2 text-slate-500">
            Track invoices, payments and money transfers in one place.
          </p>
        </div>

        <button className="flex items-center gap-2 rounded bg-sky-600 px-4 py-2 font-medium text-white shadow-lg transition hover:bg-sky-700 hover:shadow-xl">
          <Plus size={18} />
          Add Invoice
        </button>
      </div>
    </section>
  );
}

export default Invoices;
