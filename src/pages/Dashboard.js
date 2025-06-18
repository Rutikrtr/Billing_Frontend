// Dashboard.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from '../components/Layout/AppLayout';
import Home from './Home/Home';
import Clients from './Clients';
import Vehicle from './Vehicle';
import Billing from './billing/Billing';
import Fuel from './Fuel/Fuel';
import Overview from './Overview/Overview';
import ClOverview from './Client-Overview/ClOverview';


const Dashboard = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
      
        <Route index element={<Home />} />
        
      
        <Route path="home" element={<Home />} />
        <Route path="clients" element={<Clients />} />
        <Route path="vehicle" element={<Vehicle />} />
        <Route path="billig" element={<Billing />} />
        <Route path="fuel" element={<Fuel />} />
        <Route path="overview" element={<Overview />} />
        <Route path="client-overview" element={<ClOverview />} />
      </Route>
    </Routes>
  );
};

export default Dashboard;