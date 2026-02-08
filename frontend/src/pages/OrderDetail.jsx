import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { checkAuth } from "../store/features/authSlice.js";
import { fetchOrderDetail, clearOrderDetail } from "../store/features/orderDetailSlice.js";
import { AppNav } from "../components/AppNav.jsx";
import axiosClient from "../utils/axiosClient.js";

const TABS = ["TNA", "Fabric", "Tech Pack", "Costing"];

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString();
}

function toInputDate(value) {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

const ORDER_STATUS_OPTIONS = ["pending", "in-production", "shipped", "delivered", "cancelled"];
const FACTORY_STATUS_OPTIONS = ["shipped", "delivered"];

function toValidHex(hex) {
  if (!hex || typeof hex !== "string") return "#808080";
  const m = hex.trim().match(/^#?([0-9A-Fa-f]{6})$/);
  return m ? `#${m[1]}` : "#808080";
}

export default function OrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { order, loading, error } = useSelector((s) => s.orderDetail);
  const [activeTab, setActiveTab] = useState("TNA");
  const [editingTab, setEditingTab] = useState(null);
  const [editingStatus, setEditingStatus] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentSubmitLoading, setCommentSubmitLoading] = useState(false);
  const prevOrderIdRef = useRef(null);

  const isAsmara = user?.role === "asmara";
  const isFactory = user?.role === "factory";
  const canEditTna = isAsmara;
  const canEditFabric = isAsmara;
  const canEditTechPack = isAsmara;
  const canEditCosting = true;
  const canEditStatus = isAsmara || isFactory;
  const statusOptions = isAsmara ? ORDER_STATUS_OPTIONS : FACTORY_STATUS_OPTIONS;

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  useEffect(() => {
    if (!orderId) return;
    if (prevOrderIdRef.current !== orderId) {
      prevOrderIdRef.current = orderId;
      dispatch(clearOrderDetail());
    }
    dispatch(fetchOrderDetail(orderId));
  }, [dispatch, orderId]);

  useEffect(() => {
    if (error?.status === 401) navigate("/login", { replace: true });
  }, [error, navigate]);

  useEffect(() => {
    if (!orderId) return;
    setCommentsLoading(true);
    axiosClient
      .get(`/notification/order/${orderId}/comments`)
      .then((res) => setComments(res.data?.data ?? []))
      .catch(() => setComments([]))
      .finally(() => setCommentsLoading(false));
  }, [orderId]);

  async function handleSaveTna(e) {
    e.preventDefault();
    if (!order?.tna?._id) return;
    setEditError("");
    setSaveLoading(true);
    const form = e.target;
    const body = {
      greigeCommit: form.greigeCommit?.value || null,
      colorCommit: form.colorCommit?.value || null,
      ppApproval: form.ppApproval?.value || null,
      cutDate: form.cutDate?.value || null,
      gacDate: form.gacDate?.value || null,
      tnaClosedWithBuyer: form.tnaClosedWithBuyer?.value || null,
    };
    Object.keys(body).forEach((k) => { if (body[k] === "") body[k] = null; });
    try {
      const fd = new FormData();
      Object.entries(body).forEach(([k, v]) => { if (v != null) fd.append(k, v); });
      const file = form.fabricSketch?.files?.[0];
      if (file) fd.append("fabricSketch", file);
      await axiosClient.patch(`/order/update-tna/${order.tna._id}`, fd);
      setEditingTab(null);
      dispatch(fetchOrderDetail(orderId));
    } catch (err) {
      setEditError(err.response?.data?.message || err.message || "Failed to save");
    } finally {
      setSaveLoading(false);
    }
  }

  async function handleSaveFabric(e) {
    e.preventDefault();
    if (!order?.fabric?._id) return;
    setEditError("");
    setSaveLoading(true);
    const form = e.target;
    const body = {
      colorName: form.colorName?.value?.trim() || "TBD",
      pantoneCode: form.pantoneCode?.value?.trim() || undefined,
      pantoneColorHex: form.pantoneColorHex?.value?.trim() || undefined,
      labDipApprovalDate: form.labDipApprovalDate?.value || null,
      iobApprovalDate: form.iobApprovalDate?.value || null,
      bulkInhouseDate: form.bulkInhouseDate?.value || null,
      lotApprovalDate: form.lotApprovalDate?.value || null,
    };
    Object.keys(body).forEach((k) => { if (body[k] === "") body[k] = null; });
    try {
      const fd = new FormData();
      Object.entries(body).forEach(([k, v]) => { if (v != null && v !== undefined) fd.append(k, v); });
      const file = form.fabricSketch?.files?.[0];
      if (file) fd.append("fabricSketch", file);
      await axiosClient.patch(`/order/update-fabric/${order.fabric._id}`, fd);
      setEditingTab(null);
      dispatch(fetchOrderDetail(orderId));
    } catch (err) {
      setEditError(err.response?.data?.message || err.message || "Failed to save");
    } finally {
      setSaveLoading(false);
    }
  }

  async function handleSaveTechPack(e) {
    e.preventDefault();
    if (!order?.techpackDetails?._id) return;
    setEditError("");
    setSaveLoading(true);
    const form = e.target;
    const body = {
      initialTPDate: form.initialTPDate?.value || null,
      firstFitSubmissionDate: form.firstFitSubmissionDate?.value || null,
      secondFitSubmissionDate: form.secondFitSubmissionDate?.value || null,
      ppApprovalDate: form.ppApprovalDate?.value || null,
    };
    Object.keys(body).forEach((k) => { if (body[k] === "") body[k] = null; });
    try {
      const fd = new FormData();
      Object.entries(body).forEach(([k, v]) => { if (v != null) fd.append(k, v); });
      const techpackFile = form.techpackFile?.files?.[0];
      const fabricSketch = form.fabricSketch?.files?.[0];
      if (techpackFile) fd.append("techpackFile", techpackFile);
      if (fabricSketch) fd.append("fabricSketch", fabricSketch);
      await axiosClient.patch(`/order/update-techpack/${order.techpackDetails._id}`, fd);
      setEditingTab(null);
      dispatch(fetchOrderDetail(orderId));
    } catch (err) {
      setEditError(err.response?.data?.message || err.message || "Failed to save");
    } finally {
      setSaveLoading(false);
    }
  }

  async function handleSaveCosting(e) {
    e.preventDefault();
    if (!order?.costing?._id) return;
    setEditError("");
    setSaveLoading(true);
    const form = e.target;
    const body = {
      fabricCost: form.fabricCost?.value ? Number(form.fabricCost.value) : 0,
      trim: form.trim?.value ? Number(form.trim.value) : 0,
      packagingWithYY: form.packagingWithYY?.value ? Number(form.packagingWithYY.value) : 0,
      washingCost: form.washingCost?.value ? Number(form.washingCost.value) : 0,
      testing: form.testing?.value ? Number(form.testing.value) : 0,
      cutMakingCost: form.cutMakingCost?.value ? Number(form.cutMakingCost.value) : 0,
      overheads: form.overheads?.value ? Number(form.overheads.value) : 0,
      isApproved: (form.isApproved?.checked ?? false) ? "true" : "false",
    };
    try {
      const fd = new FormData();
      Object.entries(body).forEach(([k, v]) => fd.append(k, String(v)));
      const costingSheet = form.costingSheet?.files?.[0];
      const fabricSketch = form.fabricSketch?.files?.[0];
      if (costingSheet) fd.append("costingSheet", costingSheet);
      if (fabricSketch) fd.append("fabricSketch", fabricSketch);
      await axiosClient.patch(`/order/update-costing/${order.costing._id}`, fd);
      setEditingTab(null);
      dispatch(fetchOrderDetail(orderId));
    } catch (err) {
      setEditError(err.response?.data?.message || err.message || "Failed to save");
    } finally {
      setSaveLoading(false);
    }
  }

  async function handleAddComment(e) {
    e.preventDefault();
    if (!orderId || !commentText.trim()) return;
    setCommentSubmitLoading(true);
    setEditError("");
    try {
      await axiosClient.post("/notification/comment", { orderId, text: commentText.trim() });
      setCommentText("");
      const res = await axiosClient.get(`/notification/order/${orderId}/comments`);
      setComments(res.data?.data ?? []);
    } catch (err) {
      setEditError(err.response?.data?.message || err.message || "Failed to post comment");
    } finally {
      setCommentSubmitLoading(false);
    }
  }

  async function handleSaveStatus(e) {
    e.preventDefault();
    if (!orderId) return;
    const newStatus = e.target.status?.value;
    if (!newStatus) return;
    setEditError("");
    setSaveLoading(true);
    try {
      await axiosClient.patch(`/order/update-status/${orderId}`, { status: newStatus });
      setEditingStatus(false);
      dispatch(fetchOrderDetail(orderId));
    } catch (err) {
      setEditError(err.response?.data?.message || err.message || "Failed to update status");
    } finally {
      setSaveLoading(false);
    }
  }

  if (loading && !order) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="min-h-screen bg-base-200 flex flex-col items-center justify-center p-6">
        <p className="text-error mb-4">{error.message || "Order not found."}</p>
        <Link to="/orders" className="btn btn-primary">
          Back to orders
        </Link>
      </div>
    );
  }

  if (!order) return null;

  const styleLabel = order.styleNumber + (order.buyerName ? ` ${order.buyerName}` : "");
  const images = [
    order.previewPhoto?.url,
    order.fabricSketch?.url,
    order.techpackDetails?.techpackFile?.url,
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      <AppNav backTo="/orders" backLabel="Back to orders" />

      <main className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-6">
        <div className="bg-base-100 rounded-lg border border-base-300 shadow-sm overflow-hidden text-base-content">
          <div className="px-5 py-4 border-b border-base-300 bg-base-200/50">
            <span className="text-xs font-bold text-base-content/70 uppercase tracking-wider block mb-1">Style number</span>
            <p className="text-lg font-semibold">{order.styleNumber}</p>
          </div>

          <div role="tablist" className="tabs tabs-boxed tabs-lg bg-base-100 border-b border-base-300 rounded-none overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab}
                role="tab"
                type="button"
                className={`tab whitespace-nowrap ${activeTab === tab ? "tab-active" : ""}`}
                onClick={() => { setActiveTab(tab); setEditingTab(null); setEditError(""); }}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-5 sm:p-6">
            {editError && (
              <div className="alert alert-error text-sm mb-4" role="alert">
                {editError}
              </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4 space-y-4">
                <div>
                  <span className="text-xs font-bold text-base-content/70 uppercase tracking-wider block mb-1">Style number</span>
                  <p className="font-medium">{order.styleNumber}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-base-content/70 uppercase tracking-wider block mb-1">Style</span>
                  <p className="font-medium break-words">{styleLabel}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-base-content/70 uppercase tracking-wider block mb-1">Season</span>
                  <p className="font-medium">{order.season}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-base-content/70 uppercase tracking-wider block mb-1">Brand</span>
                  <p className="font-medium">{order.buyerName}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-base-content/70 uppercase tracking-wider block mb-1">Quantity</span>
                  <p className="font-medium">{order.orderQuantity?.toLocaleString() ?? "—"}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-base-content/70 uppercase tracking-wider block mb-1">Shipment date</span>
                  <p className="font-medium">{formatDate(order.shipmentDate)}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-base-content/70 uppercase tracking-wider block mb-1">Status</span>
                  {editingStatus && canEditStatus ? (
                    <form onSubmit={handleSaveStatus} className="flex flex-wrap items-center gap-2">
                      <select name="status" className="select select-bordered select-sm" defaultValue={order.status}>
                        {statusOptions.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <button type="submit" className="btn btn-primary btn-sm" disabled={saveLoading}>{saveLoading ? "…" : "Save"}</button>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditingStatus(false)}>Cancel</button>
                    </form>
                  ) : (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`badge badge-sm ${
                        order.status === "delivered" ? "badge-success" :
                        order.status === "cancelled" ? "badge-error" :
                        order.status === "in-production" ? "badge-info" : "badge-warning"
                      }`}>
                        {order.status}
                      </span>
                      {canEditStatus && (
                        <button type="button" className="btn btn-sm btn-ghost" onClick={() => setEditingStatus(true)}>Edit</button>
                      )}
                    </div>
                  )}
                </div>
                {order.factory?.organisationName && (
                  <div>
                    <span className="text-xs font-bold text-base-content/70 uppercase tracking-wider block mb-1">Factory</span>
                    <p className="font-medium">{order.factory.organisationName}</p>
                  </div>
                )}
              </div>

              <div className="lg:col-span-8 space-y-6">
                {activeTab === "TNA" && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-base-content/70 uppercase tracking-wider">TNA</h3>
                      {canEditTna && !editingTab && (
                        <button type="button" className="btn btn-sm btn-outline" onClick={() => setEditingTab("TNA")}>
                          Edit
                        </button>
                      )}
                    </div>
                    {editingTab === "TNA" && order.tna ? (
                      <form onSubmit={handleSaveTna} className="space-y-3">
                        {["greigeCommit", "colorCommit", "ppApproval", "cutDate", "gacDate", "tnaClosedWithBuyer"].map((field) => (
                          <div key={field} className="form-control">
                            <label className="label py-0">
                              <span className="label-text text-sm capitalize">{field.replace(/([A-Z])/g, " $1").trim()}</span>
                            </label>
                            <input type="date" name={field} className="input input-bordered input-sm w-full" defaultValue={toInputDate(order.tna[field])} />
                          </div>
                        ))}
                        <div className="form-control">
                          <label className="label py-0"><span className="label-text text-sm">Fabric sketch (optional)</span></label>
                          <input type="file" name="fabricSketch" className="file-input file-input-bordered file-input-sm w-full" accept="image/*" />
                        </div>
                        <div className="flex gap-2">
                          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditingTab(null)}>Cancel</button>
                          <button type="submit" className="btn btn-primary btn-sm" disabled={saveLoading}>{saveLoading ? "Saving…" : "Save"}</button>
                        </div>
                      </form>
                    ) : order.tna ? (
                      <ul className="space-y-2 text-sm">
                        <li><span className="text-base-content/70">Greige commit:</span> {formatDate(order.tna.greigeCommit)}</li>
                        <li><span className="text-base-content/70">Color commit:</span> {formatDate(order.tna.colorCommit)}</li>
                        <li><span className="text-base-content/70">PP approval:</span> {formatDate(order.tna.ppApproval)}</li>
                        <li><span className="text-base-content/70">Cut date:</span> {formatDate(order.tna.cutDate)}</li>
                        <li><span className="text-base-content/70">GAC:</span> {formatDate(order.tna.gacDate)}</li>
                        <li><span className="text-base-content/70">TNA closed with buyer:</span> {formatDate(order.tna.tnaClosedWithBuyer)}</li>
                      </ul>
                    ) : (
                      <p className="text-base-content/70 text-sm">No TNA data yet.</p>
                    )}
                  </div>
                )}

                {activeTab === "Fabric" && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-base-content/70 uppercase tracking-wider">Fabric</h3>
                      {canEditFabric && !editingTab && order.fabric && (
                        <button type="button" className="btn btn-sm btn-outline" onClick={() => setEditingTab("Fabric")}>
                          Edit
                        </button>
                      )}
                    </div>
                    {editingTab === "Fabric" && order.fabric ? (
                      <form onSubmit={handleSaveFabric} className="space-y-3">
                        <div className="form-control">
                          <label className="label py-0"><span className="label-text text-sm">Color name</span></label>
                          <input name="colorName" className="input input-bordered input-sm w-full" defaultValue={order.fabric.colorName} required />
                        </div>
                        <div className="form-control">
                          <label className="label py-0"><span className="label-text text-sm">Pantone code</span></label>
                          <input name="pantoneCode" className="input input-bordered input-sm w-full" defaultValue={order.fabric.pantoneCode} />
                        </div>
                        <div className="form-control">
                          <label className="label py-0"><span className="label-text text-sm">Fabric color (picker)</span></label>
                          <div className="flex items-center gap-3 flex-wrap">
                            <input
                              type="color"
                              name="pantoneColorHex"
                              className="w-full h-10 rounded border-2 border-base-300 cursor-pointer"
                              style={{ minWidth: "12rem" }}
                              defaultValue={toValidHex(order.fabric.pantoneColorHex)}
                              title="Pick fabric color"
                              onChange={(e) => {
                                const textInput = e.target.form?.querySelector(".fabric-hex-input");
                                if (textInput) textInput.value = e.target.value;
                              }}
                            />
                            <input
                              type="text"
                              className="input input-bordered input-sm w-28 fabric-hex-input"
                              placeholder="#rrggbb"
                              defaultValue={toValidHex(order.fabric.pantoneColorHex)}
                              onChange={(e) => {
                                const hex = e.target.value.trim();
                                const colorInput = e.target.form?.querySelector('input[name="pantoneColorHex"]');
                                if (colorInput && /^#?[0-9A-Fa-f]{6}$/.test(hex)) {
                                  colorInput.value = hex.startsWith("#") ? hex : `#${hex}`;
                                }
                              }}
                            />
                          </div>
                          <p className="text-xs text-base-content/60 mt-1">Use the color bar to pick, or enter hex.</p>
                        </div>
                        {["labDipApprovalDate", "iobApprovalDate", "bulkInhouseDate", "lotApprovalDate"].map((field) => (
                          <div key={field} className="form-control">
                            <label className="label py-0"><span className="label-text text-sm">{field.replace(/([A-Z])/g, " $1").trim()}</span></label>
                            <input type="date" name={field} className="input input-bordered input-sm w-full" defaultValue={toInputDate(order.fabric[field])} />
                          </div>
                        ))}
                        <div className="form-control">
                          <label className="label py-0"><span className="label-text text-sm">Fabric sketch (optional)</span></label>
                          <input type="file" name="fabricSketch" className="file-input file-input-bordered file-input-sm w-full" accept="image/*" />
                        </div>
                        <div className="flex gap-2">
                          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditingTab(null)}>Cancel</button>
                          <button type="submit" className="btn btn-primary btn-sm" disabled={saveLoading}>{saveLoading ? "Saving…" : "Save"}</button>
                        </div>
                      </form>
                    ) : order.fabric ? (
                      <div className="space-y-3">
                        <div>
                          <span className="text-xs font-bold text-base-content/70 uppercase tracking-wider block mb-1">Color name</span>
                          <p className="font-medium">{order.fabric.colorName}</p>
                        </div>
                        {order.fabric.pantoneCode && (
                          <div>
                            <span className="text-xs font-bold text-base-content/70 uppercase tracking-wider block mb-1">Pantone code</span>
                            <p className="font-medium">{order.fabric.pantoneCode}</p>
                          </div>
                        )}
                        {order.fabric.pantoneColorHex && (
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-base-content/70 uppercase tracking-wider">Swatch</span>
                            <span className="w-12 h-12 rounded-lg border-2 border-base-300 shrink-0" style={{ backgroundColor: order.fabric.pantoneColorHex }} />
                            {order.fabric.pantoneCode && <span className="text-sm text-base-content/70">{order.fabric.pantoneCode}</span>}
                          </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          <p><span className="text-base-content/70">Lab dip approval:</span> {formatDate(order.fabric.labDipApprovalDate)}</p>
                          <p><span className="text-base-content/70">IOB approval:</span> {formatDate(order.fabric.iobApprovalDate)}</p>
                          <p><span className="text-base-content/70">Bulk in-house:</span> {formatDate(order.fabric.bulkInhouseDate)}</p>
                          <p><span className="text-base-content/70">Lot approval:</span> {formatDate(order.fabric.lotApprovalDate)}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-base-content/70 text-sm">No fabric data yet.</p>
                    )}
                  </div>
                )}

                {activeTab === "Tech Pack" && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-base-content/70 uppercase tracking-wider">Tech pack</h3>
                      {canEditTechPack && !editingTab && order.techpackDetails && (
                        <button type="button" className="btn btn-sm btn-outline" onClick={() => setEditingTab("Tech Pack")}>
                          Edit
                        </button>
                      )}
                    </div>
                    {editingTab === "Tech Pack" && order.techpackDetails ? (
                      <form onSubmit={handleSaveTechPack} className="space-y-3">
                        {["initialTPDate", "firstFitSubmissionDate", "secondFitSubmissionDate", "ppApprovalDate"].map((field) => (
                          <div key={field} className="form-control">
                            <label className="label py-0"><span className="label-text text-sm">{field.replace(/([A-Z])/g, " $1").trim()}</span></label>
                            <input type="date" name={field} className="input input-bordered input-sm w-full" defaultValue={toInputDate(order.techpackDetails[field])} />
                          </div>
                        ))}
                        <div className="form-control">
                          <label className="label py-0"><span className="label-text text-sm">Techpack file (optional)</span></label>
                          <input type="file" name="techpackFile" className="file-input file-input-bordered file-input-sm w-full" accept=".pdf,.zip" />
                        </div>
                        <div className="form-control">
                          <label className="label py-0"><span className="label-text text-sm">Fabric sketch (optional)</span></label>
                          <input type="file" name="fabricSketch" className="file-input file-input-bordered file-input-sm w-full" accept="image/*" />
                        </div>
                        <div className="flex gap-2">
                          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditingTab(null)}>Cancel</button>
                          <button type="submit" className="btn btn-primary btn-sm" disabled={saveLoading}>{saveLoading ? "Saving…" : "Save"}</button>
                        </div>
                      </form>
                    ) : order.techpackDetails ? (
                      <div className="space-y-2 text-sm">
                        <p><span className="text-base-content/70">Initial TP:</span> {formatDate(order.techpackDetails.initialTPDate)}</p>
                        <p><span className="text-base-content/70">1st fit submission:</span> {formatDate(order.techpackDetails.firstFitSubmissionDate)}</p>
                        <p><span className="text-base-content/70">2nd fit submission:</span> {formatDate(order.techpackDetails.secondFitSubmissionDate)}</p>
                        <p><span className="text-base-content/70">PP approval date:</span> {formatDate(order.techpackDetails.ppApprovalDate)}</p>
                        {order.techpackDetails.techpackFile?.url && (
                          <a href={order.techpackDetails.techpackFile.url} target="_blank" rel="noreferrer" className="link link-primary text-sm">Open techpack file</a>
                        )}
                      </div>
                    ) : (
                      <p className="text-base-content/70 text-sm">No tech pack data yet.</p>
                    )}
                  </div>
                )}

                {activeTab === "Costing" && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-base-content/70 uppercase tracking-wider">Costing</h3>
                      {canEditCosting && !editingTab && order.costing && (
                        <button type="button" className="btn btn-sm btn-outline" onClick={() => setEditingTab("Costing")}>
                          Edit
                        </button>
                      )}
                    </div>
                    {editingTab === "Costing" && order.costing ? (
                      <form onSubmit={handleSaveCosting} className="space-y-3">
                        {["fabricCost", "trim", "packagingWithYY", "washingCost", "testing", "cutMakingCost", "overheads"].map((field) => (
                          <div key={field} className="form-control">
                            <label className="label py-0"><span className="label-text text-sm">{field.replace(/([A-Z])/g, " $1").trim()}</span></label>
                            <input type="number" step="0.01" name={field} className="input input-bordered input-sm w-full" defaultValue={order.costing[field] ?? ""} />
                          </div>
                        ))}
                        <div className="form-control">
                          <label className="label cursor-pointer gap-2 justify-start">
                            <input type="checkbox" name="isApproved" className="checkbox checkbox-sm" defaultChecked={order.costing.isApproved} />
                            <span className="label-text">Approved</span>
                          </label>
                        </div>
                        <div className="form-control">
                          <label className="label py-0"><span className="label-text text-sm">Costing sheet (optional)</span></label>
                          <input type="file" name="costingSheet" className="file-input file-input-bordered file-input-sm w-full" accept=".pdf,.zip" />
                        </div>
                        <div className="form-control">
                          <label className="label py-0"><span className="label-text text-sm">Fabric sketch (optional)</span></label>
                          <input type="file" name="fabricSketch" className="file-input file-input-bordered file-input-sm w-full" accept="image/*" />
                        </div>
                        <div className="flex gap-2">
                          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditingTab(null)}>Cancel</button>
                          <button type="submit" className="btn btn-primary btn-sm" disabled={saveLoading}>{saveLoading ? "Saving…" : "Save"}</button>
                        </div>
                      </form>
                    ) : order.costing ? (
                      <div className="space-y-2 text-sm">
                        <p><span className="text-base-content/70">Fabric cost:</span> {order.costing.fabricCost != null ? `$ ${order.costing.fabricCost.toFixed(2)}` : "—"}</p>
                        <p><span className="text-base-content/70">Trim:</span> {order.costing.trim != null ? `$ ${order.costing.trim.toFixed(2)}` : "—"}</p>
                        <p><span className="text-base-content/70">Packaging with Y/Y:</span> {order.costing.packagingWithYY != null ? `$ ${order.costing.packagingWithYY.toFixed(2)}` : "—"}</p>
                        <p><span className="text-base-content/70">Washing cost:</span> {order.costing.washingCost != null ? `$ ${order.costing.washingCost.toFixed(2)}` : "—"}</p>
                        <p><span className="text-base-content/70">Testing:</span> {order.costing.testing != null ? `$ ${order.costing.testing.toFixed(2)}` : "—"}</p>
                        <p><span className="text-base-content/70">Cut making cost:</span> {order.costing.cutMakingCost != null ? `$ ${order.costing.cutMakingCost.toFixed(2)}` : "—"}</p>
                        <p><span className="text-base-content/70">Overheads:</span> {order.costing.overheads != null ? `$ ${order.costing.overheads.toFixed(2)}` : "—"}</p>
                        <p className="font-semibold pt-2 border-t border-base-300 mt-2">Final cost: {order.costing.finalCost != null ? `$ ${order.costing.finalCost.toFixed(2)}` : "—"}</p>
                        <p><span className="text-base-content/70">Approved:</span> {order.costing.isApproved ? "Yes" : "No"}</p>
                        {order.costing.costingSheet?.url && (
                          <a href={order.costing.costingSheet.url} target="_blank" rel="noreferrer" className="link link-primary text-sm">Open costing sheet</a>
                        )}
                      </div>
                    ) : (
                      <p className="text-base-content/70 text-sm">No costing data yet.</p>
                    )}
                  </div>
                )}

                <div className="pt-4 border-t border-base-300">
                  <span className="text-xs font-bold text-base-content/70 uppercase tracking-wider block mb-3">Visuals</span>
                  <div className="flex flex-wrap gap-3">
                    {images.length > 0 ? (
                      images.slice(0, 3).map((url, i) => (
                        <div key={i} className="w-28 h-28 sm:w-36 sm:h-36 rounded-lg overflow-hidden border-2 border-base-300 bg-base-200">
                          {url && (url.match(/\.(pdf|zip)$/i) ? (
                            <a href={url} target="_blank" rel="noreferrer" className="flex items-center justify-center h-full text-xs font-medium link link-primary">View file</a>
                          ) : (
                            <img src={url} alt="" className="w-full h-full object-cover" />
                          ))}
                        </div>
                      ))
                    ) : (
                      [1, 2, 3].map((i) => (
                        <div key={i} className="w-28 h-28 sm:w-36 sm:h-36 rounded-lg border-2 border-dashed border-base-300 bg-base-200 flex items-center justify-center text-base-content/60 text-xs">No image</div>
                      ))
                    )}
                  </div>
                </div>

                <div className="pt-6 border-t border-base-300">
                  <span className="text-xs font-bold text-base-content/70 uppercase tracking-wider block mb-3">Comment history</span>
                  {commentsLoading ? (
                    <div className="flex justify-center py-4"><span className="loading loading-spinner loading-sm" /></div>
                  ) : (
                    <>
                      <ul className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                        {comments.length === 0 ? (
                          <li className="text-sm text-base-content/60">No comments yet.</li>
                        ) : (
                          comments.map((c) => (
                            <li key={c._id} className="bg-base-200 rounded-lg p-3 text-sm">
                              <p className="font-medium text-base-content/90">
                                {c.sender?.firstName && c.sender?.lastName
                                  ? `${c.sender.firstName} ${c.sender.lastName}`
                                  : c.sender?.organisationName || c.sender?.emailId || "Someone"}
                                {c.sender?.role && (
                                  <span className="ml-2 badge badge-ghost badge-sm">{c.sender.role}</span>
                                )}
                              </p>
                              <p className="mt-1 text-base-content">{c.text}</p>
                              <p className="text-xs text-base-content/60 mt-1">{formatDate(c.createdAt)}</p>
                            </li>
                          ))
                        )}
                      </ul>
                      <form onSubmit={handleAddComment} className="flex gap-2 flex-wrap">
                        <textarea
                          className="textarea textarea-bordered textarea-sm flex-1 min-w-[200px] min-h-[80px]"
                          placeholder="Add a comment…"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          disabled={commentSubmitLoading}
                        />
                        <button type="submit" className="btn btn-primary btn-sm self-end" disabled={commentSubmitLoading || !commentText.trim()}>
                          {commentSubmitLoading ? "Sending…" : "Post comment"}
                        </button>
                      </form>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
