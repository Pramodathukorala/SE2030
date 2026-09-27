import React from 'react';
import AppNavbar from './Navbar';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children }) => {
  return (
    <div className="d-flex flex-column vh-100">
      <AppNavbar />
      <div className="d-flex flex-grow-1" style={{ marginTop: '56px' }}>
        <Sidebar />
        <main className="flex-grow-1 p-4 bg-light overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
