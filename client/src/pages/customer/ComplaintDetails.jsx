import React, { useEffect, useState } from 'react';
import { Card, Badge, Button, Row, Col, Form, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { getComplaintById, updateComplaint } from '../../services/api';
import { toast } from 'react-toastify';
import DashboardLayout from '../../components/DashboardLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FaArrowLeft, FaClock } from 'react-icons/fa';

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

const ComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [formData, setFormData] = useState({ title: '', category: 'OTHER', description: '' });

  const startEditing = () => {
    setFormData({ title: complaint.title, category: complaint.category, description: complaint.description });
    setSaveError('');
    setEditing(true);
  };

  const handleChange = (event) => {
    setFormData(current => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (saving) return;
    if (!formData.title.trim() || !formData.description.trim()) {
      setSaveError('Title and description are required');
      return;
    }
    setSaving(true);
    setSaveError('');
    try {
      const res = await updateComplaint(id, formData);
      setComplaint(res.data.data);
      setEditing(false);
      toast.success('Complaint updated successfully');
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Failed to update complaint. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const res = await getComplaintById(id);
        setComplaint(res.data.data);
      } catch (err) {
        setError('Failed to load complaint details');
      } finally {
        setLoading(false);
      }
    };
    fetchComplaint();
  }, [id]);

  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;
  if (error) return <DashboardLayout><div className="text-danger">{error}</div></DashboardLayout>;
  if (!complaint) return <DashboardLayout><div>Complaint not found</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <Button variant="link" className="text-decoration-none p-0" onClick={() => navigate(-1)}>
          <FaArrowLeft className="me-2"/> Back
        </Button>
        {!editing && <Button variant="primary" onClick={startEditing}>Edit Complaint</Button>}
      </div>

      {editing && (
        <Card className="shadow-sm border-0 mb-4">
          <Card.Body className="p-4">
            <h4 className="mb-3">Edit Complaint</h4>
            {saveError && <Alert variant="danger">{saveError}</Alert>}
            <Form onSubmit={handleSave}>
              <fieldset disabled={saving}>
                <Form.Group className="mb-3" controlId="editComplaintTitle">
                  <Form.Label>Title</Form.Label>
                  <Form.Control name="title" value={formData.title} onChange={handleChange} required />
                </Form.Group>
                <Form.Group className="mb-3" controlId="editComplaintCategory">
                  <Form.Label>Category</Form.Label>
                  <Form.Select name="category" value={formData.category} onChange={handleChange} required>
                    <option value="TRANSACTION_ISSUE">Transaction Issue</option>
                    <option value="ACCOUNT_ISSUE">Account Issue</option>
                    <option value="SERVICE_REQUEST">Service Request</option>
                    <option value="TECHNICAL_ISSUE">Technical Issue</option>
                    <option value="OTHER">Other</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-4" controlId="editComplaintDescription">
                  <Form.Label>Description</Form.Label>
                  <Form.Control as="textarea" rows={5} name="description" value={formData.description} onChange={handleChange} required />
                </Form.Group>
                <Button type="submit" variant="primary" className="me-2">
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button type="button" variant="outline-secondary" onClick={() => setEditing(false)}>Cancel</Button>
              </fieldset>
            </Form>
          </Card.Body>
        </Card>
      )}
      
      <Card className="shadow-sm border-0 mb-4" style={{ borderTop: '5px solid #0B3D60' }}>
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-start mb-4">
            <div>
              <p className="text-muted mb-1">Complaint Number: <strong>{complaint.complaintNumber}</strong></p>
              <h3 className="fw-bold mb-0">{complaint.title}</h3>
            </div>
            <Badge bg={getStatusBadge(complaint.status)} className="px-3 py-2 fs-6">
              {complaint.status.replace('_', ' ')}
            </Badge>
          </div>

          <Row className="mb-4">
            <Col sm={6}>
              <p className="text-muted mb-1">Category</p>
              <h6 className="fw-bold">{complaint.category.replace('_', ' ')}</h6>
            </Col>
            <Col sm={6}>
              <p className="text-muted mb-1">Created Date</p>
              <h6 className="fw-bold">{new Date(complaint.createdAt).toLocaleString()}</h6>
            </Col>
          </Row>

          <div>
            <p className="text-muted mb-1">Description</p>
            <div className="p-3 bg-light rounded border border-light">
              <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>{complaint.description}</p>
            </div>
          </div>
        </Card.Body>
      </Card>

      {(complaint.staffNotes || complaint.managerNotes) && (
        <Card className="shadow-sm border-0 mb-4">
          <Card.Header className="bg-white">
            <h5 className="mb-0">Bank Responses</h5>
          </Card.Header>
          <Card.Body>
            {complaint.staffNotes && (
              <div className="mb-3">
                <h6 className="text-primary">Staff Notes:</h6>
                <div className="p-3 bg-light rounded"><p className="mb-0">{complaint.staffNotes}</p></div>
              </div>
            )}
            {complaint.managerNotes && (
              <div>
                <h6 className="text-danger">Manager Notes:</h6>
                <div className="p-3 bg-light rounded"><p className="mb-0">{complaint.managerNotes}</p></div>
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white">
          <h5 className="mb-0">Timeline</h5>
        </Card.Header>
        <Card.Body>
          <ul className="list-unstyled mb-0">
            <li className="mb-3 d-flex align-items-start">
              <FaClock className="text-muted me-3 mt-1" />
              <div>
                <strong>Created</strong>
                <div className="text-muted small">{new Date(complaint.createdAt).toLocaleString()}</div>
              </div>
            </li>
            {complaint.escalatedAt && (
              <li className="mb-3 d-flex align-items-start">
                <FaClock className="text-danger me-3 mt-1" />
                <div>
                  <strong>Escalated</strong>
                  <div className="text-muted small">{new Date(complaint.escalatedAt).toLocaleString()}</div>
                </div>
              </li>
            )}
            {complaint.resolvedAt && (
              <li className="mb-3 d-flex align-items-start">
                <FaClock className="text-success me-3 mt-1" />
                <div>
                  <strong>Resolved</strong>
                  <div className="text-muted small">{new Date(complaint.resolvedAt).toLocaleString()}</div>
                </div>
              </li>
            )}
            {complaint.closedAt && (
              <li className="d-flex align-items-start">
                <FaClock className="text-secondary me-3 mt-1" />
                <div>
                  <strong>Closed</strong>
                  <div className="text-muted small">{new Date(complaint.closedAt).toLocaleString()}</div>
                </div>
              </li>
            )}
          </ul>
        </Card.Body>
      </Card>
    </DashboardLayout>
  );
};

export default ComplaintDetails;
