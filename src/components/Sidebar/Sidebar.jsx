import React, { useState, useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Sidebar.css";

import {
  FiGrid,
  FiShoppingBag,
  FiShoppingCart,
  FiDollarSign,
  FiDatabase,
  FiUsers,
  FiPercent,
  FiCreditCard,
  FiFileText,
  FiSettings,
  FiChevronDown,
  FiBox,
  FiLayers,
  FiTag,
  FiTruck,
  FiRotateCcw,
  FiFilePlus,
  FiClock,
  FiSliders,
  FiTrendingUp,
  FiMapPin,
  FiAward,
  FiGift,
  FiServer,
  FiUserPlus,
  FiShield,
  FiHash,
} from "react-icons/fi";

export default function Sidebar() {
  const { user } = useAuth();
  const location = roleBasedLocation(); // fallback helper

  const locationHook = useLocation();
  const currentPath = locationHook.pathname;

  // Ultra-Safe Role Extraction with Admin Fallback
  const userRole = useMemo(() => {
    if (!user) return "admin"; // Default to admin if uninitialized
    const rawUser = user?.user || user || {};
    let roleVal = rawUser.role || rawUser.roleName || rawUser.userRole || "";

    if (typeof roleVal === "object" && roleVal !== null) {
      roleVal = roleVal.name || roleVal.roleName || roleVal.title || roleVal.role || "";
    }

    if (Array.isArray(roleVal)) {
      roleVal = roleVal[0]?.name || roleVal[0] || "";
    }

    const normalized = String(roleVal).trim().toLowerCase();
    

    return normalized === "" ? "admin" : normalized;
  }, [user]);


  const menuConfig = useMemo(
    () => [
      {
        id: "dashboard",
        title: "Dashboard",
        icon: <FiGrid className="sidebar-icon" />,
        path: "/dashboard",
      },
      {
        id: "masters",
        title: "Masters",
        icon: <FiServer className="sidebar-icon" />,
        children: [
          { title: "Store", path: "/masters/store", icon: <FiServer /> },
          { title: "Warehouse", path: "/masters/warehouse", icon: <FiBox /> },
          { title: "Shelf", path: "/masters/shelf", icon: <FiLayers /> },
          { title: "Category", path: "/masters/category", icon: <FiTag /> },
          { title: "Sub Category", path: "/masters/sub-category", icon: <FiTag /> },
          { title: "Brand", path: "/masters/brand", icon: <FiAward /> },
          { title: "Units", path: "/masters/units", icon: <FiSliders /> },
          { title: "Tax Settings", path: "/masters/tax-settings", icon: <FiPercent /> },
          { title: "Users", path: "/masters/user", icon: <FiUserPlus /> },
      
        ],
      },
      {
        id: "sales",
        title: "Sales & Billing",
        icon: <FiDollarSign className="sidebar-icon" />,
        children: [
          { title: "Sales Invoice", path: "/sales/invoices", icon: <FiFilePlus /> },
          { title: "Sales Return", path: "/sales/returns", icon: <FiRotateCcw /> },
          { title: "Hold Bills", path: "/sales/holdbills", icon: <FiClock /> },
          { title: "Payments", path: "/sales/payments", icon: <FiCreditCard /> },
          { title: "Cash Session", path: "/sales/cashsession", icon: <FiDollarSign /> },
        ],
      },
      {
        id: "products",
        title: "Products",
        icon: <FiShoppingBag className="sidebar-icon" />,
        children: [
          { title: "All Products", path: "/product/product", icon: <FiBox /> },
          { title: "Variants", path: "/product/productvariant", icon: <FiLayers /> },
          { title: "Barcodes", path: "/product/barcodes", icon: <FiHash /> },
          { title: "Batches", path: "/product/batch", icon: <FiDatabase /> },
        ],
      },
      {
        id: "inventory",
        title: "Inventory",
        icon: <FiDatabase className="sidebar-icon" />,
        children: [
          { title: "Stock Adjustment", path: "/inventory/stockadjustment", icon: <FiSliders /> },
          { title: "Stock Transfer", path: "/inventory/stocktransfer", icon: <FiTrendingUp /> },
          { title: "Stock Ledger", path: "/inventory/stockledger", icon: <FiFileText /> },
        ],
      },
      {
        id: "purchase",
        title: "Purchase",
        icon: <FiShoppingCart className="sidebar-icon" />,
        children: [
          { title: "Suppliers", path: "/purchase/suppliers", icon: <FiTruck /> },
          { title: "Purchases", path: "/purchase/purchase", icon: <FiShoppingCart /> },
          { title: "Purchase Return", path: "/purchase/purchaseReturn", icon: <FiRotateCcw /> },
        ],
      },
      {
        id: "crm",
        title: "CRM",
        icon: <FiUsers className="sidebar-icon" />,
        children: [
          { title: "Customers", path: "/crm/customers", icon: <FiUsers /> },
          { title: "Address List", path: "/crm/address", icon: <FiMapPin /> },
          { title: "Loyalty Points", path: "/crm/loyaltypoints", icon: <FiAward /> },
        ],
      },
      {
        id: "offers",
        title: "Offers & Coupons",
        icon: <FiPercent className="sidebar-icon" />,
        children: [
          { title: "Offers", path: "/offers-coupons/offers", icon: <FiGift /> },
          { title: "Coupons", path: "/offers-coupons/coupon", icon: <FiTag /> },
        ],
      },
      {
        id: "expenses",
        title: "Expenses",
        icon: <FiCreditCard className="sidebar-icon" />,
        path: "/expenses/expenses",
      },
      {
        id: "reports",
        title: "Reports",
        icon: <FiFileText className="sidebar-icon" />,
        path: "/reports/reports",
      },
      
      {
        id: "settings",
        title: "Settings",
        icon: <FiSettings className="sidebar-icon" />,
        path: "/settings",
      },
    ],
    []
  );

  // Restricted menus for Cashier / Sales Executive if needed, Admin gets everything automatically
  const authorizedMenu = useMemo(() => {
    if (userRole === "admin" || userRole === "superadmin" || userRole === "") {
      return menuConfig; // Admin gets 100% access
    }

  
    if (userRole === "cashier") {
      return menuConfig.filter((item) => ["dashboard", "sales", "crm"].includes(item.id));
    }

    return menuConfig;
  }, [menuConfig, userRole]);

  const [openMenus, setOpenMenus] = useState(() => {
    const activeParent = menuConfig.find(
      (m) => m.children && m.children.some((c) => currentPath.startsWith(c.path))
    );
    return activeParent ? { [activeParent.id]: true } : {};
  });

  const toggleSubmenu = (menuId) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuId]: !prev[menuId],
    }));
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <NavLink to="/dashboard" className="sidebar-logo">
          <div className="logo-icon">BP</div>
          <div className="logo-content">
            <h2>Billing Pro</h2>
            <span>{userRole ? userRole.toUpperCase() : "ADMIN"}</span>
          </div>
        </NavLink>
        <div className="sidebar-divider" />
      </div>

      <nav className="sidebar-menu">
        {authorizedMenu.map((item) => {
          if (!item.children) {
            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "active-link" : ""}`
                }
              >
                <div className="sidebar-left">
                  {item.icon}
                  <span>{item.title}</span>
                </div>
              </NavLink>
            );
          }

          const isOpened = !!openMenus[item.id];
          const hasActiveChild = item.children.some((child) =>
            currentPath.startsWith(child.path)
          );

          return (
            <div key={item.id} className="sidebar-group">
              <button
                type="button"
                className={`sidebar-link ${hasActiveChild ? "active-link" : ""} ${
                  isOpened ? "opened" : ""
                }`}
                onClick={() => toggleSubmenu(item.id)}
              >
                <div className="sidebar-left">
                  {item.icon}
                  <span>{item.title}</span>
                </div>
                <FiChevronDown className="arrow" />
              </button>

              <div className={`submenu ${isOpened ? "submenu-open" : ""}`}>
                {item.children.map((child) => (
                  <NavLink
                    key={child.path}
                    to={child.path}
                    className={({ isActive }) =>
                      `submenu-link ${isActive ? "active-submenu" : ""}`
                    }
                  >
                    {child.icon}
                    <span>{child.title}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="footer-card">
          <p className="footer-title">Billing Pro ERP</p>
          <span className="footer-version">v2.4.0 • POS Edition</span>
        </div>
      </div>
    </aside>
  );
}

function roleBasedLocation() {
  return useLocation();
}