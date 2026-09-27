import React, { useEffect, useState } from 'react';
import { Card, Badge, Button, Form, Row, Col, Modal } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { getComplaintById, addManagerNotes, resolveComplaint, closeComplaint } from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaClock } from 'react-icons/fa';

const ManagerComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [managerNotes, setManagerNotes] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState('');

  const fetchComplaint = async () => {
    try {
      setLoading(true);
      const res = await getComplaintById(id);
      setComplaint(res.data.data);
      setManagerNotes(res.data.data.managerNotes || '');
    } catch (err) {
      toast.error('Failed to load complaint details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const handleSaveNotes = async () => {
    try {
      setLoading(true);
      await addManagerNotes(id, { notes: managerNotes });
      toast.success('Manager notes saved');
      fetchComplaint();
    } catch (error) {
      toast.error('Failed to save notes');
      setLoading(false);
    }
  };

  const handleActionClick = (type) => {
    setActionType(type);
    setShowModal(true);
  };

  const handleConfirmAction = async () => {
    setShowModal(false);
    try {
      setLoading(true);
      if (managerNotes !== complaint.managerNotes) {
        await addManagerNotes(id, { notes: managerNotes });
      }

      if (actionType === 'resolve') {
        await resolveComplaint(id);
        toast.success('Complaint resolved');
      } else if (actionType === 'close') {
        await closeComplaint(id);
        toast.success('Complaint closed');
      }
      fetchComplaint();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
      setLoading(false);
    }
  };

  if (loading && !complaint) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;
  if (!complaint) return <DashboardLayout><div>Complaint not found</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="mb-3">
        <Button variant="link" className="text-decoration-none p-0" onClick={() => navigate(-1)}>
          <FaArrowLeft className="me-2"/> Back to List
        </Button>
      </div>

      <Row className="g-4">
        <Col lg={8}>
          <Card className="shadow-sm border-0 mb-4">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0">{complaint.title}</h4>
                <Badge bg={complaint.status === 'RESOLVED' ? 'success' : complaint.status === 'ESCALATED' ? 'danger' : complaint.status === 'CLOSED' ? 'secondary' : 'warning'} className="px-3 py-2 fs-6">
                  {complaint.status.replace('_', ' ')}
                </Badge>
              </div>

              <Row className="mb-4">
                <Col sm={6}>
                  <p className="text-muted mb-1 small">Customer</p>
                  <h6 className="fw-bold">{complaint.customer ? `${complaint.customer.firstName} ${complaint.customer.lastName}` : 'N/A'}</h6>
                </Col>
                <Col sm={6}>
                  <p className="text-muted mb-1 small">Assigned Officer</p>
                  <h6 className="fw-bold">{complaint.assignedTo ? `${complaint.assignedTo.firstName} ${complaint.assignedTo.lastName}` : 'Unassigned'}</h6>
                </Col>
              </Row>

              <div>
                <h6 className="fw-bold mb-2">Issue Description:</h6>
                <div className="p-3 bg-light rounded" style={{ whiteSpace: 'pre-wrap' }}>
                  {complaint.description}
                </div>
              </div>

              {complaint.staffNotes && (
                <div className="mt-4 pt-3 border-top">
                  <h6 className="fw-bold mb-2 text-primary">Officer Notes:</h6>
                  <div className="p-3 bg-light rounded" style={{ whiteSpace: 'pre-wrap' }}>
                    {complaint.staffNotes}
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>

          <Card className="shadow-sm border-0 mb-4">
            <Card.Header className="bg-white py-3">
              <h5 className="mb-0">Manager Notes (Internal)</h5>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Control 
                  as="textarea" 
                  rows={4} 
                  value={managerNotes} 
                  onChange={(e) => setManagerNotes(e.target.value)}
                  placeholder="Add your review notes here..."
                  disabled={complaint.status === 'CLOSED'}
                />
              </Form.Group>
              {complaint.status !== 'CLOSED' && (
                <Button variant="secondary" onClick={handleSaveNotes} disabled={loading || managerNotes === complaint.managerNotes}>
                  Save Notes
                </Button>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="shadow-sm border-0 mb-4 sticky-top" style={{ top: '80px' }}>
            <Card.Header className="bg-white py-3">
              <h5 className="mb-0">Actions</h5>
            </Card.Header>
            <Card.Body className="d-grid gap-3">
              {(complaint.status === 'ESCALATED' || complaint.status === 'IN_PROGRESS') && (
                <Button variant="success" onClick={() => handleActionClick('resolve')}>
                  Resolve Complaint
                </Button>
              )}

              {complaint.status === 'RESOLVED' && (
                <Button variant="secondary" onClick={() => handleActionClick('close')}>
                  Close Complaint
                </Button>
              )}

              {complaint.status === 'CLOSED' && (
                <div className="text-center text-muted">
                  <p className="mb-0">Complaint is closed. No further actions can be taken.</p>
                </div>
              )}
            </Card.Body>
          </Card>

          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white py-3">
              <h6 className="mb-0">Timeline</h6>
            </Card.Header>
            <Card.Body>
              <ul className="list-unstyled mb-0">
                <li className="mb-3 d-flex">
                  <FaClock className="text-muted me-2 mt-1" />
                  <div>
                    <div className="fw-bold small">Created</div>
                    <div className="text-muted small">{new Date(complaint.createdAt).toLocaleString()}</div>
                  </div>
                </li>
                {complaint.escalatedAt && (
                  <li className="mb-3 d-flex">
                    <FaClock className="text-danger me-2 mt-1" />
                    <div>
                      <div className="fw-bold small">Escalated</div>
                      <div className="text-muted small">{new Date(complaint.escalatedAt).toLocaleString()}</div>
                    </div>
                  </li>
                )}
                {complaint.resolvedAt && (
                  <li className="mb-3 d-flex">
                    <FaClock className="text-success me-2 mt-1" />
                    <div>
                      <div className="fw-bold small">Resolved</div>
                      <div className="text-muted small">{new Date(complaint.resolvedAt).toLocaleString()}</div>
                    </div>
                  </li>
                )}
                {complaint.closedAt && (
                  <li className="d-flex">
                    <FaClock className="text-secondary me-2 mt-1" />
                    <div>
                      <div className="fw-bold small">Closed</div>
                      <div className="text-muted small">{new Date(complaint.closedAt).toLocaleString()}</div>
                    </div>
                  </li>
                )}
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Action</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {actionType === 'resolve' && <p>Are you sure you want to <strong>Resolve</strong> this complaint? Make sure manager notes are added if needed.</p>}
          {actionType === 'close' && <p>Are you sure you want to <strong>Close</strong> this complaint? This action cannot be undone.</p>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button 
            variant={actionType === 'resolve' ? 'success' : 'secondary'} 
            onClick={handleConfirmAction}
          >
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>

    </DashboardLayout>
  );
};

export default ManagerComplaintDetails;
