import "./RecentPurchases.css";

function RecentPurchases({ purchases }) {
  return (
    <div className="purchase-card">

      <div className="purchase-header">
        <h3>Recent Purchases</h3>
      </div>

      <table className="purchase-table">

        <thead>
          <tr>
            <th>Purchase No</th>
            <th>Date</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>

          {purchases.length === 0 ? (
            <tr>
              <td colSpan="4" className="empty">
                No Purchases Found
              </td>
            </tr>
          ) : (
            purchases.map((purchase) => (
              <tr key={purchase._id}>

                <td>{purchase.purchaseNo}</td>

                <td>
                  {new Date(
                    purchase.purchaseDate
                  ).toLocaleDateString()}
                </td>

                <td>
                  ₹ {purchase.grandTotal.toLocaleString("en-IN")}
                </td>

                <td>

                  <span
                    className={
                      purchase.paymentStatus === "paid"
                        ? "status paid"
                        : purchase.paymentStatus === "partial"
                        ? "status partial"
                        : "status unpaid"
                    }
                  >
                    {purchase.paymentStatus}
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

export default RecentPurchases;