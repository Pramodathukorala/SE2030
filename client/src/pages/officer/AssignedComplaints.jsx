import React, { useEffect, useState } from 'react';
import { Card, Table, Form, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getAssignedComplaints } from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';
import LoadingSpinner from '../../components/LoadingSpinner';

const getStatusBadge = (status) => {
  switch (status) {
    case 'ASSIGNED': return 'info';
    case 'IN_PROGRESS': return 'warning';
    case 'ESCALATED': return 'danger';
    case 'RESOLVED': return 'success';
    case 'CLOSED': return 'secondary';
    default: return 'light';
  }
};

const AssignedComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        const params = statusFilter ? { status: statusFilter } : {};
        const res = await getAssignedComplaints(params);
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
      <h3 className="mb-4" style={{ color: '#0B3D60' }}>Assigned Complaints</h3>
      
      <Card className="shadow-sm border-0 mb-4 bg-light">
        <Card.Body>
          <Form.Group className="d-flex align-items-center" style={{ maxWidth: '300px' }}>
            <Form.Label className="me-3 mb-0 text-nowrap">Filter by Status:</Form.Label>
            <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="ESCALATED">Escalated</option>
              <option value="RESOLVED">Resolved</option>
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
                    <th>Number</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.length > 0 ? (
                    complaints.map(comp => (
                      <tr key={comp._id} style={{ cursor: 'pointer' }}>
                        <td><Link to={`/officer/complaints/${comp._id}`}>{comp.complaintNumber}</Link></td>
                        <td>{comp.title}</td>
                        <td>{comp.category.replace('_', ' ')}</td>
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
                    <tr><td colSpan="6" className="text-center py-4">No complaints assigned</td></tr>
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

export default AssignedComplaints;
