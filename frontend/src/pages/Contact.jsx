import React, { useState } from "react";
import { Link } from "react-router";
import axios from "axios";

const Contact = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    username: "",
    email: "",
    message: "",
  });
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: null }));
    setError("");
    setSuccess(false);
  };

  const validate = () => {
    const err = {};
    if (!form.username?.trim()) err.username = "Name is required";
    if (!form.email?.trim()) err.email = "Email is required";
    else if (!/^\S+@\S+$/.test(form.email)) err.email = "Invalid email format";
    if (!form.message?.trim()) err.message = "Message is required";
    setFormErrors(err);
    return Object.keys(err).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError("");
    setSuccess(false);
    const payload = {
      access_key: "a47f08b6-0170-40ca-94f8-50bc3246abd2",
      name: form.username.trim(),
      email: form.email.trim(),
      message: form.message.trim(),
    };
    try {
      await axios.post("https://api.web3forms.com/submit", payload);
      setSuccess(true);
      setForm({ username: "", email: "", message: "" });
      setFormErrors({});
    } catch (err) {
      setError("An error occurred while sending your message. Please try again.");
      console.error("Form Submission Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col">
      <header className="bg-[#0f172a] text-white px-6 py-4 shadow-lg border-b border-white/10">
        <nav className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xl font-semibold tracking-tight hover:text-white/90">
            <img src="/factrixlogo.svg" alt="" className="h-11 w-auto object-contain flex-shrink-0" />
            <span>Factrix</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-white/90 hover:text-white">
              Home
            </Link>
            <Link to="/login" className="btn btn-ghost text-white hover:bg-white/10 border border-white/50 btn-sm">
              Login
            </Link>
            <Link to="/signup" className="btn bg-white text-[#0f172a] hover:bg-white/90 border-0 btn-sm">
              Sign up
            </Link>
          </div>
        </nav>
      </header>

      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl w-full card bg-white shadow-2xl rounded-xl p-6 md:p-10 text-[#0f172a]">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-extrabold text-[#0f172a]">
              Get In Touch
            </h2>
            <p className="text-lg text-[#64748b] mt-2">
              We're here to help you. Reach out anytime.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row justify-between lg:gap-10">
            <div className="w-full lg:w-1/2 mb-8 lg:mb-0">
              <h3 className="text-xl font-bold text-[#0f172a] mb-4">
                Send Us a Direct Message
              </h3>

              {success && (
                <div className="alert alert-success text-sm mb-4">
                  Thank you! Your message has been sent successfully.
                </div>
              )}
              {error && (
                <div className="alert alert-error text-sm mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={onSubmit} className="space-y-4">
                <div className="form-control">
                  <input
                    type="text"
                    name="username"
                    placeholder="Your Name"
                    className={`input input-bordered w-full ${formErrors.username ? "input-error" : ""}`}
                    value={form.username}
                    onChange={handleChange}
                  />
                  {formErrors.username && (
                    <span className="label-text-alt text-error mt-1">{formErrors.username}</span>
                  )}
                </div>

                <div className="form-control">
                  <input
                    type="email"
                    name="email"
                    placeholder="Your Email"
                    className={`input input-bordered w-full ${formErrors.email ? "input-error" : ""}`}
                    value={form.email}
                    onChange={handleChange}
                  />
                  {formErrors.email && (
                    <span className="label-text-alt text-error mt-1">{formErrors.email}</span>
                  )}
                </div>

                <div className="form-control">
                  <textarea
                    name="message"
                    placeholder="Your Message"
                    className={`textarea textarea-bordered h-32 w-full ${formErrors.message ? "textarea-error" : ""}`}
                    value={form.message}
                    onChange={handleChange}
                  />
                  {formErrors.message && (
                    <span className="label-text-alt text-error mt-1">{formErrors.message}</span>
                  )}
                </div>

                <div className="form-control pt-2">
                  <button
                    type="submit"
                    className="btn btn-primary w-full bg-[#0f172a] text-white border-0 hover:bg-[#1e293b]"
                    disabled={loading}
                  >
                    {loading ? "Sending…" : "Send Message"}
                  </button>
                </div>
              </form>
            </div>

            <div className="w-full lg:w-1/2 border-t lg:border-t-0 lg:border-l border-base-200 pt-8 lg:pt-0 lg:pl-8">
              <h3 className="text-xl font-bold text-[#0f172a] mb-4">
                Direct Contact Info
              </h3>
              <ul className="space-y-6 text-lg">
                <li className="flex items-center gap-3">
                  <span className="text-[#0f172a]/70" aria-hidden="true">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
                  </span>
                  <a href="tel:+916394017901" className="link link-hover text-[#0f172a]">+91 6394017901</a>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-[#0f172a]/70" aria-hidden="true">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                  </span>
                  <a href="mailto:tiwari.janvi123@gmail.com" className="link link-hover text-[#0f172a]">tiwari.janvi123@gmail.com</a>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-[#0f172a]/70" aria-hidden="true">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                  </span>
                  <span className="text-[#0f172a]">India</span>
                </li>
                <li className="pt-4 border-t border-base-200">
                  <p className="font-semibold text-[#0f172a]/80">Contact person</p>
                  <p className="text-sm text-[#64748b]">Janvi Tiwari — tiwari.janvi123@gmail.com</p>
                  <p className="text-sm text-[#64748b]">+91 6394017901</p>
                </li>
                <li className="pt-4 border-t border-base-200">
                  <p className="font-semibold text-[#0f172a]/80">Support Hours</p>
                  <p className="text-sm text-[#64748b]">Mon – Fri, 9:00 AM to 5:00 PM IST</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-[#0f172a] text-white py-6 px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-2 font-semibold hover:opacity-90">
            <img src="/factrixlogo.svg" alt="" className="h-11 w-auto object-contain flex-shrink-0" />
            <span>Factrix</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link to="/" className="text-white/80 hover:text-white transition-colors">Home</Link>
            <Link to="/about" className="text-white/80 hover:text-white transition-colors">About</Link>
            <Link to="/contact" className="text-white/80 hover:text-white transition-colors">Contact</Link>
          </nav>
          <p className="text-sm text-white/70">
            © {new Date().getFullYear()} Factrix. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Contact;
