import React, { useEffect, useMemo, useState } from "react";
import "./Dashboard.css";
import { getDashboardOverview } from "../../services/dashboardService";

const formatCurrency = (value) => {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getInitials = (firstName, lastName) => {
  const first = firstName?.charAt(0) || "";
  const last = lastName?.charAt(0) || "";

  return `${first}${last}`.toUpperCase() || "U";
};

const formatRole = (role) => {
  if (!role) return "USER";

  return role
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const StatCard = ({
  icon,
  title,
  value,
  subtitle,
  type = "",
}) => {
  return (
    <div className={`dashboard-stat-card ${type}`}>
      <div className="dashboard-stat-content">
        <div className="dashboard-stat-text">
          <p className="dashboard-stat-title">
            {title}
          </p>

          <h2 className="dashboard-stat-value">
            {value}
          </h2>

          {subtitle && (
            <p className="dashboard-stat-subtitle">
              {subtitle}
            </p>
          )}
        </div>

        <div className="dashboard-stat-icon">
          {icon}
        </div>
      </div>
    </div>
  );
};

const SectionHeader = ({
  title,
  subtitle,
}) => {
  return (
    <div className="dashboard-section-header">
      <div>
        <h3>{title}</h3>

        {subtitle && (
          <p>{subtitle}</p>
        )}
      </div>
    </div>
  );
};

const RecentInvoices = ({
  invoices = [],
}) => {
  return (
    <div className="dashboard-panel">
      <SectionHeader
        title="Recent Invoices"
        subtitle="Latest sales invoices"
      />

      {invoices.length === 0 ? (
        <div className="dashboard-empty">
          <div className="dashboard-empty-icon">
            🧾
          </div>

          <p>No invoices found</p>
        </div>
      ) : (
        <div className="dashboard-table-wrapper">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Invoice No</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Due</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {invoices.map((invoice) => {
                const status =
                  invoice.paymentStatus ||
                  "Pending";

                return (
                  <tr key={invoice._id}>
                    <td>
                      <strong>
                        {invoice.invoiceNo || "-"}
                      </strong>
                    </td>

                    <td>
                      {invoice.customer?.customerName ||
                        "Walk-In Customer"}
                    </td>

                    <td>
                      {formatDate(
                        invoice.invoiceDate
                      )}
                    </td>

                    <td>
                      <strong>
                        {formatCurrency(
                          invoice.grandTotal
                        )}
                      </strong>
                    </td>

                    <td>
                      {formatCurrency(
                        invoice.paidAmount
                      )}
                    </td>

                    <td>
                      {formatCurrency(
                        invoice.dueAmount
                      )}
                    </td>

                    <td>
                      <span
                        className={`dashboard-status ${status
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                      >
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const LowStockProducts = ({
  products = [],
}) => {
  return (
    <div className="dashboard-panel">
      <SectionHeader
        title="Low Stock Products"
        subtitle="Products that need restocking"
      />

      {products.length === 0 ? (
        <div className="dashboard-empty">
          <div className="dashboard-empty-icon">
            ✅
          </div>

          <p>No low-stock products</p>
        </div>
      ) : (
        <div className="low-stock-list">
          {products.map((product) => {
            const stock = Number(
              product.totalStock || 0
            );

            const minimum = Number(
              product.minimumStock || 0
            );

            return (
              <div
                className="low-stock-item"
                key={product._id}
              >
                <div className="low-stock-product">
                  <div className="low-stock-product-icon">
                    📦
                  </div>

                  <div>
                    <h4>
                      {product.productName || "-"}
                    </h4>

                    <p>
                      {product.productCode ||
                        "No product code"}
                    </p>
                  </div>
                </div>

                <div className="low-stock-quantity">
                  <strong>{stock}</strong>

                  <span>
                    Min: {minimum}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const AdminManagerDashboard = ({
  data,
  role,
}) => {
  const cards = data?.cards || {};

  const lowStockProducts =
    data?.lowStockProducts || [];

  const recentInvoices =
    data?.recentInvoices || [];

  return (
    <>
      <div className="dashboard-page-header">
        <div>
          <h1>
            {role === "ADMIN"
              ? "Admin Dashboard"
              : "Manager Dashboard"}
          </h1>

          <p>
            Monitor your store performance
            and business activity.
          </p>
        </div>
      </div>

      <div className="dashboard-stats-grid">
        <StatCard
          icon="📦"
          title="Total Products"
          value={cards.totalProducts ?? 0}
          subtitle="Products in store"
          type="products"
        />

        <StatCard
          icon="👥"
          title="Total Customers"
          value={cards.totalCustomers ?? 0}
          subtitle="Active customers"
          type="customers"
        />

        <StatCard
          icon="🧾"
          title="Total Invoices"
          value={cards.totalInvoices ?? 0}
          subtitle="Sales invoices"
          type="invoices"
        />

        <StatCard
          icon="🛒"
          title="Total Purchases"
          value={cards.totalPurchases ?? 0}
          subtitle="Purchase records"
          type="purchases"
        />
      </div>

      <div className="dashboard-two-column">
        <LowStockProducts
          products={lowStockProducts}
        />

        <RecentInvoices
          invoices={recentInvoices}
        />
      </div>
    </>
  );
};

const CashierDashboard = ({
  data,
}) => {
  const cards = data?.cards || {};

  const recentInvoices =
    data?.recentInvoices || [];

  return (
    <>
      <div className="dashboard-page-header">
        <div>
          <h1>Cashier Dashboard</h1>

          <p>
            Manage today's billing and
            payment activity.
          </p>
        </div>
      </div>

      <div className="dashboard-stats-grid cashier-grid">
        <StatCard
          icon="🧾"
          title="Today's Invoices"
          value={cards.todayInvoices ?? 0}
          subtitle="Invoices created today"
          type="invoices"
        />

        <StatCard
          icon="₹"
          title="Today's Sales"
          value={formatCurrency(
            cards.todaySales
          )}
          subtitle="Sales generated today"
          type="sales"
        />

        <StatCard
          icon="💳"
          title="Pending Payments"
          value={cards.pendingPayments ?? 0}
          subtitle="Pending / partial payments"
          type="pending"
        />
      </div>

      <RecentInvoices
        invoices={recentInvoices}
      />
    </>
  );
};


const SalesExecutiveDashboard = ({
  data,
}) => {
  const cards = data?.cards || {};

  const recentInvoices =
    data?.recentInvoices || [];

  return (
    <>
      <div className="dashboard-page-header">
        <div>
          <h1>
            Sales Executive Dashboard
          </h1>

          <p>
            Track customers, invoices and
            sales performance.
          </p>
        </div>
      </div>

      <div className="dashboard-stats-grid sales-executive-grid">
        <StatCard
          icon="👥"
          title="Total Customers"
          value={cards.totalCustomers ?? 0}
          subtitle="Active customers"
          type="customers"
        />

        <StatCard
          icon="🧾"
          title="Total Invoices"
          value={cards.totalInvoices ?? 0}
          subtitle="Sales invoices"
          type="invoices"
        />

        <StatCard
          icon="₹"
          title="Total Sales"
          value={formatCurrency(
            cards.totalSales
          )}
          subtitle="Total invoice value"
          type="sales"
        />
      </div>

      <RecentInvoices
        invoices={recentInvoices}
      />
    </>
  );
};

const Dashboard = () => {
  const [dashboard, setDashboard] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getDashboardOverview();

        if (!mounted) return;

        if (!data?.success) {
          throw new Error(
            data?.message ||
              "Unable to load dashboard"
          );
        }

        setDashboard(data);
      } catch (err) {
        console.error(
          "Dashboard Error:",
          err
        );

        if (!mounted) return;

        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load dashboard";

        setError(message);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  const user = dashboard?.user;

  const role = useMemo(() => {
    return String(
      dashboard?.role ||
        user?.role?.roleCode ||
        ""
    ).toUpperCase();
  }, [dashboard, user]);

  const storeName =
    user?.store?.storeName || "Store";

  const fullName =
    `${user?.firstName || ""} ${
      user?.lastName || ""
    }`.trim() || "User";

  const initials = getInitials(
    user?.firstName,
    user?.lastName
  );

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          <div className="dashboard-spinner"></div>

          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }


  if (error) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-error">
          <div className="dashboard-error-icon">
            ⚠️
          </div>

          <h2>
            Unable to load dashboard
          </h2>

          <p>{error}</p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-error">
          <h2>No dashboard data</h2>

          <p>
            The server did not return
            dashboard information.
          </p>
        </div>
      </div>
    );
  }


  if (!dashboard.success) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-error">
          <div className="dashboard-error-icon">
            🔒
          </div>

          <h2>
            Dashboard Access Denied
          </h2>

          <p>
            {dashboard.message ||
              "You do not have dashboard access."}
          </p>
        </div>
      </div>
    );
  }


  const renderRoleDashboard = () => {
    switch (role) {
      case "ADMIN":
        return (
          <AdminManagerDashboard
            data={dashboard.data}
            role="ADMIN"
          />
        );

      case "MANAGER":
        return (
          <AdminManagerDashboard
            data={dashboard.data}
            role="MANAGER"
          />
        );

      case "CASHIER":
        return (
          <CashierDashboard
            data={dashboard.data}
          />
        );

      case "SALES_EXECUTIVE":
        return (
          <SalesExecutiveDashboard
            data={dashboard.data}
          />
        );

      default:
        return (
          <div className="dashboard-error">
            <div className="dashboard-error-icon">
              🔒
            </div>

            <h2>
              Dashboard Not Configured
            </h2>

            <p>
              No dashboard configuration
              found for role:
            </p>

            <strong>
              {role || "UNKNOWN"}
            </strong>
          </div>
        );
    }
  };

  return (
    <div className="dashboard-page">
      {/* USER / STORE BAR */}

      <div className="dashboard-user-bar">
        <div className="dashboard-user-info">
          <div className="dashboard-avatar">
            {initials}
          </div>

          <div>
            <h2>
              Welcome, {fullName}
            </h2>

            <p>
              {user?.role?.roleName || role}
              {storeName
                ? ` • ${storeName}`
                : ""}
            </p>
          </div>
        </div>

        <div className="dashboard-role-badge">
          {formatRole(role)}
        </div>
      </div>

      {renderRoleDashboard()}
    </div>
  );
};

export default Dashboard;