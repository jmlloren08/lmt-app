import React, { useState, useEffect } from 'react';
import { Head, useForm, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import axios from 'axios';
import Swal from 'sweetalert2';

// Import existing components
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';

export default function Index({ auth, users, userRole, flash }) {
    const [selectedUser, setSelectedUser] = useState(null);
    const [showRoleDialog, setShowRoleDialog] = useState(false);
    const [showRemoveDialog, setShowRemoveDialog] = useState(false);
    const [isAssigning, setIsAssigning] = useState(false);

    const { data, setData, processing, errors, reset, setError, clearErrors } = useForm({
        role: '',
    });

    const getAvailableRoles = () => {
        switch (userRole) {
            case 'administrator':
                return [
                    { value: 'division_leader', label: 'Division Leader' },
                    { value: 'team_leader', label: 'Team Leader' },
                    { value: 'loan_specialist', label: 'Loan Specialist' }
                ];
            case 'division_leader':
                return [
                    { value: 'team_leader', label: 'Team Leader' },
                    { value: 'loan_specialist', label: 'Loan Specialist' }
                ];
            case 'team_leader':
                return [
                    { value: 'loan_specialist', label: 'Loan Specialist' }
                ];
            default:
                return [];
        }
    };

    const handleAssignRole = async () => {
        setIsAssigning(true);
        clearErrors();

        try {
            const response = await axios.patch(route('users.assign-role', selectedUser.id), {
                role: data.role
            });

            if (response.data.success) {
                await Swal.fire({
                    title: 'Success!',
                    text: response.data.message,
                    icon: 'success',
                    confirmButtonText: 'OK'
                });

                setShowRoleDialog(false);
                setSelectedUser(null);
                reset();

                // Reload the page to refresh the user list
                window.location.reload();
            }
        } catch (error) {
            console.error('Role assignment error:', error);

            if (error.response?.data?.errors) {
                // Handle validation errors
                Object.keys(error.response.data.errors).forEach(key => {
                    setError(key, error.response.data.errors[key][0]);
                });
            } else {
                const errorMessage = error.response?.data?.message || 'Failed to assign role';
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

    const handleRemoveUser = () => {
        router.delete(route('users.delete', selectedUser.id), {
            preserveScroll: true,
            onSuccess: () => {
                setShowRemoveDialog(false);
                setSelectedUser(null);
            },
            onError: () => {
                Swal.fire({
                    title: 'Error!',
                    text: 'Failed to remove user. Please try again.',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        });
    };

    const openRoleDialog = (user) => {
        setSelectedUser(user);
        reset();
        setShowRoleDialog(true);
    };

    const openRemoveDialog = (user) => {
        setSelectedUser(user);
        setShowRemoveDialog(true);
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="User Management" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-semibold">User Management - Role Assignment</h2>
                                <Link
                                    href={route('store-management')}
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                >
                                    Store Management
                                </Link>
                            </div>
                            <div className="mb-4 text-sm text-gray-600">
                                <p>This page displays newly registered users without assigned roles. Once a role is assigned, users will appear in the Store Management page for store assignment.</p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50"><tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr></thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {users.map(user => (<tr key={user.id}>
                                            <td className="text-sm px-6 py-4 whitespace-nowrap">{user.name}</td>
                                            <td className="text-sm px-6 py-4 whitespace-nowrap">{user.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {user.roles === 'division_leader' ? (
                                                    <span className="text-xs bg-green-200 text-green-800 py-1 px-2 rounded-full">{user.roles}</span>
                                                ) : user.roles === 'team_leader' ? (
                                                    <span className="text-xs bg-blue-200 text-blue-800 py-1 px-2 rounded-full">{user.roles}</span>
                                                ) : user.roles === 'loan_specialist' ? (
                                                    <span className="text-xs bg-yellow-200 text-yellow-800 py-1 px-2 rounded-full">{user.roles}</span>
                                                ) : (
                                                    <span className="text-xs bg-red-200 text-red-800 py-1 px-2 rounded-full">no role assigned</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex space-x-2">
                                                    <PrimaryButton onClick={() => openRoleDialog(user)}>
                                                        {user.roles === 'administrator' || user.roles === 'user' ? 'Assign Role' : 'Change Role'}
                                                    </PrimaryButton>
                                                    {(userRole === 'administrator' || userRole === 'division_leader') && (
                                                        <DangerButton onClick={() => openRemoveDialog(user)}>
                                                            Remove
                                                        </DangerButton>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Role Assignment Dialog */}
            <Modal show={showRoleDialog} onClose={() => setShowRoleDialog(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        Assign Role to {selectedUser?.name}
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="role" value="Role" />
                            <select
                                id="role"
                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                value={data.role}
                                onChange={(e) => setData('role', e.target.value)}
                            >
                                <option value="">Select a role</option>
                                {getAvailableRoles().map((role) => (
                                    <option key={role.value} value={role.value}>
                                        {role.label}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.role} className="mt-2" />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                        <SecondaryButton onClick={() => setShowRoleDialog(false)}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton
                            onClick={handleAssignRole}
                            disabled={isAssigning}
                        >
                            {isAssigning ? 'Assigning...' : 'Assign Role'}
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>            {/* Remove User Dialog */}
            <Modal show={showRemoveDialog} onClose={() => setShowRemoveDialog(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        Remove User
                    </h2>
                    <p className="text-sm text-gray-600 mb-6">
                        Are you sure you want to remove {selectedUser?.name}? This action cannot be undone.
                    </p>
                    <div className="flex justify-end space-x-3">
                        <SecondaryButton onClick={() => setShowRemoveDialog(false)}>
                            Cancel
                        </SecondaryButton>
                        <DangerButton onClick={handleRemoveUser}>
                            Remove User
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}