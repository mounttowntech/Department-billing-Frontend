import {
  FaShoppingBag,
  FaShoppingCart,
  FaBoxes,
  FaChartLine,
} from "react-icons/fa";

import {
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

import "./StatCards.css";

const chartData = [
  { value: 20 },
  { value: 35 },
  { value: 30 },
  { value: 45 },
  { value: 38 },
  { value: 55 },
  { value: 48 },
  { value: 60 },
];

function StatCards({ data }) {
  const cards = [
    {
      title: "Total Sales",
      value: data?.totalSales || 0,
      growth: "Today's Sales",
      icon: <FaShoppingBag />,
      color: "#4169E1",
      bg: "#E9F0FF",
    },
    {
      title: "Orders",
      value: data?.totalOrders || 0,
      growth: "Total Orders",
      icon: <FaShoppingCart />,
      color: "#22C55E",
      bg: "#EAFBF0",
    },
    {
      title: "Due Amount",
      value: data?.dueAmount || 0,
      growth: "Pending",
      icon: <FaBoxes />,
      color: "#F59E0B",
      bg: "#FFF5E5",
    },
    {
      title: "Profit",
      value: data?.totalProfit || 0,
      growth: "Net Profit",
      icon: <FaChartLine />,
      color: "#8B5CF6",
      bg: "#F3ECFF",
    },
  ];

  return (
    <div className="stats-grid">
      {cards.map((card) => (
        <div className="stat-card" key={card.title}>
          <div className="stat-top">
            <div
              className="stat-icon"
              style={{
                background: card.bg,
                color: card.color,
              }}
            >
              {card.icon}
            </div>

            <div>
              <h4
                style={{
                  color: card.color,
                }}
              >
                {card.title}
              </h4>

              <h2>₹ {Number(card.value).toLocaleString("en-IN")}</h2>

              <p>{card.growth}</p>
            </div>
          </div>

          <div className="mini-chart">
            <ResponsiveContainer width="100%" height={70}>
              <LineChart data={chartData}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={card.color}
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ))}
    </div>
  );
}

export default StatCards;