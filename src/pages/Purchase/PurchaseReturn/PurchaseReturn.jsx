import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Save,
  RotateCcw,
  CheckCircle,
  Clock,
  IndianRupee,
} from "lucide-react";

import api from "../../../api/axios";
import "./PurchaseReturn.css";

const emptyItem = {
  product: "",
  variant: "",
  batch: "",
  skuCode: "",
  barcode: "",
  productName: "",
  quantity: 1,
  purchasePrice: 0,
  refundAmount: 0,
  reason: "",
};

const createEmptyForm = () => ({
  purchase: "",
  supplier: "",
  store: "",
  warehouse: "",
  returnDate: new Date().toISOString().split("T")[0],
  returnStatus: "Pending",
  items: [{ ...emptyItem }],
  reason: "",
  remarks: "",
});

const PurchaseReturn = () => {
  const [returns, setReturns] = useState([]);

  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [stores, setStores] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);

  const [form, setForm] = useState(createEmptyForm());

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [loading, setLoading] = useState(false);
  const [masterLoading, setMasterLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
  });

  const fetchReturns = async () => {
    try {
      setLoading(true);

      const params = {
        page,
        limit: 10,
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      if (statusFilter) {
        params.returnStatus = statusFilter;
      }

      const response = await api.get("/purchase-returns/all", {
        params,
      });

      if (response.data?.success) {
        setReturns(
          response.data.data ||
            response.data.returns ||
            response.data.purchaseReturns ||
            [],
        );

        setPagination(
          response.data.pagination || {
            currentPage: page,
            totalPages: 1,
            totalRecords: 0,
          },
        );
      } else {
        setReturns([]);
      }
    } catch (error) {
      console.error("Fetch Purchase Returns Error:", error);

      if (error.response?.status !== 401) {
        alert(
          error.response?.data?.message || "Failed to fetch purchase returns",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMasterData = async () => {
    try {
      setMasterLoading(true);

      const [purchaseRes, supplierRes, storeRes, warehouseRes, productRes] =
        await Promise.all([
          api.get("/purchases/all"),
          api.get("/suppliers/all"),
          api.get("/stores/all"),
          api.get("/warehouses/all"),
          api.get("/products/all"),
        ]);

      setPurchases(purchaseRes.data?.data || purchaseRes.data?.purchases || []);

      setSuppliers(supplierRes.data?.data || supplierRes.data?.suppliers || []);

      setStores(storeRes.data?.data || storeRes.data?.stores || []);

      setWarehouses(
        warehouseRes.data?.data || warehouseRes.data?.warehouses || [],
      );

      setProducts(productRes.data?.data || productRes.data?.products || []);
    } catch (error) {
      console.error("Master Data Error:", error);

      if (error.response?.status !== 401) {
        alert(error.response?.data?.message || "Failed to load master data");
      }
    } finally {
      setMasterLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchMasterData();
  }, []);

  const summary = useMemo(() => {
    const total = Number(pagination.totalRecords) || 0;

    const pending = returns.filter(
      (item) => item.returnStatus === "Pending",
    ).length;

    const completed = returns.filter(
      (item) => item.returnStatus === "Completed",
    ).length;

    const refund = returns.reduce(
      (sum, item) => sum + Number(item.refundAmount || 0),
      0,
    );

    return {
      total,
      pending,
      completed,
      refund,
    };
  }, [returns, pagination]);

  
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const generateSku = (product) => {
    if (!product) {
      return "";
    }


    const existingSku =
      product.skuCode ||
      product.sku ||
      product.SKU ||
      product.productSku ||
      product.itemCode ||
      "";

    if (existingSku) {
      return String(existingSku);
    }

 

    if (product._id) {
      return `SKU-${String(product._id)
        .replace(/[^a-zA-Z0-9]/g, "")
        .substring(0, 9)
        .toUpperCase()}`;
    }

    if (product.productName || product.name) {
      const name = product.productName || product.name;

      return `SKU-${String(name)
        .trim()
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .substring(0, 20)
        .toUpperCase()}`;
    }

    return "";
  };

  const handleItemChange = (index, field, value) => {
    setForm((prev) => {
      const items = [...prev.items];

      items[index] = {
        ...items[index],
        [field]: value,
      };

      if (field === "product") {
        const product = products.find((p) => String(p._id) === String(value));

        if (product) {
         
          items[index].productName = product.productName || product.name || "";

          items[index].skuCode = generateSku(product);

          items[index].barcode = product.barcode || product.barCode || "";

          const purchasePrice = Number(
            product.purchasePrice ||
              product.purchaseRate ||
              product.costPrice ||
              product.cost ||
              0,
          );

          items[index].purchasePrice = purchasePrice;

          const quantity = Number(items[index].quantity || 1);

          items[index].refundAmount = purchasePrice * quantity;

          items[index].variant = product.variant?._id || product.variant || "";

          items[index].batch = product.batch?._id || product.batch || "";
        } else {
       
          items[index].skuCode = "";
          items[index].productName = "";
          items[index].barcode = "";
          items[index].purchasePrice = 0;
          items[index].refundAmount = 0;
          items[index].variant = "";
          items[index].batch = "";
        }
      }

      if (field === "quantity") {
        const quantity = Number(value || 0);

        const purchasePrice = Number(items[index].purchasePrice || 0);

        items[index].refundAmount = purchasePrice * quantity;
      }


      if (field === "purchasePrice") {
        const purchasePrice = Number(value || 0);

        const quantity = Number(items[index].quantity || 0);

        items[index].refundAmount = purchasePrice * quantity;
      }

      if (field === "refundAmount") {
        items[index].refundAmount = Number(value || 0);
      }

      return {
        ...prev,
        items,
      };
    });
  };


  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          ...emptyItem,
        },
      ],
    }));
  };

  const removeItem = (index) => {
    setForm((prev) => {
      if (prev.items.length === 1) {
        return prev;
      }

      return {
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      };
    });
  };

  const totalQuantity = form.items.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0,
  );

  const totalRefund = form.items.reduce(
    (sum, item) => sum + Number(item.refundAmount || 0),
    0,
  );

  const resetForm = () => {
    setForm(createEmptyForm());
    setEditingId(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = async (id) => {
    try {
      setLoading(true);

      const response = await api.get(`/purchase-returns/${id}`);

      const data = response.data?.data || response.data?.purchaseReturn;

      if (!data) {
        alert("Purchase return not found");
        return;
      }

      setForm({
        purchase: data.purchase?._id || data.purchase || "",

        supplier: data.supplier?._id || data.supplier || "",

        store: data.store?._id || data.store || "",

        warehouse: data.warehouse?._id || data.warehouse || "",

        returnDate: data.returnDate
          ? new Date(data.returnDate).toISOString().split("T")[0]
          : "",

        returnStatus: data.returnStatus || "Pending",

        items:
          data.items?.length > 0
            ? data.items.map((item) => ({
                product: item.product?._id || item.product || "",

                variant: item.variant?._id || item.variant || "",

                batch: item.batch?._id || item.batch || "",

                /*
                 * Use saved SKU.
                 * If missing, find product and generate it.
                 */

                skuCode:
                  item.skuCode ||
                  (() => {
                    const product = products.find(
                      (p) =>
                        String(p._id) ===
                        String(item.product?._id || item.product),
                    );

                    return generateSku(product);
                  })(),

                barcode: item.barcode || "",

                productName: item.productName || "",

                quantity: Number(item.quantity || 1),

                purchasePrice: Number(item.purchasePrice || 0),

                refundAmount: Number(item.refundAmount || 0),

                reason: item.reason || "",
              }))
            : [
                {
                  ...emptyItem,
                },
              ],

        reason: data.reason || "",

        remarks: data.remarks || "",
      });

      setEditingId(id);
      setShowModal(true);
    } catch (error) {
      console.error("Edit Error:", error);

      alert(error.response?.data?.message || "Failed to load purchase return");
    } finally {
      setLoading(false);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.purchase) {
      alert("Please select purchase");
      return;
    }

    if (!form.supplier) {
      alert("Please select supplier");
      return;
    }

    if (!form.store) {
      alert("Please select store");
      return;
    }

    if (!form.warehouse) {
      alert("Please select warehouse");
      return;
    }

    if (!form.items.length) {
      alert("Add at least one item");
      return;
    }

    const invalidItem = form.items.some(
      (item) => !item.product || Number(item.quantity) <= 0,
    );

    if (invalidItem) {
      alert("Please select product and enter valid quantity for every item");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        purchase: form.purchase,

        supplier: form.supplier,

        store: form.store,

        warehouse: form.warehouse,

        returnDate: form.returnDate,

        returnStatus: form.returnStatus,

        items: form.items.map((item) => ({
          product: item.product,

          variant: item.variant || null,

          batch: item.batch || null,

          skuCode: item.skuCode || "",

          barcode: item.barcode || "",

          productName: item.productName || "",

          quantity: Number(item.quantity || 0),

          purchasePrice: Number(item.purchasePrice || 0),

          refundAmount: Number(item.refundAmount || 0),

          reason: item.reason || "",
        })),

        reason: form.reason || "",

        remarks: form.remarks || "",
      };

      if (editingId) {
        await api.put(`/purchase-returns/update/${editingId}`, payload);

        alert("Purchase Return updated successfully");
      } else {
        await api.post("/purchase-returns/create", payload);

        alert("Purchase Return created successfully");
      }

      setShowModal(false);
      resetForm();

      await fetchReturns();
    } catch (error) {
      console.error("Save Error:", error);

      alert(error.response?.data?.message || "Failed to save purchase return");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this Purchase Return?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);

      await api.delete(`/purchase-returns/delete/${id}`);

      alert("Purchase Return deleted successfully");

      await fetchReturns();
    } catch (error) {
      console.error("Delete Error:", error);

      alert(
        error.response?.data?.message || "Failed to delete purchase return",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, returnStatus) => {
    try {
      await api.patch(`/purchase-returns/${id}/status`, {
        returnStatus,
      });

      await fetchReturns();
    } catch (error) {
      console.error("Status Error:", error);

      alert(error.response?.data?.message || "Failed to update status");
    }
  };


  const closeModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    resetForm();
  };


  return (
    <div className="purchase-return-page">
      <div className="purchase-return-content">
    
        <div className="page-header">
          <div>
            <h2>Purchase Returns</h2>

            <p>Manage returned purchases and refunds</p>
          </div>

          <button className="primary-btn" onClick={openCreateModal}>
            <Plus size={18} />
            Add Purchase Return
          </button>
        </div>

        <div className="purchase-return-toolbar">
          <div className="purchase-return-search-box">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search return number..."
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
            />
          </div>

          <select
            className="purchase-return-filter-select"
            value={statusFilter}
            onChange={(e) => {
              setPage(1);
              setStatusFilter(e.target.value);
            }}
          >
            <option value="">All Status</option>

            <option value="Pending">Pending</option>

            <option value="Approved">Approved</option>

            <option value="Rejected">Rejected</option>

            <option value="Completed">Completed</option>
          </select>
        </div>

        <div className="purchase-return-summary-grid">
          <div className="purchase-return-summary-card card-blue">
            <div className="purchase-return-summary-icon">
              <RotateCcw size={21} />
            </div>

            <div>
              <h2>{summary.total}</h2>

              <p>Total Returns</p>
            </div>
          </div>

          <div className="purchase-return-summary-card card-amber">
            <div className="purchase-return-summary-icon">
              <Clock size={21} />
            </div>

            <div>
              <h2>{summary.pending}</h2>

              <p>Pending Returns</p>
            </div>
          </div>

          <div className="purchase-return-summary-card card-green">
            <div className="purchase-return-summary-icon">
              <CheckCircle size={21} />
            </div>

            <div>
              <h2>{summary.completed}</h2>

              <p>Completed Returns</p>
            </div>
          </div>

          <div className="purchase-return-summary-card card-purple">
            <div className="purchase-return-summary-icon">
              <IndianRupee size={21} />
            </div>

            <div>
              <h2>₹{summary.refund.toFixed(2)}</h2>

              <p>Total Refund</p>
            </div>
          </div>
        </div>

        <div className="table-card">
          <table className="purchase-return-table">
            <thead>
              <tr>
                <th>Return No</th>

                <th>Purchase</th>

                <th>Supplier</th>

                <th>Return Date</th>

                <th>Items</th>

                <th>Refund</th>

                <th>Status</th>

                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="empty-row">
                    Loading...
                  </td>
                </tr>
              ) : returns.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-row">
                    No purchase returns found
                  </td>
                </tr>
              ) : (
                returns.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div className="purchase-return-info">
                        <strong>{item.returnNo || "-"}</strong>

                        <p>{item.reason || "No reason"}</p>
                      </div>
                    </td>

                    <td>
                      <strong>
                        {item.purchase?.purchaseNo || item.purchaseNo || "-"}
                      </strong>
                    </td>

                    <td>
                      {item.supplier?.supplierName || item.supplierName || "-"}
                    </td>

                    <td>
                      {item.returnDate
                        ? new Date(item.returnDate).toLocaleDateString("en-IN")
                        : "-"}
                    </td>

                    <td>
                      {item.totalQuantity ||
                        item.items?.reduce(
                          (sum, current) => sum + Number(current.quantity || 0),
                          0,
                        ) ||
                        0}
                    </td>

                    <td>
                      <strong>
                        ₹{Number(item.refundAmount || 0).toFixed(2)}
                      </strong>
                    </td>

                    <td>
                      <select
                        className={`return-status-select ${String(
                          item.returnStatus || "Pending",
                        ).toLowerCase()}`}
                        value={item.returnStatus || "Pending"}
                        onChange={(e) =>
                          handleStatusChange(item._id, e.target.value)
                        }
                      >
                        <option value="Pending">Pending</option>

                        <option value="Approved">Approved</option>

                        <option value="Rejected">Rejected</option>

                        <option value="Completed">Completed</option>
                      </select>
                    </td>

                    <td>
                      <div className="action-btns">
                        <button
                          className="edit-btn"
                          onClick={() => handleEdit(item._id)}
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(item._id)}
                          title="Delete"
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

        {pagination.totalPages > 1 && (
          <div className="pagination">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </button>

            <span>
              Page {page} of {pagination.totalPages}
            </span>

            <button
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="purchase-return-modal">
            {/* HEADER */}

            <div className="modal-header">
              <h3>
                {editingId ? "Edit Purchase Return" : "Create Purchase Return"}
              </h3>

              <button className="close-btn" type="button" onClick={closeModal}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-body">

              <div className="section-title">Return Details</div>

              <div className="form-grid">
  
                <div className="form-group">
                  <label>Purchase *</label>

                  <select
                    name="purchase"
                    value={form.purchase}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Purchase</option>

                    {purchases.map((purchase) => (
                      <option key={purchase._id} value={purchase._id}>
                        {purchase.purchaseNo ||
                          purchase.invoiceNo ||
                          purchase._id}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Supplier *</label>

                  <select
                    name="supplier"
                    value={form.supplier}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Supplier</option>

                    {suppliers.map((supplier) => (
                      <option key={supplier._id} value={supplier._id}>
                        {supplier.supplierName || supplier.name || supplier._id}
                      </option>
                    ))}
                  </select>
                </div>


                <div className="form-group">
                  <label>Store *</label>

                  <select
                    name="store"
                    value={form.store}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Store</option>

                    {stores.map((store) => (
                      <option key={store._id} value={store._id}>
                        {store.storeName || store.name || store._id}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Warehouse *</label>

                  <select
                    name="warehouse"
                    value={form.warehouse}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Warehouse</option>

                    {warehouses.map((warehouse) => (
                      <option key={warehouse._id} value={warehouse._id}>
                        {warehouse.warehouseName ||
                          warehouse.name ||
                          warehouse._id}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Return Date</label>

                  <input
                    type="date"
                    name="returnDate"
                    value={form.returnDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Status</label>

                  <select
                    name="returnStatus"
                    value={form.returnStatus}
                    onChange={handleChange}
                  >
                    <option value="Pending">Pending</option>

                    <option value="Approved">Approved</option>

                    <option value="Rejected">Rejected</option>

                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="section-title">Return Items</div>

              {masterLoading && (
                <div
                  style={{
                    padding: "10px",
                    textAlign: "center",
                  }}
                >
                  Loading master data...
                </div>
              )}

              <div className="items-table-wrap">
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Product</th>

                      <th>SKU</th>

                      <th>Quantity</th>

                      <th>Purchase Price</th>

                      <th>Refund Amount</th>

                      <th>Reason</th>

                      <th>Remove</th>
                    </tr>
                  </thead>

                  <tbody>
                    {form.items.map((item, index) => (
                      <tr key={index}>
                
                        <td>
                          <select
                            value={item.product}
                            onChange={(e) =>
                              handleItemChange(index, "product", e.target.value)
                            }
                            required
                          >
                            <option value="">Select Product</option>

                            {products.map((product) => (
                              <option key={product._id} value={product._id}>
                                {product.productName ||
                                  product.name ||
                                  product._id}
                              </option>
                            ))}
                          </select>
                        </td>

                     
                        <td>
                          <input
                            type="text"
                            value={item.skuCode}
                            readOnly
                            placeholder="Auto generated SKU"
                            title="SKU is automatically generated from the selected product"
                          />
                        </td>

                        <td>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "quantity",
                                e.target.value,
                              )
                            }
                            required
                          />
                        </td>

                        <td>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.purchasePrice}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "purchasePrice",
                                e.target.value,
                              )
                            }
                          />
                        </td>

                        <td>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.refundAmount}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "refundAmount",
                                e.target.value,
                              )
                            }
                          />
                        </td>

                        <td>
                          <input
                            type="text"
                            placeholder="Reason"
                            value={item.reason}
                            onChange={(e) =>
                              handleItemChange(index, "reason", e.target.value)
                            }
                          />
                        </td>

                        <td>
                          <button
                            type="button"
                            className="item-remove-btn"
                            onClick={() => removeItem(index)}
                            disabled={form.items.length === 1}
                            title="Remove item"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button type="button" className="add-item-btn" onClick={addItem}>
                <Plus size={15} />
                Add Item
              </button>

              <div className="totals-box">
                <div className="totals-row">
                  <span>Total Quantity</span>

                  <strong>{totalQuantity}</strong>
                </div>

                <div className="totals-row">
                  <span>Total Items</span>

                  <strong>{form.items.length}</strong>
                </div>

                <div className="totals-row grand-total">
                  <span>Total Refund</span>

                  <strong>₹{totalRefund.toFixed(2)}</strong>
                </div>
              </div>

              <div className="section-title">Additional Information</div>

              <div className="form-grid">
                <div className="form-group form-group-full">
                  <label>Return Reason</label>

                  <textarea
                    name="reason"
                    rows="3"
                    value={form.reason}
                    onChange={handleChange}
                    placeholder="Enter return reason..."
                  />
                </div>

                <div className="form-group form-group-full">
                  <label>Remarks</label>

                  <textarea
                    name="remarks"
                    rows="3"
                    value={form.remarks}
                    onChange={handleChange}
                    placeholder="Enter additional remarks..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-btn"
                  disabled={saving || masterLoading}
                >
                  <Save size={17} />

                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Return"
                      : "Save Return"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseReturn;
