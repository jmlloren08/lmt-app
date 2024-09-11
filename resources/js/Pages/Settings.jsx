import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { ButtonGroup } from 'primereact/buttongroup';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';

export default function Settings({ auth }) {

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [visibleUpdateDialog, setVisibleUpdateDialog] = useState(false);
    const [visibleCancelDialog, setVisibleCancelDialog] = useState(false);
    const [visibleRemoveDialog, setVisibleRemoveDialog] = useState(false);
    const [selectedOption, setSelectedOption] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);

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
        if (!selectedOption) {
            toast.current.show({ severity: 'warn', summary: 'Validation Error', detail: 'Please select a role before saving.', life: 3000 });
            return
        }
        try {
            const response = await axios.patch(`/update-user-role/${selectedUser.id}`, {
                roles: selectedOption
            });
            toast.current.show({ severity: 'success', summary: 'Success', detail: response.data.success, life: 3000 });
            setVisibleUpdateDialog(false);
            setUsers((prevUsers) => prevUsers.map((user) => user.id === selectedUser.id ? { ...user, roles: selectedOption } : user));
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: error.response?.data.message || 'An error while updating the role.', life: 3000 });
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
            setUsers((prevUsers) => prevUsers.map((user) => user.id === selectedUser.id ? { ...user, roles: selectedOption } : user));
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

    const showUpdateDialog = (user) => {
        setSelectedUser(user);
        setSelectedOption(user.roles || 'User');
        setVisibleUpdateDialog(true);
    }

    const showCancelDialog = (user) => {
        setSelectedUser(user);
        setSelectedOption(null);
        setVisibleCancelDialog(true);
    }

    const showRemoveDialog = async (user) => {
        setSelectedUser(user);
        setVisibleRemoveDialog(true);
    }

    const updateDialogFooter = (
        <div className='card flex justify-end gap-2'>
            <Button
                label='Save'
                icon='pi pi-check'
                onClick={save}
                autoFocus
                className='bg-blue-500 text-white font-medium p-button-text px-2'
            />
            <Button
                label='Cancel'
                icon='pi pi-times'
                onClick={() => setVisibleUpdateDialog(false)}
                className='bg-gray-500 text-white p-button-text p-2'
            />
        </div>
    );

    const cancelDialogFooter = (
        <div className='card flex justify-end gap-2'>
            <Button
                label='Delete'
                icon='pi pi-trash'
                onClick={cancel}
                autoFocus
                className='bg-red-500 text-white font-medium p-button-text px-2'
            />
            <Button
                label='Cancel'
                icon='pi pi-times'
                onClick={() => setVisibleCancelDialog(false)}
                className='bg-gray-500 text-white p-button-text p-2'
            />
        </div>
    );

    const removeDialogFooter = (
        <div className='card flex justify-end gap-2'>
            <Button
                label='Remove'
                icon='pi pi-trash'
                onClick={remove}
                autoFocus
                className='bg-red-500 text-white font-medium p-button-text px-2'
            />
            <Button
                label='Cancel'
                icon='pi pi-times'
                onClick={() => setVisibleRemoveDialog(false)}
                className='bg-gray-500 text-white p-button-text p-2'
            />
        </div>
    );

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
                    <Column field='email' header='Email' />
                    <Column field='email_verified_at' header='Status' body={statusBodyTemplate} />
                    <Column field='roles' header='Role' body={roleBodyTemplate} />
                    <Column field='created_at' header='CREATED AT' body={dateTimeBodyTemplate} />
                    <Column field='updated_at' header='UPDATED AT' body={dateTimeBodyTemplate} />
                    <Column
                        header='ACTION'
                        body={(rowData) => (
                            <div className='card flex justify-content-center'>
                                {rowData.roles !== 'Administrator' && (
                                    <ButtonGroup>
                                        {rowData.email_verified_at !== null && (
                                            <Button
                                                onClick={() => showUpdateDialog(rowData)}
                                                icon={`pi ${rowData.roles === 'User' ? 'pi-user-edit' : 'pi-user-plus'}`}
                                                tooltip='Assign/Modify Role'
                                                className='bg-blue-500 text-white p-2'
                                            />
                                        )}
                                        {rowData.roles === 'User' && (
                                            <Button
                                                onClick={() => showCancelDialog(rowData)}
                                                icon='pi pi-times'
                                                tooltip='Cancel Role'
                                                className='bg-yellow-500 text-white font-medium p-2'
                                            />
                                        )}
                                        <Button
                                            onClick={() => showRemoveDialog(rowData)}
                                            icon='pi pi-trash'
                                            tooltip='Remove User'
                                            className='bg-red-500 text-white font-medium p-2'
                                        />
                                    </ButtonGroup>
                                )}
                                <Toast ref={toast} />
                                {visibleUpdateDialog && (
                                    <Dialog
                                        modal
                                        header='Assign/Modify User Role'
                                        visible={visibleUpdateDialog}
                                        style={{ width: '24vw' }}
                                        onHide={() => setVisibleUpdateDialog(false)}
                                        footer={updateDialogFooter}
                                    >
                                        <div className='flex items-center'>
                                            <div className='p-2'>
                                                <label className='text-gray-900'>Role</label>
                                            </div>
                                            <div className="p-2">
                                                <select
                                                    value={selectedOption}
                                                    onChange={(e) => { setSelectedOption(e.target.value) }}
                                                    className='relative z-20 w-full rounded border py-3 px-5 outline-none'
                                                >
                                                    <option value="" disabled>Select</option>
                                                    <option value="User">User</option>
                                                    <option value="Administrator">Administrator</option>
                                                </select>
                                            </div>
                                        </div>
                                    </Dialog >
                                )}
                                {visibleCancelDialog && (
                                    <Dialog
                                        modal
                                        header='Cancel User Role'
                                        visible={visibleCancelDialog}
                                        style={{ width: '24vw' }}
                                        onHide={() => setVisibleCancelDialog(false)}
                                        footer={cancelDialogFooter}
                                    >
                                        <div className='flex items-center'>
                                            <p className='m-0'>
                                                Are you sure you want to cancel the role of this User?
                                            </p>
                                        </div>
                                    </Dialog >
                                )}
                                {visibleRemoveDialog && (
                                    <Dialog
                                        modal
                                        header='Remove User'
                                        visible={visibleRemoveDialog}
                                        style={{ width: '24vw' }}
                                        onHide={() => setVisibleRemoveDialog(false)}
                                        footer={removeDialogFooter}
                                    >
                                        <div className='flex items-center'>
                                            <p className='m-0'>
                                                Are you sure you want to remove this user?
                                            </p>
                                        </div>
                                    </Dialog >
                                )}
                            </div>
                        )}
                    />
                </DataTable>
            </div >
        </AuthenticatedLayout >
    );
}