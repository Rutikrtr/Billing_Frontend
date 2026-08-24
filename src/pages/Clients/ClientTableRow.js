import React, { useState } from 'react';
import { UserIcon } from '../../icons';
import api from '../../utils/axiosSetup';
import { toast } from 'react-hot-toast';

const ClientTableRow = ({ client, handleEditClient, handleDeleteClient, onNoteUpdate, activeNoteId, setActiveNoteId }) => {
  const [noteText, setNoteText] = useState(client.note || '');
  const [savingNote, setSavingNote] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const showNoteEditor = activeNoteId === client._id;

  const handleSaveNote = async (autoSave = false) => {
    // Only save if there are actual changes
    if (noteText === client.note) {
      if (!autoSave) {
        setActiveNoteId(null);
      }
      return;
    }

    setSavingNote(true);
    try {
      console.log('=== SAVING NOTE ===');
      console.log('Client ID:', client._id);
      console.log('Note content:', noteText);
      console.log('Auto-save:', autoSave);
      
      const { data } = await api.put(`/customer/${client._id}/note`, {
        note: noteText
      });
      
      console.log('=== SAVE SUCCESS ===');
      console.log('Response data:', data);
      
      if (!autoSave) {
        toast.success('Note updated successfully!');
      }
      
      // Update parent component's state
      if (onNoteUpdate) {
        onNoteUpdate(client._id, noteText);
      }
      
      setHasUnsavedChanges(false);
      if (!autoSave) {
        setActiveNoteId(null);
      }
    } catch (error) {
      console.error('=== SAVE FAILED ===');
      console.error('Full error:', error);
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save note';
      toast.error(`Error ${error.response?.status || ''}: ${errorMessage}`);
    } finally {
      setSavingNote(false);
    }
  };

  const handleCancelNote = () => {
    setNoteText(client.note || '');
    setHasUnsavedChanges(false);
    setActiveNoteId(null);
  };

  const handleToggleNote = async () => {
    if (showNoteEditor) {
      // Closing current note
      setActiveNoteId(null);
    } else {
      // Opening a new note - save the previously open note if it exists
      if (activeNoteId && hasUnsavedChanges) {
        // The previous note will auto-save through the effect
      }
      setActiveNoteId(client._id);
    }
  };

  const handleNoteChange = (e) => {
    setNoteText(e.target.value);
    setHasUnsavedChanges(e.target.value !== client.note);
  };

  // Auto-save when switching to another note
  React.useEffect(() => {
    // If this note was open but now another note is being opened
    if (!showNoteEditor && hasUnsavedChanges && noteText !== client.note) {
      handleSaveNote(true); // Auto-save
    }
  }, [showNoteEditor]);

  return (
    <>
      <tr className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
        <td className="py-3 px-4 text-gray-900 dark:text-white">
          <div className="flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-gray-400" />
            {client.customerName}
          </div>
        </td>
        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {client.customerAddress}
          </div>
        </td>
        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            {client.customerMobile || 'N/A'}
          </div>
        </td>
        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
  {client.gstNo || 'N/A'}
</td>
        <td className="py-3 px-4">
          <div className="flex gap-2">
            <button 
              onClick={handleToggleNote}
              className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center gap-1"
              title={client.note ? 'View/Edit Note' : 'Add Note'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Note
              {client.note && (
                <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
              )}
            </button>
            <button 
              onClick={() => handleEditClient(client)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Edit
            </button>
            <button 
              onClick={() => handleDeleteClient(client)}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Delete
            </button>
          </div>
        </td>
      </tr>
      
      {/* Expandable Note Section */}
      {showNoteEditor && (
        <tr className="bg-gray-50 dark:bg-gray-800">
          <td colSpan="4" className="px-4 py-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Customer Note
              </div>
              <textarea
                value={noteText}
                onChange={handleNoteChange}
                placeholder="Add a note about this customer..."
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white resize-none"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={handleCancelNote}
                  disabled={savingNote}
                  className="px-4 py-2 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveNote(false)}
                  disabled={savingNote}
                  className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {savingNote ? 'Saving...' : 'Save Note'}
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default ClientTableRow;