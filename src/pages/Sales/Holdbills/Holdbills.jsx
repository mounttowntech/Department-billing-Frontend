import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  RefreshCw,
  FileText,
  ClipboardList,
  Clock3,
  CheckCircle2,
  IndianRupee,
} from "lucide-react";

import {
  getHoldBills,
  getHoldBillById,
  createHoldBill,
  updateHoldBill,
  convertHoldBill,
  deleteHoldBill,
  getCustomers,
  getProducts,
  getProductVariants,
  getStores,
} from "../../../services/holdBillService";

import "./Holdbills.css";

const emptyItem = {
  product: "",
  variant: "",
  batch: "",
  skuCode: "",
  barcode: "",
  productName: "",
  quantity: 1,
  salesPrice: 0,
  discount: 0,
  gstPercentage: 0,
};

const emptyForm = {
  customer: "",
  store: "",
  remarks: "",
  items: [],
};

const Holdbills = () => {
  const [holdBills, setHoldBills] = useState([]);

  const [stores, setStores] = useState([]);
  
  // Store-filtered lists for the modal form dropdowns
  const [formCustomers, setFormCustomers] = useState([]);
  const [formProducts, setFormProducts] = useState([]);
  const [formVariants, setFormVariants] = useState([]);

  const [loading, setLoading] = useState(false);
  const [masterLoading, setMasterLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [page, setPage] = useState(1);
  const limit = 10;

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [form, setForm] = useState(emptyForm);

  const getArrayData = (response, keys = []) => {
    if (Array.isArray(response)) {
      return response;
    }
    if (Array.isArray(response?.data)) {
      return response.data;
    }
    for (const key of keys) {
      if (Array.isArray(response?.[key])) {
        return response[key];
      }
    }
    return [];
  };

  const loadGlobalStores = async () => {
    try {
      setMasterLoading(true);
      const storeRes = await getStores();
      setStores(getArrayData(storeRes, ["stores"]));
    } catch (error) {
      console.error("Store API Error:", error);
    } finally {
      setMasterLoading(false);
    }
  };

  // Fetch store-dependent lists for the modal form
  const fetchStoreDependentData = async (storeId) => {
    if (!storeId) {
      setFormCustomers([]);
      setFormProducts([]);
      setFormVariants([]);
      return;
    }

    try {
      setMasterLoading(true);
      const [custRes, prodRes, varRes] = await Promise.all([
        getCustomers({ store: storeId }),
        getProducts({ store: storeId }),
        getProductVariants({ store: storeId }),
      ]);

      setFormCustomers(getArrayData(custRes, ["customers"]));
      setFormProducts(getArrayData(prodRes, ["products"]));
      setFormVariants(getArrayData(varRes, ["variants", "productVariants"]));
    } catch (error) {
      console.error("Failed to load store dependent data:", error);
    } finally {
      setMasterLoading(false);
    }
  };

  const loadHoldBills = async () => {
    try {
      setLoading(true);

      const response = await getHoldBills({
        page,
        limit,
        search: search || undefined,
        status: status || undefined,
      });

      const data =
        Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
          ? response
          : [];

      setHoldBills(data);

      if (response?.pagination) {
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error("Hold Bills Error:", error);
      if (error.response?.status === 401) {
        alert("Session expired. Please login again.");
      } else {
        alert(error.response?.data?.message || "Unable to load Hold Bills");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGlobalStores();
  }, []);

  useEffect(() => {
    loadHoldBills();
  }, [page, search, status]);

  const findProduct = (productId) => {
    return formProducts.find(
      (product) => String(product?._id) === String(productId),
    );
  };

  const findVariant = (variantId) => {
    return formVariants.find(
      (variant) => String(variant?._id) === String(variantId),
    );
  };

  const getProductBarcode = (product) => {
    if (!product) return "";
    return (
      product.barcode ||
      product.barCode ||
      product.productBarcode ||
      product.barcodeNumber ||
      product.ean ||
      product.upc ||
      ""
    );
  };

  const getProductSku = (product) => {
    if (!product) return "";
    return (
      product.skuCode ||
      product.sku ||
      product.productCode ||
      product.itemCode ||
      ""
    );
  };

  const getProductName = (product) => {
    if (!product) return "";
    return product.productName || product.name || product.product_name || "";
  };

  const getProductPrice = (product) => {
    if (!product) return 0;
    return Number(
      product.salesPrice ??
        product.sellingPrice ??
        product.salePrice ??
        product.price ??
        0,
    );
  };

  const getProductGST = (product) => {
    if (!product) return 0;
    return Number(
      product.gstPercentage ??
        product.gstPercent ??
        product.gst ??
        product.taxPercentage ??
        0,
    );
  };

  const handleProductChange = (index, productId) => {
    const selectedProduct = findProduct(productId);
    const barcode = getProductBarcode(selectedProduct);
    const sku = getProductSku(selectedProduct);
    const productName = getProductName(selectedProduct);
    const salesPrice = getProductPrice(selectedProduct);
    const gstPercentage = getProductGST(selectedProduct);

    setForm((prev) => {
      const items = [...prev.items];
      items[index] = {
        ...items[index],
        product: productId,
        variant: "",
        skuCode: sku,
        barcode: barcode,
        productName: productName,
        salesPrice: salesPrice,
        gstPercentage: gstPercentage,
      };
      return { ...prev, items };
    });
  };

  const handleVariantChange = (index, variantId) => {
    const selectedVariant = findVariant(variantId);
    const currentItem = form.items[index];
    const selectedProduct = findProduct(currentItem.product);

    const variantBarcode =
      selectedVariant?.barcode ||
      selectedVariant?.barCode ||
      selectedVariant?.variantBarcode ||
      "";

    const variantSku =
      selectedVariant?.skuCode ||
      selectedVariant?.sku ||
      selectedVariant?.variantCode ||
      "";

    const variantPrice = Number(
      selectedVariant?.salesPrice ??
        selectedVariant?.sellingPrice ??
        selectedVariant?.salePrice ??
        selectedVariant?.price ??
        getProductPrice(selectedProduct),
    );

    setForm((prev) => {
      const items = [...prev.items];
      items[index] = {
        ...items[index],
        variant: variantId,
        skuCode: variantSku || getProductSku(selectedProduct),
        barcode: variantBarcode || getProductBarcode(selectedProduct),
        salesPrice: variantPrice,
        productName: getProductName(selectedProduct),
      };
      return { ...prev, items };
    });
  };

  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { ...emptyItem }],
    }));
  };

  const removeItem = (index) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const totals = useMemo(() => {
    let quantity = 0;
    let subtotal = 0;
    let gst = 0;
    let discount = 0;

    form.items.forEach((item) => {
      const qty = Number(item.quantity || 0);
      const price = Number(item.salesPrice || 0);
      const itemDiscount = Number(item.discount || 0);
      const gstPercentage = Number(item.gstPercentage || 0);

      const gross = qty * price;
      const taxable = Math.max(gross - itemDiscount, 0);
      const itemGST = (taxable * gstPercentage) / 100;

      quantity += qty;
      subtotal += taxable;
      gst += itemGST;
      discount += itemDiscount;
    });

    return {
      quantity,
      subtotal,
      gst,
      discount,
      grandTotal: subtotal + gst,
    };
  }, [form.items]);

  const summary = useMemo(() => {
    const total = pagination.totalRecords || holdBills.length || 0;
    const holdCount = holdBills.filter(
      (bill) => String(bill.status || "Hold").toLowerCase() === "hold",
    ).length;
    const convertedCount = holdBills.filter(
      (bill) => String(bill.status || "").toLowerCase() === "converted",
    ).length;
    const totalValue = holdBills.reduce(
      (sum, bill) => sum + Number(bill.grandTotal || 0),
      0,
    );

    return {
      total,
      holdCount,
      convertedCount,
      totalValue,
    };
  }, [holdBills, pagination.totalRecords]);

  const openCreate = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      items: [{ ...emptyItem }],
    });
    setFormCustomers([]);
    setFormProducts([]);
    setFormVariants([]);
    setShowModal(true);
  };

  const openEdit = async (id) => {
    try {
      setSaving(true);
      const response = await getHoldBillById(id);
      const bill = response?.data || response;

      if (!bill) {
        alert("Hold Bill not found");
        return;
      }

      const storeId = bill.store?._id || bill.store || "";
      if (storeId) {
        await fetchStoreDependentData(storeId);
      }

      setEditingId(bill._id);
      setForm({
        customer: bill.customer?._id || bill.customer || "",
        store: storeId,
        remarks: bill.remarks || "",
        items: (bill.items || []).map((item) => ({
          product: item.product?._id || item.product || "",
          variant: item.variant?._id || item.variant || "",
          batch: item.batch?._id || item.batch || "",
          skuCode: item.skuCode || item.product?.skuCode || "",
          barcode: item.barcode || item.product?.barcode || "",
          productName:
            item.productName || item.product?.productName || item.product?.name || "",
          quantity: Number(item.quantity || 1),
          salesPrice: Number(item.salesPrice || 0),
          discount: Number(item.discount || 0),
          gstPercentage: Number(item.gstPercentage || 0),
        })),
      });

      setShowModal(true);
    } catch (error) {
      console.error("Edit Hold Bill Error:", error);
      alert(error.response?.data?.message || "Unable to load Hold Bill");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!form.store) {
      alert("Please select a store");
      return;
    }

    if (!form.items.length) {
      alert("Please add at least one item");
      return;
    }

    for (const item of form.items) {
      if (!item.product) {
        alert("Please select a product for every item");
        return;
      }
      if (Number(item.quantity) <= 0) {
        alert("Quantity must be greater than zero");
        return;
      }
      if (Number(item.salesPrice) < 0) {
        alert("Sales price cannot be negative");
        return;
      }
    }

    try {
      setSaving(true);

      const payload = {
        customer: form.customer || undefined,
        store: form.store,
        remarks: form.remarks || "",
        items: form.items.map((item) => ({
          product: item.product,
          variant: item.variant || undefined,
          batch: item.batch || undefined,
          skuCode: item.skuCode || "",
          barcode: item.barcode || "",
          productName: item.productName || "",
          quantity: Number(item.quantity),
          salesPrice: Number(item.salesPrice),
          discount: Number(item.discount || 0),
          gstPercentage: Number(item.gstPercentage || 0),
        })),
      };

      if (editingId) {
        await updateHoldBill(editingId, payload);
        alert("Hold Bill updated successfully");
      } else {
        await createHoldBill(payload);
        alert("Hold Bill created successfully");
      }

      setShowModal(false);
      setEditingId(null);
      setForm(emptyForm);
      await loadHoldBills();
    } catch (error) {
      console.error("Save Hold Bill Error:", error);
      alert(error.response?.data?.message || "Unable to save Hold Bill");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this Hold Bill?");
    if (!confirmed) return;

    try {
      setSaving(true);
      await deleteHoldBill(id);
      alert("Hold Bill deleted successfully");
      await loadHoldBills();
    } catch (error) {
      console.error("Delete Hold Bill Error:", error);
      alert(error.response?.data?.message || "Unable to delete Hold Bill");
    } finally {
      setSaving(false);
    }
  };

  const handleConvert = async (id) => {
    const confirmed = window.confirm("Convert this Hold Bill into a Sales Invoice?");
    if (!confirmed) return;

    try {
      setSaving(true);
      const response = await convertHoldBill(id);
      alert(response?.message || "Hold Bill converted successfully");
      await loadHoldBills();
    } catch (error) {
      console.error("Convert Hold Bill Error:", error);
      alert(error.response?.data?.message || "Unable to convert Hold Bill");
    } finally {
      setSaving(false);
    }
  };

  const money = (value) =>
    Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const getStoreName = (store) => {
    if (!store) return "-";
    if (typeof store === "string") {
      const foundStore = stores.find(
        (item) => String(item?._id) === String(store),
      );
      return foundStore?.storeName || foundStore?.name || store;
    }
    return store.storeName || store.name || "-";
  };

  const getCustomerName = (customer) => {
    if (!customer) return "Walk-in";
    if (typeof customer === "string") {
      const found = formCustomers.find(
        (item) => String(item?._id) === String(customer),
      );
      return found?.customerName || found?.name || "Customer";
    }
    return customer.customerName || customer.name || "Customer";
  };

  return (
    <div className="hold-page">
      <div className="hold-content">
        <div className="page-header">
          <div>
            <h2>Hold Bills</h2>
            <p>Manage parked and pending customer bills</p>
          </div>

          <button className="primary-btn" onClick={openCreate}>
            <Plus size={18} />
            New Hold Bill
          </button>
        </div>

        <div className="hold-toolbar">
          <div className="hold-search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search hold number, product, SKU..."
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
            />

            {search && (
              <button
                className="clear-search"
                type="button"
                onClick={() => setSearch("")}
              >
                <X size={15} />
              </button>
            )}
          </div>

          <select
            className="hold-filter-select"
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
          >
            <option value="">All Status</option>
            <option value="Hold">Hold</option>
            <option value="Converted">Converted</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div className="hold-summary-grid">
          <div className="hold-summary-card card-blue">
            <div className="hold-summary-icon">
              <ClipboardList size={22} />
            </div>
            <div>
              <h2>{summary.total}</h2>
              <p>Total Hold Bills</p>
            </div>
          </div>

          <div className="hold-summary-card card-amber">
            <div className="hold-summary-icon">
              <Clock3 size={22} />
            </div>
            <div>
              <h2>{summary.holdCount}</h2>
              <p>Currently On Hold</p>
            </div>
          </div>

          <div className="hold-summary-card card-green">
            <div className="hold-summary-icon">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <h2>{summary.convertedCount}</h2>
              <p>Converted Bills</p>
            </div>
          </div>

          <div className="hold-summary-card card-purple">
            <div className="hold-summary-icon">
              <IndianRupee size={22} />
            </div>
            <div>
              <h2>₹{money(summary.totalValue)}</h2>
              <p>Current Page Value</p>
            </div>
          </div>
        </div>

        {masterLoading && (
          <div className="info-message">
            <RefreshCw size={16} className="spin" />
            Loading store data...
          </div>
        )}

        <div className="table-card">
          <div className="table-heading">
            <div>
              <h3>Hold Bill List</h3>
              <span>{pagination.totalRecords || holdBills.length || 0} records</span>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
              <RefreshCw size={22} className="spin" />
              <span>Loading Hold Bills...</span>
            </div>
          ) : holdBills.length === 0 ? (
            <div className="empty-state">
              <FileText size={42} />
              <h3>No Hold Bills Found</h3>
              <p>Create a new Hold Bill to get started.</p>
              <button className="primary-btn" onClick={openCreate}>
                <Plus size={17} />
                Create Hold Bill
              </button>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="hold-table">
                <thead>
                  <tr>
                    <th>Hold No</th>
                    <th>Customer</th>
                    <th>Store</th>
                    <th>Items</th>
                    <th>Quantity</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {holdBills.map((bill) => (
                    <tr key={bill._id}>
                      <td>
                        <strong className="hold-no">{bill.holdNo || "-"}</strong>
                      </td>

                      <td>{getCustomerName(bill.customer)}</td>
                      <td>{getStoreName(bill.store)}</td>
                      <td>{bill.totalItems ?? bill.items?.length ?? 0}</td>
                      <td>{bill.totalQuantity ?? 0}</td>

                      <td>
                        <strong>₹{money(bill.grandTotal)}</strong>
                      </td>

                      <td>
                        <span
                          className={`status-pill status-${String(
                            bill.status || "Hold",
                          ).toLowerCase()}`}
                        >
                          {bill.status || "Hold"}
                        </span>
                      </td>

                      <td>
                        {bill.createdAt
                          ? new Date(bill.createdAt).toLocaleDateString("en-IN")
                          : "-"}
                      </td>

                      <td>
                        <div className="action-btns">
                          {bill.status !== "Converted" && (
                            <>
                              <button
                                type="button"
                                className="edit-btn"
                                title="Edit"
                                onClick={() => openEdit(bill._id)}
                              >
                                <Edit size={16} />
                              </button>

                              <button
                                type="button"
                                className="delete-btn"
                                title="Delete"
                                onClick={() => handleDelete(bill._id)}
                              >
                                <Trash2 size={16} />
                              </button>

                              <button
                                type="button"
                                className="convert-btn"
                                disabled={saving}
                                onClick={() => handleConvert(bill._id)}
                              >
                                Convert
                              </button>
                            </>
                          )}

                          {bill.status === "Converted" && (
                            <span className="converted-label">Invoice Created</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showModal && (
          <div className="modal-overlay">
            <div className="hold-modal">
              <div className="modal-header">
                <div>
                  <h3>{editingId ? "Edit Hold Bill" : "Create Hold Bill"}</h3>
                  <p>Add store-wise customer and product details</p>
                </div>

                <button
                  type="button"
                  className="close-btn"
                  disabled={saving}
                  onClick={() => {
                    if (!saving) setShowModal(false);
                  }}
                >
                  <X size={19} />
                </button>
              </div>

              <form onSubmit={handleSave} className="modal-body">
                <div className="section-title">Bill Information</div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Store *</label>
                    <select
                      value={form.store}
                      onChange={(e) => {
                        const storeId = e.target.value;
                        setForm((prev) => ({
                          ...prev,
                          store: storeId,
                          customer: "",
                          items: [{ ...emptyItem }],
                        }));
                        if (storeId) {
                          fetchStoreDependentData(storeId);
                        } else {
                          setFormCustomers([]);
                          setFormProducts([]);
                          setFormVariants([]);
                        }
                      }}
                      required
                    >
                      <option value="">Select Store</option>
                      {stores.map((store) => (
                        <option key={store._id} value={store._id}>
                          {store.storeName}
                          {store.storeCode ? ` - ${store.storeCode}` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Customer</label>
                    <select
                      value={form.customer}
                      disabled={!form.store}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          customer: e.target.value,
                        }))
                      }
                    >
                      <option value="">
                        {form.store ? "Walk-in Customer" : "Select a store first"}
                      </option>
                      {formCustomers
                        .filter((customer) => {
                          const custStoreId = customer.store?._id || customer.store || "";
                          return !form.store || String(custStoreId) === String(form.store);
                        })
                        .map((customer) => (
                          <option key={customer._id} value={customer._id}>
                            {customer.customerName || customer.name || "Customer"}
                            {customer.customerCode ? ` - ${customer.customerCode}` : ""}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="form-group form-group-full">
                    <label>Remarks</label>
                    <textarea
                      rows="2"
                      placeholder="Optional remarks"
                      value={form.remarks}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          remarks: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="section-title">Bill Items</div>

                <div className="items-header">
                  <div>
                    <strong>Items</strong>
                    <span>{form.items.length} item(s)</span>
                  </div>

                  <button
                    type="button"
                    className="add-item-btn"
                    onClick={addItem}
                    disabled={!form.store}
                  >
                    <Plus size={16} />
                    Add Item
                  </button>
                </div>

                <div className="items-list">
                  {form.items.map((item, index) => (
                    <div className="item-card" key={index}>
                      <div className="item-top">
                        <div>
                          <strong>Item {index + 1}</strong>
                          {item.barcode && (
                            <span className="item-barcode-label">
                              Barcode: {item.barcode}
                            </span>
                          )}
                        </div>

                        {form.items.length > 1 && (
                          <button
                            type="button"
                            className="remove-item"
                            title="Remove item"
                            onClick={() => removeItem(index)}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>

                      <div className="item-grid">
                        <div className="form-group product-field">
                          <label>Product *</label>
                          <select
                            value={item.product}
                            disabled={!form.store}
                            onChange={(e) =>
                              handleProductChange(index, e.target.value)
                            }
                            required
                          >
                            <option value="">
                              {form.store ? "Select Product" : "Select a store first"}
                            </option>
                            {formProducts
                              .filter((product) => {
                                const prodStoreId = product.store?._id || product.store || "";
                                return !form.store || String(prodStoreId) === String(form.store);
                              })
                              .map((product) => (
                                <option key={product._id} value={product._id}>
                                  {getProductName(product)}
                                  {getProductSku(product)
                                    ? ` (${getProductSku(product)})`
                                    : ""}
                                </option>
                              ))}
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Variant</label>
                          <select
                            value={item.variant}
                            disabled={!item.product}
                            onChange={(e) =>
                              handleVariantChange(index, e.target.value)
                            }
                          >
                            <option value="">No Variant</option>
                            {formVariants
                              .filter((variant) => {
                                const variantProduct =
                                  variant.product?._id || variant.product;
                                if (!item.product) return true;
                                return (
                                  !variantProduct ||
                                  String(variantProduct) === String(item.product)
                                );
                              })
                              .map((variant) => (
                                <option key={variant._id} value={variant._id}>
                                  {variant.variantName ||
                                    variant.name ||
                                    variant.skuCode ||
                                    "Variant"}
                                </option>
                              ))}
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Quantity *</label>
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemChange(index, "quantity", e.target.value)
                            }
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label>Sales Price</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.salesPrice}
                            onChange={(e) =>
                              handleItemChange(index, "salesPrice", e.target.value)
                            }
                          />
                        </div>

                        <div className="form-group">
                          <label>Discount</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.discount}
                            onChange={(e) =>
                              handleItemChange(index, "discount", e.target.value)
                            }
                          />
                        </div>

                        <div className="form-group">
                          <label>GST %</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.gstPercentage}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "gstPercentage",
                                e.target.value,
                              )
                            }
                          />
                        </div>

                        <div className="form-group">
                          <label>SKU</label>
                          <input
                            type="text"
                            value={item.skuCode}
                            onChange={(e) =>
                              handleItemChange(index, "skuCode", e.target.value)
                            }
                            placeholder="Auto-filled"
                          />
                        </div>

                        <div className="form-group">
                          <label>Barcode</label>
                          <div className="barcode-input">
                            <input
                              type="text"
                              value={item.barcode}
                              onChange={(e) =>
                                handleItemChange(index, "barcode", e.target.value)
                              }
                              placeholder="Auto-filled"
                            />
                            {item.barcode && <span className="barcode-status">✓</span>}
                          </div>
                        </div>
                      </div>

                      {item.productName && (
                        <div className="selected-product-info">
                          <div>
                            <span>Product</span>
                            <strong>{item.productName}</strong>
                          </div>
                          <div>
                            <span>SKU</span>
                            <strong>{item.skuCode || "-"}</strong>
                          </div>
                          <div>
                            <span>Barcode</span>
                            <strong className="barcode-value">
                              {item.barcode || "No barcode"}
                            </strong>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="section-title">Bill Summary</div>

                <div className="totals-card">
                  <div>
                    <span>Items</span>
                    <strong>{form.items.length}</strong>
                  </div>

                  <div>
                    <span>Quantity</span>
                    <strong>{totals.quantity}</strong>
                  </div>

                  <div>
                    <span>Subtotal</span>
                    <strong>₹{money(totals.subtotal)}</strong>
                  </div>

                  <div>
                    <span>Discount</span>
                    <strong>₹{money(totals.discount)}</strong>
                  </div>

                  <div>
                    <span>GST</span>
                    <strong>₹{money(totals.gst)}</strong>
                  </div>

                  <div className="grand-total">
                    <span>Grand Total</span>
                    <strong>₹{money(totals.grandTotal)}</strong>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="cancel-btn"
                    disabled={saving}
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>

                  <button type="submit" className="save-btn" disabled={saving}>
                    <Save size={17} />
                    {saving
                      ? "Saving..."
                      : editingId
                      ? "Update Hold Bill"
                      : "Save Hold Bill"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Holdbills;