import React, { useEffect, useState } from "react";
import {
  FaRupeeSign,
  FaFileInvoice,
  FaUsers,
  FaBoxOpen,
  FaCreditCard,
  FaClock,
  FaUndo,
  FaChartLine,
  FaExclamationTriangle,
  FaSyncAlt,
  FaArrowUp,
  FaArrowDown,
  FaEye,
} from "react-icons/fa";

import { getDashboardOverview } from "../../services/dashboardService";

import "./Dashboard.css";

const Dashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  /* ============================================================
     LOAD DASHBOARD
  ============================================================ */

  const loadDashboard = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await getDashboardOverview();

      if (response?.data?.success) {
        setDashboard(response.data.data);
      } else {
        throw new Error(
          response?.data?.message || "Unable to load dashboard"
        );
      }
    } catch (err) {
      console.error("Dashboard Error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load dashboard"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  /* ============================================================
     HELPERS
  ============================================================ */

  const formatCurrency = (value) => {
    const number = Number(value || 0);

    return `₹${number.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatNumber = (value) => {
    return Number(value || 0).toLocaleString("en-IN");
  };

  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getCustomerName = (invoice) => {
    if (!invoice?.customer) {
      return "Walk-In Customer";
    }

    return (
      invoice.customer.customerName ||
      invoice.customer.name ||
      "Walk-In Customer"
    );
  };

  const getPaymentClass = (status) => {
    const value = String(status || "").toLowerCase();

    if (value === "paid") return "status-paid";
    if (value === "partial") return "status-partial";

    return "status-pending";
  };

  const getStockClass = (stock) => {
    const value = Number(stock || 0);

    if (value <= 0) return "stock-out";
    if (value <= 5) return "stock-critical";

    return "stock-low";
  };

  /* ============================================================
     LOADING
  ============================================================ */

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

  /* ============================================================
     ERROR
  ============================================================ */

  if (error && !dashboard) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-error">
          <FaExclamationTriangle />

          <h3>Unable to load dashboard</h3>

          <p>{error}</p>

          <button
            type="button"
            onClick={() => loadDashboard()}
          >
            <FaSyncAlt />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const summary = dashboard?.summary || {};

  const paymentSummary =
    dashboard?.paymentSummary || [];

  const salesOverview =
    dashboard?.salesOverview || [];

  const recentInvoices =
    dashboard?.recentInvoices || [];

  const topSellingProducts =
    dashboard?.topSellingProducts || [];

  const lowStockProducts =
    dashboard?.lowStockProducts || [];

  /* ============================================================
     PAYMENT DATA
  ============================================================ */

  const paymentMethods = [
    {
      key: "Cash",
      label: "Cash",
      icon: "💵",
    },
    {
      key: "UPI",
      label: "UPI",
      icon: "📱",
    },
    {
      key: "Card",
      label: "Card",
      icon: "💳",
    },
    {
      key: "Wallet",
      label: "Wallet",
      icon: "👛",
    },
    {
      key: "Credit",
      label: "Credit",
      icon: "🧾",
    },
  ];

  const getPaymentAmount = (method) => {
    const item = paymentSummary.find(
      (payment) =>
        String(payment?._id || "").toLowerCase() ===
        method.toLowerCase()
    );

    return Number(item?.amount || 0);
  };

  const paymentTotal = paymentMethods.reduce(
    (total, method) =>
      total + getPaymentAmount(method.key),
    0
  );

  /* ============================================================
     SALES CHART
  ============================================================ */

  const maxSales = Math.max(
    ...salesOverview.map((item) =>
      Number(item.sales || 0)
    ),
    1
  );

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div className="dashboard-page">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="dashboard-header">

        <div>
          <h1>Dashboard</h1>

          <p>
            Overview of your billing and business
            performance
          </p>
        </div>

        <button
          type="button"
          className="dashboard-refresh-btn"
          onClick={() => loadDashboard(true)}
          disabled={refreshing}
        >
          <FaSyncAlt
            className={
              refreshing
                ? "refresh-spinning"
                : ""
            }
          />

          {refreshing ? "Refreshing..." : "Refresh"}
        </button>

      </div>

      {/* ======================================================
          ERROR MESSAGE
      ====================================================== */}

      {error && (
        <div className="dashboard-inline-error">
          <FaExclamationTriangle />
          <span>{error}</span>
        </div>
      )}

      {/* ======================================================
          SUMMARY CARDS
      ====================================================== */}

      <div className="dashboard-summary-grid">

        {/* Today's Sales */}

        <div className="dashboard-card summary-card sales-card">

          <div className="summary-card-top">

            <div className="summary-icon">
              <FaRupeeSign />
            </div>

            <span className="summary-label">
              Today's Sales
            </span>

          </div>

          <div className="summary-value">
            {formatCurrency(summary.todaySales)}
          </div>

          <div className="summary-bottom">
            <span>
              <FaArrowUp />
              Today
            </span>

            <small>
              {formatNumber(summary.todayInvoices)} invoices
            </small>
          </div>

        </div>

        {/* Today's Invoices */}

        <div className="dashboard-card summary-card invoice-card">

          <div className="summary-card-top">

            <div className="summary-icon">
              <FaFileInvoice />
            </div>

            <span className="summary-label">
              Today's Invoices
            </span>

          </div>

          <div className="summary-value">
            {formatNumber(summary.todayInvoices)}
          </div>

          <div className="summary-bottom">
            <span>
              <FaFileInvoice />
              Billing
            </span>

            <small>
              Active invoices
            </small>
          </div>

        </div>

        {/* Customers */}

        <div className="dashboard-card summary-card customer-card">

          <div className="summary-card-top">

            <div className="summary-icon">
              <FaUsers />
            </div>

            <span className="summary-label">
              Customers
            </span>

          </div>

          <div className="summary-value">
            {formatNumber(summary.totalCustomers)}
          </div>

          <div className="summary-bottom">
            <span>
              <FaUsers />
              Active
            </span>

            <small>
              Registered customers
            </small>
          </div>

        </div>

        {/* Products */}

        <div className="dashboard-card summary-card product-card">

          <div className="summary-card-top">

            <div className="summary-icon">
              <FaBoxOpen />
            </div>

            <span className="summary-label">
              Products
            </span>

          </div>

          <div className="summary-value">
            {formatNumber(summary.totalProducts)}
          </div>

          <div className="summary-bottom">
            <span>
              <FaBoxOpen />
              Inventory
            </span>

            <small>
              Total products
            </small>
          </div>

        </div>

        {/* Paid */}

        <div className="dashboard-card summary-card paid-card">

          <div className="summary-card-top">

            <div className="summary-icon">
              <FaCreditCard />
            </div>

            <span className="summary-label">
              Today's Paid
            </span>

          </div>

          <div className="summary-value">
            {formatCurrency(summary.todayPaid)}
          </div>

          <div className="summary-bottom">
            <span>
              <FaCreditCard />
              Received
            </span>
          </div>

        </div>

        {/* Due */}

        <div className="dashboard-card summary-card due-card">

          <div className="summary-card-top">

            <div className="summary-icon">
              <FaClock />
            </div>

            <span className="summary-label">
              Today's Due
            </span>

          </div>

          <div className="summary-value">
            {formatCurrency(summary.todayDue)}
          </div>

          <div className="summary-bottom">
            <span>
              <FaClock />
              Pending
            </span>
          </div>

        </div>

      </div>

      {/* ======================================================
          MAIN GRID
      ====================================================== */}

      <div className="dashboard-main-grid">

        {/* ====================================================
            SALES OVERVIEW
        ==================================================== */}

        <div className="dashboard-card chart-card">

          <div className="section-header">

            <div>
              <h2>
                <FaChartLine />
                Sales Overview
              </h2>

              <p>
                Sales performance for the last 7 days
              </p>
            </div>

          </div>

          {salesOverview.length === 0 ? (
            <div className="empty-state">
              <FaChartLine />
              <p>No sales data available</p>
            </div>
          ) : (
            <div className="sales-chart">

              {salesOverview.map((item, index) => {

                const sales =
                  Number(item.sales || 0);

                const height =
                  Math.max(
                    (sales / maxSales) * 100,
                    sales > 0 ? 8 : 2
                  );

                const date = new Date(
                  `${item._id}T00:00:00`
                );

                const day = Number.isNaN(
                  date.getTime()
                )
                  ? item._id
                  : date.toLocaleDateString(
                      "en-IN",
                      {
                        weekday: "short",
                      }
                    );

                return (
                  <div
                    className="chart-column"
                    key={`${item._id}-${index}`}
                  >

                    <div className="chart-value">
                      {sales > 0
                        ? formatCurrency(sales)
                        : "₹0"}
                    </div>

                    <div className="chart-bar-area">

                      <div
                        className="chart-bar"
                        style={{
                          height: `${height}%`,
                        }}
                        title={formatCurrency(sales)}
                      ></div>

                    </div>

                    <span className="chart-day">
                      {day}
                    </span>

                    <small>
                      {formatNumber(item.invoices)} invoice
                      {Number(item.invoices || 0) !== 1
                        ? "s"
                        : ""}
                    </small>

                  </div>
                );
              })}

            </div>
          )}

        </div>

        {/* ====================================================
            PAYMENT SUMMARY
        ==================================================== */}

        <div className="dashboard-card payment-card">

          <div className="section-header">

            <div>
              <h2>
                <FaCreditCard />
                Payment Summary
              </h2>

              <p>
                Today's payment collection
              </p>
            </div>

          </div>

          <div className="payment-total">
            <span>Total Collected</span>

            <strong>
              {formatCurrency(paymentTotal)}
            </strong>
          </div>

          <div className="payment-list">

            {paymentMethods.map((method) => {

              const amount =
                getPaymentAmount(method.key);

              const percentage =
                paymentTotal > 0
                  ? (amount / paymentTotal) * 100
                  : 0;

              return (
                <div
                  className="payment-row"
                  key={method.key}
                >

                  <div className="payment-row-top">

                    <div className="payment-name">
                      <span className="payment-emoji">
                        {method.icon}
                      </span>

                      <span>
                        {method.label}
                      </span>
                    </div>

                    <strong>
                      {formatCurrency(amount)}
                    </strong>

                  </div>

                  <div className="payment-progress">
                    <div
                      className="payment-progress-fill"
                      style={{
                        width: `${percentage}%`,
                      }}
                    ></div>
                  </div>

                </div>
              );
            })}

          </div>

        </div>

      </div>

      {/* ======================================================
          SECOND GRID
      ====================================================== */}

      <div className="dashboard-two-column">

        {/* ====================================================
            RECENT INVOICES
        ==================================================== */}

        <div className="dashboard-card table-card">

          <div className="section-header">

            <div>
              <h2>
                <FaFileInvoice />
                Recent Invoices
              </h2>

              <p>
                Latest sales invoices
              </p>
            </div>

          </div>

          {recentInvoices.length === 0 ? (
            <div className="empty-state">
              <FaFileInvoice />
              <p>No invoices found</p>
            </div>
          ) : (
            <div className="dashboard-table-wrapper">

              <table className="dashboard-table">

                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>

                  {recentInvoices.map((invoice) => (

                    <tr key={invoice._id}>

                      <td>
                        <strong className="invoice-number">
                          {invoice.invoiceNo || "-"}
                        </strong>
                      </td>

                      <td>
                        <span className="customer-name">
                          {getCustomerName(invoice)}
                        </span>
                      </td>

                      <td>
                        {formatDate(invoice.invoiceDate)}
                      </td>

                      <td>
                        <strong>
                          {formatCurrency(
                            invoice.grandTotal
                          )}
                        </strong>
                      </td>

                      <td>
                        <span
                          className={`invoice-status ${getPaymentClass(
                            invoice.paymentStatus
                          )}`}
                        >
                          {invoice.paymentStatus ||
                            "Pending"}
                        </span>
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>
          )}

        </div>

        {/* ====================================================
            TOP SELLING PRODUCTS
        ==================================================== */}

        <div className="dashboard-card top-products-card">

          <div className="section-header">

            <div>
              <h2>
                <FaBoxOpen />
                Top Selling Products
              </h2>

              <p>
                Best performing products
              </p>
            </div>

          </div>

          {topSellingProducts.length === 0 ? (
            <div className="empty-state">
              <FaBoxOpen />
              <p>No product sales available</p>
            </div>
          ) : (
            <div className="top-products-list">

              {topSellingProducts.map(
                (product, index) => (

                  <div
                    className="top-product-row"
                    key={
                      product._id ||
                      `product-${index}`
                    }
                  >

                    <div className="product-rank">
                      {index + 1}
                    </div>

                    <div className="product-info">

                      <strong>
                        {product.productName ||
                          "Unknown Product"}
                      </strong>

                      <span>
                        {product.productCode ||
                          "-"}
                      </span>

                    </div>

                    <div className="product-sales">

                      <strong>
                        {formatNumber(
                          product.quantity
                        )}
                      </strong>

                      <span>
                        sold
                      </span>

                    </div>

                  </div>

                )
              )}

            </div>
          )}

        </div>

      </div>

      {/* ======================================================
          LOW STOCK
      ====================================================== */}

      <div className="dashboard-card low-stock-card">

        <div className="section-header">

          <div>
            <h2>
              <FaExclamationTriangle />
              Low Stock Products
            </h2>

            <p>
              Products that need stock attention
            </p>
          </div>

          <span className="low-stock-count">
            {lowStockProducts.length} items
          </span>

        </div>

        {lowStockProducts.length === 0 ? (
          <div className="empty-state success-empty">
            <FaBoxOpen />
            <p>
              All products have sufficient stock
            </p>
          </div>
        ) : (
          <div className="low-stock-grid">

            {lowStockProducts.map((product) => {

              const stock =
                Number(product.totalStock || 0);

              return (
                <div
                  className="low-stock-item"
                  key={product._id}
                >

                  <div className="low-stock-icon">
                    <FaBoxOpen />
                  </div>

                  <div className="low-stock-info">

                    <strong>
                      {product.productName ||
                        "Unknown Product"}
                    </strong>

                    <span>
                      {product.productCode || "-"}
                    </span>

                  </div>

                  <div
                    className={`stock-value ${getStockClass(
                      stock
                    )}`}
                  >
                    {formatNumber(stock)}
                    <small>
                      units
                    </small>
                  </div>

                </div>
              );
            })}

          </div>
        )}

      </div>

      {/* ======================================================
          QUICK STATS
      ====================================================== */}

      <div className="dashboard-bottom-stats">

        <div className="bottom-stat">

          <div className="bottom-stat-icon">
            <FaFileInvoice />
          </div>

          <div>
            <span>Total Invoices</span>
            <strong>
              {formatNumber(summary.totalInvoices)}
            </strong>
          </div>

        </div>

        <div className="bottom-stat">

          <div className="bottom-stat-icon">
            <FaClock />
          </div>

          <div>
            <span>Outstanding Today</span>
            <strong>
              {formatCurrency(summary.todayDue)}
            </strong>
          </div>

        </div>

        <div className="bottom-stat">

          <div className="bottom-stat-icon">
            <FaUndo />
          </div>

          <div>
            <span>Today's Returns</span>
            <strong>
              {formatCurrency(summary.todayReturns)}
            </strong>
          </div>

        </div>

        <div className="bottom-stat">

          <div className="bottom-stat-icon">
            <FaCreditCard />
          </div>

          <div>
            <span>Today's Collection</span>
            <strong>
              {formatCurrency(summary.todayPaid)}
            </strong>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;