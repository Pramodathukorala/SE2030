import { formatLKR } from '../../utils/currency';
import React, { useEffect, useState } from 'react';
import { Card, Table, Form, Row, Col, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getMyTransactions, getMyAccount } from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';
import LoadingSpinner from '../../components/LoadingSpinner';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [accountId, setAccountId] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    const fetchAccountAndTransactions = async () => {
      try {
        setLoading(true);
        const accRes = await getMyAccount();
        setAccountId(accRes.data.data._id);
        
        const params = {};
        if (filters.status) params.status = filters.status;
        if (filters.type) params.type = filters.type;
        if (filters.startDate) params.startDate = filters.startDate;
        if (filters.endDate) params.endDate = filters.endDate;
        
        const txRes = await getMyTransactions(params);
        setTransactions(txRes.data.data);
      } catch (error) {
        console.error("Failed to fetch transactions", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAccountAndTransactions();
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <DashboardLayout>
      <h3 className="mb-4" style={{ color: '#0B3D60' }}>Transaction History</h3>
      
      <Card className="shadow-sm border-0 mb-4 bg-light">
        <Card.Body>
          <Row className="g-3">
            <Col md={3}>
              <Form.Select name="status" value={filters.status} onChange={handleFilterChange}>
                <option value="">All Statuses</option>
                <option value="SUCCESSFUL">Successful</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select name="type" value={filters.type} onChange={handleFilterChange}>
                <option value="">All Types</option>
                <option value="sent">Sent</option>
                <option value="received">Received</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Control type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} placeholder="Start Date" />
            </Col>
            <Col md={3}>
              <Form.Control type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} placeholder="End Date" />
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
                    <th>Reference No.</th>
                    <th>Date</th>
                    <th>Sender</th>
                    <th>Receiver</th>
                    <th>Amount</th>
                    <th>Type</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length > 0 ? (
                    transactions.map(tx => {
                      const isSent = tx.senderAccount && tx.senderAccount._id === accountId;
                      return (
                        <tr key={tx._id} style={{ cursor: 'pointer' }}>
                          <td><Link to={`/customer/transactions/${tx._id}`}>{tx.referenceNumber}</Link></td>
                          <td>{new Date(tx.createdAt).toLocaleString()}</td>
                          <td>{tx.senderAccount ? tx.senderAccount.accountNumber : 'N/A'}</td>
                          <td>{tx.receiverAccount ? tx.receiverAccount.accountNumber : 'N/A'}</td>
                          <td className={isSent ? 'text-danger fw-bold' : 'text-success fw-bold'}>
                            {isSent ? '-' : '+'}{formatLKR(tx.amount)}
                          </td>
                          <td>{isSent ? 'Sent' : 'Received'}</td>
                          <td>
                            <Badge bg={tx.status === 'SUCCESSFUL' ? 'success' : tx.status === 'PENDING' ? 'warning' : 'danger'}>
                              {tx.status}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr><td colSpan="7" className="text-center py-4">No transactions found</td></tr>
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

export default TransactionHistory;
