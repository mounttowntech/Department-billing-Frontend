import  { useEffect, useMemo, useState } from "react";
import "./Suppliers.css";

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
  Wallet,
} from "lucide-react";

import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  activateSupplier,
} from "../../../services/supplierService";

import { getStores } from "../../../services/storeService";

const emptySupplier = {
  store: "",

  supplierCode: "",
  supplierName: "",
  companyName: "",
  contactPerson: "",

  email: "",
  phone: "",
  alternatePhone: "",

  gstNumber: "",
  panNumber: "",

  address: "",
  city: "",
  state: "",
  country: "India",
  pincode: "",

  bankName: "",
  accountHolder: "",
  accountNumber: "",
  ifscCode: "",

  paymentTerms: 0,
  creditLimit: 0,
  openingBalance: 0,
  currentBalance: 0,

  notes: "",
  status: "active",
};

export default function Supplier() {
  const [suppliers, setSuppliers] = useState([]);
  const [stores, setStores] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [storeFilter, setStoreFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState(emptySupplier);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);

      const res = await getSuppliers({
        store: storeFilter || undefined,
        status: statusFilter || undefined,
        search: search.trim() || undefined,
      });

      const data = res?.data || [];

      setSuppliers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("Failed to load suppliers:", err);
      setSuppliers([]);
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
      console.log("Failed to load stores:", err);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuppliers();
    }, 300);

    return () => clearTimeout(timer);
  }, [storeFilter, statusFilter, search]);


  const filteredSuppliers = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return suppliers;

    return suppliers.filter((supplier) => {
      return (
        supplier.supplierCode
          ?.toLowerCase()
          .includes(value) ||
        supplier.supplierName
          ?.toLowerCase()
          .includes(value) ||
        supplier.companyName
          ?.toLowerCase()
          .includes(value) ||
        supplier.phone
          ?.toLowerCase()
          .includes(value) ||
        supplier.gstNumber
          ?.toLowerCase()
          .includes(value)
      );
    });
  }, [suppliers, search]);

 
  const totalSuppliers = suppliers.length;

  const activeSuppliers = suppliers.filter(
    (x) => x.status === "active"
  ).length;

  const inactiveSuppliers = suppliers.filter(
    (x) => x.status === "inactive"
  ).length;

  const totalCredit = suppliers.reduce(
    (sum, supplier) =>
      sum + Number(supplier.creditLimit || 0),
    0
  );

  const updateField = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData(emptySupplier);
    setShowModal(true);
  };

  const openEditModal = (supplier) => {
    setEditingId(supplier._id);

    setFormData({
      store:
        supplier.store?._id ||
        supplier.store ||
        "",

      supplierCode:
        supplier.supplierCode || "",

      supplierName:
        supplier.supplierName || "",

      companyName:
        supplier.companyName || "",

      contactPerson:
        supplier.contactPerson || "",

      email:
        supplier.email || "",

      phone:
        supplier.phone || "",

      alternatePhone:
        supplier.alternatePhone || "",

      gstNumber:
        supplier.gstNumber || "",

      panNumber:
        supplier.panNumber || "",

      address:
        supplier.address || "",

      city:
        supplier.city || "",

      state:
        supplier.state || "",

      country:
        supplier.country || "India",

      pincode:
        supplier.pincode || "",

      bankName:
        supplier.bankName || "",

      accountHolder:
        supplier.accountHolder || "",

      accountNumber:
        supplier.accountNumber || "",

      ifscCode:
        supplier.ifscCode || "",

      paymentTerms:
        supplier.paymentTerms ?? 0,

      creditLimit:
        supplier.creditLimit ?? 0,

      openingBalance:
        supplier.openingBalance ?? 0,

      currentBalance:
        supplier.currentBalance ?? 0,

      notes:
        supplier.notes || "",

      status:
        supplier.status || "active",
    });

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData(emptySupplier);
  };


  const handleSubmit = async () => {
    if (
      !formData.store ||
      !formData.supplierCode ||
      !formData.supplierName
    ) {
      alert(
        "Store, Supplier Code and Supplier Name are required."
      );

      return;
    }

    try {
      setSaving(true);

      const payload = {
        ...formData,

        paymentTerms:
          Number(formData.paymentTerms) || 0,

        creditLimit:
          Number(formData.creditLimit) || 0,

        openingBalance:
          Number(formData.openingBalance) || 0,

        currentBalance:
          Number(formData.currentBalance) || 0,
      };

      if (editingId) {
        await updateSupplier(
          editingId,
          payload
        );
      } else {
        await createSupplier(payload);
      }

      closeModal();

      fetchSuppliers();
    } catch (err) {
      console.log(err);

      alert(
        err?.response?.data?.message ||
          "Unable to save supplier."
      );
    } finally {
      setSaving(false);
    }
  };


  const handleDelete = async (supplier) => {
    const confirmed = window.confirm(
      `Delete supplier "${supplier.supplierName}"?`
    );

    if (!confirmed) return;

    try {
      await deleteSupplier(supplier._id);

      fetchSuppliers();
    } catch (err) {
      console.log(err);

      alert(
        err?.response?.data?.message ||
          "Unable to delete supplier."
      );
    }
  };

  const handleActivate = async (supplier) => {
    try {
      await activateSupplier(supplier._id);

      fetchSuppliers();
    } catch (err) {
      console.log(err);

      alert(
        err?.response?.data?.message ||
          "Unable to activate supplier."
      );
    }
  };


  return (
    <div className="supplier-page">
      <div className="supplier-content">

        <div className="page-header">
          <div>
            <h2>Supplier Management</h2>

            <p>
              Manage suppliers, contact details,
              payments and balances.
            </p>
          </div>

          <button
            className="primary-btn"
            onClick={openAddModal}
          >
            <Plus size={18} />
            Add Supplier
          </button>
        </div>

        <div className="supplier-toolbar">

          <div className="supplier-search-box">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search supplier, company, phone, GST..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </div>

          <select
            className="supplier-filter-select"
            value={storeFilter}
            onChange={(e) =>
              setStoreFilter(e.target.value)
            }
          >
            <option value="">
              All Stores
            </option>

            {stores.map((store) => (
              <option
                key={store._id}
                value={store._id}
              >
                {store.storeName}
              </option>
            ))}
          </select>

          <select
            className="supplier-filter-select"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
          >
            <option value="">
              All Status
            </option>

            <option value="active">
              Active
            </option>

            <option value="inactive">
              Inactive
            </option>
          </select>

        </div>

        
        <div className="supplier-summary-grid">

          <div className="supplier-summary-card card-blue">
            <div className="supplier-summary-icon">
              <Building2 size={24} />
            </div>

            <div>
              <h2>{totalSuppliers}</h2>
              <p>Total Suppliers</p>
            </div>
          </div>

          <div className="supplier-summary-card card-green">
            <div className="supplier-summary-icon">
              <CheckCircle size={24} />
            </div>

            <div>
              <h2>{activeSuppliers}</h2>
              <p>Active Suppliers</p>
            </div>
          </div>

          <div className="supplier-summary-card card-red">
            <div className="supplier-summary-icon">
              <XCircle size={24} />
            </div>

            <div>
              <h2>{inactiveSuppliers}</h2>
              <p>Inactive Suppliers</p>
            </div>
          </div>

          <div className="supplier-summary-card card-amber">
            <div className="supplier-summary-icon">
              <Wallet size={24} />
            </div>

            <div>
              <h2>
                ₹
                {totalCredit.toLocaleString(
                  "en-IN"
                )}
              </h2>

              <p>Total Credit Limit</p>
            </div>
          </div>

        </div>

      

        <div className="table-card">

          <table className="supplier-table">

            <thead>
              <tr>
                <th>Supplier</th>
                <th>Company</th>
                <th>Contact</th>
                <th>Store</th>
                <th>Credit Limit</th>
                <th>Balance</th>
                <th>Status</th>
                <th width="140">Action</th>
              </tr>
            </thead>

            <tbody>

              {loading ? (
                <tr>
                  <td
                    colSpan="8"
                    className="empty-row"
                  >
                    Loading...
                  </td>
                </tr>
              ) : filteredSuppliers.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="empty-row"
                  >
                    No Suppliers Found
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map(
                  (supplier) => (
                    <tr key={supplier._id}>

                      <td>
                        <div className="supplier-info">

                          <div className="supplier-avatar">
                            <Building2 size={20} />
                          </div>

                          <div>
                            <strong>
                              {
                                supplier.supplierName
                              }
                            </strong>

                            <p>
                              {
                                supplier.supplierCode
                              }
                            </p>
                          </div>

                        </div>
                      </td>

                      <td>
                        <strong>
                          {
                            supplier.companyName ||
                            "—"
                          }
                        </strong>
                      </td>

                      <td>
                        <div>
                          <strong>
                            {
                              supplier.phone ||
                              "—"
                            }
                          </strong>

                          <p>
                            {
                              supplier.email ||
                              "—"
                            }
                          </p>
                        </div>
                      </td>

                      <td>
                        {
                          supplier.store
                            ?.storeName ||
                          "—"
                        }
                      </td>

                      <td>
                        <strong>
                          ₹
                          {Number(
                            supplier.creditLimit ||
                              0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </strong>
                      </td>

                      <td>
                        <strong>
                          ₹
                          {Number(
                            supplier.currentBalance ||
                              0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </strong>
                      </td>

                      <td>
                        <span
                          className={`badge ${
                            supplier.status ===
                            "active"
                              ? "active"
                              : "inactive"
                          }`}
                        >
                          {supplier.status}
                        </span>
                      </td>

                      <td>
                        <div className="action-btns">

                          <button
                            className="edit-btn"
                            title="Edit"
                            onClick={() =>
                              openEditModal(
                                supplier
                              )
                            }
                          >
                            <Edit size={16} />
                          </button>

                          {supplier.status ===
                          "inactive" ? (
                            <button
                              className="activate-btn"
                              title="Activate"
                              onClick={() =>
                                handleActivate(
                                  supplier
                                )
                              }
                            >
                              <CheckCircle
                                size={16}
                              />
                            </button>
                          ) : null}

                          <button
                            className="delete-btn"
                            title="Delete"
                            onClick={() =>
                              handleDelete(
                                supplier
                              )
                            }
                          >
                            <Trash2 size={16} />
                          </button>

                        </div>
                      </td>

                    </tr>
                  )
                )
              )}

            </tbody>

          </table>

        </div>

        {showModal && (
          <div className="modal-overlay">

            <div className="supplier-modal">

              <div className="modal-header">

                <h3>
                  {editingId
                    ? "Edit Supplier"
                    : "Add Supplier"}
                </h3>

                <button
                  className="close-btn"
                  onClick={closeModal}
                >
                  <X size={20} />
                </button>

              </div>

              <div className="modal-body">

                <h4 className="section-title">
                  Supplier Details
                </h4>

                <div className="form-grid">

                  <div className="form-group">
                    <label>
                      Store *
                    </label>

                    <select
                      value={formData.store}
                      onChange={(e) =>
                        updateField(
                          "store",
                          e.target.value
                        )
                      }
                    >
                      <option value="">
                        Select Store
                      </option>

                      {stores.map((store) => (
                        <option
                          key={store._id}
                          value={store._id}
                        >
                          {store.storeName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>
                      Supplier Code *
                    </label>

                    <input
                      placeholder="e.g. SUP-001"
                      value={
                        formData.supplierCode
                      }
                      onChange={(e) =>
                        updateField(
                          "supplierCode",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Supplier Name *
                    </label>

                    <input
                      placeholder="Enter supplier name"
                      value={
                        formData.supplierName
                      }
                      onChange={(e) =>
                        updateField(
                          "supplierName",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Company Name
                    </label>

                    <input
                      placeholder="Enter company name"
                      value={
                        formData.companyName
                      }
                      onChange={(e) =>
                        updateField(
                          "companyName",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Contact Person
                    </label>

                    <input
                      placeholder="Enter contact person"
                      value={
                        formData.contactPerson
                      }
                      onChange={(e) =>
                        updateField(
                          "contactPerson",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Status
                    </label>

                    <select
                      value={formData.status}
                      onChange={(e) =>
                        updateField(
                          "status",
                          e.target.value
                        )
                      }
                    >
                      <option value="active">
                        Active
                      </option>

                      <option value="inactive">
                        Inactive
                      </option>
                    </select>
                  </div>

                </div>

                <h4 className="section-title">
                  Contact Information
                </h4>

                <div className="form-grid">

                  <div className="form-group">
                    <label>
                      Email
                    </label>

                    <input
                      type="email"
                      placeholder="supplier@email.com"
                      value={formData.email}
                      onChange={(e) =>
                        updateField(
                          "email",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Phone
                    </label>

                    <input
                      placeholder="Enter phone number"
                      value={formData.phone}
                      onChange={(e) =>
                        updateField(
                          "phone",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Alternate Phone
                    </label>

                    <input
                      placeholder="Enter alternate phone"
                      value={
                        formData.alternatePhone
                      }
                      onChange={(e) =>
                        updateField(
                          "alternatePhone",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      GST Number
                    </label>

                    <input
                      placeholder="e.g. 33ABCDE1234F1Z5"
                      value={
                        formData.gstNumber
                      }
                      onChange={(e) =>
                        updateField(
                          "gstNumber",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      PAN Number
                    </label>

                    <input
                      placeholder="e.g. ABCDE1234F"
                      value={
                        formData.panNumber
                      }
                      onChange={(e) =>
                        updateField(
                          "panNumber",
                          e.target.value
                        )
                      }
                    />
                  </div>

                </div>

                <h4 className="section-title">
                  Address
                </h4>

                <div className="form-grid">

                  <div className="form-group form-group-full">
                    <label>
                      Address
                    </label>

                    <textarea
                      rows="2"
                      placeholder="Enter full address"
                      value={formData.address}
                      onChange={(e) =>
                        updateField(
                          "address",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      City
                    </label>

                    <input
                      value={formData.city}
                      onChange={(e) =>
                        updateField(
                          "city",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      State
                    </label>

                    <input
                      value={formData.state}
                      onChange={(e) =>
                        updateField(
                          "state",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Country
                    </label>

                    <input
                      value={formData.country}
                      onChange={(e) =>
                        updateField(
                          "country",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Pincode
                    </label>

                    <input
                      value={formData.pincode}
                      onChange={(e) =>
                        updateField(
                          "pincode",
                          e.target.value
                        )
                      }
                    />
                  </div>

                </div>


                <h4 className="section-title">
                  Bank Details
                </h4>

                <div className="form-grid">

                  <div className="form-group">
                    <label>
                      Bank Name
                    </label>

                    <input
                      value={formData.bankName}
                      onChange={(e) =>
                        updateField(
                          "bankName",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Account Holder
                    </label>

                    <input
                      value={
                        formData.accountHolder
                      }
                      onChange={(e) =>
                        updateField(
                          "accountHolder",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Account Number
                    </label>

                    <input
                      value={
                        formData.accountNumber
                      }
                      onChange={(e) =>
                        updateField(
                          "accountNumber",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      IFSC Code
                    </label>

                    <input
                      value={formData.ifscCode}
                      onChange={(e) =>
                        updateField(
                          "ifscCode",
                          e.target.value
                        )
                      }
                    />
                  </div>

                </div>

                <h4 className="section-title">
                  Payment & Balance
                </h4>

                <div className="form-grid-3">

                  <div className="form-group">
                    <label>
                      Payment Terms (Days)
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={
                        formData.paymentTerms
                      }
                      onChange={(e) =>
                        updateField(
                          "paymentTerms",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Credit Limit
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={
                        formData.creditLimit
                      }
                      onChange={(e) =>
                        updateField(
                          "creditLimit",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Opening Balance
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={
                        formData.openingBalance
                      }
                      onChange={(e) =>
                        updateField(
                          "openingBalance",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Current Balance
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={
                        formData.currentBalance
                      }
                      onChange={(e) =>
                        updateField(
                          "currentBalance",
                          e.target.value
                        )
                      }
                    />
                  </div>

                </div>

                <h4 className="section-title">
                  Notes
                </h4>

                <div className="form-group">

                  <textarea
                    rows="3"
                    placeholder="Enter notes..."
                    value={formData.notes}
                    onChange={(e) =>
                      updateField(
                        "notes",
                        e.target.value
                      )
                    }
                  />

                </div>

              </div>

              <div className="modal-footer">

                <button
                  className="cancel-btn"
                  onClick={closeModal}
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
                    ? "Update Supplier"
                    : "Create Supplier"}
                </button>

              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}