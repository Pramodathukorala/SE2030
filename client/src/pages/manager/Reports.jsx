import React, { useEffect, useState } from 'react';
import { Card, Table, Form, Row, Col } from 'react-bootstrap';
import DashboardLayout from '../../components/DashboardLayout';
import { getManagerDashboard } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const Reports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We can use manager dashboard endpoint which returns totals
    const fetchDashboard = async () => {
      try {
        const res = await getManagerDashboard();
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
  if (!data) return <DashboardLayout><div>Error loading report data</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <h3 className="mb-4" style={{ color: '#0B3D60' }}>System Reports</h3>
      
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body className="p-4">
          <h5 className="mb-4">Complaint Status Summary</h5>
          <div className="table-responsive">
            <Table bordered hover>
              <thead className="bg-light">
                <tr>
                  <th>Status</th>
                  <th>Count</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Total Complaints</td>
                  <td className="fw-bold">{data.totalComplaints}</td>
                  <td>100%</td>
                </tr>
                <tr>
                  <td>Resolved</td>
                  <td>{data.resolvedComplaints}</td>
                  <td>{data.totalComplaints > 0 ? Math.round((data.resolvedComplaints / data.totalComplaints) * 100) : 0}%</td>
                </tr>
                <tr>
                  <td>Escalated</td>
                  <td className="text-danger">{data.escalatedComplaints}</td>
                  <td>{data.totalComplaints > 0 ? Math.round((data.escalatedComplaints / data.totalComplaints) * 100) : 0}%</td>
                </tr>
              </tbody>
            </Table>
          </div>
          <div className="mt-4 text-muted small">
            * Note: Complete reporting capabilities including date filters and custom exports would go here in a full implementation.
          </div>
        </Card.Body>
      </Card>
    </DashboardLayout>
  );
};

export default Reports;
