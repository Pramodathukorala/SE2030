import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Table, Button, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAdminDashboard, deleteComplaint } from '../../services/api';
import { toast } from 'react-toastify';
import DashboardLayout from '../../components/DashboardLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FaUsers, FaUserTie, FaUserShield, FaUserCheck, FaUserPlus } from 'react-icons/fa';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState(null);

  const handleDeleteComplaint = async (complaint) => {
    if (!window.confirm(`Permanently delete complaint ${complaint.complaintNumber}? This cannot be undone.`)) return;
    setDeletingId(complaint._id);
    try {
      await deleteComplaint(complaint._id);
      setData(previous => ({ ...previous, assignedComplaints: previous.assignedComplaints.filter(item => item._id !== complaint._id) }));
      toast.success('Complaint deleted');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete complaint');
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await getAdminDashboard();
        setData(res.data.data);
      } catch (error) {
        console.error("Dashboard fetch error", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;
  if (!data) return <DashboardLayout><div>Error loading dashboard</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{ color: '#0B3D60' }}>Welcome, Admin {user.firstName}!</h2>
        <Button onClick={() => navigate('/admin/users/create')} style={{ backgroundColor: '#0B3D60' }}>
          <FaUserPlus className="me-2" /> Create Staff User
        </Button>
      </div>
      
      <Card className="shadow-sm border-0 mb-4">
        <Card.Header className="bg-white py-3">
          <h5 className="mb-0" style={{ color: '#0B3D60' }}>Complaints Assigned to Me</h5>
        </Card.Header>
        <Card.Body>
          {data.assignedComplaints?.length ? data.assignedComplaints.map(complaint => (
            <div key={complaint._id} className="border rounded p-3 mb-3">
              <div className="d-flex justify-content-between gap-3">
                <h6>{complaint.complaintNumber}: {complaint.title}</h6>
                <Badge bg="info" className="align-self-start">{complaint.status.replace(/_/g, ' ')}</Badge>
              </div>
              <p className="text-muted small mb-2">
                {complaint.customer?.firstName} {complaint.customer?.lastName} · {complaint.category.replace(/_/g, ' ')} · {new Date(complaint.createdAt).toLocaleString()}
              </p>
              <p className="mb-0" style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{complaint.description}</p>
              <Button variant="outline-danger" size="sm" className="mt-3" disabled={!!deletingId} onClick={() => handleDeleteComplaint(complaint)}>
                {deletingId === complaint._id ? 'Deleting...' : 'Delete Complaint'}
              </Button>
            </div>
          )) : <p className="text-muted mb-0">No complaints assigned to you yet.</p>}
        </Card.Body>
      </Card>

      <Row className="mb-4 g-3">
        <Col md={4} sm={6}>
          <Card className="shadow-sm border-0 h-100" style={{ borderLeft: '5px solid #0B3D60' }}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">Total Users</p>
                  <h3 className="mb-0 fw-bold">{data.totalUsers}</h3>
                </div>
                <FaUsers size={40} color="#0B3D60" opacity={0.2} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} sm={6}>
          <Card className="shadow-sm border-0 h-100" style={{ borderLeft: '5px solid #176B87' }}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">Customers</p>
                  <h3 className="mb-0 fw-bold">{data.customerCount}</h3>
                </div>
                <FaUserTie size={40} color="#176B87" opacity={0.2} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} sm={6}>
          <Card className="shadow-sm border-0 h-100" style={{ borderLeft: '5px solid #F4A261' }}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">Active Users</p>
                  <h3 className="mb-0 fw-bold">{data.activeUsers}</h3>
                </div>
                <FaUserCheck size={40} color="#F4A261" opacity={0.2} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4 g-3">
        <Col md={4} sm={6}>
           <Card className="text-center shadow-sm border-0 py-2 bg-light">
             <Card.Body>
               <h6>Service Officers</h6>
               <h4 className="mb-0 text-primary">{data.officerCount}</h4>
             </Card.Body>
           </Card>
        </Col>
        <Col md={4} sm={6}>
           <Card className="text-center shadow-sm border-0 py-2 bg-light">
             <Card.Body>
               <h6>Managers</h6>
               <h4 className="mb-0 text-primary">{data.managerCount}</h4>
             </Card.Body>
           </Card>
        </Col>
        <Col md={4} sm={6}>
           <Card className="text-center shadow-sm border-0 py-2 bg-light">
             <Card.Body>
               <h6>Inactive Users</h6>
               <h4 className="mb-0 text-danger">{data.inactiveUsers}</h4>
             </Card.Body>
           </Card>
        </Col>
      </Row>

      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white py-3 border-bottom-0 d-flex justify-content-between align-items-center">
          <h5 className="mb-0" style={{ color: '#0B3D60' }}>Recent Users</h5>
          <Link to="/admin/users" className="text-decoration-none">View All</Link>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {data.recentUsers && data.recentUsers.length > 0 ? (
                  data.recentUsers.map(u => (
                    <tr key={u._id} style={{ cursor: 'pointer' }}>
                      <td><Link to={`/admin/users/${u._id}`}>{u.firstName} {u.lastName}</Link></td>
                      <td>{u.email}</td>
                      <td>{u.role.replace(/_/g, ' ')}</td>
                      <td>
                        <Badge bg={u.status === 'ACTIVE' ? 'success' : 'danger'}>
                          {u.status}
                        </Badge>
                      </td>
                      <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="5" className="text-center py-4">No recent users</td></tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </DashboardLayout>
  );
};

export default AdminDashboard;
