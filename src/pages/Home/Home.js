import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import MonthlySalesChart from "./components/MonthlySalesChart";
import MonthlyProfitChart from "./components/MonthlyProfitChart";
import api from "../../utils/axiosSetup";

const Home = () => {
  const { user, token } = useSelector((state) => state.auth);
  const [dashboardStats, setDashboardStats] = useState({
    totalCustomers: 0,
    totalVehicles: 0,
    pendingBills: 0,
  });
  const [customersData, setCustomersData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const response = await api.get("/customer"); // ← clean and token-secured
        const apiResponse = response.data;

        if (apiResponse?.success && Array.isArray(apiResponse.data)) {
          const customers = apiResponse.data;
          setCustomersData(customers);

          const totalCustomers = customers.length;
          let totalVehicles = 0;
          let pendingBills = 0;

          customers.forEach((customer) => {
            totalVehicles = customer.totalVehicles || 0;

            if (customer.latestBills?.length) {
              customer.latestBills.forEach((bill) => {
                if (bill.pendingAmount > 0) pendingBills++;
              });
            }
          });

          setDashboardStats({
            totalCustomers,
            totalVehicles,
            pendingBills,
          });
        } else {
          console.warn("Unexpected API response structure", apiResponse);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6 col-span-12 xl:col-span-7">
          <h1 className="text-2xl font-bold mb-4">
            Welcome back, {user?.fullname}!
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-50 p-4 rounded-lg animate-pulse">
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-8 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
          <h1 className="text-2xl font-bold mb-4">
            Welcome back, {user?.fullname}!
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800">Total Customers</h3>
              <p className="text-2xl font-bold text-blue-600">
                {dashboardStats.totalCustomers}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800">Vehicles</h3>
              <p className="text-2xl font-bold text-green-600">
                {dashboardStats.totalVehicles}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-800">Pending Bills</h3>
              <p className="text-2xl font-bold text-purple-600">
                {dashboardStats.pendingBills}
              </p>
            </div>
          </div>
        </div>

           {/* Monthly Sales Chart */}
        <div className="xl:col-span-1">
          <MonthlySalesChart />
        </div>
      </div>
   {/* Monthly Profit Chart - Full Width */}
      <div className="col-span-12">
        <MonthlyProfitChart />
      </div>


         

        {/* User Information */}
        <div className="xl:col-span-1">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-6 py-6 dark:border-gray-800 dark:bg-white/[0.03] shadow-sm">
            <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
              User Information
            </h2>

            <div className="grid grid-cols-1 gap-6">
              {/* Personal Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Personal Details
                </h3>
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Fullname
                    </span>
                    <span className="text-sm text-gray-900 dark:text-white font-medium">
                      {user?.fullname || "N/A"}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Address
                      </span>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {user?.address || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Business Details
                </h3>
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Firm Name
                    </span>
                    <span className="text-sm text-gray-900 dark:text-white font-medium">
                      {user?.firmName || "N/A"}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        GST No
                      </span>
                      <span className="text-sm text-gray-900 dark:text-white font-mono">
                        {user?.jstNo || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};

export default Home;
