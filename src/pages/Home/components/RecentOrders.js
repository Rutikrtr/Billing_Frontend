import React, { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../../components/ui/table/index";

export default function RecentOrders({ customersData }) {
    const [recentBills, setRecentBills] = useState([]);
    const [loading, setLoading] = useState(true);

    // Format date for display
    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return 'Invalid Date';
            }
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Invalid Date';
        }
    };

    // Get status color
    const getStatusColor = (status) => {
        if (!status) return 'text-gray-700 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
        
        switch (status.toLowerCase()) {
            case 'delivered':
            case 'completed':
                return 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
            case 'pending':
                return 'text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
            case 'canceled':
            case 'cancelled':
                return 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
            default:
                return 'text-gray-700 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
        }
    };

    // Get primary vehicle info from vehicles array
    const getPrimaryVehicleInfo = (vehicles) => {
        if (!vehicles || !Array.isArray(vehicles) || vehicles.length === 0) {
            return {
                vehicleNumber: 'N/A',
                vehicleType: 'N/A',
                driverName: 'N/A'
            };
        }
        
        const primaryVehicle = vehicles[0];
        return {
            vehicleNumber: primaryVehicle.vehicleNumber || 'N/A',
            vehicleType: primaryVehicle.vehicleType || 'N/A',
            driverName: primaryVehicle.driverName || 'N/A'
        };
    };

    // Process customer data to extract bills
    useEffect(() => {
        if (customersData && customersData.length > 0) {
            setLoading(true);
            try {
                // Extract all bills from all customers
                const allBills = [];
                customersData.forEach(customer => {
                    if (customer.latestBills && Array.isArray(customer.latestBills) && customer.latestBills.length > 0) {
                        customer.latestBills.forEach(bill => {
                            // Get primary vehicle info
                            const vehicleInfo = getPrimaryVehicleInfo(bill.vehicles);
                            
                            allBills.push({
                                _id: bill._id,
                                billNo: bill.billNo || 'N/A',
                                date: bill.date,
                                netAmount: bill.netAmount || 0,
                                pendingAmount: bill.pendingAmount || 0,
                                status: bill.status || 'Unknown',
                                comment: bill.comment || '',
                                totalAmount: bill.totalAmount || 0,
                                cashDiscount: bill.cashDiscount || 0,
                                // Customer info
                                customerName: customer.customerName || 'N/A',
                                customerAddress: customer.customerAddress || 'N/A',
                                customerMobile: customer.customerMobile || 'N/A',
                                // Vehicle info (primary vehicle)
                                vehicleNumber: vehicleInfo.vehicleNumber,
                                vehicleType: vehicleInfo.vehicleType,
                                driverName: vehicleInfo.driverName,
                                // Additional info
                                vehicleCount: bill.vehicles ? bill.vehicles.length : 0
                            });
                        });
                    }
                });
                
                // Sort bills by date (newest first) and take recent ones
                const sortedBills = allBills
                    .sort((a, b) => {
                        const dateA = new Date(a.date);
                        const dateB = new Date(b.date);
                        // Handle invalid dates
                        if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
                        if (isNaN(dateA.getTime())) return 1;
                        if (isNaN(dateB.getTime())) return -1;
                        return dateB - dateA;
                    })
                    .slice(0, 10); // Show last 10 bills
                
                setRecentBills(sortedBills);
            } catch (error) {
                console.error('Error processing bills data:', error);
                setRecentBills([]);
            } finally {
                setLoading(false);
            }
        } else {
            // If no customer data, set loading to false
            setLoading(false);
            setRecentBills([]);
        }
    }, [customersData]);

    if (loading) {
        return (
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
                <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                            Recent Bills
                        </h3>
                    </div>
                </div>
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="animate-pulse">
                            <div className="h-12 bg-gray-200 rounded dark:bg-gray-700"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
            <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        Recent Bills
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {recentBills.length} recent bills found
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
                        <svg
                            className="stroke-current fill-white dark:fill-gray-800"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="M2.29004 5.90393H17.7067" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M17.7075 14.0961H2.29085" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path
                                d="M12.0826 3.33331C13.5024 3.33331 14.6534 4.48431 14.6534 5.90414C14.6534 7.32398 13.5024 8.47498 12.0826 8.47498C10.6627 8.47498 9.51172 7.32398 9.51172 5.90415C9.51172 4.48432 10.6627 3.33331 12.0826 3.33331Z"
                                strokeWidth="1.5"
                            />
                            <path
                                d="M7.91745 11.525C6.49762 11.525 5.34662 12.676 5.34662 14.0959C5.34661 15.5157 6.49762 16.6667 7.91745 16.6667C9.33728 16.6667 10.4883 15.5157 10.4883 14.0959C10.4883 12.676 9.33728 11.525 7.91745 11.525Z"
                                strokeWidth="1.5"
                            />
                        </svg>
                        Filter
                    </button>
                    <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
                        See all
                    </button>
                </div>
            </div>

            <div className="max-w-full overflow-x-auto">
                <Table>
                    <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                        <TableRow>
                            <TableCell className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                                Bill Details
                            </TableCell>
                            <TableCell className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                                Customer
                            </TableCell>
                            <TableCell className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                                Vehicle
                            </TableCell>
                            <TableCell className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                                Amount
                            </TableCell>
                            <TableCell className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                                Status
                            </TableCell>
                        </TableRow>
                    </TableHeader>

                    <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {recentBills.length > 0 ? (
                            recentBills.map((bill) => (
                                <TableRow key={bill._id}>
                                    <TableCell className="py-3">
                                        <div>
                                            <p className="font-medium text-gray-800 text-sm dark:text-white/90">
                                                {bill.billNo}
                                            </p>
                                            <span className="text-gray-500 text-xs dark:text-gray-400">
                                                {formatDate(bill.date)}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-3">
                                        <div>
                                            <p className="font-medium text-gray-800 text-sm dark:text-white/90">
                                                {bill.customerName}
                                            </p>
                                            <span className="text-gray-500 text-xs dark:text-gray-400">
                                                {bill.customerMobile}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-3">
                                        <div>
                                            <p className="font-medium text-gray-800 text-sm dark:text-white/90">
                                                {bill.vehicleNumber}
                                                {bill.vehicleCount > 1 && (
                                                    <span className="ml-1 text-xs text-blue-600 dark:text-blue-400">
                                                        (+{bill.vehicleCount - 1} more)
                                                    </span>
                                                )}
                                            </p>
                                            <span className="text-gray-500 text-xs dark:text-gray-400">
                                                {bill.vehicleType} • {bill.driverName}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-3">
                                        <div>
                                            <p className="font-medium text-gray-800 text-sm dark:text-white/90">
                                                ₹{bill.netAmount.toLocaleString()}
                                            </p>
                                            {bill.pendingAmount > 0 && (
                                                <span className="text-red-500 text-xs dark:text-red-400">
                                                    Pending: ₹{bill.pendingAmount.toLocaleString()}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-3">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(bill.status)}`}>
                                            {bill.status}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="py-8 text-center text-gray-500 dark:text-gray-400">
                                    No recent bills found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}