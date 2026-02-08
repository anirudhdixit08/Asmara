import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { login, clearError } from "../store/features/authSlice.js";
import { PasswordInput } from "../components/PasswordInput.jsx";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((s) => s.auth);
  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    if (!emailId.trim() || !password) return;
    const result = await dispatch(login({ emailId: emailId.trim().toLowerCase(), password }));
    if (login.fulfilled.match(result)) {
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-primary flex flex-col">
      <header className="bg-primary text-primary-content px-4 py-3 border-b border-primary-content/10">
        <nav className="max-w-6xl mx-auto flex justify-between items-center">
          <Link to="/" className="text-xl font-semibold tracking-tight text-primary-content">
            GP Asmara
          </Link>
          <Link to="/signup" className="btn btn-sm bg-base-100 text-primary hover:bg-base-200 border-0">
            Sign up
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="bg-base-100 rounded-lg border border-base-300 shadow-sm w-full max-w-md p-6 sm:p-8 text-base-content">
          <h1 className="text-xl font-bold mb-1">Log in</h1>
          <p className="text-base-content/70 text-sm mb-6">
            Sign in as Asmara or Factory.
          </p>

          {error && (
            <div className="alert alert-error text-sm mb-4" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label py-1" htmlFor="emailId">
                <span className="label-text font-medium">Email</span>
              </label>
              <input
                id="emailId"
                name="emailId"
                type="email"
                className="input input-bordered w-full"
                value={emailId}
                onChange={(e) => { setEmailId(e.target.value); dispatch(clearError()); }}
                required
              />
            </div>
            <div className="form-control">
              <label className="label py-1" htmlFor="password">
                <span className="label-text font-medium">Password</span>
              </label>
              <PasswordInput
                id="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); dispatch(clearError()); }}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? "Signing in…" : "Log in"}
            </button>
          </form>

          <p className="text-center text-sm text-base-content/70 mt-6">
            Don’t have an account?{" "}
            <Link to="/signup" className="link link-primary font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
