import { NavLink } from "react-router-dom";

function SubMenu({ items = [] }) {
  return (
    <div className="submenu submenu-open">
      {items.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            isActive
              ? "submenu-link active-submenu"
              : "submenu-link"
          }
        >
          {item.icon && (
            <item.icon className="submenu-icon" />
          )}

          <span>{item.title}</span>
        </NavLink>
      ))}
    </div>
  );
}

export default SubMenu;