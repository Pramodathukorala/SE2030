import React, { useEffect, useState } from 'react';
import { Navbar, Nav, NavDropdown, Container, Badge } from 'react-bootstrap';
import { FaBell, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyNotifications } from '../services/api';

const AppNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      const fetchNotifications = async () => {
        try {
          const res = await getMyNotifications();
          const unread = res.data.data.filter(n => !n.isRead).length;
          setUnreadCount(unread);
        } catch (error) {
          console.error("Failed to fetch notifications", error);
        }
      };
      fetchNotifications();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'CUSTOMER': return '/customer/dashboard';
      case 'CUSTOMER_SERVICE_OFFICER': return '/officer/dashboard';
      case 'BANK_MANAGER': return '/manager/dashboard';
      case 'SYSTEM_ADMIN': return '/admin/dashboard';
      default: return '/login';
    }
  };

  const getProfileLink = () => {
    if (!user) return '#';
    switch (user.role) {
      case 'CUSTOMER': return '/customer/profile';
      default: return '#'; // Only customer profile requested
    }
  };

  const getNotificationsLink = () => {
    if (!user) return '#';
    switch (user.role) {
      case 'CUSTOMER': return '/customer/notifications';
      case 'CUSTOMER_SERVICE_OFFICER': return '/officer/notifications';
      case 'BANK_MANAGER': return '/manager/notifications';
      case 'SYSTEM_ADMIN': return '/admin/notifications';
      default: return '#';
    }
  };

  return (
    <Navbar expand="lg" style={{ backgroundColor: '#0B3D60' }} variant="dark" className="px-3" fixed="top">
      <Navbar.Brand as={Link} to={getDashboardLink()} className="fw-bold">
        🏦 Web Banking System
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
        {user && (
          <Nav>
            <Nav.Link as={Link} to={getNotificationsLink()} className="me-3 position-relative d-flex align-items-center">
              <FaBell size={20} />
              {unreadCount > 0 && (
                <Badge bg="danger" pill className="position-absolute top-0 start-100 translate-middle">
                  {unreadCount}
                </Badge>
              )}
            </Nav.Link>
            <NavDropdown 
              title={<><FaUser className="me-1"/> {user.firstName} {user.lastName}</>} 
              id="basic-nav-dropdown" 
              align="end"
            >
              {user.role === 'CUSTOMER' && (
                <NavDropdown.Item as={Link} to={getProfileLink()}>Profile</NavDropdown.Item>
              )}
              <NavDropdown.Item onClick={handleLogout} className="text-danger">
                <FaSignOutAlt className="me-1"/> Logout
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        )}
      </Navbar.Collapse>
    </Navbar>
  );
};

export default AppNavbar;
