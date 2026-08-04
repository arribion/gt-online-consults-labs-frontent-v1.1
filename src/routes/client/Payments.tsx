// import React from 'react'

import Stats from "../../components/client/payments/Stats";

const Payments = () => {
  return (
    <>
      <section className="min-h-[80.8vh] bg-gray-50 px-4 pb-10 pt-2">
        <div className="mx-4">
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-sky-500">
            PAYMENTS
          </h1>
        </div>

        <div>
          <Stats/>
        </div>
      </section>
    </>
  );
}

export default Payments