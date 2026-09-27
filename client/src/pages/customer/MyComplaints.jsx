import React, { useEffect, useState } from 'react';
import { Card, Table, Form, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getMyComplaints } from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';
import LoadingSpinner from '../../components/LoadingSpinner';

const getStatusBadge = (status) => {
  switch (status) {
    case 'OPEN': return 'primary';
    case 'ASSIGNED': return 'info';
    case 'IN_PROGRESS': return 'warning';
    case 'ESCALATED': return 'danger';
    case 'RESOLVED': return 'success';
    case 'CLOSED': return 'secondary';
    default: return 'light';
  }
};

const MyComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        const params = statusFilter ? { status: statusFilter } : {};
        const res = await getMyComplaints(params);
        setComplaints(res.data.data);
      } catch (error) {
        console.error("Failed to fetch complaints", error);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, [statusFilter]);

  return (
    <DashboardLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 style={{ color: '#0B3D60' }}>My Complaints</h3>
        <Button as={Link} to="/customer/complaints/new" style={{ backgroundColor: '#F4A261', borderColor: '#F4A261' }}>
          New Complaint
        </Button>
      </div>
      
      <Card className="shadow-sm border-0 mb-4 bg-light">
        <Card.Body>
          <Form.Group className="d-flex align-items-center" style={{ maxWidth: '300px' }}>
            <Form.Label className="me-3 mb-0 text-nowrap">Filter by Status:</Form.Label>
            <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="ESCALATED">Escalated</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </Form.Select>
          </Form.Group>
        </Card.Body>
      </Card>

      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          {loading ? (
            <div className="p-5 text-center"><LoadingSpinner /></div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Complaint No.</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.length > 0 ? (
                    complaints.map(comp => (
                      <tr key={comp._id} style={{ cursor: 'pointer' }}>
                        <td><Link to={`/customer/complaints/${comp._id}`}>{comp.complaintNumber}</Link></td>
                        <td>{comp.title}</td>
                        <td>{comp.category.replace('_', ' ')}</td>
                        <td>{new Date(comp.createdAt).toLocaleDateString()}</td>
                        <td>
                          <Badge bg={getStatusBadge(comp.status)}>
                            {comp.status.replace('_', ' ')}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="5" className="text-center py-4">No complaints found</td></tr>
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </DashboardLayout>
  );
};

export default MyComplaints;
