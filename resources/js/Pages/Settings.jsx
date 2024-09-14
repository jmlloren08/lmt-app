import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
const UserActionButtons = React.lazy(() => import('@/Components/ActionButtons/UserActionButtons'));
const UpdateDialog = React.lazy(() => import('@/Components/Dialogs/UpdateDialog'));
const CancelDialog = React.lazy(() => import('@/Components/Dialogs/CancelDialog'));
const RemoveDialog = React.lazy(() => import('@/Components/Dialogs/RemoveDialog'));
const AssignStoreDialog = React.lazy(() => import('@/Components/Dialogs/AssignStoreDialog'));

export default function Settings({ auth }) {

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [visibleUpdateDialog, setVisibleUpdateDialog] = useState(false);
    const [visibleCancelDialog, setVisibleCancelDialog] = useState(false);
    const [visibleRemoveDialog, setVisibleRemoveDialog] = useState(false);
    const [visibleStoreDialog, setVisibleStoreDialog] = useState(false);
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedStore, setSelectedStore] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [stores, setStores] = useState([]);

    const userId = auth.user.id;
    const toast = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await axios.get('/get-users-list');
                setUsers(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data: ', error);
                setLoading(false);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    useEffect(() => {
        axios.get('/get-stores')
            .then(response => {
                setStores(response.data);
            })
            .catch(error => {
                console.error('Error fetching data: ', error);
            });
    }, []);

    const getRoleLevel = (role) => {
        if (!role) {
            return 'danger';
        }
        switch (role) {
            case 'Administrator':
                return 'info';
            case 'User':
                return 'warning';
        }
    }

    const getStatusLevel = (status) => {
        if (!status) {
            return 'danger';
        }
        return 'success';
    }

    const roleBodyTemplate = (rowData) => {
        const roleText = rowData.roles ? rowData.roles : 'Unassigned';
        return (
            <Tag value={roleText} severity={getRoleLevel(rowData.roles)} />
        );
    }

    const statusBodyTemplate = (rowData) => {
        const statusText = rowData.email_verified_at ? 'Verified' : 'Unverified';
        return (
            <Tag value={statusText} severity={getStatusLevel(rowData.email_verified_at)} />
        );
    }

    const dateTimeBodyTemplate = (rowData) => {
        let date = rowData.created_at ? new Date(rowData.created_at) : new Date(rowData.updated_at);
        const formattedDate = date.toLocaleString('en-PH', {
            timeZone: 'Asia/Manila',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });

        return formattedDate.replace(',', '');
    }

    const save = async () => {
        if (!selectedRole) {
            toast.current.show({ severity: 'warn', summary: 'Validation Error', detail: 'Please select a role before saving.', life: 3000 });
            return
        }
        try {
            const response = await axios.patch(`/update-user-role/${selectedUser.id}`, {
                roles: selectedRole
            });
            toast.current.show({ severity: 'success', summary: 'Success', detail: response.data.success, life: 3000 });
            setUsers((prevUsers) => prevUsers.map((user) => user.id === selectedUser.id ? { ...user, roles: selectedRole } : user));
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: error.response?.data.message || 'An error while updating the role.', life: 3000 });
        } finally {
            setVisibleUpdateDialog(false);
        }
    }

    const cancel = async () => {
        try {
            const response = await axios.patch(`/cancel-user-role/${selectedUser.id}`, {
                roles: null
            });
            toast.current.show({ severity: 'success', summary: 'Success', detail: response.data.success, life: 3000 });
            setVisibleCancelDialog(false);
            setUsers((prevUsers) => prevUsers.map((user) => user.id === selectedUser.id ? { ...user, roles: selectedRole } : user));
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: error.response?.data.message || 'An error while updating the role.', life: 3000 });
            setVisibleCancelDialog(false);
        }
    }

    const remove = async () => {
        try {
            const response = await axios.delete(`/remove-user/${selectedUser.id}`);
            toast.current.show({ severity: 'success', summary: 'Success', detail: response.data.success, life: 3000 });
            setVisibleRemoveDialog(false);
            setUsers((prevUsers) => prevUsers.filter(user => user.id !== selectedUser.id));
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: error.response?.data.message || 'An error while updating the role.', life: 3000 });
            setVisibleRemoveDialog(false);
        }
    }

    const assign = async () => {
        if (!selectedStore) {
            toast.current.show({ severity: 'warn', summary: 'Validation Error', detail: 'Please select a store before saving.', life: 3000 });
            return
        }
        try {
            const response = await axios.patch(`/assign-user-store/${selectedUser.id}`, {
                office: selectedStore
            });
            toast.current.show({ severity: 'success', summary: 'Success', detail: response.data.success, life: 3000 });
            setVisibleStoreDialog(false);
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: error.response?.data.message || 'An error while updating the role.', life: 3000 });
            setVisibleStoreDialog(false);
        }
    }

    const showUpdateDialog = (user) => {
        setSelectedUser(user);
        setSelectedRole(user.roles || 'User');
        setVisibleUpdateDialog(true);
    }

    const showCancelDialog = (user) => {
        setSelectedUser(user);
        setSelectedRole(null);
        setVisibleCancelDialog(true);
    }

    const showRemoveDialog = (user) => {
        setSelectedUser(user);
        setVisibleRemoveDialog(true);
    }

    const showStoreDialog = (user) => {
        setSelectedUser(user);
        setSelectedStore(user.office || 'GINGOOG STORE');
        setVisibleStoreDialog(true);
    }

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Settings</h2>}
        >
            <Head title="Settings" />
            <div className='card bg-white shadow rounded-lg p-4 mb-4'>
                <h3 className='font-semibold text-xl mb-4'>User List</h3>
                <DataTable
                    value={users}
                    tableStyle={{ minWidth: '50rem' }}
                    loading={loading}
                >
                    <Column field='name' header='Name' body={(rowData) => (
                        <>
                            {rowData.id === userId ? (
                                <span>{`${rowData.name} (You)`}</span>
                            ) : (
                                <span>{rowData.name}</span>
                            )}
                        </>
                    )} />
                    <Column field='email' header='EMAIL' />
                    <Column field='email_verified_at' header='STATUS' body={statusBodyTemplate} />
                    <Column field='roles' header='ROLE' body={roleBodyTemplate} />
                    <Column field='created_at' header='CREATED AT' body={dateTimeBodyTemplate} />
                    <Column field='updated_at' header='UPDATED AT' body={dateTimeBodyTemplate} />
                    <Column
                        header='ACTION'
                        body={(rowData) => (
                            <UserActionButtons rowData={rowData} showUpdateDialog={showUpdateDialog} showCancelDialog={showCancelDialog} showRemoveDialog={showRemoveDialog} showStoreDialog={showStoreDialog} />
                        )}
                    />
                </DataTable>
            </div >

            <Toast ref={toast} />

            <UpdateDialog visible={visibleUpdateDialog} selectedRole={selectedRole} setSelectedRole={setSelectedRole} onSave={save} onClose={() => setVisibleUpdateDialog(false)} />

            <CancelDialog visible={visibleCancelDialog} onCancel={cancel} onClose={() => setVisibleCancelDialog(false)} />

            <RemoveDialog visible={visibleRemoveDialog} onRemove={remove} onClose={() => setVisibleRemoveDialog(false)} />

            <AssignStoreDialog visible={visibleStoreDialog} stores={stores} selectedStore={selectedStore} setSelectedStore={setSelectedStore} onAssign={assign} onClose={() => setVisibleStoreDialog(false)} />

        </AuthenticatedLayout >
    );
}