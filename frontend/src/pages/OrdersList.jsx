import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { checkAuth } from "../store/features/authSlice.js";
import { fetchOrders } from "../store/features/ordersSlice.js";
import { AppNav } from "../components/AppNav.jsx";

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString();
}

export default function OrdersList() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, loading: authLoading, checked } = useSelector((s) => s.auth);
  const { list: orders, loading: ordersLoading } = useSelector((s) => s.orders);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  useEffect(() => {
    if (!checked) return;
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    dispatch(fetchOrders(search));
  }, [dispatch, user, checked, search, navigate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  const dashboardPath = user?.role === "asmara" ? "/asmara" : "/factory";
  const isAsmara = user?.role === "asmara";
  const loading = authLoading || ordersLoading;

  if (!checked || (checked && !user)) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center text-primary-content">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      <AppNav backTo={dashboardPath} backLabel="Dashboard">
        {isAsmara && (
          <Link to="/orders/create" className="btn btn-sm bg-base-100 text-primary hover:bg-base-200 border-0">
            Create order
          </Link>
        )}
      </AppNav>

      <main className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-6">
        <div className="bg-base-100 rounded-lg border border-base-300 shadow-sm overflow-hidden text-base-content">
          <div className="p-5 sm:p-6 border-b border-base-300">
            <h1 className="text-xl font-bold mb-4">All orders</h1>
            <form onSubmit={handleSearchSubmit} className="flex flex-wrap gap-2">
              <input
                type="text"
                className="input input-bordered input-sm sm:input-md flex-1 min-w-[180px]"
                placeholder="Search by style number or buyer name"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <button type="submit" className="btn btn-primary btn-sm sm:btn-md">
                Search
              </button>
              {search && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => { setSearchInput(""); setSearch(""); }}
                >
                  Clear
                </button>
              )}
            </form>
          </div>

          <div className="overflow-x-auto">
            {loading && orders.length === 0 ? (
              <div className="p-12 flex justify-center">
                <span className="loading loading-spinner loading-md" />
              </div>
            ) : orders.length === 0 ? (
              <div className="p-12 text-center text-base-content/70">
                No orders found.
              </div>
            ) : (
              <table className="table table-zebra">
                <thead>
                  <tr className="bg-primary text-primary-content">
                    <th className="rounded-none">Style number</th>
                    <th>Buyer</th>
                    <th>Quantity</th>
                    <th>Shipment date</th>
                    <th>Season</th>
                    <th>Status</th>
                    {isAsmara && <th>Factory</th>}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order._id}
                      className="cursor-pointer hover:bg-slate-50"
                      onClick={() => navigate(`/orders/${order._id}`)}
                    >
                      <td className="font-semibold">{order.styleNumber}</td>
                      <td>{order.buyerName}</td>
                      <td>{order.orderQuantity?.toLocaleString()}</td>
                      <td>{formatDate(order.shipmentDate)}</td>
                      <td>{order.season}</td>
                      <td>
                        <span className={`badge badge-sm ${
                          order.status === "delivered" ? "badge-success" :
                          order.status === "cancelled" ? "badge-error" :
                          order.status === "in-production" ? "badge-info" :
                          "badge-warning"
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      {isAsmara && (
                        <td>{order.factory?.organisationName ?? order.factory?.firstName ?? "—"}</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
