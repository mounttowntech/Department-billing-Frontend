import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  X,
  Save,
  Wallet,
  Lock,
  Unlock,
  IndianRupee,
} from "lucide-react";

import {
  getCashSessions,
  createCashSession,
  updateCashSession,
  deleteCashSession,
} from "../../../services/CashsessionService";

import { getStores } from "../../../services/storeService";
import "./Cashsession.css";

const emptyForm = {
  sessionNo: "",
  store: "",
  cashier: "",
  openingBalance: 0,
  closingBalance: 0,
  cashSales: 0,
  expenseCash: 0,
  status: "open",
  notes: "",
};

const Cashsession = () => {
  const [sessions, setSessions] = useState([]);
  const [stores, setStores] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingStores, setLoadingStores] = useState(false);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [viewingSession, setViewingSession] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const loadStores = async () => {
    try {
      setLoadingStores(true);
      const response = await getStores();
      const storeData =
        response?.data?.data ||
        response?.data?.stores ||
        response?.data ||
        response?.stores ||
        (Array.isArray(response) ? response : []);

      setStores(Array.isArray(storeData) ? storeData : []);
    } catch (error) {
      console.error("Load Stores Error:", error);
    } finally {
      setLoadingStores(false);
    }
  };

  const loadSessions = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) {
        params.status = statusFilter;
      }

      const response = await getCashSessions(params);
      const data =
        response?.data?.data ||
        response?.data?.sessions ||
        response?.data ||
        [];
      setSessions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Load Cash Sessions Error:", error);
      alert(error?.response?.data?.message || "Failed to load cash sessions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStores();
  }, []);

  useEffect(() => {
    loadSessions();
  }, [statusFilter]);

  const getStoreName = (storeField) => {
    if (!storeField) return "—";

    if (typeof storeField === "object" && storeField !== null) {
      return storeField.storeName || storeField.name || storeField.title || "—";
    }

    const idStr = String(storeField).trim();
    const matched = stores.find((s) => String(s._id || s.id).trim() === idStr);

    if (matched) {
      return matched.storeName || matched.name || matched.title || "—";
    }

    if (
      typeof storeField === "string" &&
      !/^[0-9a-fA-F]{24}$/.test(storeField)
    ) {
      return storeField;
    }

    return "—";
  };

  const filteredSessions = useMemo(() => {
    const value = search.trim().toLowerCase();
    if (!value) return sessions;

    return sessions.filter((session) => {
      const storeDisplay = getStoreName(session.store).toLowerCase();
      return (
        String(session.sessionNo || "")
          .toLowerCase()
          .includes(value) ||
        storeDisplay.includes(value) ||
        String(session.cashier || "")
          .toLowerCase()
          .includes(value) ||
        String(session.status || "")
          .toLowerCase()
          .includes(value)
      );
    });
  }, [sessions, search, stores]);

  const summary = useMemo(() => {
    const open = sessions.filter((item) => item.status === "open").length;
    const closed = sessions.filter((item) => item.status === "closed").length;
    const sales = sessions.reduce(
      (sum, item) => sum + Number(item.cashSales || 0),
      0,
    );

    return { total: sessions.length, open, closed, sales };
  }, [sessions]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const openCreateModal = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setShowModal(true);
  };

  const openEditModal = (session) => {
    if (session.status === "closed") {
      alert("Closed cash sessions cannot be edited.");
      return;
    }

    setEditingId(session._id);
    setForm({
      sessionNo: session.sessionNo || "",
      store: session.store?._id || session.store || "",
      cashier: session.cashier || "",
      openingBalance: session.openingBalance ?? 0,
      closingBalance: session.closingBalance ?? 0,
      cashSales: session.cashSales ?? 0,
      expenseCash: session.expenseCash ?? 0,
      status: session.status || "open",
      notes: session.notes || "",
    });

    setShowModal(true);
  };

  const openViewModal = (session) => {
    setViewingSession(session);
    setShowViewModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.sessionNo.trim()) {
      alert("Session No is required");
      return;
    }

    if (!form.store) {
      alert("Please select a store");
      return;
    }

    if (!form.cashier.trim()) {
      alert("Cashier ID / Number is required");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        sessionNo: form.sessionNo.trim(),
        store: form.store,
        cashier: form.cashier.trim(),
        openingBalance: Number(form.openingBalance || 0),
        closingBalance: Number(form.closingBalance || 0),
        cashSales: Number(form.cashSales || 0),
        expenseCash: Number(form.expenseCash || 0),
        status: form.status,
        notes: form.notes?.trim() || "",
      };

      if (editingId) {
        await updateCashSession(editingId, payload);
        alert("Cash Session updated successfully");
      } else {
        await createCashSession(payload);
        alert("Cash Session created successfully");
      }

      setShowModal(false);
      setEditingId(null);
      setForm({ ...emptyForm });
      await loadSessions();
    } catch (error) {
      console.error("Save Cash Session Error:", error);
      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to save Cash Session.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (session) => {
    if (session.status === "closed") {
      alert("Closed cash sessions cannot be deleted.");
      return;
    }

    const confirmed = window.confirm(`Delete session ${session.sessionNo}?`);
    if (!confirmed) return;

    try {
      setSaving(true);
      await deleteCashSession(session._id);
      alert("Cash Session deleted successfully");
      await loadSessions();
    } catch (error) {
      console.error("Delete Cash Session Error:", error);
      alert(error?.response?.data?.message || "Failed to delete cash session");
    } finally {
      setSaving(false);
    }
  };

  const closeSession = async (session) => {
    if (session.status === "closed") {
      alert("This cash session is already closed.");
      return;
    }

    const closingBalance = window.prompt(
      "Enter actual closing cash:",
      session.closingBalance || 0,
    );

    if (closingBalance === null) return;

    const value = Number(closingBalance);
    if (Number.isNaN(value) || value < 0) {
      alert("Please enter a valid closing balance");
      return;
    }

    try {
      setSaving(true);
      await updateCashSession(session._id, {
        closingBalance: value,
        status: "closed",
      });

      alert("Cash Session closed successfully");
      await loadSessions();
    } catch (error) {
      console.error("Close Cash Session Error:", error);
      alert(error?.response?.data?.message || "Failed to close cash session");
    } finally {
      setSaving(false);
    }
  };

  const money = (value) => {
    return `₹${Number(value || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    })}`;
  };

  const formatDate = (value) => {
    if (!value) return "—";
    const d = new Date(value);
    return (
      <div className="cashsession-date-col">
        <span>
          {d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
        </span>
        <small>
          {d.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </small>
      </div>
    );
  };

  const expectedClosing =
    Number(form.openingBalance || 0) +
    Number(form.cashSales || 0) -
    Number(form.expenseCash || 0);

  const difference = Number(form.closingBalance || 0) - expectedClosing;

  return (
    <div className="cashsession-page">
      <div className="cashsession-content">
        <div className="cashsession-page-header">
          <div>
            <h2>Cash Sessions</h2>
            <p>Manage opening and closing cash sessions across stores.</p>
          </div>

          <button className="cashsession-primary-btn" onClick={openCreateModal}>
            <Plus size={18} />
            New Session
          </button>
        </div>

        <div className="cashsession-toolbar">
          <div className="cashsession-search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search session, store or cashier..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                className="cashsession-clear-search"
                onClick={() => setSearch("")}
              >
                <X size={15} />
              </button>
            )}
          </div>

          <select
            className="cashsession-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <div className="cashsession-summary-grid">
          <div className="cashsession-summary-card card-blue">
            <div className="cashsession-summary-icon">
              <Wallet size={22} />
            </div>
            <div>
              <h2>{summary.total}</h2>
              <p>Total Sessions</p>
            </div>
          </div>

          <div className="cashsession-summary-card card-green">
            <div className="cashsession-summary-icon">
              <Unlock size={22} />
            </div>
            <div>
              <h2>{summary.open}</h2>
              <p>Open Sessions</p>
            </div>
          </div>

          <div className="cashsession-summary-card card-purple">
            <div className="cashsession-summary-icon">
              <Lock size={22} />
            </div>
            <div>
              <h2>{summary.closed}</h2>
              <p>Closed Sessions</p>
            </div>
          </div>

          <div className="cashsession-summary-card card-amber">
            <div className="cashsession-summary-icon">
              <IndianRupee size={22} />
            </div>
            <div>
              <h2>{money(summary.sales)}</h2>
              <p>Cash Sales</p>
            </div>
          </div>
        </div>

        <div className="cashsession-table-card">
          <table className="cashsession-table">
            <thead>
              <tr>
                <th style={{ width: "10%" }}>Session</th>
                <th style={{ width: "11%" }}>Store</th>
                <th style={{ width: "8%" }}>Cashier</th>
                <th style={{ width: "8%" }}>Opening</th>
                <th style={{ width: "9%" }}>Sales</th>
                <th style={{ width: "8%" }}>Expenses</th>
                <th style={{ width: "8%" }}>Closing</th>
                <th style={{ width: "8%" }}>Difference</th>
                <th style={{ width: "10%" }}>Status</th>
                <th style={{ width: "9%" }}>Opened At</th>
                <th style={{ width: "19%" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="11" className="cashsession-empty-row">
                    <RefreshCw size={20} className="cashsession-spin" />
                    <span>Loading cash sessions...</span>
                  </td>
                </tr>
              ) : filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan="11" className="cashsession-empty-row">
                    No cash sessions found.
                  </td>
                </tr>
              ) : (
                filteredSessions.map((session) => {
                  const sessionDifference = Number(session.difference || 0);

                  return (
                    <tr
                      key={session._id}
                      className={
                        session.status === "closed"
                          ? "cashsession-closed-row"
                          : ""
                      }
                    >
                      <td>
                        <strong className="cashsession-number">
                          {session.sessionNo}
                        </strong>
                      </td>

                      <td
                        className="cashsession-store-text"
                        title={getStoreName(session.store)}
                      >
                        {getStoreName(session.store)}
                      </td>

                      <td>{session.cashier || "—"}</td>

                      <td>{money(session.openingBalance)}</td>

                      <td className="cashsession-green-text">
                        {money(session.cashSales)}
                      </td>

                      <td className="cashsession-red-text">
                        {money(session.expenseCash)}
                      </td>

                      <td>{money(session.closingBalance)}</td>

                      <td>
                        <strong
                          className={
                            sessionDifference >= 0
                              ? "cashsession-green-text"
                              : "cashsession-red-text"
                          }
                        >
                          {money(sessionDifference)}
                        </strong>
                      </td>

                      <td>
                        <span
                          className={`badge ${
                            session.status === "open" ? "paid" : "purple"
                          }`}
                        >
                          {session.status}
                        </span>
                      </td>

                      <td>{formatDate(session.openedAt)}</td>

                      <td>
                        <div className="cashsession-actions">
                          <button
                            className="cashsession-action-btn view-btn"
                            title="View"
                            onClick={() => openViewModal(session)}
                          >
                            <Eye size={15} />
                          </button>

                          {session.status === "open" ? (
                            <>
                              <button
                                className="cashsession-action-btn edit-btn"
                                title="Edit"
                                onClick={() => openEditModal(session)}
                              >
                                <Edit size={15} />
                              </button>

                              <button
                                className="cashsession-action-btn close-btn"
                                title="Close Session"
                                onClick={() => closeSession(session)}
                              >
                                <Lock size={15} />
                              </button>

                              <button
                                className="cashsession-action-btn delete-btn"
                                title="Delete"
                                onClick={() => handleDelete(session)}
                              >
                                <Trash2 size={15} />
                              </button>
                            </>
                          ) : (
                            <span className="cashsession-locked-hint">
                              <Lock size={13} /> Locked
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div
          className="cashsession-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !saving) {
              setShowModal(false);
            }
          }}
        >
          <div className="cashsession-modal">
            <div className="cashsession-modal-header">
              <h3>{editingId ? "Edit Cash Session" : "New Cash Session"}</h3>
              <button
                className="cashsession-close-btn"
                onClick={() => setShowModal(false)}
                disabled={saving}
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="cashsession-modal-form-wrapper"
            >
              <div className="cashsession-modal-body">
                <h4 className="cashsession-section-title">
                  Session Information
                </h4>

                <div className="cashsession-form-grid">
                  <div className="cashsession-form-group">
                    <label>Session No *</label>
                    <input
                      type="text"
                      name="sessionNo"
                      value={form.sessionNo}
                      onChange={handleChange}
                      placeholder="Enter session number"
                      required
                    />
                  </div>

                  <div className="cashsession-form-group">
                    <label>Store *</label>
                    <select
                      name="store"
                      value={form.store}
                      onChange={handleChange}
                      required
                      disabled={loadingStores}
                    >
                      <option value="">
                        {loadingStores ? "Loading stores..." : "Select Store"}
                      </option>
                      {stores.map((store) => (
                        <option key={store._id} value={store._id}>
                          {store.storeName || store.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="cashsession-form-group">
                    <label>Cashier ID / Number *</label>
                    <input
                      type="text"
                      name="cashier"
                      value={form.cashier}
                      onChange={handleChange}
                      placeholder="Enter cashier ID / number"
                      required
                    />
                  </div>

                  <div className="cashsession-form-group">
                    <label>Status</label>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      disabled={Boolean(editingId)}
                    >
                      <option value="open">Open</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>

                <h4 className="cashsession-section-title">Cash Details</h4>

                <div className="cashsession-form-grid">
                  <div className="cashsession-form-group">
                    <label>Opening Balance</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      name="openingBalance"
                      value={form.openingBalance}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="cashsession-form-group">
                    <label>Cash Sales</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      name="cashSales"
                      value={form.cashSales}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="cashsession-form-group">
                    <label>Expense Cash</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      name="expenseCash"
                      value={form.expenseCash}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="cashsession-form-group">
                    <label>Closing Balance</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      name="closingBalance"
                      value={form.closingBalance}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="cashsession-calculation">
                  <div className="cashsession-calc-item">
                    <span>Opening</span>
                    <strong>{money(form.openingBalance)}</strong>
                  </div>

                  <div className="cashsession-calc-item">
                    <span>Cash Sales</span>
                    <strong className="cashsession-green-text">
                      {money(form.cashSales)}
                    </strong>
                  </div>

                  <div className="cashsession-calc-item">
                    <span>Expenses</span>
                    <strong className="cashsession-red-text">
                      {money(form.expenseCash)}
                    </strong>
                  </div>

                  <div className="cashsession-calc-item">
                    <span>Expected Closing</span>
                    <strong>{money(expectedClosing)}</strong>
                  </div>

                  <div className="cashsession-calc-item">
                    <span>Difference</span>
                    <strong
                      className={
                        difference >= 0
                          ? "cashsession-green-text"
                          : "cashsession-red-text"
                      }
                    >
                      {money(difference)}
                    </strong>
                  </div>
                </div>

                <div className="cashsession-form-group cashsession-full">
                  <label>Notes</label>
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    placeholder="Enter session notes..."
                    rows="3"
                  />
                </div>
              </div>

              <div className="cashsession-modal-footer">
                <button
                  type="button"
                  className="cashsession-cancel-btn"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="cashsession-save-btn"
                  disabled={saving}
                >
                  <Save size={18} />
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Session"
                      : "Create Session"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showViewModal && viewingSession && (
        <div
          className="cashsession-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setShowViewModal(false);
            }
          }}
        >
          <div className="cashsession-modal cashsession-view-modal">
            <div className="cashsession-modal-header">
              <h3>Cash Session Details — {viewingSession.sessionNo}</h3>
              <button
                className="cashsession-close-btn"
                onClick={() => setShowViewModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="cashsession-modal-body">
              <div className="cashsession-detail-grid">
                <div>
                  <span>Session No</span>
                  <strong>{viewingSession.sessionNo}</strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong>
                    <span
                      className={`badge ${
                        viewingSession.status === "open" ? "paid" : "purple"
                      }`}
                    >
                      {viewingSession.status}
                    </span>
                  </strong>
                </div>

                <div>
                  <span>Store</span>
                  <strong>{getStoreName(viewingSession.store)}</strong>
                </div>

                <div>
                  <span>Cashier ID</span>
                  <strong>{viewingSession.cashier || "—"}</strong>
                </div>

                <div>
                  <span>Opening Balance</span>
                  <strong>{money(viewingSession.openingBalance)}</strong>
                </div>

                <div>
                  <span>Cash Sales</span>
                  <strong className="cashsession-green-text">
                    {money(viewingSession.cashSales)}
                  </strong>
                </div>

                <div>
                  <span>Expense Cash</span>
                  <strong className="cashsession-red-text">
                    {money(viewingSession.expenseCash)}
                  </strong>
                </div>

                <div>
                  <span>Expected Closing</span>
                  <strong>
                    {money(
                      viewingSession.expectedClosingBalance || expectedClosing,
                    )}
                  </strong>
                </div>

                <div>
                  <span>Actual Closing</span>
                  <strong>{money(viewingSession.closingBalance)}</strong>
                </div>

                <div>
                  <span>Difference</span>
                  <strong
                    className={
                      Number(viewingSession.difference || 0) >= 0
                        ? "cashsession-green-text"
                        : "cashsession-red-text"
                    }
                  >
                    {money(viewingSession.difference)}
                  </strong>
                </div>

                <div>
                  <span>Opened At</span>
                  <strong>
                    {new Date(viewingSession.openedAt).toLocaleString("en-IN")}
                  </strong>
                </div>

                <div>
                  <span>Closed At</span>
                  <strong>
                    {viewingSession.closedAt
                      ? new Date(viewingSession.closedAt).toLocaleString(
                          "en-IN",
                        )
                      : "—"}
                  </strong>
                </div>
              </div>

              {viewingSession.notes && (
                <div className="cashsession-notes">
                  <span>Notes</span>
                  <p>{viewingSession.notes}</p>
                </div>
              )}
            </div>

            <div className="cashsession-modal-footer">
              <button
                type="button"
                className="cashsession-cancel-btn"
                onClick={() => setShowViewModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cashsession;
