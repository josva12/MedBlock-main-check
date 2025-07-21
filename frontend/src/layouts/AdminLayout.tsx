import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/layout/Header';
const AdminLayout: React.FC = () => (
  <>
    <Header />
          <Outlet />
  </>
  );
export default AdminLayout; 