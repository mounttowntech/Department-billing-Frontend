import { useEffect, useMemo, useState } from "react";
import "./Store.css";

import {
  Search,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Building2,
  CheckCircle,
  XCircle,
} from "lucide-react";

import {
  getStores,
  createStore,
  updateStore,
  deleteStore,
} from "../../../services/storeService";

const emptyStore = {
  storeCode: "",
  storeName: "",
  ownerName: "",

  email: "",
  phone: "",

  gstNumber: "",
  panNumber: "",

  address: "",
  city: "",
  state: "",
  country: "India",
  pincode: "",

  openingTime: "09:00 AM",
  closingTime: "09:00 PM",

  currency: "INR",
  currencySymbol: "₹",

  invoicePrefix: "INV",
  purchasePrefix: "PUR",
  barcodePrefix: "BAR",

  taxType: "GST",

  thermalPrinterWidth: 80,

  receiptFooter: "Thank You! Visit Again.",

  isHeadOffice: false,
  allowNegativeStock: false,
  enableBarcode: true,
  enableLoyalty: true,
  enableCoupon: true,
  enableWhatsAppInvoice: true,

  status: "active",
};

export default function Store() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
 const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState(emptyStore);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const res = await getStores();

      if (res.success) {
        setStores(res.data || []);
      } else {
        setStores([]);
      }
    } catch (err) {
      console.log(err);
      setStores([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {

    const t = setTimeout(() => {
      fetchStores();
    }, 0);

    return () => clearTimeout(t);
  }, []);

  const filteredStores = useMemo(() => {
  const key = search.trim().toLowerCase();

  return stores.filter((store) => {

    const matchesSearch =
      !key ||
      store.storeCode?.toLowerCase().includes(key) ||
      store.storeName?.toLowerCase().includes(key) ||
      store.ownerName?.toLowerCase().includes(key) ||
      store.phone?.toLowerCase().includes(key) ||
      store.city?.toLowerCase().includes(key);


    const matchesStatus =
      !statusFilter ||
      store.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });
}, [stores, search, statusFilter]);
  const totalStores = stores.length;

  const activeStores = stores.filter((x) => x.status === "active").length;

  const inactiveStores = stores.filter((x) => x.status === "inactive").length;

  const headOffice = stores.filter((x) => x.isHeadOffice).length;

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this Store?")) return;

    try {
      await deleteStore(id);
      fetchStores();
    } catch (err) {
      console.log(err);
      alert("Unable to delete Store.");
    }
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);

      if (editingId) {
        await updateStore(editingId, formData);
      } else {
        await createStore(formData);
      }

      setShowModal(false);
      setEditingId(null);
      setFormData(emptyStore);
      fetchStores();
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Unable to save Store.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="store-page">
      <div className="store-content">
 
          <div className="page-header">
            <div>
              <h2>Store Management</h2>
              <p>Manage all stores, branches and outlets.</p>
            </div>

            <button
              className="primary-btn"
              onClick={() => {
                setEditingId(null);
                setFormData(emptyStore);
                setShowModal(true);
              }}
            >
              <Plus size={18} />
              Add Store
            </button>
          </div>


          <div className="toolbar">
            <div className="search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search Store..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
             <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          </div>



          <div className="store-summary-grid">
            <div className="store-summary-card card-blue">
              <div className="store-summary-icon">
                <Building2 size={24} />
              </div>
              <h2>{totalStores}</h2>
              <p>Total Stores</p>
            </div>

            <div className="store-summary-card card-green">
              <div className="store-summary-icon">
                <CheckCircle size={24} />
              </div>
              <h2>{activeStores}</h2>
              <p>Active Stores</p>
            </div>

            <div className="store-summary-card card-red">
              <div className="store-summary-icon">
                <XCircle size={24} />
              </div>
              <h2>{inactiveStores}</h2>
              <p>Inactive Stores</p>
            </div>

            <div className="store-summary-card card-purple">
              <div className="store-summary-icon">
                <Building2 size={24} />
              </div>
              <h2>{headOffice}</h2>
              <p>Head Office</p>
            </div>
          </div>

      

          <div className="table-card">
            <table className="store-table">
              <thead>
                <tr>
                  <th>Store</th>
                  <th>Owner</th>
                  <th>Phone</th>
                  <th>City</th>
                  <th>Status</th>
                  <th width="140">Action</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="empty-row">
                      Loading...
                    </td>
                  </tr>
                ) : filteredStores.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="empty-row">
                      No Stores Found
                    </td>
                  </tr>
                ) : (
                  filteredStores.map((store) => (
                    <tr key={store._id}>
                      <td>
                        <div className="store-info">
                          <div className="store-avatar">
                            <Building2 size={20} />
                          </div>
                          <div>
                            <strong>{store.storeName}</strong>
                            <p>{store.storeCode}</p>
                          </div>
                        </div>
                      </td>

                      <td>{store.ownerName}</td>
                      <td>{store.phone}</td>
                      <td>{store.city}</td>

                      <td>
                        <span
                          className={
                            store.status === "active"
                              ? "badge active"
                              : "badge inactive"
                          }
                        >
                          {store.status}
                        </span>
                      </td>

                      <td>
                        <div className="action-btns">
                          <button
                            className="edit-btn"
                            onClick={() => {
                              setEditingId(store._id);
                              setFormData(store);
                              setShowModal(true);
                            }}
                          >
                            <Edit size={16} />
                          </button>

                          <button
                            className="delete-btn"
                            onClick={() => handleDelete(store._id)}
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
              <div className="store-modal">
                <div className="modal-header">
                  <h3>{editingId ? "Edit Store" : "Add Store"}</h3>
                  <button
                    className="close-btn"
                    onClick={() => setShowModal(false)}
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="modal-body">
          

                  <h4 className="section-title">Basic Information</h4>

                  <div className="form-grid">
                    <input
                      placeholder="Store Code"
                      value={formData.storeCode}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          storeCode: e.target.value,
                        })
                      }
                    />

                    <input
                      placeholder="Store Name"
                      value={formData.storeName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          storeName: e.target.value,
                        })
                      }
                    />

                    <input
                      placeholder="Owner Name"
                      value={formData.ownerName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          ownerName: e.target.value,
                        })
                      }
                    />

                    <input
                      type="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />

                    <input
                      placeholder="Phone"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  </div>



                  <h4 className="section-title">Registration Details</h4>

                  <div className="form-grid">
                    <input
                      placeholder="GST Number"
                      value={formData.gstNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          gstNumber: e.target.value,
                        })
                      }
                    />

                    <input
                      placeholder="PAN Number"
                      value={formData.panNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          panNumber: e.target.value,
                        })
                      }
                    />
                  </div>



                  <h4 className="section-title">Address</h4>

                  <div className="form-grid">
                    <textarea
                      rows="3"
                      placeholder="Address"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                    />

                    <input
                      placeholder="City"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                    />

                    <input
                      placeholder="State"
                      value={formData.state}
                      onChange={(e) =>
                        setFormData({ ...formData, state: e.target.value })
                      }
                    />

                    <input
                      placeholder="Country"
                      value={formData.country}
                      onChange={(e) =>
                        setFormData({ ...formData, country: e.target.value })
                      }
                    />

                    <input
                      placeholder="Pincode"
                      value={formData.pincode}
                      onChange={(e) =>
                        setFormData({ ...formData, pincode: e.target.value })
                      }
                    />
                  </div>



                  <h4 className="section-title">Store Timing</h4>

                  <div className="form-grid">
                    <div>
                      <label>Opening Time</label>
                      <input
                        type="time"
                        value={formData.openingTime}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            openingTime: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <label>Closing Time</label>
                      <input
                        type="time"
                        value={formData.closingTime}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            closingTime: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>



                  <h4 className="section-title">Billing Settings</h4>

                  <div className="form-grid">
                    <input
                      placeholder="Currency"
                      value={formData.currency}
                      onChange={(e) =>
                        setFormData({ ...formData, currency: e.target.value })
                      }
                    />

                    <input
                      placeholder="Currency Symbol"
                      value={formData.currencySymbol}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          currencySymbol: e.target.value,
                        })
                      }
                    />

                    <input
                      placeholder="Invoice Prefix"
                      value={formData.invoicePrefix}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          invoicePrefix: e.target.value,
                        })
                      }
                    />

                    <input
                      placeholder="Purchase Prefix"
                      value={formData.purchasePrefix}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          purchasePrefix: e.target.value,
                        })
                      }
                    />

                    <input
                      placeholder="Barcode Prefix"
                      value={formData.barcodePrefix}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          barcodePrefix: e.target.value,
                        })
                      }
                    />

                    <select
                      value={formData.taxType}
                      onChange={(e) =>
                        setFormData({ ...formData, taxType: e.target.value })
                      }
                    >
                      <option value="GST">GST</option>
                      <option value="VAT">VAT</option>
                    </select>
                  </div>

 

                  <h4 className="section-title">Receipt Settings</h4>

                  <div className="form-grid">
                    <input
                      type="number"
                      placeholder="Thermal Printer Width"
                      value={formData.thermalPrinterWidth}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          thermalPrinterWidth: Number(e.target.value),
                        })
                      }
                    />
                  </div>

                  <textarea
                    className="receipt-footer"
                    rows="3"
                    placeholder="Receipt Footer"
                    value={formData.receiptFooter}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        receiptFooter: e.target.value,
                      })
                    }
                  />

                  <h4 className="section-title">Features</h4>

                  <div className="checkbox-grid">
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.isHeadOffice}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isHeadOffice: e.target.checked,
                          })
                        }
                      />
                      Head Office
                    </label>

                    <label>
                      <input
                        type="checkbox"
                        checked={formData.allowNegativeStock}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            allowNegativeStock: e.target.checked,
                          })
                        }
                      />
                      Allow Negative Stock
                    </label>

                    <label>
                      <input
                        type="checkbox"
                        checked={formData.enableBarcode}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            enableBarcode: e.target.checked,
                          })
                        }
                      />
                      Enable Barcode
                    </label>

                    <label>
                      <input
                        type="checkbox"
                        checked={formData.enableLoyalty}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            enableLoyalty: e.target.checked,
                          })
                        }
                      />
                      Enable Loyalty
                    </label>

                    <label>
                      <input
                        type="checkbox"
                        checked={formData.enableCoupon}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            enableCoupon: e.target.checked,
                          })
                        }
                      />
                      Enable Coupon
                    </label>

                    <label>
                      <input
                        type="checkbox"
                        checked={formData.enableWhatsAppInvoice}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            enableWhatsAppInvoice: e.target.checked,
                          })
                        }
                      />
                      WhatsApp Invoice
                    </label>
                  </div>



                  <h4 className="section-title">Status</h4>

                  <select
                    className="status-select"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="modal-footer">
                  <button
                    className="cancel-btn"
                    onClick={() => {
                      setShowModal(false);
                      setEditingId(null);
                      setFormData(emptyStore);
                    }}
                  >
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
                      ? "Update Store"
                      : "Create Store"}
                  </button>
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}