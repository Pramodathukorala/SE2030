import React, { useState } from 'react';
import { Card, Form, Button, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { createStaffUser } from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';
import { toast } from 'react-toastify';

const CreateStaffUser = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    role: 'CUSTOMER_SERVICE_OFFICER'
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      await createStaffUser(formData);
      toast.success('Staff user created successfully');
      navigate('/admin/users');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <h3 className="mb-4" style={{ color: '#0B3D60' }}>Create Staff User</h3>
      
      <Card className="shadow-sm border-0" style={{ maxWidth: '600px' }}>
        <Card.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>First Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Last Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Email <span className="text-danger">*</span></Form.Label>
              <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Phone <span className="text-danger">*</span></Form.Label>
              <Form.Control type="text" name="phone" value={formData.phone} onChange={handleChange} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Role <span className="text-danger">*</span></Form.Label>
              <Form.Select name="role" value={formData.role} onChange={handleChange} required>
                <option value="CUSTOMER_SERVICE_OFFICER">Customer Service Officer</option>
                <option value="BANK_MANAGER">Bank Manager</option>
                <option value="SYSTEM_ADMIN">System Admin</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Password <span className="text-danger">*</span></Form.Label>
              <Form.Control type="password" name="password" value={formData.password} onChange={handleChange} required minLength="6" />
              <Form.Text className="text-muted">Minimum 6 characters.</Form.Text>
            </Form.Group>

            <Button 
              variant="primary" 
              type="submit" 
              className="py-2 px-4"
              style={{ backgroundColor: '#0B3D60', borderColor: '#0B3D60' }}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Staff User'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </DashboardLayout>
  );
};

export default CreateStaffUser;
