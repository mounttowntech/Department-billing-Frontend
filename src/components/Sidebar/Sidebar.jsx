import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { FiChevronDown } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import sidebarMenu from "../../data/sidebarMenu";
import "./Sidebar.css";

export default function Sidebar() {
  const { user } = useAuth();
  const { pathname } = useLocation();

  const userRole = useMemo(() => {
    const role =
      user?.roleCode ||
      user?.role?.roleCode ||
      user?.roleName ||
      user?.role?.name ||
      "";

    return String(role).trim().toUpperCase();
  }, [user]);

  console.log("Sidebar User:", user);
  console.log("Sidebar Role:", userRole);

  const authorizedMenu = useMemo(() => {
    if (!userRole) return [];

    return sidebarMenu
      .filter((item) => {
        if (!item.roles) return true;

        return item.roles.includes(userRole);
      })
      .map((item) => {
        if (!item.children) {
          return item;
        }

        const children = item.children.filter((child) => {
          if (!child.roles) return true;

          return child.roles.includes(userRole);
        });

        return {
          ...item,
          children,
        };
      })
      .filter((item) => {
        if (!item.children) return true;

        return item.children.length > 0;
      });
  }, [userRole]);

  const [openMenus, setOpenMenus] = useState({});

  useEffect(() => {
    const activeParent = authorizedMenu.find(
      (item) =>
        item.children?.some((child) =>
          pathname.startsWith(child.path)
        )
    );

    if (activeParent) {
      setOpenMenus((prev) => ({
        ...prev,
        [activeParent.title]: true,
      }));
    }
  }, [pathname, authorizedMenu]);

  const toggleMenu = (title) => {
    setOpenMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const displayRole =
    userRole.replaceAll("_", " ") || "USER";

  return (
    <aside className="sidebar">

      <div className="sidebar-top">

        <NavLink
          to="/dashboard"
          className="sidebar-logo"
        >
          <div className="logo-icon">
            BP
          </div>

          <div className="logo-content">
            <h2>Billing Pro</h2>

            <span>{displayRole}</span>
          </div>
        </NavLink>

        <div className="sidebar-divider" />

      </div>

      <nav className="sidebar-menu">

        {authorizedMenu.map((item) => {

          // Single menu
          if (!item.children) {
            return (
              <NavLink
                key={item.title}
                to={item.path}
                className={({ isActive }) =>
                  `sidebar-link ${
                    isActive
                      ? "active-link"
                      : ""
                  }`
                }
              >
                <div className="sidebar-left">
                  <item.icon />

                  <span>
                    {item.title}
                  </span>
                </div>
              </NavLink>
            );
          }

          // Parent menu
          const isOpen =
            !!openMenus[item.title];

          const hasActiveChild =
            item.children.some((child) =>
              pathname.startsWith(child.path)
            );

          return (
            <div
              key={item.title}
              className="sidebar-group"
            >

              <button
                type="button"
                className={`sidebar-link ${
                  hasActiveChild
                    ? "active-link"
                    : ""
                } ${isOpen ? "opened" : ""}`}
                onClick={() =>
                  toggleMenu(item.title)
                }
              >
                <div className="sidebar-left">

                  <item.icon />

                  <span>
                    {item.title}
                  </span>

                </div>

                <FiChevronDown className="arrow" />

              </button>

              <div
                className={`submenu ${
                  isOpen
                    ? "submenu-open"
                    : ""
                }`}
              >
                {item.children.map(
                  (child) => (
                    <NavLink
                      key={child.path}
                      to={child.path}
                      className={({ isActive }) =>
                        `submenu-link ${
                          isActive
                            ? "active-submenu"
                            : ""
                        }`
                      }
                    >
                      <child.icon />

                      <span>
                        {child.title}
                      </span>
                    </NavLink>
                  )
                )}
              </div>

            </div>
          );
        })}

      </nav>

      <div className="sidebar-footer">
        <div className="footer-card">
          <p className="footer-title">
            Billing Pro ERP
          </p>

          <span className="footer-version">
            v2.4.0 • POS Edition
          </span>
        </div>
      </div>

    </aside>
  );
}