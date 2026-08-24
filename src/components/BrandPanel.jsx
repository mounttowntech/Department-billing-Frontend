
export default function BrandPanel({ variant = 'login' }) {
  const copy = {
    login: {
      heading: 'Run the whole store from one screen.',
      body: 'Sales, purchases, stock, and profit — tracked live, so nothing slips through at closing time.',
    },
    register: {
      heading: 'Set up your store in minutes.',
      body: 'Create your admin account and start billing, tracking stock, and managing customers today.',
    },
  }[variant];

  return (
    <div className="bp-auth-brandpanel">
      <div className="bp-brand-logo">
        <div className="bp-brand-logo-mark">🛍️</div>
        <div className="bp-brand-logo-text">
          <h1>BillingPro</h1>
          <span>Enterprise Edition</span>
        </div>
      </div>

      <div className="bp-brand-copy">
        <h2>{copy.heading}</h2>
        <p>{copy.body}</p>

        <div className="bp-brand-stats">
          <div className="bp-brand-stat">
            <div className="num">₹82,450</div>
            <div className="label">Today's sales</div>
          </div>
          <div className="bp-brand-stat">
            <div className="num">15.3%</div>
            <div className="label">Profit growth</div>
          </div>
          <div className="bp-brand-stat">
            <div className="num">18</div>
            <div className="label">Low stock alerts</div>
          </div>
        </div>
      </div>

      <div className="bp-brand-footer">© {new Date().getFullYear()} BillingPro. All rights reserved.</div>
    </div>
  );
}