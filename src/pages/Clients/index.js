import React, { useState, useEffect, useCallback } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import api from '../../utils/axiosSetup';
import ClientForm from './ClientForm';
import ClientList from './ClientList';
import ClientDeleteModal from './ClientDeleteModal';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerAddress: '',
    customerMobile: ''
  });
  const [errors, setErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);

  // Fetch clients from API
  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/customer');
      setClients(data.data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  }, []);

  // Validation logic
  const validateForm = useCallback((data) => {
    const newErrors = {};
    if (!data.customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    }
    if (!data.customerAddress.trim()) {
      newErrors.customerAddress = 'Customer address is required';
    }
    if (data.customerMobile.trim() && !/^[0-9]{10}$/.test(data.customerMobile)) {
      newErrors.customerMobile = 'Mobile number must be exactly 10 digits';
    }
    return newErrors;
  }, []);

  // Reset form function - moved before handleSubmit
  const resetForm = useCallback(() => {
    setFormData({ customerName: '', customerAddress: '', customerMobile: '' });
    setErrors({});
    setShowForm(false);
    setEditingClient(null);
  }, []);

  // Form submission handler
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm(formData);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitLoading(true);
    try {
      if (editingClient) {
        await api.put(`/customer/${editingClient._id}`, formData);
        toast.success('Client updated successfully!');
        setClients(prev => prev.map(client => 
          client._id === editingClient._id ? { ...client, ...formData } : client
        ));
      } else {
        const { data } = await api.post('/customer', formData);
        toast.success('Client added successfully!');
        const newClient = data.data || data;
        setClients(prev => [...prev, newClient]);
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving client:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error(`Failed to ${editingClient ? 'update' : 'add'} client. Please try again.`);
      }
    } finally {
      setSubmitLoading(false);
    }
  }, [formData, editingClient, validateForm, resetForm]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  const handleEditClient = useCallback((client) => {
    setEditingClient(client);
    setFormData({
      customerName: client.customerName,
      customerAddress: client.customerAddress,
      customerMobile: client.customerMobile || ''
    });
    setShowForm(true);
  }, []);

  const handleDeleteClient = useCallback((client) => {
    setClientToDelete(client);
    setDeleteConfirmText('');
    setShowDeleteModal(true);
  }, []);

  // NEW: Handle note updates
  const handleNoteUpdate = useCallback((clientId, newNote) => {
    setClients(prev => prev.map(client => 
      client._id === clientId ? { ...client, note: newNote } : client
    ));
  }, []);

  const confirmDeleteClient = useCallback(async () => {
    if (deleteConfirmText !== clientToDelete.customerName) {
      toast.error('Customer name does not match. Please type the exact customer name.');
      return;
    }

    setDeleteLoading(true);
    try {
      await api.delete(`/customer/${clientToDelete._id}`);
      toast.success('Client and all associated records deleted successfully!');
      setClients(prev => prev.filter(client => client._id !== clientToDelete._id));
      setShowDeleteModal(false);
      setClientToDelete(null);
      setDeleteConfirmText('');
    } catch (error) {
      console.error('Error deleting client:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to delete client. Please try again.');
      }
    } finally {
      setDeleteLoading(false);
    }
  }, [deleteConfirmText, clientToDelete]);

  const cancelDelete = useCallback(() => {
    setShowDeleteModal(false);
    setClientToDelete(null);
    setDeleteConfirmText('');
  }, []);

  const toggleForm = useCallback(() => {
    setEditingClient(null);
    setFormData({ customerName: '', customerAddress: '', customerMobile: '' });
    setErrors({});
    setShowForm(!showForm);
  }, [showForm]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  return (
    <div className="space-y-6">
      <Toaster />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Clients</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your client information</p>
        </div>
        <button
          onClick={toggleForm}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Client
        </button>
      </div>

      {/* Add/Edit Client Form */}
      {showForm && (
        <ClientForm
          formData={formData}
          errors={errors}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          submitLoading={submitLoading}
          editingClient={editingClient}
          resetForm={resetForm}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ClientDeleteModal
        showDeleteModal={showDeleteModal}
        clientToDelete={clientToDelete}
        deleteConfirmText={deleteConfirmText}
        setDeleteConfirmText={setDeleteConfirmText}
        confirmDeleteClient={confirmDeleteClient}
        cancelDelete={cancelDelete}
        deleteLoading={deleteLoading}
      />

      {/* Clients List */}
      <ClientList
        clients={clients}
        loading={loading}
        handleEditClient={handleEditClient}
        handleDeleteClient={handleDeleteClient}
        onNoteUpdate={handleNoteUpdate}
      />
    </div>
  );
};

export default Clients;