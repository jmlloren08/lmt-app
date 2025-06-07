import React, { useState, useEffect } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import axios from 'axios';
import Swal from 'sweetalert2';

// Import existing components
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';

export default function Index({ auth, users, userRole, flash }) {
    const [selectedUser, setSelectedUser] = useState(null);
    const [showStoreDialog, setShowStoreDialog] = useState(false);
    const [availableStores, setAvailableStores] = useState([]);
    const [availableAreas, setAvailableAreas] = useState([]);
    const [isAssigning, setIsAssigning] = useState(false);
    const [isLoadingAreas, setIsLoadingAreas] = useState(false);

    const { data, setData, processing, errors, reset, setError, clearErrors } = useForm({
        store: '',
        area: '',
    });

    useEffect(() => {
        fetchAvailableStores();
    }, []);

    useEffect(() => {
        if (data.store) {
            fetchAreasForStore(data.store);
        } else {
            setAvailableAreas([]);
            setData('area', '');
        }
    }, [data.store]);

    const fetchAvailableStores = async () => {
        try {
            const response = await axios.get('/store-management/distinct-stores');
            setAvailableStores(response.data);
        } catch (error) {
            console.error('Failed to fetch stores:', error);
        }
    };

    const fetchAreasForStore = async (storeName) => {
        setIsLoadingAreas(true);
        try {
            const response = await axios.get(`/store-management/areas/${storeName}`);
            setAvailableAreas(response.data);
        } catch (error) {
            console.error('Failed to fetch areas:', error);
        } finally {
            setIsLoadingAreas(false);
        }
    };

    const handleStoreAssignment = async () => {
        setIsAssigning(true);
        clearErrors();

        try {
            const response = await axios.patch(route('stores.assign-store', selectedUser.id), {
                store_name: data.store,
                area_name: data.area
            });

            if (response.data.success) {
                await Swal.fire({
                    title: 'Success!',
                    text: response.data.message,
                    icon: 'success',
                    confirmButtonText: 'OK'
                });

                setShowStoreDialog(false);
                setSelectedUser(null);
                reset();

                // Reload the page to refresh the user list
                window.location.reload();
            }
        } catch (error) {
            console.error('Store assignment error:', error);

            if (error.response?.data?.errors) {
                // Handle validation errors
                Object.keys(error.response.data.errors).forEach(key => {
                    setError(key, error.response.data.errors[key][0]);
                });
            } else {
                const errorMessage = error.response?.data?.message || 'Failed to assign store';
                await Swal.fire({
                    title: 'Error!',
                    text: errorMessage,
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        } finally {
            setIsAssigning(false);
        }
    };

    const openStoreDialog = (user) => {
        setSelectedUser(user);
        setData({
            store: user.store || '',
            area: user.area || ''
        });
        setShowStoreDialog(true);
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'administrator':
                return 'bg-gray-100 text-gray-800';
            case 'division_leader':
                return 'bg-green-100 text-green-800';
            case 'team_leader':
                return 'bg-blue-100 text-blue-800';
            case 'loan_specialist':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const showAreaField = selectedUser?.roles === 'loan_specialist';

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Store Management" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-semibold">Store Management - Store Assignment</h2>
                                <Link
                                    href={route('user-management')}
                                    className="inline-flex items-center px-4 py-2 bg-gray-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                >
                                    User Management
                                </Link>
                            </div>
                            <div className="mb-4 text-sm text-gray-600">
                                <p>This page displays users with assigned roles. You can assign a store to Division Leaders and Team Leaders. Loan Specialists require both store and area assignment.</p>
                            </div>

                            {users && users.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">No users with assigned roles found.</p>
                                    <Link
                                        href={route('user-management')}
                                        className="text-blue-600 hover:text-blue-500 mt-2 inline-block"
                                    >
                                        Go to User Management to assign roles first
                                    </Link>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50"><tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Store</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Area</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr></thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {users && users.length > 0 ? (
                                                users.map(user => (
                                                    <tr key={user.id}>
                                                        <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">{user.roles && <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.roles)}`}>{user.roles}</span>}</td>
                                                        <td className='px-6 py-4 whitespace-nowrap'>{user.store || 'No store assigned'}</td>
                                                        <td className='px-6 py-4 whitespace-nowrap'>{user.area || 'No area assigned'}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {(user.roles === 'administrator' || user.roles === 'division_leader' || user.roles === 'team_leader' || user.roles === 'loan_specialist') ? (
                                                                <PrimaryButton onClick={() => openStoreDialog(user)}>
                                                                    {user.store ? 'Update' : 'Assign Store'}
                                                                </PrimaryButton>
                                                            ) : (
                                                                <span className="text-gray-400 text-sm">Not eligible for store assignment</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                                        No users found.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Store Assignment Dialog */}
            <Modal show={showStoreDialog} onClose={() => setShowStoreDialog(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        Assign Store to {selectedUser?.name}
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="store" value="Select Store" />
                            <select
                                id="store"
                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                value={data.store}
                                onChange={(e) => setData('store', e.target.value)}
                            >
                                <option value="">Select a store</option>
                                {availableStores.map((store) => (
                                    <option key={store.value} value={store.value}>
                                        {store.label}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.store} className="mt-2" />
                        </div>

                        {showAreaField && (
                            <div>
                                <InputLabel htmlFor="area" value="Select Area (Optional)" />
                                <select
                                    id="area"
                                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                    value={data.area}
                                    onChange={(e) => setData('area', e.target.value)}
                                    disabled={isLoadingAreas}
                                >
                                    <option value="">Select an area</option>
                                    {availableAreas.map((area) => (
                                        <option key={area.value} value={area.value}>
                                            {area.label}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.area} className="mt-2" />
                                {isLoadingAreas && (
                                    <p className="mt-1 text-sm text-gray-500">Loading areas...</p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                        <SecondaryButton onClick={() => setShowStoreDialog(false)}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton
                            onClick={handleStoreAssignment}
                            disabled={isAssigning || !data.store || (showAreaField && isLoadingAreas)}
                        >
                            {isAssigning ? 'Assigning...' : 'Assign Store'}
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
