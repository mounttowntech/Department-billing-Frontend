import "./RecentBills.css";

function RecentBills({ bills }) {
  return (
    <div className="recent-card">

      <div className="recent-header">
        <h3>Recent Bills</h3>
      </div>

      <table className="recent-table">

        <thead>
          <tr>
            <th>Invoice</th>
            <th>Customer</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>

          {bills.length === 0 ? (
            <tr>
              <td colSpan="4" className="empty">
                No Bills Found
              </td>
            </tr>
          ) : (
            bills.map((bill) => (
              <tr key={bill._id}>

                <td>{bill.invoiceNo}</td>

                <td>{bill.customer?.customerName}</td>

                <td>
                  ₹ {bill.grandTotal.toLocaleString("en-IN")}
                </td>

                <td>

                  <span
                    className={
                      bill.paymentStatus === "Paid"
                        ? "status paid"
                        : "status pending"
                    }
                  >
                    {bill.paymentStatus}
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

export default RecentBills;