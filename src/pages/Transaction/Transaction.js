import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../components/ui/table/index";
import BillDeleteModal from './BillDeleteModal';
import BillEditModal from './BillEditModal';
import api from '../../utils/axiosSetup';
import toast, { Toaster } from 'react-hot-toast';

const Transaction = () => {
    const { token } = useSelector((state) => state.auth);
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedBill, setSelectedBill] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [editLoading, setEditLoading] = useState(false);

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
            case 'paid':
            case 'paid':
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

    // Check if bill can be edited/deleted (within 48 hours)
    const canModifyBill = (billDate) => {
        const now = new Date();
        const billDateTime = new Date(billDate);
        const hoursDifference = (now - billDateTime) / (1000 * 60 * 60);
        return hoursDifference <= 48;
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

    // Fetch all bills from customers
   const fetchBills = async () => {
    setLoading(true);
    try {
        const response = await api.get('/customer');
        const apiResponse = response.data;

        if (apiResponse?.success && Array.isArray(apiResponse.data)) {
            const customers = apiResponse.data;
            const allBills = [];

            customers.forEach(customer => {
                // FIXED: Changed from customer.bills to customer.latestBills
                if (customer.latestBills && Array.isArray(customer.latestBills) && customer.latestBills.length > 0) {
                    customer.latestBills.forEach(bill => {
                        const vehicleInfo = getPrimaryVehicleInfo(bill.vehicles);
                        
                        allBills.push({
                            ...bill,
                            customerId: customer._id,
                            customerName: customer.customerName || 'N/A',
                            customerAddress: customer.customerAddress || 'N/A',
                            customerMobile: customer.customerMobile || 'N/A',
                            vehicleNumber: vehicleInfo.vehicleNumber,
                            vehicleType: vehicleInfo.vehicleType,
                            driverName: vehicleInfo.driverName,
                            vehicleCount: bill.vehicles ? bill.vehicles.length : 0,
                            canModify: canModifyBill(bill.date)
                        });
                    });
                }
            });

            // Sort bills by date (newest first)
            const sortedBills = allBills.sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
                if (isNaN(dateA.getTime())) return 1;
                if (isNaN(dateB.getTime())) return -1;
                return dateB - dateA;
            });

            setBills(sortedBills);
        }
    } catch (error) {
        console.error('Error fetching bills:', error);
    } finally {
        setLoading(false);
    }
};

    useEffect(() => {
        fetchBills();
    }, [token]);

    // Filter bills based on search and status
    const filteredBills = bills.filter(bill => {
        const matchesSearch = 
            bill.billNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bill.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bill.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || bill.status?.toLowerCase() === statusFilter.toLowerCase();
        
        return matchesSearch && matchesStatus;
    });

    // Handle delete bill
    const handleDeleteBill = async () => {
        if (!selectedBill) return;
        
        setDeleteLoading(true);
        try {
            const response = await api.delete('/bill/delete', {
                data: {
                    customerId: selectedBill.customerId,
                    billNo: selectedBill.billNo
                }
            });

            if (response.data.success) {
                setBills(bills.filter(bill => bill._id !== selectedBill._id));
                setShowDeleteModal(false);
                setSelectedBill(null);
                toast.success(response.data.message);
            }
        } catch (error) {
            console.error('Error deleting bill:', error);
            toast.error(error.response?.data?.message);
        } finally {
            setDeleteLoading(false);
        }
    };

    // Handle edit bill
    const handleEditBill = async (editedData) => {
        if (!selectedBill) return;
        
        setEditLoading(true);
        try {
            const response = await api.put('/bill/edit', {
                customerId: selectedBill.customerId,
                billNo: selectedBill.billNo,
                ...editedData
            });

            if (response.data.success) {
                // Update the bill in the local state
                setBills(bills.map(bill => 
                    bill._id === selectedBill._id 
                        ? { ...bill, ...response.data.data }
                        : bill
                ));
                setShowEditModal(false);
                setSelectedBill(null);
                toast.success(response.data.message);
            }
        } catch (error) {
            console.error('Error editing bill:', error);
            toast.error(error.response?.data?.message);
        } finally {
            setEditLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
                    <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                                Transaction History
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
            </div>
        );
    }

    return (
        <div className="space-y-6">
        <Toaster position='top-center'/>
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
                <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                            Transaction History
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {filteredBills.length} bills found
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        {/* Search Input */}
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search bills..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            />
                        </div>

                        <button 
                            onClick={fetchBills}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Refresh
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
                                <TableCell className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                                    Actions
                                </TableCell>
                            </TableRow>
                        </TableHeader>

                        <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {filteredBills.length > 0 ? (
                                filteredBills.map((bill) => (
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
                                                    ₹{bill.netAmount?.toLocaleString() || 0}
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
                                        <TableCell className="py-3">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedBill(bill);
                                                        setShowEditModal(true);
                                                    }}
                                                    disabled={!bill.canModify}
                                                    className="inline-flex items-center p-1.5 text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed dark:text-blue-400 dark:hover:text-blue-300"
                                                    title={bill.canModify ? "Edit bill" : "Cannot edit bill after 48 hours"}
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedBill(bill);
                                                        setShowDeleteModal(true);
                                                    }}
                                                    disabled={!bill.canModify}
                                                    className="inline-flex items-center p-1.5 text-sm text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed dark:text-red-400 dark:hover:text-red-300"
                                                    title={bill.canModify ? "Delete bill" : "Cannot delete bill after 48 hours"}
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-8 text-center text-gray-500 dark:text-gray-400">
                                        No bills found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Delete Modal */}
            <BillDeleteModal
                showDeleteModal={showDeleteModal}
                billToDelete={selectedBill}
                onConfirm={handleDeleteBill}
                onCancel={() => {
                    setShowDeleteModal(false);
                    setSelectedBill(null);
                }}
                loading={deleteLoading}
            />

            {/* Edit Modal */}
            <BillEditModal
                showEditModal={showEditModal}
                billToEdit={selectedBill}
                onSave={handleEditBill}
                onCancel={() => {
                    setShowEditModal(false);
                    setSelectedBill(null);
                }}
                loading={editLoading}
            />
        </div>
    );
};

export default Transaction;