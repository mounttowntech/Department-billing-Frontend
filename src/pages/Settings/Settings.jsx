import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Store,
  Receipt,
  Save,
  CheckCircle2,
  Sliders,
  Award,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import { getStores } from "../../services/storeService";
import {
  getSettingsByStore,
  createSettings,
  updateSettings,
} from "../../services/settingsService";
import "./Settings.css";

const defaultSettings = {
  store: "",
  lowStockAlert: true,
  lowStockQuantity: 5,
  allowNegativeStock: false,
  expiryAlertDays: 30,
  invoicePrefix: "INV",
  purchasePrefix: "PUR",
  invoicePrintSize: "Thermal80",
  roundOff: true,
  gstInclusive: false,
  defaultPaymentMode: "Cash",
  loyaltyEnabled: true,
  loyaltyEarnPerAmount: 100,
  loyaltyPointsPerAmount: 1,
  redeemPointValue: 1,
  currency: "INR",
  currencySymbol: "₹",
  barcodeType: "CODE128",
  status: true,
};

export default function Settings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("store");
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState("");
  const [settingsId, setSettingsId] = useState(null);
  const [formData, setFormData] = useState(defaultSettings);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      const res = await getStores();
      const list = res?.data?.data || res?.data || [];
      setStores(list);
      if (list.length > 0) {
        setSelectedStore(list[0]._id);
      }
    } catch (err) {
      console.error("Failed to load stores", err);
    }
  };

  useEffect(() => {
    if (selectedStore) {
      loadStoreSettings(selectedStore);
    }
  }, [selectedStore]);

  const loadStoreSettings = async (storeId) => {
    try {
      setLoading(true);
      setMessage({ type: "", text: "" });
      const res = await getSettingsByStore(storeId);
      const data = res?.data || res;

      if (data && data._id) {
        setSettingsId(data._id);
        setFormData({
          store: storeId,
          lowStockAlert: data.lowStockAlert ?? true,
          lowStockQuantity: data.lowStockQuantity ?? 5,
          allowNegativeStock: data.allowNegativeStock ?? false,
          expiryAlertDays: data.expiryAlertDays ?? 30,
          invoicePrefix: data.invoicePrefix || "INV",
          purchasePrefix: data.purchasePrefix || "PUR",
          invoicePrintSize: data.invoicePrintSize || "Thermal80",
          roundOff: data.roundOff ?? true,
          gstInclusive: data.gstInclusive ?? false,
          defaultPaymentMode: data.defaultPaymentMode || "Cash",
          loyaltyEnabled: data.loyaltyEnabled ?? true,
          loyaltyEarnPerAmount: data.loyaltyEarnPerAmount ?? 100,
          loyaltyPointsPerAmount: data.loyaltyPointsPerAmount ?? 1,
          redeemPointValue: data.redeemPointValue ?? 1,
          currency: data.currency || "INR",
          currencySymbol: data.currencySymbol || "₹",
          barcodeType: data.barcodeType || "CODE128",
          status: data.status ?? true,
        });
      } else {
        setSettingsId(null);
        setFormData({ ...defaultSettings, store: storeId });
      }
    } catch {
      setSettingsId(null);
      setFormData({ ...defaultSettings, store: storeId });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStore) {
      setMessage({ type: "error", text: "Please select a store first." });
      return;
    }

    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      if (settingsId) {
        await updateSettings(settingsId, { ...formData, store: selectedStore });
        setMessage({ type: "success", text: "Settings updated successfully!" });
      } else {
        const res = await createSettings({ ...formData, store: selectedStore });
        const created = res?.data || res;
        if (created?._id) setSettingsId(created._id);
        setMessage({
          type: "success",
          text: "Settings configured and saved successfully!",
        });
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to save settings.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-container">

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "18px",
          }}
        >
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "#4f46e5",
              color: "#ffffff",
              border: "none",
              padding: "9px 16px",
              borderRadius: "10px",
              fontSize: "13.5px",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(79, 70, 229, 0.25)",
              transition: "0.2s ease",
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </button>

          <div className="settings-store-select-bar" style={{ margin: 0 }}>
            <label>Store:</label>
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
            >
              {stores.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.storeName} ({s.storeCode || "Store"})
                </option>
              ))}
            </select>
            {loading && <RefreshCw size={16} className="reports-spin" />}
          </div>
        </div>

        <div className="settings-tab-bar">
          <button
            type="button"
            className={`settings-tab-btn ${
              activeTab === "store" ? "active" : ""
            }`}
            onClick={() => setActiveTab("store")}
          >
            <Store size={16} />
            <span>Store & Inventory</span>
          </button>

          <button
            type="button"
            className={`settings-tab-btn ${
              activeTab === "billing" ? "active" : ""
            }`}
            onClick={() => setActiveTab("billing")}
          >
            <Receipt size={16} />
            <span>Invoice & POS</span>
          </button>

          <button
            type="button"
            className={`settings-tab-btn ${
              activeTab === "loyalty" ? "active" : ""
            }`}
            onClick={() => setActiveTab("loyalty")}
          >
            <Award size={16} />
            <span>Loyalty Program</span>
          </button>

          <button
            type="button"
            className={`settings-tab-btn ${
              activeTab === "system" ? "active" : ""
            }`}
            onClick={() => setActiveTab("system")}
          >
            <Sliders size={16} />
            <span>System & Currency</span>
          </button>
        </div>

        {message.text && (
          <div className={`settings-alert-${message.type}`}>
            {message.type === "success" ? (
              <CheckCircle2 size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="settings-card">

          {activeTab === "store" && (
            <div className="settings-section">
              <div className="section-header">
                <h3>Stock Thresholds & Expiry Rules</h3>
                <p>
                  Configure automated alerts and negative inventory policies for
                  this store.
                </p>
              </div>

              <div className="settings-form-grid">
                <div className="settings-group">
                  <label>Low Stock Warning Limit (Quantity)</label>
                  <input
                    type="number"
                    name="lowStockQuantity"
                    value={formData.lowStockQuantity}
                    onChange={handleChange}
                    min="0"
                  />
                </div>

                <div className="settings-group">
                  <label>Expiry Alert Notice (Days Before Expiry)</label>
                  <input
                    type="number"
                    name="expiryAlertDays"
                    value={formData.expiryAlertDays}
                    onChange={handleChange}
                    min="0"
                  />
                </div>

                <div className="settings-group full-span checkbox-row">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="lowStockAlert"
                      checked={formData.lowStockAlert}
                      onChange={handleChange}
                    />
                    <span>Enable Real-Time Low Stock Warning Alerts</span>
                  </label>
                </div>

                <div className="settings-group full-span checkbox-row">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="allowNegativeStock"
                      checked={formData.allowNegativeStock}
                      onChange={handleChange}
                    />
                    <span>
                      Allow Billing with Negative Stock (Continue sales even if
                      inventory is 0)
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}


          {activeTab === "billing" && (
            <div className="settings-section">
              <div className="section-header">
                <h3>Invoice Numbering & POS Defaults</h3>
                <p>
                  Format bill prefixes, receipt print sizes, and standard tax
                  behavior.
                </p>
              </div>

              <div className="settings-form-grid">
                <div className="settings-group">
                  <label>Sales Invoice Prefix</label>
                  <input
                    type="text"
                    name="invoicePrefix"
                    value={formData.invoicePrefix}
                    onChange={handleChange}
                  />
                </div>

                <div className="settings-group">
                  <label>Purchase Order (PO) Prefix</label>
                  <input
                    type="text"
                    name="purchasePrefix"
                    value={formData.purchasePrefix}
                    onChange={handleChange}
                  />
                </div>

                <div className="settings-group">
                  <label>Invoice Print Format</label>
                  <select
                    name="invoicePrintSize"
                    value={formData.invoicePrintSize}
                    onChange={handleChange}
                  >
                    <option value="Thermal80">Thermal 80mm (Standard POS)</option>
                    <option value="Thermal58">Thermal 58mm (Compact)</option>
                    <option value="A4">A4 Sheet (Laser / Inkjet)</option>
                  </select>
                </div>

                <div className="settings-group">
                  <label>Default POS Payment Mode</label>
                  <select
                    name="defaultPaymentMode"
                    value={formData.defaultPaymentMode}
                    onChange={handleChange}
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Card">Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Wallet">Wallet</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>

                <div className="settings-group full-span checkbox-row">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="roundOff"
                      checked={formData.roundOff}
                      onChange={handleChange}
                    />
                    <span>
                      Automatically round off decimal grand totals on POS bills
                    </span>
                  </label>
                </div>

                <div className="settings-group full-span checkbox-row">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="gstInclusive"
                      checked={formData.gstInclusive}
                      onChange={handleChange}
                    />
                    <span>
                      Default product retail pricing is inclusive of GST/Tax
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === "loyalty" && (
            <div className="settings-section">
              <div className="section-header">
                <h3>Customer Loyalty & Reward Points</h3>
                <p>
                  Configure automated reward points earning and redemption
                  ratios.
                </p>
              </div>

              <div className="settings-form-grid">
                <div className="settings-group">
                  <label>Spend Amount to Earn Points (₹)</label>
                  <input
                    type="number"
                    name="loyaltyEarnPerAmount"
                    value={formData.loyaltyEarnPerAmount}
                    onChange={handleChange}
                    min="1"
                  />
                </div>

                <div className="settings-group">
                  <label>Points Earned per Spend Threshold</label>
                  <input
                    type="number"
                    name="loyaltyPointsPerAmount"
                    value={formData.loyaltyPointsPerAmount}
                    onChange={handleChange}
                    min="1"
                  />
                </div>

                <div className="settings-group">
                  <label>Redeem Value per 1 Point (₹)</label>
                  <input
                    type="number"
                    name="redeemPointValue"
                    value={formData.redeemPointValue}
                    onChange={handleChange}
                    min="0.1"
                    step="0.1"
                  />
                </div>

                <div className="settings-group full-span checkbox-row">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="loyaltyEnabled"
                      checked={formData.loyaltyEnabled}
                      onChange={handleChange}
                    />
                    <span>
                      Enable Customer Loyalty Points calculation during
                      checkout
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SYSTEM & BARCODE */}
          {activeTab === "system" && (
            <div className="settings-section">
              <div className="section-header">
                <h3>Currency & Barcode Standards</h3>
                <p>Define standard label barcodes and base monetary unit.</p>
              </div>

              <div className="settings-form-grid">
                <div className="settings-group">
                  <label>Base Currency Code</label>
                  <input
                    type="text"
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                  />
                </div>

                <div className="settings-group">
                  <label>Currency Display Symbol</label>
                  <input
                    type="text"
                    name="currencySymbol"
                    value={formData.currencySymbol}
                    onChange={handleChange}
                  />
                </div>

                <div className="settings-group">
                  <label>Default Barcode Symbology</label>
                  <select
                    name="barcodeType"
                    value={formData.barcodeType}
                    onChange={handleChange}
                  >
                    <option value="CODE128">Code 128 (Universal)</option>
                    <option value="EAN13">EAN-13 (Retail Standard)</option>
                    <option value="QR">QR Code (2D Matrix)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="settings-footer">
            <button
              type="submit"
              className="save-btn"
              disabled={saving || loading}
            >
              {saving ? (
                <RefreshCw size={16} className="reports-spin" />
              ) : (
                <Save size={16} />
              )}
              {saving
                ? "Saving..."
                : settingsId
                ? "Update Settings"
                : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}