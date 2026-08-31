import React, { useEffect, useMemo, useState } from "react";
import "./Invoices.css";

import {
  Search,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Receipt,
  IndianRupee,
  Clock,
  AlertCircle,
  UserCheck,
  Tag,
} from "lucide-react";

import {
  getSalesInvoices,
  createSalesInvoice,
  updateSalesInvoice,
  deleteSalesInvoice,
} from "../../../services/invoiceService";

import { getStores } from "../../../services/storeService";
import { getWarehouses } from "../../../services/warehouseService";
import { getProducts } from "../../../services/productService";
import { getVariants } from "../../../services/productVariantService";
import { getCustomers } from "../../../services/customerService";
import { getCoupons } from "../../../services/couponService";
import { checkApplicableOffer } from "../../../services/offerService";

const CUSTOMER_TYPES = [
  { label: "Regular", value: "regular" },
  { label: "Walk-In", value: "walk_in" },
  { label: "Wholesale", value: "wholesale" },
];

const BILLING_TYPES = ["POS", "Online", "Manual"];
const PAYMENT_METHODS = ["Cash", "UPI", "Card", "Wallet", "Credit", "Split"];
const PAGE_LIMIT = 10;

const generateInvoiceNumber = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const milliseconds = String(now.getMilliseconds()).padStart(3, "0");
  return `INV-${year}${month}${day}-${hours}${minutes}${seconds}${milliseconds}`;
};

const emptyItem = () => ({
  product: "",
  variant: "",
  skuCode: "",
  barcode: "",
  productName: "",
  unit: "",
  packSize: "",
  hsnCode: "",
  expiryDate: "",
  quantity: 1,
  price: 0,
  discount: 0,
  gstPercentage: 0,
});

const emptyInvoice = () => ({
  invoiceNo: "",
  customer: "",
  store: "",
  warehouse: "",
  invoiceDate: new Date().toISOString().slice(0, 10),
  billingType: "POS",
  customerType: "regular",
  paymentMethod: "Cash",
  paidAmount: 0,
  couponCode: "",
  couponAmount: 0,
  remarks: "",
});

export default function SalesInvoice() {
  const [invoices, setInvoices] = useState([]);
  const [stores, setStores] = useState([]);
  
  // Toolbar dropdown lists
  const [toolbarWarehouses, setToolbarWarehouses] = useState([]);

  // Store & Warehouse filtered lists for the modal form dropdowns
  const [formWarehouses, setFormWarehouses] = useState([]);
  const [formCustomers, setFormCustomers] = useState([]);
  const [formProducts, setFormProducts] = useState([]);
  const [formVariants, setFormVariants] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [search, setSearch] = useState("");
  const [storeFilter, setStoreFilter] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [billingTypeFilter, setBillingTypeFilter] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState(emptyInvoice());
  const [items, setItems] = useState([emptyItem()]);

  // Offer integration state
  const [appliedOfferName, setAppliedOfferName] = useState("");

  const selectedCustomerDetails = useMemo(() => {
    if (!formData.customer) return null;
    return formCustomers.find((c) => c._id === formData.customer) || null;
  }, [formData.customer, formCustomers]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await getSalesInvoices({
        page,
        limit: PAGE_LIMIT,
        search: search || undefined,
        store: storeFilter || undefined,
        warehouse: warehouseFilter || undefined,
        paymentStatus: paymentStatusFilter || undefined,
        billingType: billingTypeFilter || undefined,
      });

      if (res?.data?.success) {
        setInvoices(res.data.data || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalRecords(res.data.totalRecords || 0);
      } else {
        setInvoices([]);
        setTotalPages(1);
        setTotalRecords(0);
      }
    } catch (err) {
      console.error("Fetch invoices error:", err);
      setInvoices([]);
      setTotalPages(1);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchGlobalStoresAndWarehouses = async () => {
    try {
      const [storeRes, whRes] = await Promise.all([
        getStores(),
        getWarehouses(),
      ]);
      if (storeRes?.success) {
        setStores(storeRes.data || []);
      }
      if (whRes?.data || whRes?.success) {
        setToolbarWarehouses(whRes?.data?.data || whRes?.data || []);
      }
    } catch (err) {
      console.error("Store/Warehouse global data error:", err);
    }
  };

  // Fetch store-dependent lists for the sales invoice modal form
  const fetchStoreDependentData = async (storeId) => {
    if (!storeId) {
      setFormWarehouses([]);
      setFormCustomers([]);
      setFormProducts([]);
      setFormVariants([]);
      return;
    }

    try {
      const [warehouseRes, customerRes] = await Promise.all([
        getWarehouses({ store: storeId }),
        getCustomers({ store: storeId }),
      ]);

      setFormWarehouses(warehouseRes?.data || warehouseRes?.data?.data || []);
      setFormCustomers(customerRes?.data?.data || customerRes?.data || []);
      setFormProducts([]);
      setFormVariants([]);
    } catch (err) {
      console.error("Failed to load store dependent data:", err);
    }
  };

  // Fetch warehouse-dependent products and variants inside the modal form
  const fetchWarehouseDependentProducts = async (storeId, warehouseId) => {
    if (!storeId || !warehouseId) {
      setFormProducts([]);
      setFormVariants([]);
      return;
    }

    try {
      const params = { store: storeId, warehouse: warehouseId };
      const [productRes, variantRes] = await Promise.all([
        getProducts(params),
        getVariants(params),
      ]);

      setFormProducts(productRes?.data?.data || productRes?.data || []);
      setFormVariants(variantRes?.data?.data || variantRes?.data || []);
    } catch (err) {
      console.error("Failed to load warehouse dependent products:", err);
    }
  };

  useEffect(() => {
    fetchGlobalStoresAndWarehouses();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInvoices();
    }, 300);
    return () => clearTimeout(timer);
  }, [page, search, storeFilter, warehouseFilter, paymentStatusFilter, billingTypeFilter]);

  useEffect(() => {
    setPage(1);
  }, [search, storeFilter, warehouseFilter, paymentStatusFilter, billingTypeFilter]);

  const paidCount = invoices.filter(
    (invoice) => invoice.paymentStatus === "Paid",
  ).length;

  const pendingCount = invoices.filter(
    (invoice) => invoice.paymentStatus === "Pending",
  ).length;

  const pageValue = invoices.reduce(
    (sum, invoice) => sum + Number(invoice.grandTotal || 0),
    0,
  );

  const updateField = async (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));

    if (key === "store") {
      await fetchStoreDependentData(value);
      setFormData((prev) => ({
        ...prev,
        customer: "",
        warehouse: "",
      }));
      setItems([emptyItem()]);
    }

    if (key === "warehouse") {
      await fetchWarehouseDependentProducts(formData.store, value);
      setItems([emptyItem()]);
    }
  };

  // --- Auto-Check Promotional Offer ---
  useEffect(() => {
    const evaluateOffers = async () => {
      if (!formData.store || items.length === 0) {
        setAppliedOfferName("");
        return;
      }

      const firstValidItem = items.find((it) => it.product);
      if (!firstValidItem) return;

      const currentBillAmount = items.reduce(
        (sum, item) => sum + Number(item.quantity || 0) * Number(item.price || 0),
        0
      );

      if (currentBillAmount <= 0) return;

      try {
        const res = await checkApplicableOffer({
          store: formData.store,
          productId: firstValidItem.product,
          billAmount: currentBillAmount,
        });

        if (res?.data?.success && res.data.offerAvailable && res.data.bestOffer) {
          const best = res.data.bestOffer;
          setAppliedOfferName(best.offerName);
          updateField("couponAmount", best.discount);
          if (best.offerName) {
            updateField("couponCode", best.offerName.toUpperCase());
          }
        }
      } catch (err) {
        console.error("Check applicable offer error:", err);
      }
    };

    evaluateOffers();
  }, [formData.store, items]);

  // --- Auto-Fetch Coupon Discount ---
  const handleCouponBlur = async () => {
    const code = formData.couponCode.trim().toUpperCase();
    if (!code) {
      updateField("couponAmount", 0);
      setAppliedOfferName("");
      return;
    }

    try {
      const res = await getCoupons();
      const couponsList = res?.data?.data || res?.data || [];
      
      const matchedCoupon = couponsList.find(
        (c) => String(c.couponCode || "").toUpperCase() === code
      );

      if (matchedCoupon) {
        const discountType = matchedCoupon.discountType || matchedCoupon.type || "fixed";
        const rawValue = Number(matchedCoupon.discountValue || matchedCoupon.discount || 0);

        let finalCouponAmt = rawValue;

        if (discountType.toLowerCase() === "percentage" || discountType.toLowerCase() === "percent") {
          let currentTaxable = 0;
          items.forEach((item) => {
            const gross = Number(item.quantity || 0) * Number(item.price || 0);
            const discount = Math.min(Math.max(Number(item.discount || 0), 0), gross);
            currentTaxable += Math.max(gross - discount, 0);
          });
          finalCouponAmt = (currentTaxable * rawValue) / 100;
        }

        updateField("couponAmount", Number(finalCouponAmt.toFixed(2)));
      } else {
        alert("Invalid or expired coupon code.");
        updateField("couponCode", "");
        updateField("couponAmount", 0);
      }
    } catch (err) {
      console.error("Coupon fetch error:", err);
    }
  };

  const handleCustomerTypeChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      customerType: value,
      customer: "",
    }));
  };

  const updateItem = (index, key, value) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [key]: value,
            }
          : item,
      ),
    );
  };

  const handleItemProductChange = (index, productId) => {
    const product = formProducts.find((p) => p._id === productId);
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              product: productId,
              productName: product?.productName || "",
              hsnCode: product?.hsnCode || "",
              variant: "",
              skuCode: "",
              barcode: "",
              unit: "",
              packSize: "",
              price: 0,
              gstPercentage: 0,
            }
          : item,
      ),
    );
  };

  const handleItemVariantChange = (index, variantId) => {
    const variant = formVariants.find((v) => v._id === variantId);
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              variant: variantId,
              skuCode: variant?.skuCode || "",
              barcode: variant?.barcode || "",
              unit: variant?.unit?._id || variant?.unit || "",
              packSize: variant?.packSize || "",
              price: variant?.sellingPrice ?? variant?.price ?? 0,
              gstPercentage: variant?.gstPercentage ?? 0,
            }
          : item,
      ),
    );
  };

  const variantsForItemProduct = (productId) => {
    if (!productId) return [];
    return formVariants.filter((v) => (v.product?._id || v.product) === productId);
  };

  const availableStockForItem = (item) => {
    if (item.variant) {
      const variant = formVariants.find((v) => v._id === item.variant);
      return variant ? Number(variant.currentStock || 0) : null;
    }
    if (item.product) {
      const product = formProducts.find((p) => p._id === item.product);
      return product ? Number(product.totalStock || 0) : null;
    }
    return null;
  };

  const addItemRow = () => {
    setItems((prev) => [...prev, emptyItem()]);
  };

  const removeItemRow = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const totalsPreview = useMemo(() => {
    let subTotal = 0;
    let discountAmount = 0;
    let taxableAmount = 0;
    let cgstAmount = 0;
    let sgstAmount = 0;
    let gstAmount = 0;

    items.forEach((item) => {
      const qty = Number(item.quantity || 0);
      const price = Number(item.price || 0);
      const discount = Number(item.discount || 0);
      const gross = qty * price;
      const safeDiscount = Math.min(Math.max(discount, 0), gross);
      const taxable = Math.max(gross - safeDiscount, 0);
      const gstPercentage = Number(item.gstPercentage || 0);
      const gst = (taxable * gstPercentage) / 100;

      subTotal += gross;
      discountAmount += safeDiscount;
      taxableAmount += taxable;
      cgstAmount += gst / 2;
      sgstAmount += gst / 2;
      gstAmount += gst;
    });

    const couponAmount = Math.min(
      Math.max(Number(formData.couponAmount || 0), 0),
      taxableAmount,
    );
    const taxableAfterCoupon = Math.max(taxableAmount - couponAmount, 0);
    const couponRatio =
      taxableAmount > 0 ? taxableAfterCoupon / taxableAmount : 0;

    const finalCgst = cgstAmount * couponRatio;
    const finalSgst = sgstAmount * couponRatio;
    const finalGst = finalCgst + finalSgst;
    const totalBeforeRound = taxableAfterCoupon + finalGst;
    const roundOffAmount = Math.round(totalBeforeRound) - totalBeforeRound;
    const grandTotal = Math.round(totalBeforeRound);
    const paidAmount = Math.max(Number(formData.paidAmount || 0), 0);
    const dueAmount = Math.max(grandTotal - paidAmount, 0);
    const returnAmount = Math.max(paidAmount - grandTotal, 0);

    let paymentStatus = "Pending";
    if (grandTotal === 0 || paidAmount >= grandTotal) {
      paymentStatus = "Paid";
    } else if (paidAmount > 0) {
      paymentStatus = "Partial";
    }

    return {
      subTotal: subTotal.toFixed(2),
      discountAmount: discountAmount.toFixed(2),
      taxableAmount: taxableAmount.toFixed(2),
      couponAmount: couponAmount.toFixed(2),
      taxableAfterCoupon: taxableAfterCoupon.toFixed(2),
      cgstAmount: finalCgst.toFixed(2),
      sgstAmount: finalSgst.toFixed(2),
      gstAmount: finalGst.toFixed(2),
      roundOffAmount: roundOffAmount.toFixed(2),
      grandTotal,
      paidAmount,
      dueAmount,
      returnAmount,
      paymentStatus,
    };
  }, [items, formData.paidAmount, formData.couponAmount]);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      ...emptyInvoice(),
      invoiceNo: generateInvoiceNumber(),
    });
    setItems([emptyItem()]);
    setFormWarehouses([]);
    setFormCustomers([]);
    setFormProducts([]);
    setFormVariants([]);
    setAppliedOfferName("");
    setShowModal(true);
  };

  const openEditModal = async (invoice) => {
    setEditingId(invoice._id);
    const storeId = invoice.store?._id || invoice.store || "";
    const whId = invoice.warehouse?._id || invoice.warehouse || "";

    if (storeId) {
      await fetchStoreDependentData(storeId);
      if (whId) {
        await fetchWarehouseDependentProducts(storeId, whId);
      }
    }

    setFormData({
      invoiceNo: invoice.invoiceNo || "",
      customer: invoice.customer?._id || invoice.customer || "",
      store: storeId,
      warehouse: whId,
      invoiceDate: invoice.invoiceDate
        ? new Date(invoice.invoiceDate).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      billingType: invoice.billingType || "POS",
      customerType: invoice.customerType || "regular",
      paymentMethod: invoice.paymentMethod || "Cash",
      paidAmount: invoice.paidAmount ?? 0,
      couponCode: invoice.couponCode || "",
      couponAmount: invoice.couponAmount ?? 0,
      remarks: invoice.remarks || "",
    });

    const mappedItems = (invoice.items || []).map((item) => ({
      product: item.product?._id || item.product || "",
      variant: item.variant?._id || item.variant || "",
      skuCode: item.skuCode || "",
      barcode: item.barcode || "",
      productName: item.productName || "",
      unit: item.unit?._id || item.unit || "",
      packSize: item.packSize || "",
      hsnCode: item.hsnCode || "",
      expiryDate: item.expiryDate
        ? new Date(item.expiryDate).toISOString().slice(0, 10)
        : "",
      quantity: item.quantity ?? 1,
      price: item.price ?? 0,
      discount: item.discount ?? 0,
      gstPercentage: item.gstPercentage ?? 0,
    }));

    setItems(mappedItems.length ? mappedItems : [emptyItem()]);
    setAppliedOfferName("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;
    setShowModal(false);
    setEditingId(null);
    setFormData(emptyInvoice());
    setItems([emptyItem()]);
    setFormWarehouses([]);
    setFormCustomers([]);
    setFormProducts([]);
    setFormVariants([]);
    setAppliedOfferName("");
  };

  const cleanObjectId = (value) => {
    if (value === undefined || value === null || value === "") {
      return undefined;
    }
    return value;
  };

  const prepareItemForBackend = (item) => {
    const cleaned = {
      product: cleanObjectId(item.product),
      variant: cleanObjectId(item.variant),
      skuCode: item.skuCode || undefined,
      barcode: item.barcode || undefined,
      productName: item.productName || undefined,
      unit: cleanObjectId(item.unit),
      packSize: item.packSize || undefined,
      hsnCode: item.hsnCode || undefined,
      expiryDate: item.expiryDate || undefined,
      quantity: Number(item.quantity || 0),
      price: Number(item.price || 0),
      discount: Number(item.discount || 0),
      gstPercentage: Number(item.gstPercentage || 0),
    };

    Object.keys(cleaned).forEach((key) => {
      if (cleaned[key] === undefined || cleaned[key] === null) {
        delete cleaned[key];
      }
    });

    return cleaned;
  };

  const handleSubmit = async () => {
    if (!formData.invoiceNo) {
      alert("Invoice number could not be generated.");
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

    const validItems = items.filter(
      (item) => item.product && Number(item.quantity) > 0,
    );

    if (validItems.length === 0) {
      alert("Add at least one line item with a product and quantity.");
      return;
    }

    if (formData.customerType !== "walk_in" && !formData.customer) {
      alert(`Please select a customer for this customer type.`);
      return;
    }

    const paidAmount = Math.max(Number(formData.paidAmount || 0), 0);
    const couponAmount = Math.max(Number(formData.couponAmount || 0), 0);

    const payload = {
      invoiceNo: formData.invoiceNo,
      invoiceDate: formData.invoiceDate,
      store: cleanObjectId(formData.store),
      warehouse: cleanObjectId(formData.warehouse),
      customer:
        formData.customerType === "walk_in"
          ? undefined
          : cleanObjectId(formData.customer),
      customerType: formData.customerType,
      billingType: formData.billingType,
      paymentMethod: formData.paymentMethod,
      paidAmount,
      couponCode: formData.couponCode.trim() || undefined,
      couponAmount,
      remarks: formData.remarks.trim() || undefined,
      items: validItems.map(prepareItemForBackend),
    };

    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined || payload[key] === null) {
        delete payload[key];
      }
    });

    try {
      setSaving(true);
      if (editingId) {
        await updateSalesInvoice(editingId, payload);
      } else {
        await createSalesInvoice(payload);
      }

      alert(
        editingId
          ? "Sales Invoice updated successfully."
          : "Sales Invoice created successfully.",
      );

      closeModal();
      await fetchInvoices();
    } catch (err) {
      console.error("Sales Invoice save error:", err);
      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Unable to save Sales Invoice.";
      alert(backendMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (invoice) => {
    const confirmed = window.confirm(
      `Delete invoice ${invoice.invoiceNo}? This will remove it from the list and restore the stock it deducted.`,
    );

    if (!confirmed) return;

    try {
      await deleteSalesInvoice(invoice._id);
      await fetchInvoices();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Unable to delete invoice.");
    }
  };

  return (
    <div className="invoice-page">
      <div className="invoice-content">
        <div className="page-header">
          <div>
            <h2>Sales Invoices</h2>
            <p>Create and manage store-wise customer sales invoices.</p>
          </div>

          <button className="primary-btn" onClick={openAddModal}>
            <Plus size={18} />
            New Invoice
          </button>
        </div>

        <div className="invoice-toolbar">
          <div className="invoice-search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search invoice no, remarks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="invoice-filter-select"
            value={storeFilter}
            onChange={(e) => {
              setStoreFilter(e.target.value);
              setWarehouseFilter("");
            }}
          >
            <option value="">All Stores</option>
            {stores.map((store) => (
              <option key={store._id} value={store._id}>
                {store.storeName}
              </option>
            ))}
          </select>

          <select
            className="invoice-filter-select"
            value={warehouseFilter}
            onChange={(e) => setWarehouseFilter(e.target.value)}
            disabled={!storeFilter}
          >
            <option value="">
              {storeFilter ? "All Warehouses" : "Select a store first"}
            </option>
            {toolbarWarehouses
              .filter((w) => String(w.store?._id || w.store) === String(storeFilter))
              .map((w) => (
                <option key={w._id} value={w._id}>
                  {w.warehouseName}
                </option>
              ))}
          </select>

          <select
            className="invoice-filter-select"
            value={billingTypeFilter}
            onChange={(e) => setBillingTypeFilter(e.target.value)}
          >
            <option value="">All Billing Types</option>
            {BILLING_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <select
            className="invoice-filter-select"
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.target.value)}
          >
            <option value="">All Payment Status</option>
            <option value="Paid">Paid</option>
            <option value="Partial">Partial</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        <div className="invoice-summary-grid">
          <div className="invoice-summary-card card-blue">
            <div className="invoice-summary-icon">
              <Receipt size={22} />
            </div>
            <div>
              <h2>{totalRecords}</h2>
              <p>Total Invoices</p>
            </div>
          </div>

          <div className="invoice-summary-card card-green">
            <div className="invoice-summary-icon">
              <IndianRupee size={22} />
            </div>
            <div>
              <h2>{paidCount}</h2>
              <p>Paid (this page)</p>
            </div>
          </div>

          <div className="invoice-summary-card card-amber">
            <div className="invoice-summary-icon">
              <Clock size={22} />
            </div>
            <div>
              <h2>{pendingCount}</h2>
              <p>Pending (this page)</p>
            </div>
          </div>

          <div className="invoice-summary-card card-purple">
            <div className="invoice-summary-icon">
              <AlertCircle size={22} />
            </div>
            <div>
              <h2>₹{pageValue.toLocaleString("en-IN")}</h2>
              <p>Value (this page)</p>
            </div>
          </div>
        </div>

        <div className="table-card">
          <table className="invoice-table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Customer</th>
                <th>Store</th>
                <th>Warehouse</th>
                <th>Items</th>
                <th>Grand Total</th>
                <th>Payment</th>
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
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-row">
                    No Sales Invoices Found
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice._id}>
                    <td>
                      <div className="invoice-info">
                        <strong>{invoice.invoiceNo}</strong>
                        <p>
                          {invoice.billingType}
                          {" · "}
                          {invoice.invoiceDate
                            ? new Date(invoice.invoiceDate).toLocaleDateString(
                                "en-IN",
                              )
                            : "—"}
                        </p>
                      </div>
                    </td>

                    <td>
                      {invoice.customer?.customerName ||
                        invoice.customerName ||
                        (invoice.customerType === "walk_in" ? "Walk-In Customer" : "—")}
                    </td>
                    <td>{invoice.store?.storeName || "—"}</td>
                    <td>{invoice.warehouse?.warehouseName || "—"}</td>
                    <td>{invoice.itemCount ?? invoice.items?.length ?? 0}</td>
                    <td>
                      <strong>
                        ₹
                        {Number(invoice.grandTotal || 0).toLocaleString(
                          "en-IN",
                        )}
                      </strong>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          invoice.paymentStatus?.toLowerCase() || "pending"
                        }`}
                      >
                        {invoice.paymentStatus || "Pending"}
                      </span>
                    </td>

                    <td>
                      <div className="action-btns">
                        <button
                          className="edit-btn"
                          title="Edit"
                          onClick={() => openEditModal(invoice)}
                        >
                          <Edit size={16} />
                        </button>

                        <button
                          className="delete-btn"
                          title="Delete"
                          onClick={() => handleDelete(invoice)}
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
            <div className="invoice-modal">
              <div className="modal-header">
                <h3>
                  {editingId ? "Edit Sales Invoice" : "New Sales Invoice"}
                </h3>
                <button
                  className="close-btn"
                  onClick={closeModal}
                  disabled={saving}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body">
                <h4 className="section-title">Invoice Details</h4>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Invoice No</label>
                    <input
                      type="text"
                      value={formData.invoiceNo}
                      readOnly
                      disabled
                      className="auto-generated-input"
                    />
                    <small className="field-hint">
                      Automatically generated
                    </small>
                  </div>

                  <div className="form-group">
                    <label>Invoice Date</label>
                    <input
                      type="date"
                      value={formData.invoiceDate}
                      onChange={(e) =>
                        updateField("invoiceDate", e.target.value)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Store *</label>
                    <select
                      value={formData.store}
                      onChange={(e) => updateField("store", e.target.value)}
                    >
                      <option value="">Select Store</option>
                      {stores.map((store) => (
                        <option key={store._id} value={store._id}>
                          {store.storeName}
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
                      {formWarehouses.map((warehouse) => (
                        <option key={warehouse._id} value={warehouse._id}>
                          {warehouse.warehouseName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Customer Type</label>
                    <select
                      value={formData.customerType}
                      onChange={(e) => handleCustomerTypeChange(e.target.value)}
                    >
                      {CUSTOMER_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>
                      Customer {formData.customerType !== "walk_in" ? "*" : ""}
                    </label>
                    <select
                      value={formData.customer}
                      disabled={formData.customerType === "walk_in" || !formData.store}
                      onChange={(e) => updateField("customer", e.target.value)}
                    >
                      <option value="">
                        {formData.customerType === "walk_in"
                          ? "Walk-In (No customer account needed)"
                          : !formData.store
                          ? "Please select a store first"
                          : "Select Store Customer"}
                      </option>
                      {formData.customerType !== "walk_in" &&
                        formData.store &&
                        formCustomers
                          .filter((customer) => {
                            const cType = customer.customerType || "";
                            const matchesType =
                              cType.toLowerCase() === formData.customerType.toLowerCase();

                            const custStoreId = customer.store?._id || customer.store || "";
                            const matchesStore = String(custStoreId) === String(formData.store);

                            return matchesType && matchesStore;
                          })
                          .map((customer) => (
                            <option key={customer._id} value={customer._id}>
                              {customer.customerName} {customer.phone ? `(${customer.phone})` : ""}
                            </option>
                          ))}
                    </select>
                  </div>
                </div>

                {selectedCustomerDetails && (
                  <div
                    className="linked-customer-card"
                    style={{
                      marginTop: "12px",
                      padding: "12px 16px",
                      background: "var(--bp-bg)",
                      border: "1px solid var(--bp-border)",
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <UserCheck size={20} color="var(--bp-primary)" />
                      <div>
                        <strong style={{ fontSize: "13px", color: "var(--bp-ink)" }}>
                          {selectedCustomerDetails.customerName}
                        </strong>
                        <p style={{ margin: 0, fontSize: "12px", color: "var(--bp-muted)" }}>
                          Phone: {selectedCustomerDetails.phone || "N/A"} | Type: {selectedCustomerDetails.customerType}
                        </p>
                      </div>
                    </div>
                    {selectedCustomerDetails.loyaltyPoints !== undefined && (
                      <span className="badge paid" style={{ fontSize: "11px" }}>
                        Loyalty Pts: {selectedCustomerDetails.loyaltyPoints}
                      </span>
                    )}
                  </div>
                )}

                <div className="form-grid" style={{ marginTop: "15px" }}>
                  <div className="form-group">
                    <label>Billing Type</label>
                    <select
                      value={formData.billingType}
                      onChange={(e) =>
                        updateField("billingType", e.target.value)
                      }
                    >
                      {BILLING_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Payment Method</label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) =>
                        updateField("paymentMethod", e.target.value)
                      }
                    >
                      {PAYMENT_METHODS.map((method) => (
                        <option key={method} value={method}>
                          {method}
                        </option>
                      ))}
                    </select>
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

                  <div className="form-group">
                    <label>Coupon / Promo Code</label>
                    <input
                      type="text"
                      placeholder="e.g. SAVE100 or Auto-Offer"
                      value={formData.couponCode}
                      onChange={(e) =>
                        updateField("couponCode", e.target.value.toUpperCase())
                      }
                      onBlur={handleCouponBlur}
                    />
                    {appliedOfferName && (
                      <small className="field-hint" style={{ color: "var(--bp-green)", fontWeight: 600 }}>
                        <Tag size={12} style={{ display: "inline", marginRight: 3 }} />
                        Applied Offer: {appliedOfferName}
                      </small>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Discount / Coupon Amount</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.couponAmount}
                      onChange={(e) =>
                        updateField("couponAmount", e.target.value)
                      }
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

                <h4 className="section-title">Line Items</h4>

                <div className="items-table-wrap">
                  <table className="items-table">
                    <thead>
                      <tr>
                        <th style={{ minWidth: 150 }}>Product *</th>
                        <th style={{ minWidth: 130 }}>Variant / SKU</th>
                        <th style={{ width: 100 }}>Qty *</th>
                        <th style={{ width: 100 }}>Price</th>
                        <th style={{ width: 90 }}>Discount</th>
                        <th style={{ width: 80 }}>GST %</th>
                        <th style={{ width: 100 }}>Total</th>
                        <th style={{ width: 130 }}>Expiry</th>
                        <th style={{ width: 40 }} />
                      </tr>
                    </thead>

                    <tbody>
                      {items.map((item, index) => {
                        const gross =
                          Number(item.quantity || 0) * Number(item.price || 0);
                        const discount = Math.min(
                          Math.max(Number(item.discount || 0), 0),
                          gross,
                        );
                        const taxable = Math.max(gross - discount, 0);
                        const gst =
                          (taxable * Number(item.gstPercentage || 0)) / 100;
                        const lineTotal = taxable + gst;
                        const available = availableStockForItem(item);

                        return (
                          <tr key={index}>
                            <td>
                              <select
                                value={item.product}
                                disabled={!formData.warehouse}
                                onChange={(e) =>
                                  handleItemProductChange(index, e.target.value)
                                }
                              >
                                <option value="">
                                  {!formData.store
                                    ? "Select a store first"
                                    : !formData.warehouse
                                    ? "Select a warehouse first"
                                    : "Select Product"}
                                </option>
                                {formProducts.map((product) => (
                                  <option key={product._id} value={product._id}>
                                    {product.productName}
                                  </option>
                                ))}
                              </select>
                            </td>

                            <td>
                              <select
                                value={item.variant}
                                disabled={!item.product}
                                onChange={(e) =>
                                  handleItemVariantChange(index, e.target.value)
                                }
                              >
                                <option value="">
                                  {item.product
                                    ? "Select Variant"
                                    : "Pick product first"}
                                </option>
                                {variantsForItemProduct(item.product).map(
                                  (variant) => (
                                    <option
                                      key={variant._id}
                                      value={variant._id}
                                    >
                                      {variant.skuCode}
                                    </option>
                                  ),
                                )}
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
                              {available !== null && (
                                <div
                                  className={`stock-hint ${
                                    Number(item.quantity) > available
                                      ? "low"
                                      : ""
                                  }`}
                                >
                                  {available} in stock
                                </div>
                              )}
                            </td>

                            <td>
                              <input
                                type="number"
                                min="0"
                                value={item.price}
                                onChange={(e) =>
                                  updateItem(index, "price", e.target.value)
                                }
                              />
                            </td>

                            <td>
                              <input
                                type="number"
                                min="0"
                                value={item.discount}
                                onChange={(e) =>
                                  updateItem(index, "discount", e.target.value)
                                }
                              />
                            </td>

                            <td>
                              <input
                                type="number"
                                min="0"
                                value={item.gstPercentage}
                                onChange={(e) =>
                                  updateItem(
                                    index,
                                    "gstPercentage",
                                    e.target.value,
                                  )
                                }
                              />
                            </td>

                            <td>
                              <input readOnly value={lineTotal.toFixed(2)} />
                            </td>

                            <td>
                              <input
                                type="date"
                                value={item.expiryDate}
                                onChange={(e) =>
                                  updateItem(
                                    index,
                                    "expiryDate",
                                    e.target.value,
                                  )
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
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <button
                  type="button"
                  className="add-item-btn"
                  onClick={addItemRow}
                  disabled={!formData.warehouse}
                >
                  <Plus size={14} /> Add Item
                </button>

                <div className="totals-box">
                  <div className="totals-row">
                    <span>Subtotal</span>
                    <span>₹{totalsPreview.subTotal}</span>
                  </div>

                  <div className="totals-row">
                    <span>Item Discount</span>
                    <span>₹{totalsPreview.discountAmount}</span>
                  </div>

                  <div className="totals-row">
                    <span>Taxable Amount</span>
                    <span>₹{totalsPreview.taxableAmount}</span>
                  </div>

                  <div className="totals-row coupon-row">
                    <span>Coupon / Offer Discount</span>
                    <span>- ₹{totalsPreview.couponAmount}</span>
                  </div>

                  <div className="totals-row">
                    <span>Taxable After Coupon</span>
                    <span>₹{totalsPreview.taxableAfterCoupon}</span>
                  </div>

                  <div className="totals-row">
                    <span>CGST + SGST</span>
                    <span>
                      ₹{totalsPreview.cgstAmount} + ₹{totalsPreview.sgstAmount}
                    </span>
                  </div>

                  <div className="totals-row">
                    <span>Round Off</span>
                    <span>₹{totalsPreview.roundOffAmount}</span>
                  </div>

                  <div className="totals-row">
                    <span>Payment Status</span>
                    <span className={`badge ${totalsPreview.paymentStatus.toLowerCase()}`}>
                      {totalsPreview.paymentStatus}
                    </span>
                  </div>

                  <div className="totals-row due-amount">
                    <span>Balance / Due</span>
                    <span>₹{totalsPreview.dueAmount}</span>
                  </div>

                  <div className="totals-row">
                    <span>Return Amount</span>
                    <span>₹{totalsPreview.returnAmount}</span>
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
                    ? "Update Invoice"
                    : "Create Invoice"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}