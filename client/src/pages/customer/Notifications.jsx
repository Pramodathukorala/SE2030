import React, { useEffect, useState } from 'react';
import { Card, Button, ListGroup } from 'react-bootstrap';
import { getMyNotifications, markAsRead, markAllAsRead } from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FaInfoCircle, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const getIcon = (type) => {
  switch (type) {
    case 'TRANSACTION_SUCCESS': return <FaCheckCircle className="text-success" size={24} />;
    case 'TRANSACTION_FAILED': return <FaExclamationTriangle className="text-danger" size={24} />;
    default: return <FaInfoCircle className="text-primary" size={24} />;
  }
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await getMyNotifications();
      setNotifications(res.data.data);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <DashboardLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 style={{ color: '#0B3D60' }}>Notifications {unreadCount > 0 && <span className="badge bg-danger rounded-pill fs-6 ms-2">{unreadCount}</span>}</h3>
        {unreadCount > 0 && (
          <Button variant="outline-primary" size="sm" onClick={handleMarkAllAsRead}>
            Mark All as Read
          </Button>
        )}
      </div>

      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          {loading ? (
            <div className="p-5 text-center"><LoadingSpinner /></div>
          ) : (
            <ListGroup variant="flush">
              {notifications.length > 0 ? (
                notifications.map(notification => (
                  <ListGroup.Item 
                    key={notification._id} 
                    className={`p-4 border-bottom ${!notification.isRead ? 'bg-light border-start border-primary border-4' : ''}`}
                    style={!notification.isRead ? { backgroundColor: '#f8f9fa' } : {}}
                    action
                    onClick={() => !notification.isRead && handleMarkAsRead(notification._id)}
                  >
                    <div className="d-flex w-100 justify-content-between align-items-start">
                      <div className="d-flex">
                        <div className="me-3 mt-1">
                          {getIcon(notification.type)}
                        </div>
                        <div>
                          <h6 className={`mb-1 ${!notification.isRead ? 'fw-bold' : ''}`}>{notification.title}</h6>
                          <p className="mb-1 text-secondary">{notification.message}</p>
                          <small className="text-muted">{new Date(notification.createdAt).toLocaleString()}</small>
                        </div>
                      </div>
                      {!notification.isRead && (
                        <span className="badge bg-primary rounded-pill">New</span>
                      )}
                    </div>
                  </ListGroup.Item>
                ))
              ) : (
                <div className="p-5 text-center text-muted">
                  <FaInfoCircle size={40} className="mb-3 opacity-50" />
                  <h5>No notifications</h5>
                  <p>You're all caught up!</p>
                </div>
              )}
            </ListGroup>
          )}
        </Card.Body>
      </Card>
    </DashboardLayout>
  );
};

export default Notifications;
