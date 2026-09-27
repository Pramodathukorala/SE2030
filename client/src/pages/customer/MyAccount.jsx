import { formatLKR } from '../../utils/currency';
import React, { useEffect, useState } from 'react';
import { Card, Badge, Row, Col } from 'react-bootstrap';
import { getMyAccount } from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';
import LoadingSpinner from '../../components/LoadingSpinner';

const MyAccount = () => {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const res = await getMyAccount();
        setAccount(res.data.data);
      } catch (err) {
        setError('Failed to load account details');
      } finally {
        setLoading(false);
      }
    };
    fetchAccount();
  }, []);

  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;
  if (error) return <DashboardLayout><div className="text-danger">{error}</div></DashboardLayout>;
  if (!account) return <DashboardLayout><div>No account found</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <h3 className="mb-4" style={{ color: '#0B3D60' }}>My Account</h3>
      <Card className="shadow-sm border-0" style={{ maxWidth: '600px', borderTop: '5px solid #0B3D60' }}>
        <Card.Body className="p-4">
          <Row className="mb-4">
            <Col>
              <p className="text-muted mb-1 text-uppercase fw-bold" style={{ fontSize: '0.8rem' }}>Available Balance</p>
              <h1 className="fw-bold" style={{ color: '#0B3D60' }}>
                {formatLKR(account.balance)}
              </h1>
            </Col>
          </Row>
          <hr />
          <Row className="mt-4">
            <Col sm={6} className="mb-3">
              <p className="text-muted mb-1">Account Number</p>
              <h5 className="fw-bold">{account.accountNumber}</h5>
            </Col>
            <Col sm={6} className="mb-3">
              <p className="text-muted mb-1">Account Type</p>
              <h5>{account.accountType}</h5>
            </Col>
            <Col sm={6} className="mb-3">
              <p className="text-muted mb-1">Status</p>
              <Badge bg={account.status === 'ACTIVE' ? 'success' : 'danger'} className="px-3 py-2">
                {account.status}
              </Badge>
            </Col>
            <Col sm={6} className="mb-3">
              <p className="text-muted mb-1">Opened On</p>
              <h5>{new Date(account.createdAt).toLocaleDateString()}</h5>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </DashboardLayout>
  );
};

export default MyAccount;
