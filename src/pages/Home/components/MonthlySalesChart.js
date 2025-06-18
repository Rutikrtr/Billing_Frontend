import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import api from "../../../utils/axiosSetup";
export default function MonthlySalesChart() {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Chart configuration
  const options = {
    colors: ["#465fff"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 180,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "39%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 4,
      colors: ["transparent"],
    },
    xaxis: {
      categories: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
      ],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
    },
    yaxis: {
      title: {
        text: undefined,
      },
    },
    grid: {
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      x: {
        show: false,
      },
      y: {
        formatter: (val) => `₹${val}`,
      },
    },
  };

  // Process customer data to get monthly sales
  const processMonthlyData = (customersData) => {
    const monthlyTotals = new Array(12).fill(0);
    
    customersData.forEach(customer => {
      if (customer.latestBills && customer.latestBills.length > 0) {
        customer.latestBills.forEach(bill => {
          if (bill.status === "Paid" || bill.status === "Pending") {
            const billDate = new Date(bill.date);
            const month = billDate.getMonth(); // 0-11
            monthlyTotals[month] += bill.netAmount || 0;
          }
        });
      }
    });
    
    return monthlyTotals;
  };

  useEffect(() => {
    const fetchSalesData = async () => {
      setLoading(true);
      try {
        const response = await api.get('/customer');

        if (response.data?.success && Array.isArray(response.data.data)) {
          const monthlyData = processMonthlyData(response.data.data);
          setChartData(monthlyData);
        }
      } catch (error) {
        console.error('Error fetching sales data:', error);
        // Use default data if API fails
        setChartData([168, 385, 201, 298, 187, 195, 291, 110, 215, 390, 280, 112]);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, []);

  const series = [
    {
      name: "Sales",
      data: chartData,
    },
  ];


  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Monthly Sales
          </h3>
        </div>
        <div className="animate-pulse">
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Monthly Sales
        </h3>
       
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
          <Chart options={options} series={series} type="bar" height={180} />
        </div>
      </div>
    </div>
  );
}