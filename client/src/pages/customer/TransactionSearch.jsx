import { formatLKR } from '../../utils/currency';
import React, { useState } from 'react';
import { Card, Form, Button, InputGroup, Row, Col, Badge } from 'react-bootstrap';
import { getTransactionByReference, getMyAccount } from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';
import { FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';

const TransactionSearch = () => {
  const [refNumber, setRefNumber] = useState('');
  const [transaction, setTransaction] = useState(null);
  const [accountId, setAccountId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!refNumber.trim()) {
      toast.error('Please enter a reference number');
      return;
    }
    
    setLoading(true);
    setSearched(true);
    setTransaction(null);
    
    try {
      if (!accountId) {
        const accRes = await getMyAccount();
        setAccountId(accRes.data.data._id);
      }
      const res = await getTransactionByReference(refNumber);
      setTransaction(res.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Transaction not found');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <h3 className="mb-4" style={{ color: '#0B3D60' }}>Search Transaction</h3>
      
      <Card className="shadow-sm border-0 mb-4 bg-white" style={{ maxWidth: '600px' }}>
        <Card.Body className="p-4">
          <Form onSubmit={handleSearch}>
            <Form.Group>
              <Form.Label>Reference Number</Form.Label>
              <InputGroup>
                <Form.Control 
                  type="text" 
                  placeholder="Enter transaction reference number (e.g. TXN-...)" 
                  value={refNumber}
                  onChange={(e) => setRefNumber(e.target.value)}
                  required
                />
                <Button type="submit" variant="primary" style={{ backgroundColor: '#0B3D60' }} disabled={loading}>
                  {loading ? 'Searching...' : <><FaSearch /> Search</>}
                </Button>
              </InputGroup>
            </Form.Group>
          </Form>
        </Card.Body>
      </Card>

      {searched && !loading && transaction && (
        <Card className="shadow-sm border-0" style={{ maxWidth: '800px' }}>
          <Card.Header className="bg-white py-3">
            <h5 className="mb-0">Search Result</h5>
          </Card.Header>
          <Card.Body className="p-4">
            {(() => {
              const isSent = transaction.senderAccount && transaction.senderAccount._id === accountId;
              return (
                <Row className="g-4">
                  <Col sm={12} className="text-center mb-3">
                    <h2 className={isSent ? 'text-danger fw-bold' : 'text-success fw-bold'}>
                      {isSent ? '-' : '+'}{formatLKR(transaction.amount)}
                    </h2>
                    <Badge 
                      bg={transaction.status === 'SUCCESSFUL' ? 'success' : transaction.status === 'PENDING' ? 'warning' : 'danger'}
                      className="px-3 py-2"
                    >
                      {transaction.status}
                    </Badge>
                  </Col>
                  <Col sm={6}>
                    <p className="text-muted mb-1 text-uppercase small">Reference</p>
                    <h6 className="fw-bold">{transaction.referenceNumber}</h6>
                  </Col>
                  <Col sm={6}>
                    <p className="text-muted mb-1 text-uppercase small">Date</p>
                    <h6 className="fw-bold">{new Date(transaction.createdAt).toLocaleString()}</h6>
                  </Col>
                  <Col sm={6}>
                    <p className="text-muted mb-1 text-uppercase small">Sender</p>
                    <h6 className="fw-bold">{transaction.senderAccount ? transaction.senderAccount.accountNumber : 'N/A'}</h6>
                  </Col>
                  <Col sm={6}>
                    <p className="text-muted mb-1 text-uppercase small">Receiver</p>
                    <h6 className="fw-bold">{transaction.receiverAccount ? transaction.receiverAccount.accountNumber : 'N/A'}</h6>
                  </Col>
                  <Col sm={12}>
                    <p className="text-muted mb-1 text-uppercase small">Description</p>
                    <h6 className="fw-bold">{transaction.description || 'N/A'}</h6>
                  </Col>
                </Row>
              );
            })()}
          </Card.Body>
        </Card>
      )}

      {searched && !loading && !transaction && (
        <Card className="shadow-sm border-0 bg-light" style={{ maxWidth: '600px' }}>
          <Card.Body className="text-center py-5 text-muted">
            <FaSearch size={40} className="mb-3 opacity-50" />
            <h5>No transaction found</h5>
            <p className="mb-0">Please check the reference number and try again.</p>
          </Card.Body>
        </Card>
      )}
    </DashboardLayout>
  );
};

export default TransactionSearch;
