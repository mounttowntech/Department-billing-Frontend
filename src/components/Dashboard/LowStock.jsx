import "./LowStock.css";

function LowStock({ items }) {
  return (
    <div className="lowstock-card">

      <div className="lowstock-header">
        <h3>Low Stock Products</h3>
      </div>

      <table className="lowstock-table">

        <thead>
          <tr>
            <th>Product</th>
            <th>SKU</th>
            <th>Available</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>

          {items.length === 0 ? (
            <tr>
              <td colSpan="4" className="empty">
                🎉 No Low Stock Products
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item._id}>

                <td>{item.productName}</td>

                <td>{item.skuCode}</td>

                <td>{item.availableStock}</td>

                <td>
                  <span className="stock-badge">
                    Low
                  </span>
                </td>

              </tr>
            ))
          )}

        </tbody>

      </table>

    </div>
  );
}

export default LowStock;