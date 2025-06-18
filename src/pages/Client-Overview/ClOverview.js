import React, { useState, useEffect } from 'react';
import api from '../../utils/axiosSetup';
import { Search, User, Phone, MapPin, Truck, FileText, DollarSign, Calendar, X, AlertCircle, CheckCircle, Clock, Eye } from 'lucide-react';

const ClOverview = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredClients, setFilteredClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);


  // Fetch clients from API
  const fetchClients = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/customer');
      if (response.data.success) {
        setClients(response.data.data || []);
        setFilteredClients(response.data.data || []);
      } else {
        throw new Error('Failed to fetch clients');
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      setError('Failed to load client data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchClients();
  }, []);

  // Filter clients based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredClients(clients);
      return;
    }

    const results = clients.filter(client =>
      client.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.customerAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.customerMobile?.includes(searchTerm) ||
      client.customerMobile2?.includes(searchTerm)
    );
    setFilteredClients(results);
  }, [searchTerm, clients]);

  // View client details
  const handleViewDetails = (client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedClient(null);
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      'Pending': { 
        bg: 'bg-red-100 dark:bg-red-900/20', 
        text: 'text-red-800 dark:text-red-200',
        icon: <Clock className="w-3 h-3" />
      },
      'Paid': { 
        bg: 'bg-green-100 dark:bg-green-900/20', 
        text: 'text-green-800 dark:text-green-200',
        icon: <CheckCircle className="w-3 h-3" />
      },
      'Overdue': { 
        bg: 'bg-orange-100 dark:bg-orange-900/20', 
        text: 'text-orange-800 dark:text-orange-200',
        icon: <AlertCircle className="w-3 h-3" />
      }
    };

    const config = statusConfig[status] || statusConfig['Pending'];
    
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.icon}
        {status}
      </span>
    );
  };

  // Calculate summary statistics
  const calculateSummaryStats = () => {
    return {
      totalClients: clients.length,
      totalPendingBills: clients.reduce((sum, client) => sum + (client.totalRemainBills || 0), 0),
      totalPendingAmount: clients.reduce((sum, client) => sum + (client.totalAmountRemain || 0), 0)
    };
  };

  const summaryStats = calculateSummaryStats();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Client Overview</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage and view all your clients</p>
          </div>
        </div>
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Client Overview</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage and view all your clients</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-12 shadow-sm text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Error loading clients</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{error}</p>
          <button
            onClick={fetchClients}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Client Overview</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage and view all your clients</p>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Last updated: {new Date().toLocaleString('en-IN')}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Clients</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-200">{summaryStats.totalClients}</p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <FileText className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-red-600 dark:text-red-400">Pending Bills</p>
              <p className="text-2xl font-bold text-red-900 dark:text-red-200">{summaryStats.totalPendingBills}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Pending Amount</p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-200">
                ₹{summaryStats.totalPendingAmount.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Client List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        {/* Search Bar */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search clients by name, address, or mobile..."
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Client List */}
        <div className="overflow-x-auto">
          {filteredClients.length === 0 ? (
            <div className="text-center py-16">
              <User className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600" />
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                {searchTerm ? 'No clients found' : 'No clients available'}
              </h3>
              <p className="mt-1 text-gray-500 dark:text-gray-400">
                {searchTerm 
                  ? 'Try adjusting your search terms to find what you\'re looking for.'
                  : 'Start by adding your first client to get started.'
                }
              </p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Client Details
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Pending Bills
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Pending Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredClients.map((client) => (
                  <tr key={client._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {client.customerName || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            <span className="truncate max-w-xs">
                              {client.customerAddress || 'Address not provided'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {client.customerMobile && (
                          <div className="text-sm text-gray-900 dark:text-white flex items-center">
                            <Phone className="w-3 h-3 mr-1 text-gray-400" />
                            {client.customerMobile}
                          </div>
                        )}
                        {client.customerMobile2 && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                            <Phone className="w-3 h-3 mr-1 text-gray-400" />
                            {client.customerMobile2}
                          </div>
                        )}
                        {!client.customerMobile && !client.customerMobile2 && (
                          <span className="text-sm text-gray-400">No contact info</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {client.totalRemainBills || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        ₹{(client.totalAmountRemain || 0).toLocaleString('en-IN')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewDetails(client)}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 px-3 py-1.5 rounded-md transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Client Details Modal */}
      {isModalOpen && selectedClient && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={closeModal}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-white" id="modal-title">
                        {selectedClient.customerName}
                      </h3>
                      <p className="text-blue-100 text-sm">Client Details</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="bg-white bg-opacity-20 rounded-md text-white hover:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-white p-2"
                    onClick={closeModal}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="px-6 py-6 space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Contact Information</h4>
                    
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</p>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {selectedClient.customerAddress || 'Not provided'}
                        </p>
                      </div>
                    </div>

                    {selectedClient.customerMobile && (
                      <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Primary Mobile</p>
                          <p className="text-sm text-gray-900 dark:text-white">{selectedClient.customerMobile}</p>
                        </div>
                      </div>
                    )}

                    {selectedClient.customerMobile2 && (
                      <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Secondary Mobile</p>
                          <p className="text-sm text-gray-900 dark:text-white">{selectedClient.customerMobile2}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Client Since</p>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {formatDate(selectedClient.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Business Summary</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                        <div className="flex items-center">
                          <Truck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          <div className="ml-2">
                            <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Total Vehicles</p>
                            <p className="text-lg font-bold text-blue-900 dark:text-blue-200">
                              {selectedClient.totalVehicles || 0}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-red-600 dark:text-red-400" />
                          <div className="ml-2">
                            <p className="text-xs font-medium text-red-600 dark:text-red-400">Pending Bills</p>
                            <p className="text-lg font-bold text-red-900 dark:text-red-200">
                              {selectedClient.totalRemainBills || 0}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg col-span-2">
                        <div className="flex items-center">
                          <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          <div className="ml-2">
                            <p className="text-xs font-medium text-purple-600 dark:text-purple-400">Pending Amount</p>
                            <p className="text-xl font-bold text-purple-900 dark:text-purple-200">
                              ₹{(selectedClient.totalAmountRemain || 0).toLocaleString('en-IN')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Latest Bills */}
                {selectedClient.latestBills && selectedClient.latestBills.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Bills</h4>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden">
                      <div className="divide-y divide-gray-200 dark:divide-gray-600">
                        {selectedClient.latestBills.slice(0, 5).map((bill) => (
                          <div key={bill._id} className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    Bill #{bill.billNo}
                                  </p>
                                  {getStatusBadge(bill.status)}
                                </div>
                                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-4">
                                  <span>{formatDate(bill.date)}</span>
                                  <span>•</span>
                                  <span>{bill.vehicles?.length || 0} vehicle(s)</span>
                                </div>
                              </div>
                              <div className="text-right ml-4">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  ₹{(bill.totalAmount || 0).toLocaleString('en-IN')}
                                </p>
                                {bill.pendingAmount > 0 && (
                                  <p className="text-xs text-red-600 dark:text-red-400">
                                    Pending: ₹{(bill.pendingAmount || 0).toLocaleString('en-IN')}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            {/* Vehicle Details */}
                            {bill.vehicles && bill.vehicles.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {bill.vehicles.map((vehicle) => (
                                    <div key={vehicle._id} className="bg-white dark:bg-gray-800 p-2 rounded text-xs">
                                      <div className="font-medium text-gray-900 dark:text-white">
                                        {vehicle.vehicleNumber}
                                      </div>
                                      <div className="text-gray-500 dark:text-gray-400">
                                        {vehicle.vehicleType} • {vehicle.driverName}
                                      </div>
                                      <div className="text-gray-600 dark:text-gray-300">
                                        {vehicle.quantity} {vehicle.unit} × ₹{vehicle.rate} = ₹{vehicle.totalAmount}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex flex-col sm:flex-row sm:justify-end gap-3">
                <button
                  type="button"
                  className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={closeModal}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  View All Bills
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClOverview;