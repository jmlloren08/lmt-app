import React, { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FilterMatchMode } from 'primereact/api';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';

export default function Engaged({ auth }) {

    const [listOfTotalEngaged, setListOfTotalEngaged] = useState([]);
    const [loading, setLoading] = useState(true);
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [selectedConversion, setSelectedConversion] = useState(null);
    const toast = useRef(null);

    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    });

    const userRole = auth.user.roles;
    const isAdminOrDivisionLeader = userRole === 'administrator' || userRole === 'division_leader';

    const months = [
        { label: 'All Months', value: null },
        { label: 'January', value: 0 },
        { label: 'February', value: 1 },
        { label: 'March', value: 2 },
        { label: 'April', value: 3 },
        { label: 'May', value: 4 },
        { label: 'June', value: 5 },
        { label: 'July', value: 6 },
        { label: 'August', value: 7 },
        { label: 'September', value: 8 },
        { label: 'October', value: 9 },
        { label: 'November', value: 10 },
        { label: 'December', value: 11 }
    ];

    const conversionOptions = [
        { label: 'All', value: null },
        { label: 'Yes', value: 'Yes' },
        { label: 'No', value: 'No' }
    ];

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

    const handleDownload = async (format) => {
        try {
            const response = await axios.get('/download-engaged-list', {
                params: {
                    format: format,
                    month: selectedMonth,
                    converted: selectedConversion
                },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `engaged_list.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.current.show({ severity: 'success', summary: 'Success', detail: 'File downloaded successfully', life: 3000 });
        } catch (error) {
            console.error('Error downloading file:', error);
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to download file', life: 3000 });
        }
    };

    const handleConversionChange = async (rowData, newStatus) => {
        try {
            const response = await axios.patch(`/update-conversion-status/${rowData.id}`, {
                converted: newStatus,
                converted_by: auth.user.name
            });

            // Update the local state
            setListOfTotalEngaged(prevList =>
                prevList.map(item =>
                    item.id === rowData.id
                        ? { ...item, converted: newStatus, converted_by: auth.user.name }
                        : item
                )
            );

            toast.current.show({
                severity: 'success',
                summary: 'Success',
                detail: 'Conversion status updated successfully',
                life: 3000
            });
        } catch (error) {
            console.error('Error updating conversion status:', error);
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to update conversion status',
                life: 3000
            });
        }
    };

    const conversionBodyTemplate = (rowData) => {
        if (isAdminOrDivisionLeader) {
            return (
                <div className="flex gap-2">
                    <Button
                        icon={rowData.converted === 'Yes' ? 'pi pi-check-circle' : 'pi pi-circle'}
                        className={`p-button-rounded p-button-text ${rowData.converted === 'Yes' ? 'text-green-500' : 'text-gray-400'}`}
                        onClick={() => handleConversionChange(rowData, 'Yes')}
                        tooltip="Mark as Converted"
                    />
                    <Button
                        icon={rowData.converted === 'No' ? 'pi pi-times-circle' : 'pi pi-circle'}
                        className={`p-button-rounded p-button-text ${rowData.converted === 'No' ? 'text-red-500' : 'text-gray-400'}`}
                        onClick={() => handleConversionChange(rowData, 'No')}
                        tooltip="Mark as Not Converted"
                    />
                </div>
            );
        }
        return (
            <span className={`inline-flex items-center px-2 rounded-full text-xs ${rowData.converted === 'Yes' ? 'bg-green-100 text-green-800 border border-green-400' : 'bg-red-100 text-red-800 border border-red-400'}`}>
                {rowData.converted}
            </span>
        );
    };

    const renderHeader = () => {
        return (
            <div className="flex flex-column gap-2">
                <div className="flex justify-content-between align-items-center">
                    <div className="flex gap-2">
                        <Dropdown
                            value={selectedMonth}
                            options={months}
                            onChange={(e) => setSelectedMonth(e.value)}
                            placeholder="Select Month"
                            className="w-12rem"
                        />
                        <Dropdown
                            value={selectedConversion}
                            options={conversionOptions}
                            onChange={(e) => setSelectedConversion(e.value)}
                            placeholder="Conversion Status"
                            className="w-12rem"
                        />
                        <Button
                            icon="pi pi-download"
                            label="CSV"
                            onClick={() => handleDownload('csv')}
                            className="p-button-success"
                        />
                        <Button
                            icon="pi pi-download"
                            label="Excel"
                            onClick={() => handleDownload('xlsx')}
                            className="p-button-success"
                        />
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                    <IconField iconPosition='left'>
                        <InputIcon className='pi pi-search' />
                        <InputText className='px-7' value={globalFilterValue} onChange={onGlobalFilterValueChange} placeholder='Keyword Search' />
                    </IconField>
                </div>
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
                <h3 className='font-semibold text-xl mb-4'>List of Engaged Client</h3>
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
                    header={renderHeader()}
                    emptyMessage={<div className="text-center text-gray-500">No list found.</div>}
                    scrollable
                    scrollHeight='400px'
                    className='text-xs'
                >
                    <Column field='store' header='STORE' />
                    <Column field='area' header='AREA' />
                    <Column field='school' header='SCHOOL' />
                    <Column field='name' header='NAME' />
                    <Column field='account_status' header='ACCOUNT STATUS' />
                    <Column field='renewal_remarks' header='ELIGIBILITY' />
                    <Column
                        field='converted'
                        header='CONVERTED (YES/NO)'
                        body={conversionBodyTemplate}
                    />
                    <Column field='progress_report' header='PROGRESS REPORT' />
                    <Column field='action_taken_by' header='ENGAGED BY' />
                    <Column
                        field='updated_at'
                        header='DATE ENGAGED'
                        body={(rowData) => new Date(rowData.updated_at).toLocaleString()}
                    />
                </DataTable>
                <Toast ref={toast} />
            </div>
        </AuthenticatedLayout>
    );
}