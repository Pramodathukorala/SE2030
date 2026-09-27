import React, { useState } from 'react';
import { Form, Button, Card, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    try {
      setLoading(true);
      const user = await login(email, password);
      toast.success('Login successful!');
      
      switch (user.role) {
        case 'CUSTOMER': navigate('/customer/dashboard'); break;
        case 'CUSTOMER_SERVICE_OFFICER': navigate('/officer/dashboard'); break;
        case 'BANK_MANAGER': navigate('/manager/dashboard'); break;
        case 'SYSTEM_ADMIN': navigate('/admin/dashboard'); break;
        default: navigate('/');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#F5F7FA', minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Container className="d-flex justify-content-center">
        <Card style={{ width: '400px', padding: '20px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
          <Card.Body>
            <h3 className="text-center mb-4" style={{ color: '#0B3D60' }}>🏦 Login</h3>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label>Password</Form.Label>
                <Form.Control 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
              </Form.Group>
              <Button 
                variant="primary" 
                type="submit" 
                className="w-100 mb-3" 
                style={{ backgroundColor: '#0B3D60', borderColor: '#0B3D60' }}
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
              <div className="text-center">
                Don't have an account? <Link to="/register" style={{ color: '#176B87' }}>Register here</Link>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default Login;
