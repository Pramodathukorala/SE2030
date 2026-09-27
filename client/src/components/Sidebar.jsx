import React from 'react';
import { Nav } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaTachometerAlt, FaWallet, FaExchangeAlt, FaHistory, 
  FaSearch, FaExclamationCircle, FaBell, FaUsers, FaUserPlus, FaFileAlt
} from 'react-icons/fa';

const Sidebar = () => {
  const { user } = useAuth();

  if (!user) return null;

  const renderLinks = () => {
    switch (user.role) {
      case 'CUSTOMER':
        return (
          <>
            <Nav.Link as={NavLink} to="/customer/dashboard" end><FaTachometerAlt className="me-2"/> Dashboard</Nav.Link>
            <Nav.Link as={NavLink} to="/customer/account"><FaWallet className="me-2"/> My Account</Nav.Link>
            <Nav.Link as={NavLink} to="/customer/transfer"><FaExchangeAlt className="me-2"/> Transfer Funds</Nav.Link>
            <Nav.Link as={NavLink} to="/customer/transactions" end><FaHistory className="me-2"/> Transactions</Nav.Link>
            <Nav.Link as={NavLink} to="/customer/transactions/search"><FaSearch className="me-2"/> Search Transaction</Nav.Link>
            <Nav.Link as={NavLink} to="/customer/complaints"><FaExclamationCircle className="me-2"/> Complaints</Nav.Link>
            <Nav.Link as={NavLink} to="/customer/notifications"><FaBell className="me-2"/> Notifications</Nav.Link>
          </>
        );
      case 'CUSTOMER_SERVICE_OFFICER':
        return (
          <>
            <Nav.Link as={NavLink} to="/officer/dashboard" end><FaTachometerAlt className="me-2"/> Dashboard</Nav.Link>
            <Nav.Link as={NavLink} to="/officer/complaints"><FaExclamationCircle className="me-2"/> Assigned Complaints</Nav.Link>
            <Nav.Link as={NavLink} to="/officer/notifications"><FaBell className="me-2"/> Notifications</Nav.Link>
          </>
        );
      case 'BANK_MANAGER':
        return (
          <>
            <Nav.Link as={NavLink} to="/manager/dashboard" end><FaTachometerAlt className="me-2"/> Dashboard</Nav.Link>
            <Nav.Link as={NavLink} to="/manager/complaints"><FaExclamationCircle className="me-2"/> Escalated Complaints</Nav.Link>
            <Nav.Link as={NavLink} to="/manager/reports"><FaFileAlt className="me-2"/> Reports</Nav.Link>
            <Nav.Link as={NavLink} to="/manager/notifications"><FaBell className="me-2"/> Notifications</Nav.Link>
          </>
        );
      case 'SYSTEM_ADMIN':
        return (
          <>
            <Nav.Link as={NavLink} to="/admin/dashboard" end><FaTachometerAlt className="me-2"/> Dashboard</Nav.Link>
            <Nav.Link as={NavLink} to="/admin/users" end><FaUsers className="me-2"/> User Management</Nav.Link>
            <Nav.Link as={NavLink} to="/admin/users/create"><FaUserPlus className="me-2"/> Create Staff User</Nav.Link>
            <Nav.Link as={NavLink} to="/admin/notifications"><FaBell className="me-2"/> Notifications</Nav.Link>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="sidebar bg-white border-end d-flex flex-column p-3">
      <Nav className="flex-column gap-2 mt-4">
        {renderLinks()}
      </Nav>
    </div>
  );
};

export default Sidebar;
