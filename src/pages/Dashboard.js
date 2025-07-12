// Dashboard.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from '../components/Layout/AppLayout';
import Home from './Home/Home';
import Vehicle from './Vehicles/index';
import Billing from './billing/Billing';
import Fuel from './Fuel/Fuel';
import Overview from './Overview/Overview';
import ClOverview from './Client-Overview/ClOverview';
import Clients from './Clients/index';
import Transaction from './Transaction/Transaction';
import Expences from './Vehicle-Expences/Expences';
import Support from './Support';


const Dashboard = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
      
        <Route index element={<Home />} />
        
      
        <Route path="home" element={<Home />} />
        <Route path="clients" element={<Clients/>} />
        <Route path="vehicle" element={<Vehicle />} />
        <Route path="billing" element={<Billing />} />
        <Route path="fuel" element={<Fuel />} />
        <Route path="overview" element={<Overview />} />
        <Route path="client-overview" element={<ClOverview />} />
        <Route path="transaction-history" element={<Transaction />} />
        <Route path="vehicle-expences" element={<Expences />} />
        <Route path="support" element={<Support />} />
      </Route>
    </Routes>
  );
};

export default Dashboard;