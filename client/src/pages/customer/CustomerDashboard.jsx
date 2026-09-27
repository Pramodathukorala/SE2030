import { formatLKR } from '../../utils/currency';
import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Badge, Table, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getCustomerDashboard } from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FaWallet, FaExchangeAlt, FaCheckCircle, FaHourglassHalf, FaTimesCircle, FaExclamationCircle } from 'react-icons/fa';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await getCustomerDashboard();
        setData(res.data.data);
      } catch (error) {
        console.error("Dashboard fetch error", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;
  if (!data) return <DashboardLayout><div>Error loading dashboard</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <h2 className="mb-4" style={{ color: '#0B3D60' }}>Welcome, {user.firstName}!</h2>
      
      <Row className="mb-4 g-3">
        <Col md={4} sm={6}>
          <Card className="shadow-sm border-0 h-100" style={{ borderLeft: '5px solid #0B3D60' }}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">Current Balance</p>
                  <h3 className="mb-0 fw-bold">{formatLKR(data.account.balance)}</h3>
                </div>
                <FaWallet size={40} color="#0B3D60" opacity={0.2} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} sm={6}>
          <Card className="shadow-sm border-0 h-100" style={{ borderLeft: '5px solid #176B87' }}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">Total Transactions</p>
                  <h3 className="mb-0 fw-bold">{data.transactions.total}</h3>
                </div>
                <FaExchangeAlt size={40} color="#176B87" opacity={0.2} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} sm={6}>
          <Card className="shadow-sm border-0 h-100" style={{ borderLeft: '5px solid #F4A261' }}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">Active Complaints</p>
                  <h3 className="mb-0 fw-bold">{data.activeComplaints}</h3>
                </div>
                <FaExclamationCircle size={40} color="#F4A261" opacity={0.2} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4 g-3">
        <Col md={4} sm={4}>
           <Card className="text-center shadow-sm border-0 py-2">
             <Card.Body>
               <FaCheckCircle size={30} color="green" className="mb-2"/>
               <h6>Successful</h6>
               <h4 className="mb-0">{data.transactions.successful}</h4>
             </Card.Body>
           </Card>
        </Col>
        <Col md={4} sm={4}>
           <Card className="text-center shadow-sm border-0 py-2">
             <Card.Body>
               <FaHourglassHalf size={30} color="orange" className="mb-2"/>
               <h6>Pending</h6>
               <h4 className="mb-0">{data.transactions.pending}</h4>
             </Card.Body>
           </Card>
        </Col>
        <Col md={4} sm={4}>
           <Card className="text-center shadow-sm border-0 py-2">
             <Card.Body>
               <FaTimesCircle size={30} color="red" className="mb-2"/>
               <h6>Failed</h6>
               <h4 className="mb-0">{data.transactions.failed}</h4>
             </Card.Body>
           </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm border-0">
            <Card.Body className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <Button as={Link} to="/customer/transfer" style={{ backgroundColor: '#0B3D60', borderColor: '#0B3D60' }}>
                Transfer Funds
              </Button>
              <Button as={Link} to="/customer/transactions" variant="outline-primary">
                Transaction History
              </Button>
              <Button as={Link} to="/customer/transactions/search" variant="outline-secondary">
                Search Transaction
              </Button>
              <Button as={Link} to="/customer/complaints/new" style={{ backgroundColor: '#F4A261', borderColor: '#F4A261' }}>
                Submit Complaint
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white py-3 border-bottom-0">
          <h5 className="mb-0" style={{ color: '#0B3D60' }}>Recent Transactions</h5>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Reference</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Type</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentTransactions && data.recentTransactions.length > 0 ? (
                  data.recentTransactions.map(tx => (
                    <tr key={tx._id}>
                      <td><Link to={`/customer/transactions/${tx._id}`}>{tx.referenceNumber}</Link></td>
                      <td>{new Date(tx.createdAt).toLocaleDateString()}</td>
                      <td>{formatLKR(tx.amount)}</td>
                      <td>{tx.senderAccount?._id === data.account._id ? 'Sent' : 'Received'}</td>
                      <td>
                        <Badge bg={tx.status === 'SUCCESSFUL' ? 'success' : tx.status === 'PENDING' ? 'warning' : 'danger'}>
                          {tx.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="5" className="text-center py-4">No recent transactions</td></tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </DashboardLayout>
  );
};

export default CustomerDashboard;
