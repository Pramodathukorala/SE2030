import { formatLKR } from '../../utils/currency';
import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Modal, Alert } from 'react-bootstrap';
import { getMyAccount, transferFunds } from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { toast } from 'react-toastify';

const TransferFunds = () => {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [result, setResult] = useState(null);

  const [formData, setFormData] = useState({
    receiverAccountNumber: '',
    amount: '',
    description: ''
  });

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const res = await getMyAccount();
        setAccount(res.data.data);
      } catch (error) {
        toast.error("Failed to load account details");
      } finally {
        setLoading(false);
      }
    };
    fetchAccount();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTransferInit = (e) => {
    e.preventDefault();
    if (!formData.receiverAccountNumber || !formData.amount) {
      toast.error("Please fill in required fields");
      return;
    }
    if (!/^\d+(\.\d{1,2})?$/.test(formData.amount) || !Number.isFinite(Number(formData.amount)) || Number(formData.amount) <= 0) {
      toast.error("Enter a positive LKR amount with at most two decimal places");
      return;
    }
    if (parseFloat(formData.amount) > account.balance) {
      toast.error("Insufficient balance");
      return;
    }
    if (formData.receiverAccountNumber === account.accountNumber) {
      toast.error("Cannot transfer to the same account");
      return;
    }
    setShowModal(true);
  };

  const executeTransfer = async () => {
    setShowModal(false);
    setSubmitting(true);
    setResult(null);
    try {
      const res = await transferFunds({
        receiverAccountNumber: formData.receiverAccountNumber,
        amount: parseFloat(formData.amount),
        description: formData.description
      });
      setResult({ success: true, data: res.data.data });
      toast.success("Transfer successful!");
      // Update local balance
      setAccount({ ...account, balance: (Math.round(account.balance * 100) - Math.round(Number(formData.amount) * 100)) / 100 });
      setFormData({ receiverAccountNumber: '', amount: '', description: '' });
    } catch (error) {
      setResult({ success: false, message: error.response?.data?.message || 'Transfer failed' });
      toast.error(error.response?.data?.message || 'Transfer failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;
  if (!account) return <DashboardLayout><div>Error loading account</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <h3 className="mb-4" style={{ color: '#0B3D60' }}>Transfer Funds</h3>
      
      <Card className="shadow-sm border-0 mb-4 bg-light" style={{ maxWidth: '700px' }}>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <p className="mb-0 text-muted">From Account</p>
              <h5 className="mb-0 fw-bold">{account.accountNumber}</h5>
            </div>
            <div className="text-end">
              <p className="mb-0 text-muted">Available Balance</p>
              <h5 className="mb-0 fw-bold" style={{ color: '#0B3D60' }}>
                {formatLKR(account.balance)}
              </h5>
            </div>
          </div>
        </Card.Body>
      </Card>

      {result && (
        <Alert variant={result.success ? 'success' : 'danger'} style={{ maxWidth: '700px' }}>
          {result.success ? (
            <>
              <h5 className="alert-heading">Transfer Successful!</h5>
              <p className="mb-0">Reference Number: <strong>{result.data.referenceNumber}</strong></p>
            </>
          ) : (
            <>
              <h5 className="alert-heading">Transfer Failed</h5>
              <p className="mb-0">{result.message}</p>
            </>
          )}
        </Alert>
      )}

      <Card className="shadow-sm border-0" style={{ maxWidth: '700px' }}>
        <Card.Body>
          <Form onSubmit={handleTransferInit}>
            <Form.Group className="mb-3">
              <Form.Label>Receiver Account Number <span className="text-danger">*</span></Form.Label>
              <Form.Control 
                type="text" 
                name="receiverAccountNumber" 
                value={formData.receiverAccountNumber} 
                onChange={handleChange} 
                required 
                placeholder="Enter destination account number"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Amount (LKR) <span className="text-danger">*</span></Form.Label>
              <Form.Control 
                type="number" 
                step="0.01" 
                min="0.01"
                name="amount" 
                value={formData.amount} 
                onChange={handleChange} 
                required 
                placeholder="0.00"
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Description (Optional)</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={2} 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                placeholder="What is this transfer for?"
              />
            </Form.Group>

            <Button 
              variant="primary" 
              type="submit" 
              className="w-100 py-2"
              style={{ backgroundColor: '#0B3D60', borderColor: '#0B3D60' }}
              disabled={submitting}
            >
              {submitting ? 'Processing...' : 'Transfer Funds'}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Transfer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to transfer funds?</p>
          <ul className="list-unstyled">
            <li className="mb-2"><strong>To Account:</strong> {formData.receiverAccountNumber}</li>
            <li className="mb-2"><strong>Amount:</strong> {formatLKR(formData.amount || 0)}</li>
            {formData.description && <li><strong>Description:</strong> {formData.description}</li>}
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={executeTransfer} style={{ backgroundColor: '#0B3D60' }}>
            Confirm Transfer
          </Button>
        </Modal.Footer>
      </Modal>

    </DashboardLayout>
  );
};

export default TransferFunds;
