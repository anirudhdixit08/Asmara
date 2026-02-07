import { Link } from "react-router";
import { AppNav } from "../components/AppNav.jsx";

export default function FactoryDashboard() {
  return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      <AppNav showHome={false}>
        <span className="badge badge-sm bg-primary-content/20 text-primary-content">Factory</span>
        <Link to="/orders" className="btn btn-sm bg-base-100 text-primary hover:bg-base-200 border-0">
          View all orders
        </Link>
      </AppNav>

      <main className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-6">
        <div className="bg-base-100 rounded-lg border border-base-300 shadow-sm overflow-hidden p-6 sm:p-8 text-base-content">
          <h1 className="text-xl font-bold mb-2">Factory Dashboard</h1>
          <p className="text-base-content/70 text-sm mb-6">
            View orders assigned to you. Open an order to see TNA, Fabric, Tech Pack, and Costing details.
          </p>
          <Link to="/orders" className="btn btn-primary">
            View all orders
          </Link>
        </div>
      </main>
    </div>
  );
}
