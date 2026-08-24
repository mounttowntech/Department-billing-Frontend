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
  },


  {
    title: "Masters",
    icon: FaCogs,
    children: [
      { title: "Store", path: "/masters/store", icon: FaStore, module: "Store" },
      { title: "User Management", path: "/masters/user", icon: FaUsers, module: "Users" },
      { title: "Role Permission", path: "/masters/rolepermission", icon: FaUserShield, module: "Role Permission" },
      { title: "Tax Settings", path: "/masters/tax-settings", icon: FaPercentage, module: "Tax Settings" },
      { title: "Units", path: "/masters/units", icon: FaRuler, module: "Units" },
      { title: "Department Categories", path: "/masters/category", icon: FaTags, module: "Categories" },
      { title: "Department Sub Categories", path: "/masters/sub-category", icon: FaTags, module: "Sub Categories" },
      { title: "Brands", path: "/masters/brand", icon: FaTags, module: "Brands" },
      { title: "Warehouses", path: "/masters/warehouse", icon: FaWarehouse, module: "Warehouse" },
      { title: "Shelves", path: "/masters/shelf", icon: FaBoxes, module: "Shelf" },
    ],
  },


  {
    title: "Products",
    icon: FaBoxes,
    children: [
      { title: "Products", path: "/product/product", icon: FaBoxes, module: "Products" },
      { title: "Product Variants", path: "/product/productvariant", icon: FaLayerGroup, module: "Product Variants" },
      { title: "Barcodes", path: "/product/barcodes", icon: FaBarcode, module: "Barcodes" },
      { title: "Batches", path: "/product/batch", icon: FaLayerGroup, module: "Batches" },
    ],
  },


  {
    title: "Purchase",
    icon: FaShoppingCart,
    children: [
      { title: "Suppliers", path: "/purchase/suppliers", icon: FaTruck, module: "Suppliers" },
      { title: "Purchases", path: "/purchase/purchase", icon: FaShoppingCart, module: "Purchases" },
      { title: "Purchase Returns", path: "/purchase/purchasereturn", icon: FaUndo, module: "Purchase Returns" },
    ],
  },


  {
    title: "Sales",
    icon: FaFileInvoiceDollar,
    children: [
      { title: "Sales Invoices", path: "/sales/invoices", icon: FaFileInvoiceDollar, module: "Sales Invoices" },
      { title: "Sales Returns", path: "/sales/returns", icon: FaUndo, module: "Sales Returns" },
      { title: "Hold Bills", path: "/sales/holdbills", icon: FaReceipt, module: "Hold Bills" },
      { title: "Payments", path: "/sales/payments", icon: FaMoneyBillWave, module: "Payments" },
      { title: "Cash Sessions", path: "/sales/cashsession", icon: FaCashRegister, module: "Cash Sessions" },
    ],
  },


  {
    title: "Inventory",
    icon: FaClipboardList,
    children: [
      { title: "Stock Adjustments", path: "/inventory/stockadjustment", icon: FaClipboardList, module: "Stock Adjustments" },
      { title: "Stock Transfers", path: "/inventory/stocktransfer", icon: FaExchangeAlt, module: "Stock Transfers" },
      { title: "Stock Ledgers", path: "/inventory/stockledger", icon: FaBook, module: "Stock Ledgers" },
    ],
  },

  // 7. CRM
  {
    title: "CRM",
    icon: FaUserFriends,
    children: [
      { title: "Customers", path: "/crm/customers", icon: FaUserFriends, module: "Customers" },
      { title: "Customer Addresses", path: "/crm/address", icon: FaMapMarkerAlt, module: "Customer Addresses" },
      { title: "Loyalty Points", path: "/crm/loyaltypoints", icon: FaGift, module: "Loyalty Points" },
    ],
  },


  {
    title: "Offers / Promotions",
    icon: FaGift,
    children: [
      { title: "Offers", path: "/offers-coupons/offers", icon: FaGift, module: "Offers" },
      { title: "Coupons", path: "/offers-coupons/coupon", icon: FaTicketAlt, module: "Coupons" },
    ],
  },


  {
    title: "Expenses",
    icon: FaReceipt,
    children: [
      { title: "Expenses", path: "/expenses/expenses", icon: FaReceipt, module: "Expenses" },
    ],
  },


  {
    title: "Reports",
    icon: FaChartBar,
    path: "/reports/reports"
  },
];

export default sidebarMenu;