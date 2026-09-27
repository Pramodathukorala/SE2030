import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Table, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getOfficerDashboard } from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';
import LoadingSpinner from '../../components/LoadingSpinner';

const getStatusBadge = (status) => {
  switch (status) {
    case 'ASSIGNED': return 'info';
    case 'IN_PROGRESS': return 'warning';
    case 'ESCALATED': return 'danger';
    case 'RESOLVED': return 'success';
    default: return 'secondary';
  }
};

const OfficerDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await getOfficerDashboard();
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
      <h2 className="mb-4" style={{ color: '#0B3D60' }}>Welcome, Officer {user.firstName}!</h2>
      
      <Row className="mb-4 g-3">
        <Col md={3} sm={6}>
          <Card className="text-center shadow-sm border-0 border-start border-4 border-info py-2">
            <Card.Body>
              <h6>Assigned</h6>
              <h3 className="mb-0 text-info fw-bold">{data.assignedComplaints}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="text-center shadow-sm border-0 border-start border-4 border-warning py-2">
            <Card.Body>
              <h6>In Progress</h6>
              <h3 className="mb-0 text-warning fw-bold">{data.inProgressComplaints}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="text-center shadow-sm border-0 border-start border-4 border-danger py-2">
            <Card.Body>
              <h6>Escalated</h6>
              <h3 className="mb-0 text-danger fw-bold">{data.escalatedComplaints}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="text-center shadow-sm border-0 border-start border-4 border-success py-2">
            <Card.Body>
              <h6>Resolved</h6>
              <h3 className="mb-0 text-success fw-bold">{data.resolvedComplaints}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white py-3 border-bottom-0">
          <h5 className="mb-0" style={{ color: '#0B3D60' }}>Recent Assigned Complaints</h5>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Number</th>
                  <th>Title</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentAssigned && data.recentAssigned.length > 0 ? (
                  data.recentAssigned.map(comp => (
                    <tr key={comp._id} style={{ cursor: 'pointer' }}>
                      <td><Link to={`/officer/complaints/${comp._id}`}>{comp.complaintNumber}</Link></td>
                      <td>{comp.title}</td>
                      <td>{comp.customer ? `${comp.customer.firstName} ${comp.customer.lastName}` : 'N/A'}</td>
                      <td>{new Date(comp.createdAt).toLocaleDateString()}</td>
                      <td>
                        <Badge bg={getStatusBadge(comp.status)}>
                          {comp.status.replace('_', ' ')}
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="5" className="text-center py-4">No recent complaints assigned</td></tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </DashboardLayout>
  );
};

export default OfficerDashboard;
