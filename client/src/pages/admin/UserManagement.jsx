import React, { useEffect, useState } from 'react';
import { Card, Table, Form, Badge, Row, Col, InputGroup, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getAllUsers } from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FaSearch } from 'react-icons/fa';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: ''
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.role) params.role = filters.role;
      if (filters.status) params.status = filters.status;
      
      const res = await getAllUsers(params);
      setUsers(res.data.data);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Basic debounce for search
    const delayDebounceFn = setTimeout(() => {
      fetchUsers();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <DashboardLayout>
      <h3 className="mb-4" style={{ color: '#0B3D60' }}>User Management</h3>
      
      <Card className="shadow-sm border-0 mb-4 bg-light">
        <Card.Body>
          <Row className="g-3">
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text><FaSearch /></InputGroup.Text>
                <Form.Control 
                  placeholder="Search name or email..." 
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                />
              </InputGroup>
            </Col>
            <Col md={4}>
              <Form.Select name="role" value={filters.role} onChange={handleFilterChange}>
                <option value="">All Roles</option>
                <option value="CUSTOMER">Customer</option>
                <option value="CUSTOMER_SERVICE_OFFICER">Service Officer</option>
                <option value="BANK_MANAGER">Manager</option>
                <option value="SYSTEM_ADMIN">Admin</option>
              </Form.Select>
            </Col>
            <Col md={4}>
              <Form.Select name="status" value={filters.status} onChange={handleFilterChange}>
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </Form.Select>
            </Col>
          </Row>
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
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? (
                    users.map(u => (
                      <tr key={u._id} style={{ cursor: 'pointer' }}>
                        <td><Link to={`/admin/users/${u._id}`}>{u.firstName} {u.lastName}</Link></td>
                        <td>{u.email}</td>
                        <td>{u.role.replace(/_/g, ' ')}</td>
                        <td>
                          <Badge bg={u.status === 'ACTIVE' ? 'success' : 'danger'}>
                            {u.status}
                          </Badge>
                        </td>
                        <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td><Button as={Link} to={`/admin/users/${u._id}`} variant="outline-primary" size="sm">Manage User</Button></td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="6" className="text-center py-4">No users found</td></tr>
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

export default UserManagement;
