import React, { useEffect, useState } from 'react';
import { Card, Table, Form, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getEscalatedComplaints } from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';
import LoadingSpinner from '../../components/LoadingSpinner';

const EscalatedComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ESCALATED');

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        const params = statusFilter ? { status: statusFilter } : {};
        const res = await getEscalatedComplaints(params);
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
      <h3 className="mb-4" style={{ color: '#0B3D60' }}>Escalated Complaints</h3>
      
      <Card className="shadow-sm border-0 mb-4 bg-light">
        <Card.Body>
          <Form.Group className="d-flex align-items-center" style={{ maxWidth: '300px' }}>
            <Form.Label className="me-3 mb-0 text-nowrap">Filter by Status:</Form.Label>
            <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All</option>
              <option value="ESCALATED">Currently Escalated</option>
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
                    <th>Number</th>
                    <th>Title</th>
                    <th>Customer</th>
                    <th>Assigned Officer</th>
                    <th>Escalated Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.length > 0 ? (
                    complaints.map(comp => (
                      <tr key={comp._id} style={{ cursor: 'pointer' }}>
                        <td><Link to={`/manager/complaints/${comp._id}`}>{comp.complaintNumber}</Link></td>
                        <td>{comp.title}</td>
                        <td>{comp.customer ? `${comp.customer.firstName} ${comp.customer.lastName}` : 'N/A'}</td>
                        <td>{comp.assignedTo ? `${comp.assignedTo.firstName} ${comp.assignedTo.lastName}` : 'Unassigned'}</td>
                        <td>{comp.escalatedAt ? new Date(comp.escalatedAt).toLocaleDateString() : 'N/A'}</td>
                        <td>
                          <Badge bg={comp.status === 'ESCALATED' ? 'danger' : comp.status === 'RESOLVED' ? 'success' : 'secondary'}>
                            {comp.status.replace('_', ' ')}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="6" className="text-center py-4">No escalated complaints found</td></tr>
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

export default EscalatedComplaints;
