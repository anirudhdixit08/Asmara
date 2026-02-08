import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { setUserAndChecked } from "../store/features/authSlice.js";
import { sendOTP, register } from "../lib/api.js";
import { PasswordInput } from "../components/PasswordInput.jsx";

const PASSWORD_HINT =
  "At least 8 characters with uppercase, lowercase, number and symbol.";

export default function SignUp() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [step, setStep] = useState("form"); // "form" | "otp"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    emailId: "",
    organisationName: "",
    role: "factory",
    password: "",
    phoneNumber: "",
  });
  const [otp, setOtp] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.firstName.trim() || !form.emailId.trim() || !form.organisationName.trim() || !form.password.trim()) {
      setError("First name, email, organisation name and password are required.");
      return;
    }
    setLoading(true);
    try {
      await sendOTP(form.emailId.trim().toLowerCase(), form.organisationName.trim());
      setStep("otp");
    } catch (err) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (!otp.trim()) {
      setError("Please enter the OTP sent to your email.");
      return;
    }
    setLoading(true);
    try {
      const data = await register({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        emailId: form.emailId.trim().toLowerCase(),
        organisationName: form.organisationName.trim(),
        role: form.role,
        password: form.password,
        phoneNumber: form.phoneNumber.trim() || undefined,
        otp: otp.trim(),
      });
      if (data?.user) dispatch(setUserAndChecked(data.user));
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col">
      <header className="bg-[#0f172a] text-white px-6 py-4 border-b border-white/10">
        <nav className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xl font-semibold tracking-tight">
            <img src="/factrixlogo.svg" alt="" className="h-11 w-auto object-contain flex-shrink-0" />
            <span>Factrix</span>
          </Link>
          <Link to="/login" className="btn btn-ghost text-white hover:bg-white/10">
            Login
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-[#0f172a]">
          <h1 className="text-2xl font-bold mb-2">Sign up</h1>
          <p className="text-[#64748b] text-sm mb-6">
            Create an account as Asmara or Factory.
          </p>

          {error && (
            <div className="alert alert-error text-sm mb-4" role="alert">
              {error}
            </div>
          )}

          {step === "form" ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="form-control">
                <label className="label" htmlFor="firstName">
                  <span className="label-text">First name *</span>
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  className="input input-bordered w-full"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                  minLength={3}
                  maxLength={30}
                />
              </div>
              <div className="form-control">
                <label className="label" htmlFor="lastName">
                  <span className="label-text">Last name</span>
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  className="input input-bordered w-full"
                  value={form.lastName}
                  onChange={handleChange}
                  minLength={3}
                  maxLength={30}
                />
              </div>
              <div className="form-control">
                <label className="label" htmlFor="emailId">
                  <span className="label-text">Email *</span>
                </label>
                <input
                  id="emailId"
                  name="emailId"
                  type="email"
                  className="input input-bordered w-full"
                  value={form.emailId}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-control">
                <label className="label" htmlFor="organisationName">
                  <span className="label-text">Organisation name *</span>
                </label>
                <input
                  id="organisationName"
                  name="organisationName"
                  type="text"
                  className="input input-bordered w-full"
                  value={form.organisationName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Account type *</span>
                </label>
                <div className="flex gap-4">
                  <label className="label cursor-pointer gap-2">
                    <input
                      type="radio"
                      name="role"
                      value="asmara"
                      className="radio radio-primary"
                      checked={form.role === "asmara"}
                      onChange={handleChange}
                    />
                    <span className="label-text">Asmara</span>
                  </label>
                  <label className="label cursor-pointer gap-2">
                    <input
                      type="radio"
                      name="role"
                      value="factory"
                      className="radio radio-primary"
                      checked={form.role === "factory"}
                      onChange={handleChange}
                    />
                    <span className="label-text">Factory</span>
                  </label>
                </div>
              </div>
              <div className="form-control">
                <label className="label" htmlFor="password">
                  <span className="label-text">Password *</span>
                </label>
                <PasswordInput
                  id="password"
                  value={form.password}
                  onChange={(e) => handleChange({ target: { name: "password", value: e.target.value } })}
                  required
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/60">{PASSWORD_HINT}</span>
                </label>
              </div>
              <div className="form-control">
                <label className="label" htmlFor="phoneNumber">
                  <span className="label-text">Phone number</span>
                </label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  className="input input-bordered w-full"
                  value={form.phoneNumber}
                  onChange={handleChange}
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary w-full bg-[#0f172a] text-white border-0 hover:bg-[#1e293b]"
                disabled={loading}
              >
                {loading ? "Sending OTP…" : "Send OTP"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <p className="text-sm text-[#64748b]">
                We sent a 6-digit OTP to <strong>{form.emailId}</strong>. Enter it below.
              </p>
              <div className="form-control">
                <label className="label" htmlFor="otp">
                  <span className="label-text">OTP *</span>
                </label>
                <input
                  id="otp"
                  type="text"
                  className="input input-bordered w-full"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value);
                    setError("");
                  }}
                  placeholder="000000"
                  maxLength={6}
                  pattern="[0-9]*"
                  inputMode="numeric"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn btn-ghost flex-1"
                  onClick={() => setStep("form")}
                  disabled={loading}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1 bg-[#0f172a] text-white border-0 hover:bg-[#1e293b]"
                  disabled={loading}
                >
                  {loading ? "Creating account…" : "Create account"}
                </button>
              </div>
            </form>
          )}

          <p className="text-center text-sm text-[#64748b] mt-6">
            Already have an account?{" "}
            <Link to="/login" className="link link-primary">
              Log in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
