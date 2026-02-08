import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router";
import axiosClient from "../utils/axiosClient.js";
import { AppNav } from "../components/AppNav.jsx";

const MAX_TECHPACK_BYTES = 10 * 1024 * 1024;
const ACCEPT_TECHPACK = ".pdf,.zip,application/pdf,application/zip,application/x-zip-compressed";

export default function CreateOrder() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    styleNumber: "",
    orderQuantity: "",
    season: "",
    buyerName: "",
    shipmentDate: "",
    factoryOrganisationName: "",
  });
  const [techpackFile, setTechpackFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleFile = (file) => {
    setError("");
    if (!file) { setTechpackFile(null); return; }
    const isPdf = file.type === "application/pdf";
    const isZip = file.type === "application/zip" || file.type === "application/x-zip-compressed";
    if (!isPdf && !isZip) { setError("Techpack must be PDF or ZIP."); return; }
    if (file.size > MAX_TECHPACK_BYTES) { setError("Techpack must be under 10 MB."); return; }
    setTechpackFile(file);
  };

  const onDrop = (e) => { e.preventDefault(); setDragActive(false); const f = e.dataTransfer?.files?.[0]; if (f) handleFile(f); };
  const onDragOver = (e) => { e.preventDefault(); setDragActive(true); };
  const onDragLeave = () => setDragActive(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const { styleNumber, buyerName, orderQuantity, shipmentDate, season, factoryOrganisationName } = form;
    if (!styleNumber?.trim() || !buyerName?.trim() || !orderQuantity || !shipmentDate?.trim() || !season?.trim() || !factoryOrganisationName?.trim()) {
      setError("Please fill all required fields.");
      return;
    }
    if (!techpackFile) { setError("Please upload a techpack (PDF or ZIP)."); return; }
    const qty = Number(orderQuantity);
    if (Number.isNaN(qty) || qty < 1) { setError("Order quantity must be at least 1."); return; }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("styleNumber", styleNumber.trim());
      fd.append("buyerName", buyerName.trim());
      fd.append("orderQuantity", String(qty));
      fd.append("shipmentDate", shipmentDate);
      fd.append("season", season.trim());
      fd.append("factoryOrganisationName", factoryOrganisationName.trim());
      fd.append("techpack", techpackFile);
      const { data } = await axiosClient.post("/order/create", fd);
      if (data?.success) navigate("/", { replace: true });
      else setError(data?.message || "Failed to create order.");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to create order.");
      if (err.response?.status === 401) navigate("/login", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      <AppNav backTo="/" backLabel="Back to dashboard" />

      <main className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-6">
        <div className="bg-base-100 rounded-lg border border-base-300 shadow-sm overflow-hidden p-6 sm:p-8 text-base-content">
          <h1 className="text-xl font-bold mb-1">Create New Style Order</h1>
          <p className="text-base-content/70 text-sm mb-6">
            Add a new style order and upload the techpack to start the production workflow.
          </p>

          {error && (
            <div className="alert alert-error text-sm mb-6" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="form-control">
                  <label className="label py-1" htmlFor="styleNumber">
                    <span className="label-text font-bold uppercase text-xs tracking-wider text-base-content/70">Style Number</span>
                  </label>
                  <input
                    id="styleNumber"
                    name="styleNumber"
                    type="text"
                    className="input input-bordered w-full"
                    value={form.styleNumber}
                    onChange={handleChange}
                    placeholder="e.g. 159260454"
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label py-1" htmlFor="orderQuantity">
                    <span className="label-text font-bold uppercase text-xs tracking-wider text-base-content/70">Order Quantity</span>
                  </label>
                  <input
                    id="orderQuantity"
                    name="orderQuantity"
                    type="number"
                    min={1}
                    className="input input-bordered w-full"
                    value={form.orderQuantity}
                    onChange={handleChange}
                    placeholder="e.g. 10963"
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label py-1" htmlFor="season">
                    <span className="label-text font-bold uppercase text-xs tracking-wider text-base-content/70">Season</span>
                  </label>
                  <input
                    id="season"
                    name="season"
                    type="text"
                    className="input input-bordered w-full"
                    value={form.season}
                    onChange={handleChange}
                    placeholder="e.g. Summer"
                    required
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="form-control">
                  <label className="label py-1" htmlFor="buyerName">
                    <span className="label-text font-bold uppercase text-xs tracking-wider text-base-content/70">Buyer Name</span>
                  </label>
                  <input
                    id="buyerName"
                    name="buyerName"
                    type="text"
                    className="input input-bordered w-full"
                    value={form.buyerName}
                    onChange={handleChange}
                    placeholder="e.g. ANF"
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label py-1" htmlFor="shipmentDate">
                    <span className="label-text font-bold uppercase text-xs tracking-wider text-base-content/70">Shipment Date</span>
                  </label>
                  <input
                    id="shipmentDate"
                    name="shipmentDate"
                    type="date"
                    className="input input-bordered w-full"
                    value={form.shipmentDate}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label py-1" htmlFor="factoryOrganisationName">
                    <span className="label-text font-bold uppercase text-xs tracking-wider text-base-content/70">Factory</span>
                  </label>
                  <input
                    id="factoryOrganisationName"
                    name="factoryOrganisationName"
                    type="text"
                    className="input input-bordered w-full"
                    value={form.factoryOrganisationName}
                    onChange={handleChange}
                    placeholder="Factory organisation name"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-bold uppercase text-xs tracking-wider text-base-content/70">Techpack (PDF/ZIP)</span>
              </label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 sm:p-8 text-center cursor-pointer transition-colors ${
                  dragActive ? "border-primary bg-base-200" : "border-base-300"
                } ${techpackFile ? "bg-base-200" : ""}`}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onClick={() => fileInputRef.current?.click()}
              >
                <input ref={fileInputRef} type="file" accept={ACCEPT_TECHPACK} className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
                <span className="text-3xl text-base-content/60 block mb-2">↑</span>
                <p className="text-base-content/70 text-sm">
                  {techpackFile ? techpackFile.name : "Click to upload or drag and drop PDF or Zip up to 10 MB"}
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Link to="/asmara" className="btn btn-outline">
                Cancel
              </Link>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Creating…" : "Create Order"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
