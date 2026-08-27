import {
  FaTachometerAlt,
  FaCogs,
  FaStore,
  FaUsers,
  FaUserShield,
  FaPercentage,
  FaRuler,
  FaTags,
  FaWarehouse,
  FaBoxes,
  FaBarcode,
  FaLayerGroup,
  FaTruck,
  FaShoppingCart,
  FaUndo,
  FaFileInvoiceDollar,
  FaCashRegister,
  FaMoneyBillWave,
  FaClipboardList,
  FaExchangeAlt,
  FaBook,
  FaUserFriends,
  FaMapMarkerAlt,
  FaGift,
  FaTicketAlt,
  FaReceipt,
  FaChartBar,
} from "react-icons/fa";

const sidebarMenu = [
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: FaTachometerAlt,
    roles: [
      "ADMIN",
      "MANAGER",
      "CASHIER",
      "SALES_EXECUTIVE",
    ],
  },

  {
    title: "Masters",
    icon: FaCogs,
    roles: ["ADMIN", "MANAGER"],
    children: [
      {
        title: "Store",
        path: "/masters/store",
        icon: FaStore,
        module: "Store",
      },
      {
        title: "User Management",
        path: "/masters/user",
        icon: FaUsers,
        module: "Users",
      },
      {
        title: "Role Permission",
        path: "/masters/rolepermission",
        icon: FaUserShield,
        module: "Role Permission",
        roles: ["ADMIN"],
      },
      {
        title: "Tax Settings",
        path: "/masters/tax-settings",
        icon: FaPercentage,
        module: "Tax Settings",
      },
      {
        title: "Units",
        path: "/masters/units",
        icon: FaRuler,
        module: "Units",
      },
      {
        title: "Department Categories",
        path: "/masters/category",
        icon: FaTags,
        module: "Categories",
      },
      {
        title: "Department Sub Categories",
        path: "/masters/sub-category",
        icon: FaTags,
        module: "Sub Categories",
      },
      {
        title: "Brands",
        path: "/masters/brand",
        icon: FaTags,
        module: "Brands",
      },
      {
        title: "Warehouses",
        path: "/masters/warehouse",
        icon: FaWarehouse,
        module: "Warehouse",
      },
      {
        title: "Shelves",
        path: "/masters/shelf",
        icon: FaBoxes,
        module: "Shelf",
      },
    ],
  },

  {
    title: "Products",
    icon: FaBoxes,
    roles: ["ADMIN", "MANAGER"],
    children: [
      {
        title: "Products",
        path: "/product/product",
        icon: FaBoxes,
        module: "Products",
      },
      {
        title: "Product Variants",
        path: "/product/productvariant",
        icon: FaLayerGroup,
        module: "Product Variants",
      },
      {
        title: "Barcodes",
        path: "/product/barcodes",
        icon: FaBarcode,
        module: "Barcodes",
      },
      {
        title: "Batches",
        path: "/product/batch",
        icon: FaLayerGroup,
        module: "Batches",
      },
    ],
  },

  {
    title: "Purchase",
    icon: FaShoppingCart,
    roles: ["ADMIN", "MANAGER"],
    children: [
      {
        title: "Suppliers",
        path: "/purchase/suppliers",
        icon: FaTruck,
        module: "Suppliers",
      },
      {
        title: "Purchases",
        path: "/purchase/purchase",
        icon: FaShoppingCart,
        module: "Purchases",
      },
      {
        title: "Purchase Returns",
        path: "/purchase/purchasereturn",
        icon: FaUndo,
        module: "Purchase Returns",
      },
    ],
  },

  {
    title: "Sales",
    icon: FaFileInvoiceDollar,
    roles: [
      "ADMIN",
      "MANAGER",
      "CASHIER",
      "SALES_EXECUTIVE",
    ],
    children: [
      {
        title: "Sales Invoices",
        path: "/sales/invoices",
        icon: FaFileInvoiceDollar,
        module: "Sales Invoices",
        roles: [
          "ADMIN",
          "MANAGER",
          "CASHIER",
          "SALES_EXECUTIVE",
        ],
      },
      {
        title: "Sales Returns",
        path: "/sales/returns",
        icon: FaUndo,
        module: "Sales Returns",
        roles: [
          "ADMIN",
          "MANAGER",
          "CASHIER",
        ],
      },
      {
        title: "Hold Bills",
        path: "/sales/holdbills",
        icon: FaReceipt,
        module: "Hold Bills",
        roles: [
          "ADMIN",
          "MANAGER",
          "CASHIER",
        ],
      },
      {
        title: "Payments",
        path: "/sales/payments",
        icon: FaMoneyBillWave,
        module: "Payments",
        roles: [
          "ADMIN",
          "MANAGER",
          "CASHIER",
        ],
      },
      {
        title: "Cash Sessions",
        path: "/sales/cashsession",
        icon: FaCashRegister,
        module: "Cash Sessions",
        roles: [
          "ADMIN",
          "MANAGER",
          "CASHIER",
        ],
      },
    ],
  },

  {
    title: "Inventory",
    icon: FaClipboardList,
    roles: ["ADMIN", "MANAGER"],
    children: [
      {
        title: "Stock Adjustments",
        path: "/inventory/stockadjustment",
        icon: FaClipboardList,
        module: "Stock Adjustments",
      },
      {
        title: "Stock Transfers",
        path: "/inventory/stocktransfer",
        icon: FaExchangeAlt,
        module: "Stock Transfers",
      },
      {
        title: "Stock Ledgers",
        path: "/inventory/stockledger",
        icon: FaBook,
        module: "Stock Ledgers",
      },
    ],
  },

  {
    title: "CRM",
    icon: FaUserFriends,
    roles: [
      "ADMIN",
      "MANAGER",
      "CASHIER",
      "SALES_EXECUTIVE",
    ],
    children: [
      {
        title: "Customers",
        path: "/crm/customers",
        icon: FaUserFriends,
        module: "Customers",
        roles: [
          "ADMIN",
          "MANAGER",
          "CASHIER",
          "SALES_EXECUTIVE",
        ],
      },
      {
        title: "Customer Addresses",
        path: "/crm/address",
        icon: FaMapMarkerAlt,
        module: "Customer Addresses",
        roles: [
          "ADMIN",
          "MANAGER",
          "SALES_EXECUTIVE",
        ],
      },
      {
        title: "Loyalty Points",
        path: "/crm/loyaltypoints",
        icon: FaGift,
        module: "Loyalty Points",
        roles: [
          "ADMIN",
          "MANAGER",
          "SALES_EXECUTIVE",
        ],
      },
    ],
  },

  {
    title: "Offers / Promotions",
    icon: FaGift,
    roles: ["ADMIN", "MANAGER"],
    children: [
      {
        title: "Offers",
        path: "/offers-coupons/offers",
        icon: FaGift,
        module: "Offers",
      },
      {
        title: "Coupons",
        path: "/offers-coupons/coupon",
        icon: FaTicketAlt,
        module: "Coupons",
      },
    ],
  },

  {
    title: "Expenses",
    icon: FaReceipt,
    roles: ["ADMIN", "MANAGER"],
    children: [
      {
        title: "Expenses",
        path: "/expenses/expenses",
        icon: FaReceipt,
        module: "Expenses",
      },
    ],
  },

  {
    title: "Reports",
    path: "/reports/reports",
    icon: FaChartBar,
    roles: ["ADMIN", "MANAGER"],
  },
];

export default sidebarMenu;