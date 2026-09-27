import React, { useEffect, useState } from 'react';
import { Card, Badge, Button, Form, Row, Col, Modal } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserById, updateUser, updateUserRole, updateUserStatus, deleteUser } from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaUser, FaEnvelope, FaPhone, FaCalendarAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`Permanently delete ${userProfile.firstName} ${userProfile.lastName}? Their bank accounts will be deactivated and banking history retained. Any admin complaints assigned to them will be transferred to you. This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await deleteUser(id);
      toast.success('User deleted');
      navigate('/admin/users');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };
  
  // Edit form state
  const [formData, setFormData] = useState({ firstName: '', lastName: '', phone: '' });
  const [isEditing, setIsEditing] = useState(false);
  
  // Role & Status state
  const [selectedRole, setSelectedRole] = useState('');
  
  // Modal state
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await getUserById(id);
      const data = res.data.data;
      setUserProfile(data);
      setFormData({ firstName: data.firstName, lastName: data.lastName, phone: data.phone });
      setSelectedRole(data.role);
    } catch (err) {
      toast.error('Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    try {
      await updateUser(id, formData);
      toast.success('User information updated');
      setIsEditing(false);
      fetchUser();
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const handleRoleChange = async () => {
    if (selectedRole === userProfile.role) return;
    try {
      await updateUserRole(id, selectedRole);
      toast.success('User role updated');
      fetchUser();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update role');
      setSelectedRole(userProfile.role); // revert
    }
  };

  const toggleStatusClick = () => {
    setNewStatus(userProfile.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE');
    setShowStatusModal(true);
  };

  const handleConfirmStatus = async () => {
    setShowStatusModal(false);
    try {
      await updateUserStatus(id, newStatus);
      toast.success(`User marked as ${newStatus}`);
      fetchUser();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading && !userProfile) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;
  if (!userProfile) return <DashboardLayout><div>User not found</div></DashboardLayout>;

  const isSelf = currentUser._id === userProfile._id;

  return (
    <DashboardLayout>
      <div className="mb-3">
        <Button variant="link" className="text-decoration-none p-0" onClick={() => navigate(-1)}>
          <FaArrowLeft className="me-2"/> Back to Users
        </Button>
      </div>

      <Row className="g-4">
        <Col lg={4}>
          <Card className="shadow-sm border-0 mb-4 text-center">
            <Card.Body className="p-4">
              <div className="bg-light rounded-circle d-inline-flex justify-content-center align-items-center mb-3" style={{ width: '100px', height: '100px' }}>
                <FaUser size={40} className="text-secondary" />
              </div>
              <h4 className="fw-bold">{userProfile.firstName} {userProfile.lastName}</h4>
              <p className="text-muted mb-2">{userProfile.role.replace(/_/g, ' ')}</p>
              <Badge bg={userProfile.status === 'ACTIVE' ? 'success' : 'danger'} className="px-3 py-2 mb-3">
                {userProfile.status}
              </Badge>
              
              <hr />
              
              <div className="text-start">
                <div className="mb-2"><FaEnvelope className="text-muted me-2"/> {userProfile.email}</div>
                <div className="mb-2"><FaPhone className="text-muted me-2"/> {userProfile.phone}</div>
                <div><FaCalendarAlt className="text-muted me-2"/> Joined {new Date(userProfile.createdAt).toLocaleDateString()}</div>
              </div>
            </Card.Body>
          </Card>

          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white py-3">
              <h6 className="mb-0">Access Control</h6>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold">Change Role</Form.Label>
                <div className="d-flex gap-2">
                  <Form.Select 
                    value={selectedRole} 
                    onChange={(e) => setSelectedRole(e.target.value)}
                    disabled={isSelf}
                  >
                    <option value="CUSTOMER">Customer</option>
                    <option value="CUSTOMER_SERVICE_OFFICER">Service Officer</option>
                    <option value="BANK_MANAGER">Manager</option>
                    <option value="SYSTEM_ADMIN">System Admin</option>
                  </Form.Select>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    onClick={handleRoleChange}
                    disabled={isSelf || selectedRole === userProfile.role}
                  >
                    Save
                  </Button>
                </div>
              </Form.Group>

              <div className="mt-4 pt-3 border-top text-center">
                <Button 
                  variant={userProfile.status === 'ACTIVE' ? 'outline-danger' : 'outline-success'}
                  className="w-100"
                  onClick={toggleStatusClick}
                  disabled={isSelf}
                >
                  {userProfile.status === 'ACTIVE' ? 'Deactivate User' : 'Activate User'}
                </Button>
                {isSelf && <small className="text-muted d-block mt-2">Cannot change your own role/status.</small>}
                <Button variant="danger" className="w-100 mt-3" onClick={handleDelete} disabled={isSelf || deleting}>
                  {deleting ? 'Deleting...' : 'Delete User'}
                </Button>
                {isSelf && <small className="text-muted d-block mt-2">You cannot delete your own account.</small>}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Personal Information</h5>
              {!isEditing ? (
                <Button variant="outline-primary" size="sm" onClick={() => setIsEditing(true)}>Edit</Button>
              ) : (
                <Button variant="outline-secondary" size="sm" onClick={() => {
                  setIsEditing(false);
                  setFormData({ firstName: userProfile.firstName, lastName: userProfile.lastName, phone: userProfile.phone });
                }}>Cancel</Button>
              )}
            </Card.Header>
            <Card.Body className="p-4">
              {isEditing ? (
                <Form onSubmit={handleUpdateInfo}>
                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>First Name</Form.Label>
                        <Form.Control type="text" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} required />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Last Name</Form.Label>
                        <Form.Control type="text" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} required />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Form.Group className="mb-3">
                    <Form.Label>Phone</Form.Label>
                    <Form.Control type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} required />
                  </Form.Group>
                  <Form.Group className="mb-4">
                    <Form.Label>Email (Cannot be changed)</Form.Label>
                    <Form.Control type="email" value={userProfile.email} disabled />
                  </Form.Group>
                  <Button variant="primary" type="submit">Save Changes</Button>
                </Form>
              ) : (
                <Row className="g-4">
                  <Col sm={6}>
                    <p className="text-muted mb-1 small text-uppercase">First Name</p>
                    <h6 className="fw-bold">{userProfile.firstName}</h6>
                  </Col>
                  <Col sm={6}>
                    <p className="text-muted mb-1 small text-uppercase">Last Name</p>
                    <h6 className="fw-bold">{userProfile.lastName}</h6>
                  </Col>
                  <Col sm={6}>
                    <p className="text-muted mb-1 small text-uppercase">Email</p>
                    <h6 className="fw-bold">{userProfile.email}</h6>
                  </Col>
                  <Col sm={6}>
                    <p className="text-muted mb-1 small text-uppercase">Phone</p>
                    <h6 className="fw-bold">{userProfile.phone}</h6>
                  </Col>
                </Row>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Status Change</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to change this user's status to <strong>{newStatus}</strong>?
          {newStatus === 'INACTIVE' && " They will no longer be able to log in."}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStatusModal(false)}>Cancel</Button>
          <Button variant={newStatus === 'ACTIVE' ? 'success' : 'danger'} onClick={handleConfirmStatus}>
            Confirm Change
          </Button>
        </Modal.Footer>
      </Modal>
    </DashboardLayout>
  );
};

export default UserDetails;
