// import React, { useState } from 'react'

import { Bug } from "lucide-react";

const ContactUs = () => {
    // const [name, setName] = useState<string>("");
    // const [email, setEmail] = useState<string>("");
    // const [phone, setPhone] = useState<string>("");
    // const [message, setMessage] = useState<string>("");

    const how_did_u_know_about_us = [
        "Google search",
        "Friend Suggetion",
        "Former Member"
    ];

    return (
      <section className="min-h-[70vh] mx-4">
        <div className="m-2">
          <span className="font-bold text-sky-500">
            APPLICATION IS UNDER DEVELOPMENT
          </span>
          , Your suggestions are very much appreciated leave a message below{" "}
          <div className="mt-6 border-t border-gray-100 pt-1">
            <a
              href="https://wa.me/254707468863?text=I would like to report a bug/suggetion in the qt-online application."
              target="_blank"
              className="block">
              <button
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-linear-to-r from-emerald-500 to-sky-500 px-4 py-2 text-sm font-semibold text-white shadow hover:from-emerald-600 hover:to-sky-600 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                aria-label="Create member login">
                <Bug size={16} />
                REPORT A BUG & SUGGETIONs
              </button>
            </a>
          </div>
        </div>
        <h1 className="text-center font-semibold mt-[5em] ">contact Us</h1>
        <div className="flex justify-center">
          <form action="" className="shadow-card rounded-2xl p-4 max-w-md">
            <div className="mb-3">
              <label htmlFor="">Full name</label>
              <br />
              <input
                type="text"
                placeholder="e.g. Jina lako"
                className="border border-slate-400 w-full p-1 rounded"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="">Email</label>
              <br />
              <input
                type="text"
                placeholder="Jina@example.com"
                className="border border-slate-400 w-full p-1 rounded"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="">Phone</label>
              <br />
              <input
                type="text"
                placeholder="0700000000"
                className="border border-slate-400 w-full p-1 rounded"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="">How did you here about us?</label>
              <br />
              <select
                name=""
                id=""
                className="border border-slate-400 w-full p-1 rounded">
                {how_did_u_know_about_us.map((w, i) => (
                  <option value="" key={i}>
                    {w}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label htmlFor="">Why do you what to join Us?</label>
              <br />
              <textarea
                name=""
                id=""
                className="border border-slate-400 w-full p-1 rounded max-h-[12em] min-h-[5em]"></textarea>
            </div>
          </form>
        </div>
      </section>
    );}

export default ContactUs