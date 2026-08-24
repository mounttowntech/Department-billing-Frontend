import React, { useEffect, useMemo, useState } from "react";
import "./Purchase.css";

import {
  Search,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  ClipboardList,
  Clock,
  IndianRupee,
  AlertCircle,
} from "lucide-react";

import {
  getPurchases,
  createPurchase,
  updatePurchase,
  deletePurchase,
  getTodayPurchases,
  getPendingPurchases,
} from "../../../services/purchaseService";

import { getStores } from "../../../services/storeService";
import { getWarehouses } from "../../../services/warehouseService";
import { getProducts } from "../../../services/productService";
import { getVariants } from "../../../services/productVariantService";

import { getSuppliers } from "../../../services/supplierService";

const PURCHASE_STATUSES = ["Pending", "Received", "Cancelled"];

const emptyItem = () => ({
  product: "",
  variant: "",
  skuCode: "",
  barcode: "",
  productName: "",
  unit: "",
  quantity: 1,
  purchasePrice: 0,
  gstPercentage: 0,
  expiryDate: "",
});

const emptyPurchase = {
  purchaseNo: "",
  invoiceNumber: "",
  supplier: "",
  store: "",
  warehouse: "",
  purchaseDate: new Date().toISOString().slice(0, 10),
  purchaseStatus: "Received",
  discountAmount: 0,
  transportCharge: 0,
  otherCharges: 0,
  paidAmount: 0,
  remarks: "",
};

export default function Purchase() {
  const [purchases, setPurchases] = useState([]);
  const [stores, setStores] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [todayCount, setTodayCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  const [search, setSearch] = useState("");
  const [storeFilter, setStoreFilter] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [purchaseStatusFilter, setPurchaseStatusFilter] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyPurchase);
  const [items, setItems] = useState([emptyItem()]);

  const fetchPurchases = async () => {
    try {
      setLoading(true);

      const res = await getPurchases({
        store: storeFilter || undefined,
        supplier: supplierFilter || undefined,
        paymentStatus: paymentStatusFilter || undefined,
        purchaseStatus: purchaseStatusFilter || undefined,
      });

      if (res.data.success) {
        setPurchases(res.data.data || []);
      } else {
        setPurchases([]);
      }
    } catch (err) {
      console.log(err);
      setPurchases([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummaryCounts = async () => {
    try {
      const [todayRes, pendingRes] = await Promise.all([
        getTodayPurchases(),
        getPendingPurchases(),
      ]);
      if (todayRes.data.success) setTodayCount(todayRes.data.count || 0);
      if (pendingRes.data.success) setPendingCount(pendingRes.data.count || 0);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [productRes, variantRes] = await Promise.all([
        getProducts(),
        getVariants(),
      ]);
      if (productRes.data.success) setProducts(productRes.data.data || []);
      if (variantRes.data.success) setVariants(variantRes.data.data || []);
      const [storeRes, warehouseRes, supplierRes] = await Promise.all([
        getStores(),
        getWarehouses(),
        getSuppliers(),
      ]);
      if (storeRes.success) setStores(storeRes.data || []);
      if (warehouseRes.success) setWarehouses(warehouseRes.data || []);
      if (supplierRes.success) setSuppliers(supplierRes.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchDropdownData();
    fetchSummaryCounts();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPurchases();
    }, 300);
    return () => clearTimeout(timer);
   
  }, [storeFilter, supplierFilter, paymentStatusFilter, purchaseStatusFilter]);

  const filteredPurchases = useMemo(() => {
    if (!search.trim()) return purchases;
    const q = search.toLowerCase();
    return purchases.filter(
      (p) =>
        p.purchaseNo?.toLowerCase().includes(q) ||
        p.invoiceNumber?.toLowerCase().includes(q) ||
        p.supplier?.supplierName?.toLowerCase().includes(q)
    );
  }, [purchases, search]);

  const totalPurchases = purchases.length;
  const totalValue = purchases.reduce(
    (sum, p) => sum + Number(p.grandTotal || 0),
    0
  );

 
  const updateItem = (index, key, value) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [key]: value } : item))
    );
  };

  const handleItemProductChange = (index, productId) => {
    const product = products.find((p) => p._id === productId);
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              product: productId,
              productName: product?.productName || "",
              variant: "",
              skuCode: "",
              barcode: "",
              unit: "",
              purchasePrice: 0,
              gstPercentage: 0,
            }
          : item
      )
    );
  };

  const handleItemVariantChange = (index, variantId) => {
    const variant = variants.find((v) => v._id === variantId);
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              variant: variantId,
              skuCode: variant?.skuCode || "",
              barcode: variant?.barcode || "",
              unit: variant?.unit?._id || variant?.unit || "",
              purchasePrice: variant?.purchasePrice || 0,
              gstPercentage: variant?.gstPercentage || 0,
            }
          : item
      )
    );
  };

  const variantsForItemProduct = (productId) =>
    variants.filter((v) => (v.product?._id || v.product) === productId);

  const addItemRow = () => setItems((prev) => [...prev, emptyItem()]);

  const removeItemRow = (index) =>
    setItems((prev) => prev.filter((_, i) => i !== index));

  const totalsPreview = useMemo(() => {
    let subTotal = 0;
    let gstAmount = 0;

    items.forEach((item) => {
      const qty = Number(item.quantity || 0);
      const price = Number(item.purchasePrice || 0);
      const gst = Number(item.gstPercentage || 0);
      const taxable = qty * price;
      subTotal += taxable;
      gstAmount += (taxable * gst) / 100;
    });

    const transportCharge = Number(formData.transportCharge || 0);
    const otherCharges = Number(formData.otherCharges || 0);
    const discountAmount = Number(formData.discountAmount || 0);
    const paidAmount = Number(formData.paidAmount || 0);

    const grandTotal =
      subTotal + gstAmount + transportCharge + otherCharges - discountAmount;

    let dueAmount = grandTotal - paidAmount;
    let paymentStatus = "unpaid";
    if (dueAmount <= 0) {
      paymentStatus = "paid";
      dueAmount = 0;
    } else if (paidAmount > 0) {
      paymentStatus = "partial";
    }

    return {
      subTotal: subTotal.toFixed(2),
      gstAmount: gstAmount.toFixed(2),
      grandTotal: grandTotal.toFixed(2),
      dueAmount: dueAmount.toFixed(2),
      paymentStatus,
    };
  }, [items, formData.transportCharge, formData.otherCharges, formData.discountAmount, formData.paidAmount]);

  const updateField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData(emptyPurchase);
    setItems([emptyItem()]);
    setShowModal(true);
  };

  const openEditModal = (purchase) => {
    setEditingId(purchase._id);
    setFormData({
      purchaseNo: purchase.purchaseNo || "",
      invoiceNumber: purchase.invoiceNumber || "",
      supplier: purchase.supplier?._id || purchase.supplier || "",
      store: purchase.store?._id || purchase.store || "",
      warehouse: purchase.warehouse?._id || purchase.warehouse || "",
      purchaseDate: purchase.purchaseDate
        ? purchase.purchaseDate.slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      purchaseStatus: purchase.purchaseStatus || "Received",
      discountAmount: purchase.discountAmount ?? 0,
      transportCharge: purchase.transportCharge ?? 0,
      otherCharges: purchase.otherCharges ?? 0,
      paidAmount: purchase.paidAmount ?? 0,
      remarks: purchase.remarks || "",
    });

    setItems(
      (purchase.items || []).map((item) => ({
        product: item.product?._id || item.product || "",
        variant: item.variant?._id || item.variant || "",
        skuCode: item.skuCode || "",
        barcode: item.barcode || "",
        productName: item.productName || "",
        unit: item.unit?._id || item.unit || "",
        quantity: item.quantity ?? 1,
        purchasePrice: item.purchasePrice ?? 0,
        gstPercentage: item.gstPercentage ?? 0,
        expiryDate: item.expiryDate ? item.expiryDate.slice(0, 10) : "",
      }))
    );

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData(emptyPurchase);
    setItems([emptyItem()]);
  };

  const handleSubmit = async () => {
    if (
  !formData.supplier ||
  !formData.store ||
  !formData.warehouse
) { 
      alert("Purchase No, Supplier, Store and Warehouse are required.");
      return;
    }

    const validItems = items.filter((i) => i.product && i.quantity > 0);
    if (validItems.length === 0) {
      alert("Add at least one line item with a product and quantity.");
      return;
    }

    try {
      setSaving(true);

      const payload = { ...formData, items: validItems };

      if (editingId) {
        await updatePurchase(editingId, payload);
      } else {
        await createPurchase(payload);
      }

      closeModal();
      fetchPurchases();
      fetchSummaryCounts();
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Unable to save Purchase.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm("Permanently delete this purchase? This cannot be undone.")
    )
      return;

    try {
      await deletePurchase(id);
      fetchPurchases();
      fetchSummaryCounts();
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Unable to delete purchase.");
    }
  };

  return (
    <div className="purchase-page">
      <div className="purchase-content">

        <div className="page-header">
          <div>
            <h2>Purchases</h2>
            <p>Record stock received from suppliers.</p>
          </div>

          <button className="primary-btn" onClick={openAddModal}>
            <Plus size={18} />
            New Purchase
          </button>
        </div>

    
        <div className="purchase-toolbar">
          <div className="purchase-search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search purchase no, invoice, supplier..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="purchase-filter-select "
            value={storeFilter}
            onChange={(e) => setStoreFilter(e.target.value)}
          >
            <option value="">All Stores</option>
            {stores.map((s) => (
              <option key={s._id} value={s._id}>
                {s.storeName}
              </option>
            ))}
          </select>

          <select
            className="purchase-filter-select "
            value={supplierFilter}
            onChange={(e) => setSupplierFilter(e.target.value)}
          >
            <option value="">All Suppliers</option>
            {suppliers.map((s) => (
              <option key={s._id} value={s._id}>
                {s.supplierName}
              </option>
            ))}
          </select>

          <select
            className="purchase-filter-select "
            value={purchaseStatusFilter}
            onChange={(e) => setPurchaseStatusFilter(e.target.value)}
          >
            <option value="">All Purchase Status</option>
            {PURCHASE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            className="purchase-filter-select "
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.target.value)}
          >
            <option value="">All Payment Status</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="unpaid">Unpaid</option>
          </select>
        </div>

      
        <div className="purchase-summary-grid">
          <div className="purchase-summary-card card-blue">
            <div className="purchase-summary-icon">
              <ClipboardList size={22} />
            </div>
            <h2>{totalPurchases}</h2>
            <p>Total Purchases</p>
          </div>

          <div className="purchase-summary-card card-green">
            <div className="purchase-summary-icon">
              <Clock size={22} />
            </div>
            <h2>{todayCount}</h2>
            <p>Today's Purchases</p>
          </div>

          <div className="purchase-summary-card card-amber">
            <div className="purchase-summary-icon">
              <AlertCircle size={22} />
            </div>
            <h2>{pendingCount}</h2>
            <p>Pending Payment</p>
          </div>

          <div className="purchase-summary-card card-purple">
            <div className="purchase-summary-icon">
              <IndianRupee size={22} />
            </div>
            <h2>₹{totalValue.toLocaleString("en-IN")}</h2>
            <p>Total Purchase Value</p>
          </div>
        </div>

        <div className="table-card">
          <table className="purchase-table">
            <thead>
              <tr>
                <th>Purchase</th>
                <th>Supplier</th>
                <th>Warehouse</th>
                <th>Items</th>
                <th>Grand Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th width="120">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="empty-row">
                    Loading...
                  </td>
                </tr>
              ) : filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-row">
                    No Purchases Found
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((purchase) => (
                  <tr key={purchase._id}>
                    <td>
                      <div className="purchase-info">
                        <strong>{purchase.purchaseNo}</strong>
                        <p>
                          {purchase.invoiceNumber || "No invoice #"} ·{" "}
                          {purchase.purchaseDate
                            ? new Date(purchase.purchaseDate).toLocaleDateString("en-IN")
                            : "—"}
                        </p>
                      </div>
                    </td>

                    <td>{purchase.supplier?.supplierName || "—"}</td>

                    <td>{purchase.warehouse?.warehouseName || "—"}</td>

                    <td>{purchase.totalItems ?? purchase.items?.length ?? 0}</td>

                    <td>
                      <strong>₹{Number(purchase.grandTotal || 0).toLocaleString("en-IN")}</strong>
                    </td>

                    <td>
                      <span className={`badge ${purchase.paymentStatus}`}>
                        {purchase.paymentStatus}
                      </span>
                    </td>

                    <td>
                      <span className={`badge ${purchase.purchaseStatus?.toLowerCase()}`}>
                        {purchase.purchaseStatus}
                      </span>
                    </td>

                    <td>
                      <div className="action-btns">
                        <button
                          className="edit-btn"
                          title="Edit"
                          onClick={() => openEditModal(purchase)}
                        >
                          <Edit size={16} />
                        </button>

                        <button
                          className="delete-btn"
                          title="Delete"
                          onClick={() => handleDelete(purchase._id)}
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
            <div className="purchase-modal">
              <div className="modal-header">
                <h3>{editingId ? "Edit Purchase" : "New Purchase"}</h3>
                <button className="close-btn" onClick={closeModal}>
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body">
                <h4 className="section-title">Purchase Details</h4>

                <div className="form-grid">
                  <div className="form-group">
                    <label>
  Purchase Number
</label>

<input
  value={formData.purchaseNo || "Auto Generated"}
  disabled
/>
                  </div>

                  <div className="form-group">
                    <label>Invoice Number</label>
                    <input
                      value={formData.invoiceNumber}
                      onChange={(e) =>
                        updateField("invoiceNumber", e.target.value)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Purchase Date</label>
                    <input
                      type="date"
                      value={formData.purchaseDate}
                      onChange={(e) =>
                        updateField("purchaseDate", e.target.value)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Supplier *</label>
                    <select
                      value={formData.supplier}
                      onChange={(e) =>
                        updateField("supplier", e.target.value)
                      }
                    >
                      <option value="">Select Supplier</option>
                      {suppliers.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.supplierName}
                        </option>
                      ))}
                    </select>
                  </div>

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
                      onChange={(e) =>
                        updateField("warehouse", e.target.value)
                      }
                    >
                      <option value="">Select Warehouse</option>
                      {warehouses.map((w) => (
                        <option key={w._id} value={w._id}>
                          {w.warehouseName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Purchase Status</label>
                    <select
                      value={formData.purchaseStatus}
                      onChange={(e) =>
                        updateField("purchaseStatus", e.target.value)
                      }
                    >
                      {PURCHASE_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group form-group-full">
                    <label>Remarks</label>
                    <input
                      value={formData.remarks}
                      onChange={(e) =>
                        updateField("remarks", e.target.value)
                      }
                    />
                  </div>
                </div>

                <h4 className="section-title">Line Items</h4>

                <div className="items-table-wrap">
                  <table className="items-table">
                    <thead>
                      <tr>
                        <th style={{ minWidth: 160 }}>Product *</th>
                        <th style={{ minWidth: 140 }}>Variant / SKU</th>
                        <th style={{ width: 80 }}>Qty *</th>
                        <th style={{ width: 100 }}>Price</th>
                        <th style={{ width: 80 }}>GST %</th>
                        <th style={{ width: 100 }}>Taxable</th>
                        <th style={{ width: 130 }}>Expiry</th>
                        <th style={{ width: 40 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="no-items-row">
                            No items added yet
                          </td>
                        </tr>
                      ) : (
                        items.map((item, index) => (
                          <tr key={index}>
                            <td>
                              <select
                                value={item.product}
                                onChange={(e) =>
                                  handleItemProductChange(index, e.target.value)
                                }
                              >
                                <option value="">Select Product</option>
                                {products.map((p) => (
                                  <option key={p._id} value={p._id}>
                                    {p.productName}
                                  </option>
                                ))}
                              </select>
                            </td>

                            <td>
                              <select
                                value={item.variant}
                                onChange={(e) =>
                                  handleItemVariantChange(index, e.target.value)
                                }
                                disabled={!item.product}
                              >
                                <option value="">
                                  {item.product ? "Select Variant" : "Pick a product first"}
                                </option>
                                {variantsForItemProduct(item.product).map((v) => (
                                  <option key={v._id} value={v._id}>
                                    {v.skuCode} {v.variantName ? `— ${v.variantName}` : ""}
                                  </option>
                                ))}
                              </select>
                            </td>

                            <td>
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) =>
                                  updateItem(index, "quantity", e.target.value)
                                }
                              />
                            </td>

                            <td>
                              <input
                                type="number"
                                min="0"
                                value={item.purchasePrice}
                                onChange={(e) =>
                                  updateItem(index, "purchasePrice", e.target.value)
                                }
                              />
                            </td>

                            <td>
                              <input
                                type="number"
                                min="0"
                                value={item.gstPercentage}
                                onChange={(e) =>
                                  updateItem(index, "gstPercentage", e.target.value)
                                }
                              />
                            </td>

                            <td>
                              <input
                                readOnly
                                value={(
                                  Number(item.quantity || 0) *
                                  Number(item.purchasePrice || 0)
                                ).toFixed(2)}
                              />
                            </td>

                            <td>
                              <input
                                type="date"
                                value={item.expiryDate}
                                onChange={(e) =>
                                  updateItem(index, "expiryDate", e.target.value)
                                }
                              />
                            </td>

                            <td>
                              <button
                                type="button"
                                className="item-remove-btn"
                                onClick={() => removeItemRow(index)}
                              >
                                <X size={14} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <button type="button" className="add-item-btn" onClick={addItemRow}>
                  <Plus size={14} /> Add Item
                </button>

                <h4 className="section-title">Charges & Payment</h4>

                <div className="form-grid-4">
                  <div className="form-group">
                    <label>Transport Charge</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.transportCharge}
                      onChange={(e) =>
                        updateField("transportCharge", e.target.value)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Other Charges</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.otherCharges}
                      onChange={(e) =>
                        updateField("otherCharges", e.target.value)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Discount Amount</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.discountAmount}
                      onChange={(e) =>
                        updateField("discountAmount", e.target.value)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Paid Amount</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.paidAmount}
                      onChange={(e) =>
                        updateField("paidAmount", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="totals-box">
                  <div className="totals-row">
                    <span>Subtotal</span>
                    <span>₹{totalsPreview.subTotal}</span>
                  </div>
                  <div className="totals-row">
                    <span>GST</span>
                    <span>₹{totalsPreview.gstAmount}</span>
                  </div>
                  <div className="totals-row due-amount">
                    <span>Due Amount</span>
                    <span>₹{totalsPreview.dueAmount}</span>
                  </div>
                  <div className="totals-row">
                    <span>Payment Status</span>
                    <span className={`badge ${totalsPreview.paymentStatus}`}>
                      {totalsPreview.paymentStatus}
                    </span>
                  </div>
                  <div className="totals-row grand-total">
                    <span>Grand Total</span>
                    <span>₹{totalsPreview.grandTotal}</span>
                  </div>
                </div>
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
                    ? "Update Purchase"
                    : "Create Purchase"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}