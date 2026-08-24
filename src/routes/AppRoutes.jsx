import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "../components/common/ProtectedRoute";
import DashboardLayout from "../layouts/DashboardLayout";

import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import ForgotPassword from "../pages/ForgotPassword/ForgotPassword";
import ResetPassword from "../pages/ResetPassword/ResetPassword";

import Dashboard from "../pages/Dashboard/Dashboard";
import Profile from "../pages/Profile/Profile";
import Settings from "../pages/Settings/Settings";

import Product from "../pages/Product/Product/Product";
import ProductVariant from "../pages/Product/ProductVariant/ProductVariant";
import Barcode from "../pages/Product/Barcode/Barcode";
import Batch from "../pages/Product/Batch/Batch";

import StockAdjustment from "../pages/Inventory/StockAdjustment/StockAdjustment";
import StockTransfer from "../pages/Inventory/StockTransfer/StockTransfer";
import StockLedger from "../pages/Inventory/StockLedger/StockLedger";

import Purchase from "../pages/Purchase/Purchase/Purchase";
import PurchaseReturn from "../pages/Purchase/Purchasereturn/PurchaseReturn";
import Suppliers from "../pages/Purchase/Suppliers/Suppliers";

import Invoices from "../pages/Sales/Invoices/Invoices";
import Returns from "../pages/Sales/Returns/Returns";
import HoldBills from "../pages/Sales/Holdbills/Holdbills";
import Payments from "../pages/Sales/payments/payments";
import CashSession from "../pages/Sales/Cashsession/Cashsession";

import Customers from "../pages/CRM/Customers/Customers";
import Address from "../pages/CRM/Address/Address";
import Loyaltypoints from "../pages/CRM/Loyaltypoints/Loyaltypoints";

import Offers from "../pages/Offers-coupons/Offers/Offers";
import Coupon from "../pages/Offers-coupons/Coupon/Coupon";
import Expenses from "../pages/Expenses/Expenses";
import Reports from "../pages/Reports/Reports";

import Store from "../pages/Masters/Store/Store";
import User from "../pages/Masters/User/User";
import RolePermission from "../pages/Masters/RolePermission/RolePermission";
import TaxSettings from "../pages/Masters/TaxSettings/TaxSettings";
import Units from "../pages/Masters/Units/Units";
import Category from "../pages/Masters/Category/Category";
import SubCategory from "../pages/Masters/SubCategory/SubCategory";
import Brand from "../pages/Masters/Brand/Brand";
import WareHouse from "../pages/Masters/WareHouse/WareHouse";
import Shelf from "../pages/Masters/Shelf/Shelf";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Profile />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Settings />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/product/product"
        element={
          <ProtectedRoute module="Products">
            <DashboardLayout>
              <Product />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/product/productvariant"
        element={
          <ProtectedRoute module="Product Variants">
            <DashboardLayout>
              <ProductVariant />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/product/barcodes"
        element={
          <ProtectedRoute module="Barcodes">
            <DashboardLayout>
              <Barcode />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/product/batch"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Batch />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/purchase/suppliers"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Suppliers />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/purchase/purchase"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Purchase />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/purchase/purchaseReturn"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <PurchaseReturn />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/sales/invoices"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Invoices />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales/returns"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Returns />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales/holdbills"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <HoldBills />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales/payments"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Payments />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales/cashsession"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <CashSession />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/inventory"
        element={
          <Navigate to="/inventory/stockadjustment" replace />
        }
      />
      <Route
        path="/inventory/stockadjustment"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <StockAdjustment />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory/stocktransfer"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <StockTransfer />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory/stockledger"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <StockLedger />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/crm/customers"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Customers />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/crm/address"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Address />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/crm/loyaltypoints"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Loyaltypoints />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/offers-coupons/offers"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Offers />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/offers-coupons/coupon"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Coupon />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/expenses/expenses"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Expenses />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/reports"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Reports />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/masters/store"
        element={
          <ProtectedRoute module="Store">
            <DashboardLayout>
              <Store />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/masters/user"
        element={
          <ProtectedRoute module="Users">
            <DashboardLayout>
              <User />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/masters/rolepermission"
        element={
          <ProtectedRoute module="Role Permission">
            <DashboardLayout>
              <RolePermission />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/masters/tax-settings"
        element={
          <ProtectedRoute module="Tax Settings">
            <DashboardLayout>
              <TaxSettings />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/masters/units"
        element={
          <ProtectedRoute module="Units">
            <DashboardLayout>
              <Units />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/masters/category"
        element={
          <ProtectedRoute module="Categories">
            <DashboardLayout>
              <Category />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/masters/sub-category"
        element={
          <ProtectedRoute module="Sub Categories">
            <DashboardLayout>
              <SubCategory />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/masters/brand"
        element={
          <ProtectedRoute module="Brands">
            <DashboardLayout>
              <Brand />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/masters/warehouse"
        element={
          <ProtectedRoute module="Warehouse">
            <DashboardLayout>
              <WareHouse />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/masters/shelf"
        element={
          <ProtectedRoute module="Shelf">
            <DashboardLayout>
              <Shelf />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />


      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default AppRoutes;