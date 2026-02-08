import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { logout } from "../store/features/authSlice.js";
import axiosClient from "../utils/axiosClient.js";

function BellIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
    </svg>
  );
}

export function AppNav({ backTo, backLabel = "Back", showHome = true, showLogout = true, logoLabel = "Factrix", children }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!notificationsOpen) return;
    setNotificationsLoading(true);
    axiosClient
      .get("/notification")
      .then((res) => setNotifications(res.data?.data ?? []))
      .catch(() => setNotifications([]))
      .finally(() => setNotificationsLoading(false));
  }, [notificationsOpen]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    }
    if (notificationsOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [notificationsOpen]);

  async function handleLogout() {
    try {
      await axiosClient.post("/auth/logout");
      dispatch(logout());
      navigate("/", { replace: true });
    } catch {
      navigate("/", { replace: true });
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="bg-primary text-primary-content px-4 py-3 border-b border-primary-content/10">
      <nav className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight text-primary-content hover:opacity-90">
            <img src="/factrixlogo.svg" alt="" className="h-11 w-auto object-contain shrink-0" />
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
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              className="btn btn-ghost btn-sm btn-circle text-primary-content hover:bg-primary-content/10 relative"
              onClick={(e) => {
                e.stopPropagation();
                setNotificationsOpen((o) => !o);
              }}
              aria-label="Notifications"
            >
              <BellIcon />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-error text-[10px] font-bold text-primary-content">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
            {notificationsOpen && (
              <div className="absolute right-0 top-full z-50 mt-1 w-80 max-h-[min(24rem,70vh)] overflow-auto rounded-lg border border-base-300 bg-base-100 shadow-xl text-base-content">
                <div className="p-2 border-b border-base-300 font-semibold text-sm sticky top-0 bg-base-100">
                  Notifications
                </div>
                {notificationsLoading ? (
                  <div className="p-4 flex justify-center">
                    <span className="loading loading-spinner loading-sm" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-base-content/70">No notifications yet.</div>
                ) : (
                  <ul className="divide-y divide-base-200">
                    {notifications.map((n) => (
                      <li key={n._id}>
                        <button
                          type="button"
                          className={`w-full text-left p-3 hover:bg-base-200 transition-colors ${!n.isRead ? "bg-primary/5" : ""}`}
                          onClick={() => {
                            if (n.orderId?._id) navigate(`/orders/${n.orderId._id}`);
                            setNotificationsOpen(false);
                          }}
                        >
                          <p className="text-sm font-medium">{n.message}</p>
                          <p className="text-xs text-base-content/60 mt-0.5">
                            {n.type === "COSTING_APPROVED" ? "Costing approved" : "New comment"}
                            {n.createdAt && ` · ${new Date(n.createdAt).toLocaleDateString()}`}
                          </p>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
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
