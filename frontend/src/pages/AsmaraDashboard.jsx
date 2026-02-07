import { Link } from "react-router";
import { AppNav } from "../components/AppNav.jsx";

export default function AsmaraDashboard() {
  return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      <AppNav showHome={false}>
        <span className="badge badge-sm bg-primary-content/20 text-primary-content">Asmara</span>
        <Link to="/orders" className="btn btn-ghost btn-sm text-primary-content/90 hover:bg-primary-content/10">
          View all orders
        </Link>
        <Link to="/orders/create" className="btn btn-sm bg-base-100 text-primary hover:bg-base-200 border-0">
          Create New Style Order
        </Link>
      </AppNav>

      <main className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-6">
        <div className="bg-base-100 rounded-lg border border-base-300 shadow-sm overflow-hidden p-6 sm:p-8 text-base-content">
          <h1 className="text-xl font-bold mb-2">Asmara Dashboard</h1>
          <p className="text-base-content/70 text-sm mb-6">
            Create orders and view all orders. Manage production workflow from here.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/orders/create" className="btn btn-primary">
              Create New Style Order
            </Link>
            <Link to="/orders" className="btn btn-outline">
              View all orders
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
