import {
  FaCashRegister,
  FaCartPlus,
  FaBoxOpen,
  FaUserPlus,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import "./QuickActions.css";

function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      title: "New Sale",
      icon: <FaCashRegister />,
      color: "#2563EB",
      path: "/sales",
    },
    {
      title: "New Purchase",
      icon: <FaCartPlus />,
      color: "#16A34A",
      path: "/purchase",
    },
    {
      title: "Add Product",
      icon: <FaBoxOpen />,
      color: "#F59E0B",
      path: "/products",
    },
    {
      title: "Add Customer",
      icon: <FaUserPlus />,
      color: "#8B5CF6",
      path: "/customers",
    },
  ];

  return (
    <div className="quick-card">
      <h3>Quick Actions</h3>

      <div className="quick-grid">
        {actions.map((action) => (
          <button
            key={action.title}
            className="quick-btn"
            onClick={() => navigate(action.path)}
          >
            <div
              className="quick-icon"
              style={{
                background: action.color,
              }}
            >
              {action.icon}
            </div>

            <span>{action.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default QuickActions;