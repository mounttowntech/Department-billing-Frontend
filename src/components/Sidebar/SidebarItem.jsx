import { NavLink } from "react-router-dom";

import { hasPermission } from "../../utils/permission";

function SidebarItem({ item }) {
  const Icon = item.icon;

  if (
    item.module &&
    !hasPermission(item.module, "canView")
  ) {
    return null;
  }

  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        isActive
          ? "sidebar-link active-link"
          : "sidebar-link"
      }
    >
      <div className="sidebar-left">
        {Icon && (
          <Icon className="sidebar-icon" />
        )}

        <span>{item.title}</span>
      </div>
    </NavLink>
  );
}

export default SidebarItem;