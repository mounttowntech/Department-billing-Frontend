import React, { useEffect, useMemo, useState } from "react";
import "./Returns.css";

import {
  Search,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  RotateCcw,
  PackageCheck,
  IndianRupee,
} from "lucide-react";

import {
  getSalesReturns,
  createSalesReturn,
  updateSalesReturn,
  deleteSalesReturn,
} from "../../../services/returnService";

import { getStores } from "../../../services/storeService";
import api from "../../../api/axios";

const RETURN_TYPES = [
  { value: "refund", label: "Refund" },
  { value: "exchange", label: "Exchange" },
  { value: "credit_note", label: "Credit Note" },
];

const REFUND_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "upi", label: "UPI" },
  { value: "card", label: "Card" },
  { value: "wallet", label: "Wallet" },
  { value: "credit", label: "Credit" },
];

const resolvePrice = (item) =>
  item?.salesPrice ?? item?.price ?? item?.rate ?? item?.unitPrice ?? 0;

const getToday = () => new Date().toISOString().slice(0, 10);

const emptyForm = {
  returnNo: "",
  invoice: "",
  invoiceNo: "",
  customer: "",
  store: "",
  warehouse: "",
  returnDate: getToday(),
  returnType: "refund",
  refundMethod: "cash",
  reason: "",
  remarks: "",
};

export default function SalesReturn() {
  const [returns, setReturns] = useState([]);
  const [stores, setStores] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [search, setSearch] = useState("");
  const [storeFilter, setStoreFilter] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const [invoiceQuery, setInvoiceQuery] = useState("");
  const [invoiceResults, setInvoiceResults] = useState([]);
  const [searchingInvoice, setSearchingInvoice] = useState(false);
  const [loadedInvoice, setLoadedInvoice] = useState(null);

  const [returnItems, setReturnItems] = useState([]);

  const fetchReturns = async () => {
    try {
      setLoading(true);

      const params = {
        search: search || undefined,
        store: storeFilter || undefined,
        warehouse: warehouseFilter || undefined,
        returnType: typeFilter || undefined,
      };

      const res = await getSalesReturns(params);

      setReturns(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      console.log(err);
      setReturns([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStores = async () => {
    try {
      const res = await getStores();

      if (res?.success) {
        setStores(res.data || []);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const fetchWarehouses = async (storeId = "") => {
    try {
      const params = storeId ? { store: storeId } : {};
      const res = await api.get("/warehouses/all", { params });

      setWarehouses(res.data?.data || res.data?.warehouses || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchStores();
    fetchWarehouses();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReturns();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, storeFilter, warehouseFilter, typeFilter]);

  const filteredReturns = useMemo(() => returns, [returns]);

  const totalReturns = returns.length;

  const totalRefund = returns.reduce(
    (sum, r) => sum + Number(r.refundAmount || 0),
    0,
  );

  const totalItemsReturned = returns.reduce(
    (sum, r) => sum + Number(r.totalQuantity || 0),
    0,
  );

  const generateReturnNumber = () => {
    const existingNumbers = returns
      .map((item) => item.returnNo)
      .filter(Boolean)
      .map((value) => {
        const match = String(value).match(/(\d+)$/);
        return match ? Number(match[1]) : 0;
      });

    const maxNumber =
      existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;

    const nextNumber = maxNumber + 1;

    return `RET-${String(nextNumber).padStart(4, "0")}`;
  };

  // STORE & WAREHOUSE AWARE INVOICE SEARCH
  const searchInvoices = async (value) => {
    const query = value.trim();

    if (!query) {
      setInvoiceResults([]);
      return;
    }

    try {
      setSearchingInvoice(true);

      const params = {
        search: query,
      };

      if (formData.store) {
        params.store = formData.store;
      }
      if (formData.warehouse) {
        params.warehouse = formData.warehouse;
      }

      const res = await api.get("/sales-invoices/all", { params });

      setInvoiceResults(res.data?.data || []);
    } catch (err) {
      console.log(err);
      setInvoiceResults([]);
    } finally {
      setSearchingInvoice(false);
    }
  };

  const handleInvoiceQueryChange = (e) => {
    const value = e.target.value;

    setInvoiceQuery(value);

    if (!value.trim()) {
      setInvoiceResults([]);
      return;
    }

    searchInvoices(value);
  };

  const selectInvoice = async (invoiceSummary) => {
    try {
      const res = await api.get(`/sales-invoices/${invoiceSummary._id}`);

      const invoice = res.data?.data || res.data;

      setLoadedInvoice(invoice);

      setInvoiceResults([]);
      setInvoiceQuery("");

      setFormData((prev) => ({
        ...prev,

        invoice: invoice._id,

        invoiceNo: invoice.invoiceNo || "",

        customer: invoice.customer?._id || invoice.customer || "",

        store: invoice.store?._id || invoice.store || prev.store,

        warehouse: invoice.warehouse?._id || invoice.warehouse || prev.warehouse,
      }));

      const rows = (invoice.items || []).map((line) => ({
        product: line.product?._id || line.product,

        productName: line.product?.productName || line.productName || "Unknown",

        variant: line.variant?._id || line.variant || "",

        variantName: line.variant?.variantName || "",

        batch: line.batch?._id || line.batch || "",

        batchNumber: line.batch?.batchNumber || "",

        skuCode: line.variant?.skuCode || line.skuCode || "",

        barcode: line.variant?.barcode || line.barcode || "",

        invoiceQuantity: Number(line.quantity || 0),

        quantity: 0,

        salesPrice: resolvePrice(line),

        discount: Number(line.discount || 0),

        gstPercentage: Number(line.gstPercentage || 0),

        reason: "",

        checked: false,
      }));

      setReturnItems(rows);
    } catch (err) {
      console.log(err);

      alert("Unable to load that invoice's items.");
    }
  };

  const updateReturnItem = (index, key, value) => {
    setReturnItems((prev) =>
      prev.map((row, i) =>
        i === index
          ? {
              ...row,
              [key]: value,
            }
          : row,
      ),
    );
  };

  const updateField = (key, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [key]: value };
      if (key === "store") {
        fetchWarehouses(value);
        updated.warehouse = "";
        resetInvoiceState();
      }
      if (key === "warehouse") {
        resetInvoiceState();
      }
      return updated;
    });
  };

  const resetInvoiceState = () => {
    setInvoiceQuery("");
    setInvoiceResults([]);
    setLoadedInvoice(null);
    setReturnItems([]);
    setFormData((prev) => ({
      ...prev,
      invoice: "",
      invoiceNo: "",
      customer: "",
    }));
  };

  const openAddModal = () => {
    setEditingId(null);

    const newReturnNo = generateReturnNumber();

    setFormData({
      ...emptyForm,
      returnNo: newReturnNo,
    });

    resetInvoiceState();

    setShowModal(true);
  };

  const openEditModal = async (item) => {
    setEditingId(item._id);
    const storeId = item.store?._id || item.store || "";

    if (storeId) {
      fetchWarehouses(storeId);
    }

    setFormData({
      returnNo: item.returnNo || "",

      invoice: item.invoice?._id || item.invoice || "",

      invoiceNo: item.invoice?.invoiceNo || "",

      customer: item.customer?._id || item.customer || "",

      store: storeId,

      warehouse: item.warehouse?._id || item.warehouse || "",

      returnDate: item.returnDate
        ? new Date(item.returnDate).toISOString().slice(0, 10)
        : getToday(),

      returnType: item.returnType || "refund",

      refundMethod: item.refundMethod || "cash",

      reason: item.reason || "",

      remarks: item.remarks || "",
    });

    let invoiceLines = [];

    const invoiceId = item.invoice?._id || item.invoice;

    if (invoiceId) {
      try {
        const res = await api.get(`/sales-invoices/${invoiceId}`);

        const invoice = res.data?.data || res.data;

        setLoadedInvoice(invoice);

        invoiceLines = invoice?.items || [];
      } catch (err) {
        console.log("Could not reload invoice for edit:", err);
      }
    }

    const findInvoiceLine = (line) =>
      invoiceLines.find((invLine) => {
        const sameProduct =
          String(invLine.product?._id || invLine.product) ===
          String(line.product?._id || line.product);

        const sameVariant =
          String(invLine.variant?._id || invLine.variant || "") ===
          String(line.variant?._id || line.variant || "");

        const sameBatch =
          String(invLine.batch?._id || invLine.batch || "") ===
          String(line.batch?._id || line.batch || "");

        return sameProduct && sameVariant && sameBatch;
      });

    const rows = (item.items || []).map((line) => {
      const invoiceLine = findInvoiceLine(line);

      return {
        product: line.product?._id || line.product,

        productName: line.product?.productName || line.productName || "Unknown",

        variant: line.variant?._id || line.variant || "",

        variantName: line.variant?.variantName || "",

        batch: line.batch?._id || line.batch || "",

        batchNumber: line.batch?.batchNumber || "",

        skuCode: line.skuCode || line.variant?.skuCode || "",

        barcode: line.barcode || line.variant?.barcode || "",

        invoiceQuantity: Number(invoiceLine?.quantity ?? line.quantity ?? 0),

        quantity: Number(line.quantity || 0),

        salesPrice: Number(line.salesPrice || 0),

        discount: Number(line.discount || 0),

        gstPercentage: Number(line.gstPercentage || 0),

        reason: line.reason || "",

        checked: true,
      };
    });

    setReturnItems(rows);

    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);

    setEditingId(null);

    setFormData(emptyForm);

    resetInvoiceState();
  };

  const handleSubmit = async () => {
    const selected = returnItems.filter(
      (row) => row.checked && Number(row.quantity) > 0,
    );

    if (!formData.returnNo.trim()) {
      alert("Return No is required.");
      return;
    }

    if (!formData.invoice) {
      alert("Select an invoice first.");
      return;
    }

    if (!formData.store) {
      alert("Store is required.");
      return;
    }

    if (!formData.warehouse) {
      alert("Warehouse is required.");
      return;
    }

    if (selected.length === 0) {
      alert("Select at least one item to return, with a quantity.");
      return;
    }

    for (const row of selected) {
      if (Number(row.quantity) > Number(row.invoiceQuantity)) {
        alert(`${row.productName}: return quantity exceeds invoice quantity.`);
        return;
      }
    }

    try {
      setSaving(true);

      const payload = {
        returnNo: formData.returnNo,

        invoice: formData.invoice,

        customer: formData.customer || undefined,

        store: formData.store,

        warehouse: formData.warehouse,

        returnDate: formData.returnDate,

        returnType: formData.returnType,

        refundMethod: formData.refundMethod,

        reason: formData.reason,

        remarks: formData.remarks,

        items: selected.map((row) => ({
          product: row.product,

          variant: row.variant || undefined,

          batch: row.batch || undefined,

          skuCode: row.skuCode,

          barcode: row.barcode,

          productName: row.productName,

          quantity: Number(row.quantity),

          salesPrice: Number(row.salesPrice),

          discount: Number(row.discount || 0),

          gstPercentage: Number(row.gstPercentage || 0),

          reason: row.reason || "",
        })),
      };

      if (editingId) {
        await updateSalesReturn(editingId, payload);
      } else {
        await createSalesReturn(payload);
      }

      closeModal();

      fetchReturns();
    } catch (err) {
      console.log(err);

      alert(err?.response?.data?.message || "Unable to save Sales Return.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (
      !window.confirm(
        `Delete return "${item.returnNo}"? This will reduce stock back by the returned quantities.`,
      )
    ) {
      return;
    }

    try {
      setDeleting(true);

      await deleteSalesReturn(item._id);

      fetchReturns();
    } catch (err) {
      console.log(err);

      alert(err?.response?.data?.message || "Unable to delete return.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="salesreturn-page">
      <div className="salesreturn-content">
        <div className="page-header">
          <div>
            <h2>Sales Returns</h2>

            <p>Process store-wise customer returns against existing sales invoices.</p>
          </div>

          <button className="primary-btn" onClick={openAddModal}>
            <Plus size={18} />
            New Return
          </button>
        </div>

        <div className="salesreturn-toolbar">
          <div className="salesreturn-search-box">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search return no, reason..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="salesreturn-filter-select"
            value={storeFilter}
            onChange={(e) => {
              setStoreFilter(e.target.value);
              setWarehouseFilter("");
            }}
          >
            <option value="">All Stores</option>

            {stores.map((s) => (
              <option key={s._id} value={s._id}>
                {s.storeName}
              </option>
            ))}
          </select>

          <select
            className="salesreturn-filter-select"
            value={warehouseFilter}
            onChange={(e) => setWarehouseFilter(e.target.value)}
            disabled={!storeFilter}
          >
            <option value="">
              {storeFilter ? "All Warehouses" : "Select a store first"}
            </option>

            {warehouses
              .filter((w) => {
                const wStoreId = w.store?._id || w.store || "";
                return !storeFilter || String(wStoreId) === String(storeFilter);
              })
              .map((w) => (
                <option key={w._id} value={w._id}>
                  {w.warehouseName}
                </option>
              ))}
          </select>

          <select
            className="salesreturn-filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Types</option>

            {RETURN_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="salesreturn-summary-grid">
          <div className="salesreturn-summary-card card-blue">
            <div className="salesreturn-summary-icon">
              <RotateCcw size={22} />
            </div>

            <div>
              <h2>{totalReturns}</h2>
              <p>Total Returns</p>
            </div>
          </div>

          <div className="salesreturn-summary-card card-purple">
            <div className="salesreturn-summary-icon">
              <PackageCheck size={22} />
            </div>

            <div>
              <h2>{totalItemsReturned}</h2>
              <p>Items Returned</p>
            </div>
          </div>

          <div className="salesreturn-summary-card card-red">
            <div className="salesreturn-summary-icon">
              <IndianRupee size={22} />
            </div>

            <div>
              <h2>₹{totalRefund.toLocaleString("en-IN")}</h2>
              <p>Total Refund Amount</p>
            </div>
          </div>
        </div>

        <div className="table-card">
          <table className="salesreturn-table">
            <thead>
              <tr>
                <th>Return No</th>
                <th>Invoice</th>
                <th>Customer</th>
                <th>Store</th>
                <th>Warehouse</th>
                <th>Type</th>
                <th>Items</th>
                <th>Refund Amount</th>
                <th>Date</th>
                <th width="120">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" className="empty-row">
                    Loading...
                  </td>
                </tr>
              ) : filteredReturns.length === 0 ? (
                <tr>
                  <td colSpan="10" className="empty-row">
                    No Sales Returns Found
                  </td>
                </tr>
              ) : (
                filteredReturns.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <strong className="return-no">{item.returnNo}</strong>
                    </td>

                    <td>{item.invoice?.invoiceNo || "—"}</td>

                    <td>{item.customer?.customerName || "—"}</td>

                    <td>{item.store?.storeName || "—"}</td>

                    <td>{item.warehouse?.warehouseName || "—"}</td>

                    <td>
                      <span className={`type-pill type-${item.returnType}`}>
                        {RETURN_TYPES.find((t) => t.value === item.returnType)
                          ?.label || item.returnType}
                      </span>
                    </td>

                    <td>{item.totalQuantity ?? item.items?.length ?? 0}</td>

                    <td>
                      ₹{Number(item.refundAmount || 0).toLocaleString("en-IN")}
                    </td>

                    <td>
                      {item.returnDate
                        ? new Date(item.returnDate).toLocaleDateString("en-IN")
                        : "—"}
                    </td>

                    <td>
                      <div className="action-btns">
                        <button
                          className="edit-btn"
                          title="Edit"
                          onClick={() => openEditModal(item)}
                        >
                          <Edit size={16} />
                        </button>

                        <button
                          className="delete-btn"
                          title="Delete"
                          disabled={deleting}
                          onClick={() => handleDelete(item)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="modal-overlay">
            <div className="salesreturn-modal">
              <div className="modal-header">
                <h3>{editingId ? "Edit Sales Return" : "New Sales Return"}</h3>

                <button className="close-btn" onClick={closeModal}>
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body">
                <h4 className="section-title">Invoice Lookup</h4>

                <div className="form-grid" style={{ marginBottom: "15px" }}>
                  <div className="form-group">
                    <label>Store *</label>
                    <select
                      value={formData.store}
                      onChange={(e) => updateField("store", e.target.value)}
                    >
                      <option value="">Select Store</option>
                      {stores.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.storeName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Warehouse *</label>
                    <select
                      value={formData.warehouse}
                      disabled={!formData.store}
                      onChange={(e) => updateField("warehouse", e.target.value)}
                    >
                      <option value="">
                        {formData.store ? "Select Warehouse" : "Select a store first"}
                      </option>
                      {warehouses
                        .filter((w) => {
                          const wStoreId = w.store?._id || w.store || "";
                          return !formData.store || String(wStoreId) === String(formData.store);
                        })
                        .map((w) => (
                          <option key={w._id} value={w._id}>
                            {w.warehouseName}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                {!editingId && (
                  <div className="invoice-lookup">
                    <div className="invoice-lookup-input">
                      <Search size={16} />

                      <input
                        placeholder={
                          formData.store && formData.warehouse
                            ? "Type invoice number..."
                            : "Select store and warehouse first"
                        }
                        value={invoiceQuery}
                        disabled={!formData.store || !formData.warehouse}
                        onChange={handleInvoiceQueryChange}
                      />

                      {searchingInvoice && (
                        <span style={{ fontSize: "12px", color: "#777" }}>
                          Searching...
                        </span>
                      )}
                    </div>

                    {invoiceResults.length > 0 && (
                      <div className="invoice-results">
                        {invoiceResults.map((inv) => (
                          <button
                            type="button"
                            key={inv._id}
                            className="invoice-result-row"
                            onClick={() => selectInvoice(inv)}
                          >
                            <strong>{inv.invoiceNo}</strong>
                            <span>
                              {inv.customer?.customerName || "Walk-in"}
                              {" · ₹"}
                              {Number(inv.grandTotal || 0).toLocaleString(
                                "en-IN",
                              )}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {formData.invoiceNo && (
                  <div className="loaded-invoice-chip">
                    Invoice <strong>{formData.invoiceNo}</strong> selected
                  </div>
                )}

                <div className="form-grid">
                  <div className="form-group">
                    <label>Return No</label>

                    <input
                      value={formData.returnNo}
                      readOnly
                      disabled
                      style={{
                        background: "#f5f5f5",
                        cursor: "not-allowed",
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label>Return Date</label>

                    <input
                      type="date"
                      value={formData.returnDate}
                      onChange={(e) =>
                        updateField("returnDate", e.target.value)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Return Type</label>

                    <select
                      value={formData.returnType}
                      onChange={(e) =>
                        updateField("returnType", e.target.value)
                      }
                    >
                      {RETURN_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Refund Method</label>

                    <select
                      value={formData.refundMethod}
                      onChange={(e) =>
                        updateField("refundMethod", e.target.value)
                      }
                    >
                      {REFUND_METHODS.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group form-group-full">
                    <label>Reason</label>

                    <input
                      placeholder="Why is this being returned?"
                      value={formData.reason}
                      onChange={(e) => updateField("reason", e.target.value)}
                    />
                  </div>

                  <div className="form-group form-group-full">
                    <label>Remarks</label>

                    <textarea
                      rows="2"
                      value={formData.remarks}
                      onChange={(e) => updateField("remarks", e.target.value)}
                    />
                  </div>
                </div>

                {returnItems.length > 0 && (
                  <>
                    <h4 className="section-title">Return Items</h4>

                    <div className="return-items-table-wrapper">
                      <table className="return-items-table">
                        <thead>
                          <tr>
                            <th></th>
                            <th>Product</th>
                            <th>Invoice Qty</th>
                            <th>Return Qty</th>
                            <th>Price</th>
                            <th>Discount</th>
                            <th>GST %</th>
                          </tr>
                        </thead>

                        <tbody>
                          {returnItems.map((row, index) => (
                            <tr key={index}>
                              <td>
                                <input
                                  type="checkbox"
                                  checked={row.checked}
                                  onChange={(e) =>
                                    updateReturnItem(
                                      index,
                                      "checked",
                                      e.target.checked,
                                    )
                                  }
                                />
                              </td>

                              <td>
                                <strong>{row.productName}</strong>

                                {row.batchNumber && (
                                  <span className="return-item-sub">
                                    Batch: {row.batchNumber}
                                  </span>
                                )}
                              </td>

                              <td>{row.invoiceQuantity}</td>

                              <td>
                                <input
                                  type="number"
                                  min="0"
                                  max={row.invoiceQuantity}
                                  value={row.quantity}
                                  disabled={!row.checked}
                                  onChange={(e) =>
                                    updateReturnItem(
                                      index,
                                      "quantity",
                                      Number(e.target.value),
                                    )
                                  }
                                />
                              </td>

                              <td>
                                <input
                                  type="number"
                                  min="0"
                                  value={row.salesPrice}
                                  disabled={!row.checked}
                                  onChange={(e) =>
                                    updateReturnItem(
                                      index,
                                      "salesPrice",
                                      Number(e.target.value),
                                    )
                                  }
                                />
                              </td>

                              <td>
                                <input
                                  type="number"
                                  min="0"
                                  value={row.discount}
                                  disabled={!row.checked}
                                  onChange={(e) =>
                                    updateReturnItem(
                                      index,
                                      "discount",
                                      Number(e.target.value),
                                    )
                                  }
                                />
                              </td>

                              <td>
                                <input
                                  type="number"
                                  min="0"
                                  value={row.gstPercentage}
                                  disabled={!row.checked}
                                  onChange={(e) =>
                                    updateReturnItem(
                                      index,
                                      "gstPercentage",
                                      Number(e.target.value),
                                    )
                                  }
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>

              <div className="modal-footer">
                <button className="cancel-btn" onClick={closeModal}>
                  Cancel
                </button>

                <button
                  className="save-btn"
                  onClick={handleSubmit}
                  disabled={saving}
                >
                  <Save size={18} />

                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Return"
                    : "Create Return"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}