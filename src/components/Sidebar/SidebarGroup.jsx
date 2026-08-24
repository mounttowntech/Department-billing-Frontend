import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { FaChevronDown } from "react-icons/fa";

export default function SidebarGroup({ item }) {
  const location = useLocation();
  const Icon = item.icon;

  const isChildActive =
    item.children &&
    item.children.some((child) => location.pathname === child.path);

  const [isOpen, setIsOpen] = useState(isChildActive);

  useEffect(() => {
    if (isChildActive) {
      setIsOpen(true);
    }
  }, [location.pathname, isChildActive]);

  return (
    <div className={`sidebar-group ${isOpen ? "opened" : ""}`}>
      {/* Category Dropdown Title */}
      <button
        type="button"
        className={`sidebar-link ${isChildActive ? "active-link" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <div className="sidebar-left">
          {Icon && <Icon className="sidebar-icon" />}
          <span>{item.title}</span>
        </div>

        <FaChevronDown
          className="arrow"
          style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.3s ease",
            fontSize: "12px",
          }}
        />
      </button>


      <div
        className={`submenu ${isOpen ? "submenu-open" : ""}`}
        style={{
          maxHeight: isOpen ? "1000px" : "0px",
          overflow: "hidden",
          transition: "max-height 0.35s ease",
        }}
      >
        {item.children &&
          item.children.map((sub) => {
            const SubIcon = sub.icon;
            return (
              <NavLink
                key={sub.path}
                to={sub.path}
                className={({ isActive }) =>
                  `submenu-link ${isActive ? "active-submenu" : ""}`
                }
              >
                {SubIcon && <SubIcon className="sidebar-icon" />}
                <span>{sub.title}</span>
              </NavLink>
            );
          })}
      </div>
    </div>
  );
}