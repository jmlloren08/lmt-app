import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';

export default function Settings({ auth }) {

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

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

        let date;

        if (rowData.created_at) {
            date = new Date(rowData.created_at)
        } else if (rowData.updated_at) {
            date = new Date(rowData.updated_at)
        } else {
            return 'No data';
        }

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
                    <Column field='name' header='Name' />
                    <Column field='email' header='Email' />
                    <Column field='email_verified_at' header='Status' body={statusBodyTemplate} />
                    <Column field='roles' header='Role' body={roleBodyTemplate} />
                    <Column field='created_at' header='CREATED AT' body={dateTimeBodyTemplate} />
                    <Column field='updated_at' header='UPDATED AT' body={dateTimeBodyTemplate} />
                    <Column
                        header='ACTION'
                        body={(rowData) => (
                            <div className='flex flex-col md:flex-row md:space-x-2 justify-items-center items-center'>
                                <button
                                    className='bg-blue-600 text-white p-button p-component p-button-text p-1 mb-1 md:mb-0'
                                    onClick={() => handleAssignUser(rowData)}
                                >
                                    Assign
                                </button>
                                <button
                                    className='bg-red-500 text-white p-button p-component p-button-text p-1'
                                    onClick={() => handleRemoveUser(rowData)}
                                    style={{ marginLeft: '5px' }}
                                >
                                    Remove
                                </button>
                            </div>
                        )}
                    />
                </DataTable>
            </div>
        </AuthenticatedLayout>
    );
}