import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Table, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getManagerDashboard } from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';
import LoadingSpinner from '../../components/LoadingSpinner';

const getStatusBadge = (status) => {
  switch (status) {
    case 'ESCALATED': return 'danger';
    case 'RESOLVED': return 'success';
    case 'CLOSED': return 'secondary';
    default: return 'primary';
  }
};

const ManagerDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await getManagerDashboard();
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
      <h2 className="mb-4" style={{ color: '#0B3D60' }}>Welcome, Manager {user.firstName}!</h2>
      
      <Row className="mb-4 g-3">
        <Col md={4}>
          <Card className="shadow-sm border-0 h-100" style={{ borderTop: '5px solid #0B3D60' }}>
            <Card.Body className="text-center py-4">
              <h6 className="text-muted text-uppercase mb-2">Total Complaints</h6>
              <h2 className="fw-bold mb-0" style={{ color: '#0B3D60' }}>{data.totalComplaints}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm border-0 h-100" style={{ borderTop: '5px solid #dc3545' }}>
            <Card.Body className="text-center py-4">
              <h6 className="text-muted text-uppercase mb-2">Escalated</h6>
              <h2 className="fw-bold text-danger mb-0">{data.escalatedComplaints}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm border-0 h-100" style={{ borderTop: '5px solid #198754' }}>
            <Card.Body className="text-center py-4">
              <h6 className="text-muted text-uppercase mb-2">Resolved</h6>
              <h2 className="fw-bold text-success mb-0">{data.resolvedComplaints}</h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white py-3 border-bottom-0">
          <h5 className="mb-0" style={{ color: '#0B3D60' }}>Recent Escalated Complaints</h5>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Number</th>
                  <th>Title</th>
                  <th>Customer</th>
                  <th>Officer</th>
                  <th>Escalated Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentEscalated && data.recentEscalated.length > 0 ? (
                  data.recentEscalated.map(comp => (
                    <tr key={comp._id} style={{ cursor: 'pointer' }}>
                      <td><Link to={`/manager/complaints/${comp._id}`}>{comp.complaintNumber}</Link></td>
                      <td>{comp.title}</td>
                      <td>{comp.customer ? `${comp.customer.firstName} ${comp.customer.lastName}` : 'N/A'}</td>
                      <td>{comp.assignedTo ? `${comp.assignedTo.firstName} ${comp.assignedTo.lastName}` : 'N/A'}</td>
                      <td>{comp.escalatedAt ? new Date(comp.escalatedAt).toLocaleDateString() : 'N/A'}</td>
                      <td>
                        <Badge bg={getStatusBadge(comp.status)}>
                          {comp.status.replace('_', ' ')}
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="6" className="text-center py-4">No escalated complaints</td></tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </DashboardLayout>
  );
};

export default ManagerDashboard;
