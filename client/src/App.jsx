import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';

// Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Customer
import CustomerDashboard from './pages/customer/CustomerDashboard';
import Profile from './pages/customer/Profile';
import MyAccount from './pages/customer/MyAccount';
import TransferFunds from './pages/customer/TransferFunds';
import TransactionHistory from './pages/customer/TransactionHistory';
import TransactionDetails from './pages/customer/TransactionDetails';
import TransactionSearch from './pages/customer/TransactionSearch';
import SubmitComplaint from './pages/customer/SubmitComplaint';
import MyComplaints from './pages/customer/MyComplaints';
import ComplaintDetails from './pages/customer/ComplaintDetails';
import Notifications from './pages/customer/Notifications';

// Officer
import OfficerDashboard from './pages/officer/OfficerDashboard';
import AssignedComplaints from './pages/officer/AssignedComplaints';
import OfficerComplaintDetails from './pages/officer/OfficerComplaintDetails';

// Manager
import ManagerDashboard from './pages/manager/ManagerDashboard';
import EscalatedComplaints from './pages/manager/EscalatedComplaints';
import ManagerComplaintDetails from './pages/manager/ManagerComplaintDetails';
import Reports from './pages/manager/Reports';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import UserDetails from './pages/admin/UserDetails';
import CreateStaffUser from './pages/admin/CreateStaffUser';

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route element={<ProtectedRoute />}>
            {/* CUSTOMER ROUTES */}
            <Route element={<RoleRoute allowedRoles={['CUSTOMER']} />}>
              <Route path="/customer/dashboard" element={<CustomerDashboard />} />
              <Route path="/customer/profile" element={<Profile />} />
              <Route path="/customer/account" element={<MyAccount />} />
              <Route path="/customer/transfer" element={<TransferFunds />} />
              <Route path="/customer/transactions" element={<TransactionHistory />} />
              <Route path="/customer/transactions/search" element={<TransactionSearch />} />
              <Route path="/customer/transactions/:id" element={<TransactionDetails />} />
              <Route path="/customer/complaints" element={<MyComplaints />} />
              <Route path="/customer/complaints/new" element={<SubmitComplaint />} />
              <Route path="/customer/complaints/:id" element={<ComplaintDetails />} />
              <Route path="/customer/notifications" element={<Notifications />} />
            </Route>

            {/* OFFICER ROUTES */}
            <Route element={<RoleRoute allowedRoles={['CUSTOMER_SERVICE_OFFICER']} />}>
              <Route path="/officer/dashboard" element={<OfficerDashboard />} />
              <Route path="/officer/complaints" element={<AssignedComplaints />} />
              <Route path="/officer/complaints/:id" element={<OfficerComplaintDetails />} />
              <Route path="/officer/notifications" element={<Notifications />} />
            </Route>

            {/* MANAGER ROUTES */}
            <Route element={<RoleRoute allowedRoles={['BANK_MANAGER']} />}>
              <Route path="/manager/dashboard" element={<ManagerDashboard />} />
              <Route path="/manager/complaints" element={<EscalatedComplaints />} />
              <Route path="/manager/complaints/:id" element={<ManagerComplaintDetails />} />
              <Route path="/manager/reports" element={<Reports />} />
              <Route path="/manager/notifications" element={<Notifications />} />
            </Route>

            {/* ADMIN ROUTES */}
            <Route element={<RoleRoute allowedRoles={['SYSTEM_ADMIN']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/users/create" element={<CreateStaffUser />} />
              <Route path="/admin/users/:id" element={<UserDetails />} />
              <Route path="/admin/notifications" element={<Notifications />} />
            </Route>
          </Route>
          
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
