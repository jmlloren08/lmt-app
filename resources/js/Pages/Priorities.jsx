import React, { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

import { Head } from '@inertiajs/react';
import { FilterMatchMode } from 'primereact/api';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { InputText } from 'primereact/inputtext';

import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Toast } from 'primereact/toast';

const EngageDialog = React.lazy(() => import('@/Components/Dialogs/EngageDialog'));

export default function Priorities({ auth }) {

    const [listOfPriorityToEngage, setListOfPriorityToEngage] = useState([]);
    const [loading, setLoading] = useState(true);
    const [visibleEngageDialog, setVisibleEngageDialog] = useState(false);
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [engageStatus, setEngageStatus] = useState('');
    const [prData, setPrData] = useState('');
    const [priorityToEngage, setPriorityToEngage] = useState('');
    const [actionTakenBy, setActionTakenBy] = useState('');
    const [currentEngageData, setCurrentEngageData] = useState(null);

    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    });

    const userRole = auth.user.roles;
    const toast = useRef(null);
    const userName = auth.user.name;

    const fetchPriorityToEngageList = () => {
        setLoading(true);
        axios.get('/get-list-for-priority-to-engage')
            .then(response => {
                setListOfPriorityToEngage(response.data);
            })
            .catch(error => {
                console.error('Error fetching data: ', error);
            })
            .finally(() => {
                setLoading(false);
            });
    }

    useEffect(() => {
        fetchPriorityToEngageList();
    }, []);

    const onSaveEngageData = async () => {
        if (!prData) {
            toast.current.show({ severity: 'warn', summary: 'Validation Error', detail: 'Please enter action taken/remarks.', life: 3000 });
            return
        }
        try {
            const response = await axios.patch(`/save-engage-data/${currentEngageData.id}`, {
                engagement_status: engageStatus,
                progress_report: prData,
                priority_to_engage: priorityToEngage,
                action_taken_by: actionTakenBy
            });
            toast.current.show({ severity: 'success', summary: 'Success', detail: response.data.success, life: 3000 });
            fetchPriorityToEngageList();
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: error.response?.data.message || 'An error while saving the data.', life: 3000 });
        } finally {
            setVisibleEngageDialog(false);
        }
    }

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

    const showEngageDialog = (rowData) => {
        setCurrentEngageData(rowData);
        setPrData(prData);
        setEngageStatus('Engaged');
        setPriorityToEngage('No');
        setActionTakenBy(userName);
        setVisibleEngageDialog(true);
    }

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Reports</h2>}
        >
            <Head title="Priorities" />
            <div className="card bg-white shadow rounded-lg p-4 mb-4">
                <h3 className='font-semibold text-xl mb-4'>List of Priorities</h3>
                <DataTable
                    value={listOfPriorityToEngage}
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
                    {userRole === 'User' && (
                        <Column
                            header='ACTIONS'
                            body={(rowData) => (
                                <div className='card flex flex-column align-items-center gap-1'>
                                    <Button
                                        icon='pi pi-check'
                                        label='Engage'
                                        onClick={() => showEngageDialog(rowData)}
                                        className='bg-blue-500 text-white p-button p-component p-button-text p-2'
                                    />
                                </div>
                            )}
                        />
                    )}
                </DataTable>
                <Toast ref={toast} />
                <EngageDialog
                    visible={visibleEngageDialog}
                    currentEngageData={currentEngageData}
                    prData={prData}
                    setPrData={setPrData}
                    onSave={onSaveEngageData}
                    onClose={() => setVisibleEngageDialog(false)}
                />
            </div>
        </AuthenticatedLayout>
    );
}
