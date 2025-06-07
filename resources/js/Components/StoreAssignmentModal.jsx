import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function StoreAssignmentModal({ isOpen, onClose, user }) {
    const [stores, setStores] = useState([]);
    const [selectedStores, setSelectedStores] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchStores();
            if (user.stores) {
                setSelectedStores(user.stores.map(store => store.store_name));
            }
        }
    }, [isOpen, user]);

    const fetchStores = async () => {
        try {
            const response = await axios.get('/api/stores');
            setStores(response.data);
        } catch (error) {
            console.error('Error fetching stores:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to fetch stores'
            });
        }
    };

    const handleStoreToggle = (store) => {
        setSelectedStores(prev => 
            prev.includes(store)
                ? prev.filter(s => s !== store)
                : [...prev, store]
        );
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await axios.post(`/api/users/${user.id}/stores`, {
                stores: selectedStores
            });

            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Stores assigned successfully'
            });

            onClose();
        } catch (error) {
            console.error('Error assigning stores:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Failed to assign stores'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            className="fixed inset-0 z-10 overflow-y-auto"
        >
            <div className="flex items-center justify-center min-h-screen">
                <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

                <div className="relative bg-white rounded-lg max-w-md w-full mx-4 p-6">
                    <Dialog.Title className="text-lg font-medium mb-4">
                        Assign Stores to {user.name}
                    </Dialog.Title>

                    <div className="space-y-4">
                        <div className="max-h-60 overflow-y-auto">
                            {stores.map((store) => (
                                <div key={store} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id={store}
                                        checked={selectedStores.includes(store)}
                                        onChange={() => handleStoreToggle(store)}
                                        className="rounded border-gray-300"
                                    />
                                    <label htmlFor={store}>{store}</label>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end space-x-2 mt-4">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Dialog>
    );
} 