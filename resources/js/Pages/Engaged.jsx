import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FilterMatchMode } from 'primereact/api';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { InputText } from 'primereact/inputtext';

export default function Engaged({ auth }) {

    const [listOfTotalEngaged, setListOfTotalEngaged] = useState([]);
    const [loading, setLoading] = useState(true);
    const [globalFilterValue, setGlobalFilterValue] = useState('');

    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    });

    useEffect(() => {
        setLoading(true);
        axios.get('/get-list-for-total-engaged')
            .then(response => {
                setListOfTotalEngaged(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching data: ', error);
                setLoading(false);
            });
    }, []);

    const onGlobalFilterValueChange = (e) => {
        const value = e.target.value;
        let _filters = { ...filters };
        _filters['global'].value = value;
        setFilters(_filters);
        setGlobalFilterValue(value);
    }

    const renderHeader = () => {
        return (
            <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                <IconField iconPosition='left'>
                    <InputIcon className='pi pi-search' />
                    <InputText className='px-7' value={globalFilterValue} onChange={onGlobalFilterValueChange} placeholder='Keyword Search' />
                </IconField>
            </div>
        );
    }

    const header = renderHeader();

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Reports</h2>}
        >
            <Head title="Reports" />
            <div className="card bg-white shadow rounded-lg p-4 mb-4">
                <h3 className='font-semibold text-xl mb-4'>List of Engaged Teacher</h3>
                <DataTable
                    value={listOfTotalEngaged}
                    paginator
                    rows={5}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                    currentPageReportTemplate="{first} to {last} of {totalRecords}"
                    dataKey="id"
                    filters={filters}
                    filterDisplay="row"
                    loading={loading}
                    globalFilter={globalFilterValue}
                    header={header}
                    emptyMessage='No lists found.'
                >
                    <Column field='office' header='STORE' />
                    <Column field='district' header='DISTRICT' />
                    <Column field='school' header='SCHOOL' />
                    <Column field='name' header='NAME' />
                    <Column field='account_status' header='ACCOUNT STATUS' />
                    <Column field='eligibility' header='ELIGIBILITY' />
                    <Column field='engagement_status' header='ENGAGEMENT STATUS' />
                    <Column field='progress_report' header='PROGRESS REPORT' />
                    <Column field='action_taken_by' header='ENGAGED BY' />
                </DataTable>
            </div>
        </AuthenticatedLayout>
    );
}