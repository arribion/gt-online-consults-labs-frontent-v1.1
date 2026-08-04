// import React from 'react'

const Stats = () => {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
      <div className="bg-white p-2 rounded shadow-card">
        <h1 className="text-lg font-semibold text-slate-800"> Total Payment</h1>
        <span className="font-bold text-sky-500">
          KES <span>0.00</span>{" "}
        </span>
      </div>
      <div className="bg-white p-2 rounded shadow-card">
        <h1 className="text-lg font-semibold text-slate-800"> Total Unpaid:</h1>
        <span className="font-bold text-sky-500">
          KES <span>0.00</span>{" "}
        </span>
      </div>
      <div className="bg-white p-2 rounded shadow-card">
        <h1 className="text-lg font-semibold text-slate-800"> Total Unpaid:</h1>
        <span className="font-bold text-sky-500">
          KES <span>0.00</span>{" "}
        </span>
      </div>
    </div>
  );
}

export default Stats