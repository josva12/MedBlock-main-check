import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/layout/Header';

const DoctorLayout: React.FC = () => (
  <>
    <Header />
    <Outlet />
  </>
);

export default DoctorLayout; 