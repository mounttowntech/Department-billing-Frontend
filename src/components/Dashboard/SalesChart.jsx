import ReactApexChart from "react-apexcharts";
import "./SalesChart.css";

function SalesChart() {
  const options = {
    chart: {
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },

    stroke: {
      curve: "smooth",
      width: 4,
    },

    colors: ["#4F46E5"],

    xaxis: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
      ],
    },

    dataLabels: {
      enabled: false,
    },

    grid: {
      borderColor: "#f1f5f9",
    },

    tooltip: {
      theme: "light",
    },
  };

  const series = [
    {
      name: "Sales",
      data: [25000, 42000, 31000, 51000, 47000, 63000, 82450],
    },
  ];

  return (
    <div className="sales-chart-card">

      <div className="sales-chart-header">
        <h3>Sales Overview</h3>
        <p>Last 7 Months</p>
      </div>

      <ReactApexChart
        options={options}
        series={series}
        type="area"
        height={320}
      />

    </div>
  );
}

export default SalesChart;