import { formatLKR } from '../../utils/currency';
import React, { useEffect, useState } from 'react';
import { Card, Badge, Button, Row, Col } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { getTransactionById, getMyAccount } from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FaArrowLeft } from 'react-icons/fa';

const TransactionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState(null);
  const [accountId, setAccountId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const accRes = await getMyAccount();
        setAccountId(accRes.data.data._id);
        const txRes = await getTransactionById(id);
        setTransaction(txRes.data.data);
      } catch (err) {
        setError('Failed to load transaction details or unauthorized');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;
  if (error) return <DashboardLayout><div className="text-danger">{error}</div></DashboardLayout>;
  if (!transaction) return <DashboardLayout><div>Transaction not found</div></DashboardLayout>;

  const isSent = transaction.senderAccount && transaction.senderAccount._id === accountId;

  return (
    <DashboardLayout>
      <div className="mb-3">
        <Button variant="link" className="text-decoration-none p-0" onClick={() => navigate(-1)}>
          <FaArrowLeft className="me-2"/> Back
        </Button>
      </div>
      
      <Card className="shadow-sm border-0" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Card.Header className="bg-white py-3">
          <h4 className="mb-0" style={{ color: '#0B3D60' }}>Transaction Details</h4>
        </Card.Header>
        <Card.Body className="p-4">
          <div className="text-center mb-5">
            <h1 className={isSent ? 'text-danger fw-bold' : 'text-success fw-bold'} style={{ fontSize: '3rem' }}>
              {isSent ? '-' : '+'}{formatLKR(transaction.amount)}
            </h1>
            <Badge 
              bg={transaction.status === 'SUCCESSFUL' ? 'success' : transaction.status === 'PENDING' ? 'warning' : 'danger'}
              className="px-3 py-2 fs-6 mt-2"
            >
              {transaction.status}
            </Badge>
          </div>

          <Row className="g-4">
            <Col sm={6}>
              <p className="text-muted mb-1 text-uppercase small">Reference Number</p>
              <h6 className="fw-bold">{transaction.referenceNumber}</h6>
            </Col>
            <Col sm={6}>
              <p className="text-muted mb-1 text-uppercase small">Date & Time</p>
              <h6 className="fw-bold">{new Date(transaction.createdAt).toLocaleString()}</h6>
            </Col>
            <Col sm={6}>
              <p className="text-muted mb-1 text-uppercase small">Sender Account</p>
              <h6 className="fw-bold">{transaction.senderAccount ? transaction.senderAccount.accountNumber : 'N/A'}</h6>
            </Col>
            <Col sm={6}>
              <p className="text-muted mb-1 text-uppercase small">Receiver Account</p>
              <h6 className="fw-bold">{transaction.receiverAccount ? transaction.receiverAccount.accountNumber : 'N/A'}</h6>
            </Col>
            <Col sm={12}>
              <p className="text-muted mb-1 text-uppercase small">Description</p>
              <h6 className="fw-bold">{transaction.description || 'No description provided'}</h6>
            </Col>
            {transaction.status === 'FAILED' && transaction.failureReason && (
              <Col sm={12}>
                <div className="alert alert-danger mt-3 mb-0">
                  <strong>Failure Reason:</strong> {transaction.failureReason}
                </div>
              </Col>
            )}
          </Row>
        </Card.Body>
      </Card>
    </DashboardLayout>
  );
};

export default TransactionDetails;
