import React, { useState } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { createComplaint } from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';
import { toast } from 'react-toastify';

const SubmitComplaint = () => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'TRANSACTION_ISSUE',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      toast.error('Title and description are required');
      return;
    }

    try {
      setLoading(true);
      const res = await createComplaint(formData);
      setResult({ success: true, data: res.data.data });
      toast.success('Complaint submitted successfully');
      setFormData({ title: '', category: 'TRANSACTION_ISSUE', description: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 style={{ color: '#0B3D60' }}>Submit a Complaint</h3>
        <Button variant="outline-secondary" onClick={() => navigate('/customer/complaints')}>
          View My Complaints
        </Button>
      </div>
      
      {result && result.success && (
        <Alert variant="success" style={{ maxWidth: '700px' }}>
          <Alert.Heading>Complaint Submitted!</Alert.Heading>
          <p>Your complaint has been received. Complaint Number: <strong>{result.data.complaintNumber}</strong></p>
          <Button variant="success" size="sm" onClick={() => navigate(`/customer/complaints/${result.data._id}`)}>
            View Details
          </Button>
        </Alert>
      )}

      <Card className="shadow-sm border-0" style={{ maxWidth: '700px' }}>
        <Card.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Title <span className="text-danger">*</span></Form.Label>
              <Form.Control 
                type="text" 
                name="title" 
                value={formData.title} 
                onChange={handleChange} 
                required 
                placeholder="Brief title for your issue"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Category <span className="text-danger">*</span></Form.Label>
              <Form.Select name="category" value={formData.category} onChange={handleChange} required>
                <option value="TRANSACTION_ISSUE">Transaction Issue</option>
                <option value="ACCOUNT_ISSUE">Account Issue</option>
                <option value="SERVICE_REQUEST">Service Request</option>
                <option value="TECHNICAL_ISSUE">Technical Issue</option>
                <option value="OTHER">Other</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Description <span className="text-danger">*</span></Form.Label>
              <Form.Control 
                as="textarea" 
                rows={5} 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                required 
                placeholder="Provide detailed information about your issue..."
              />
            </Form.Group>

            <Button 
              variant="primary" 
              type="submit" 
              className="py-2 px-4"
              style={{ backgroundColor: '#F4A261', borderColor: '#F4A261', color: '#fff' }}
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Complaint'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </DashboardLayout>
  );
};

export default SubmitComplaint;
