import React, { useEffect, useState } from 'react';
import { Card, Badge, Button, Form, Row, Col, Modal } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { getComplaintById, updateComplaintStatus, escalateComplaint, resolveComplaint } from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { toast } from 'react-toastify';
import { FaArrowLeft } from 'react-icons/fa';

const OfficerComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [staffNotes, setStaffNotes] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState('');

  const fetchComplaint = async () => {
    try {
      setLoading(true);
      const res = await getComplaintById(id);
      setComplaint(res.data.data);
      setStaffNotes(res.data.data.staffNotes || '');
    } catch (err) {
      toast.error('Failed to load complaint details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const handleActionClick = (type) => {
    setActionType(type);
    setShowModal(true);
  };

  const handleConfirmAction = async () => {
    setShowModal(false);
    try {
      setLoading(true);
      
      // Save notes first if changed
      if (staffNotes !== complaint.staffNotes) {
        await updateComplaintStatus(id, { staffNotes });
      }

      if (actionType === 'in_progress') {
        await updateComplaintStatus(id, { status: 'IN_PROGRESS' });
        toast.success('Complaint marked as In Progress');
      } else if (actionType === 'resolve') {
        await resolveComplaint(id);
        toast.success('Complaint resolved successfully');
      } else if (actionType === 'escalate') {
        await escalateComplaint(id);
        toast.success('Complaint escalated to Manager');
      }
      
      fetchComplaint();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
      setLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    try {
      setLoading(true);
      await updateComplaintStatus(id, { staffNotes });
      toast.success('Notes saved successfully');
      fetchComplaint();
    } catch (error) {
      toast.error('Failed to save notes');
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
                <Badge bg={complaint.status === 'RESOLVED' ? 'success' : complaint.status === 'ESCALATED' ? 'danger' : 'warning'} className="px-3 py-2 fs-6">
                  {complaint.status.replace('_', ' ')}
                </Badge>
              </div>

              <Row className="mb-3 text-muted small">
                <Col sm={4}><strong>No:</strong> {complaint.complaintNumber}</Col>
                <Col sm={4}><strong>Category:</strong> {complaint.category.replace('_', ' ')}</Col>
                <Col sm={4}><strong>Date:</strong> {new Date(complaint.createdAt).toLocaleDateString()}</Col>
              </Row>

              <hr />
              
              <div className="mb-4">
                <h6 className="fw-bold mb-2">Customer Details:</h6>
                {complaint.customer ? (
                  <p className="mb-0">
                    {complaint.customer.firstName} {complaint.customer.lastName} <br/>
                    Email: {complaint.customer.email} <br/>
                    Phone: {complaint.customer.phone}
                  </p>
                ) : 'N/A'}
              </div>

              <div>
                <h6 className="fw-bold mb-2">Issue Description:</h6>
                <div className="p-3 bg-light rounded" style={{ whiteSpace: 'pre-wrap' }}>
                  {complaint.description}
                </div>
              </div>
            </Card.Body>
          </Card>

          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white py-3">
              <h5 className="mb-0">Staff Notes (Internal)</h5>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Control 
                  as="textarea" 
                  rows={4} 
                  value={staffNotes} 
                  onChange={(e) => setStaffNotes(e.target.value)}
                  placeholder="Add your investigation notes here..."
                  disabled={complaint.status === 'RESOLVED' || complaint.status === 'CLOSED'}
                />
              </Form.Group>
              {(complaint.status !== 'RESOLVED' && complaint.status !== 'CLOSED') && (
                <Button variant="secondary" size="sm" onClick={handleSaveNotes} disabled={loading || staffNotes === complaint.staffNotes}>
                  Save Notes
                </Button>
              )}

              {complaint.managerNotes && (
                <div className="mt-4 pt-3 border-top">
                  <h6 className="text-danger">Manager Notes:</h6>
                  <p className="mb-0 p-3 bg-light rounded">{complaint.managerNotes}</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="shadow-sm border-0 sticky-top" style={{ top: '80px' }}>
            <Card.Header className="bg-white py-3">
              <h5 className="mb-0">Actions</h5>
            </Card.Header>
            <Card.Body className="d-grid gap-3">
              {complaint.status === 'ASSIGNED' && (
                <Button variant="warning" onClick={() => handleActionClick('in_progress')}>
                  Mark In Progress
                </Button>
              )}
              
              {(complaint.status === 'ASSIGNED' || complaint.status === 'IN_PROGRESS' || complaint.status === 'ESCALATED') && (
                <Button variant="success" onClick={() => handleActionClick('resolve')}>
                  Resolve Complaint
                </Button>
              )}

              {(complaint.status === 'ASSIGNED' || complaint.status === 'IN_PROGRESS') && (
                <Button variant="danger" onClick={() => handleActionClick('escalate')}>
                  Escalate to Manager
                </Button>
              )}

              {(complaint.status === 'RESOLVED' || complaint.status === 'CLOSED') && (
                <div className="text-center text-muted">
                  <p className="mb-0">No further actions available for {complaint.status.toLowerCase()} complaints.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Action</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {actionType === 'in_progress' && <p>Are you sure you want to mark this complaint as <strong>In Progress</strong>?</p>}
          {actionType === 'resolve' && <p>Are you sure you want to <strong>Resolve</strong> this complaint? Make sure you have added final resolution notes.</p>}
          {actionType === 'escalate' && <p>Are you sure you want to <strong>Escalate</strong> this complaint to a Manager? Ensure you have added relevant notes explaining why escalation is needed.</p>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button 
            variant={actionType === 'resolve' ? 'success' : actionType === 'escalate' ? 'danger' : 'warning'} 
            onClick={handleConfirmAction}
          >
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>

    </DashboardLayout>
  );
};

export default OfficerComplaintDetails;
