import { Link, useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { logout } from "../store/features/authSlice.js";
import axiosClient from "../utils/axiosClient.js";

export function AppNav({ backTo, backLabel = "Back", showHome = true, showLogout = true, logoLabel = "Factrix", children }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  async function handleLogout() {
    try {
      await axiosClient.post("/auth/logout");
      dispatch(logout());
      navigate("/", { replace: true });
    } catch {
      navigate("/", { replace: true });
    }
  }

  return (
    <header className="bg-primary text-primary-content px-4 py-3 border-b border-primary-content/10">
      <nav className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight text-primary-content hover:opacity-90">
            <img src="/factrixlogo.svg" alt="" className="h-11 w-auto object-contain flex-shrink-0" />
            <span>{logoLabel}</span>
          </Link>
          {backTo && (
            <Link to={backTo} className="btn btn-ghost btn-sm text-primary-content/90 hover:bg-primary-content/10">
              {backLabel}
            </Link>
          )}
          {showHome && !backTo && (
            <Link to="/" className="btn btn-ghost btn-sm text-primary-content/90 hover:bg-primary-content/10">
              Home page
            </Link>
          )}
        </div>
        <div className="flex items-center gap-2">
          {children}
          {showLogout && (
            <button
              type="button"
              className="btn btn-ghost btn-sm text-primary-content hover:bg-primary-content/10"
              onClick={handleLogout}
            >
              Logout
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}
