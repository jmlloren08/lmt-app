import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

import { FilterMatchMode } from 'primereact/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';

const PriorityToEngage = React.lazy(() => import('./Dialogs/PriorityToEngageDialog'));
const StatusFilter = React.lazy(() => import('./Filters/StatusFilter'));
const EligibilityFilter = React.lazy(() => import('./Filters/EligibilityFilter'));
const ViewActionButton = React.lazy(() => import('./ActionButtons/ViewActionButton'));
const EngageDialog = React.lazy(() => import('./Dialogs/EngageDialog'));

export default function TableLists({ selectedSchool, auth, refreshTotalEngaged, refreshPriorityToEngage }) {

    const [listWhereSchoolIs, setListWhereSchoolIs] = useState([]);
    const [otherData, setOtherData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [visibleEngageDialog, setVisibleEngageDialog] = useState(false);
    const [visiblePriorityDialog, setVisiblePriorityDialog] = useState(false);
    const [currentEngageData, setCurrentEngageData] = useState(null);
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [engageStatus, setEngageStatus] = useState('');
    const [prData, setPrData] = useState('');
    const [priorityStatus, setPriorityStatus] = useState('');
    const [actionTakenBy, setActionTakenBy] = useState('');

    const op = useRef(null);
    const toast = useRef(null);
    const userRole = auth.user.roles;
    const userName = auth.user.name;

    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        account_status: { value: null, matchMode: FilterMatchMode.EQUALS },
        eligibility: { value: null, matchMode: FilterMatchMode.EQUALS }
    });

    const fetchOtherData = async (id, event) => {
        setLoading(true)
        try {
            const response = await axios.get(`/get-other-data/${id}`);
            setOtherData(response.data);
            op.current.toggle(event);
        } catch {
            console.error('Error fetching data: ', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await axios.get('/get-list-where-school-is', {
                    params: { school: selectedSchool || null }
                });
                setListWhereSchoolIs(response.data);
            } catch (error) {
                console.error('Error fetching data: ', error);
            } finally {
                setLoading(false);
            }
        }
        if (selectedSchool) {
            fetchData();
        }
    }, [selectedSchool]);

    const onSaveEngageData = async () => {
        if (!prData) {
            toast.current.show({ severity: 'warn', summary: 'Validation Error', detail: 'Please enter action taken/remarks.', life: 3000 });
            return
        }
        try {
            const response = await axios.patch(`/save-engage-data/${currentEngageData.id}`, {
                engagement_status: engageStatus,
                progress_report: prData,
                action_taken_by: actionTakenBy
            });
            toast.current.show({ severity: 'success', summary: 'Success', detail: response.data.success, life: 3000 });
            if (typeof refreshTotalEngaged === 'function') {
                refreshTotalEngaged();
            }
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: error.response?.data.message || 'An error while saving the data.', life: 3000 });
        } finally {
            setVisibleEngageDialog(false);
        }
    }

    const proceed = async () => {
        try {
            const response = await axios.patch(`/update-priority-to-engage/${currentEngageData.id}`, {
                priority_to_engage: priorityStatus
            });
            toast.current.show({ severity: 'success', summary: 'Success', detail: response.data.success, life: 3000 });
            if (typeof refreshPriorityToEngage === 'function') {
                refreshPriorityToEngage();
            }
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: error.response?.data.message || 'An error while updating the data.', life: 3000 });
        } finally {
            setVisiblePriorityDialog(false);
        }
    }

    const [statuses] = useState([
        'Current',
        'WRITTEN OFF',
        'Non Performing Pastdue',
        'Performing Pastdue',
        'New Possible PD',
        'Possible Non Performing',
        'NTB'
    ]);

    const [eligibilities] = useState([
        'QUALIFIED',
        'FOR RECOVERY',
        'NOT QUALIFIED'
    ]);

    const getStatusSeverity = (status) => {
        switch (status) {
            case 'Current':
                return 'info';
            case 'WRITTEN OFF':
                return 'danger';
            case 'Non Performing Pastdue':
                return 'warning';
            case 'Performing Pastdue':
                return 'success';
            case 'New Possible PD':
                return 'info';
            case 'Possible Non Performing':
                return 'warning';
            case 'NTB':
                return 'info'
        }
    }

    const getEligibilitySeverity = (eligibility) => {
        switch (eligibility) {
            case 'QUALIFIED':
                return 'success'
            case 'FOR RECOVERY':
                return 'warning';
            case 'NOT QUALIFIED':
                return 'danger';
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
        setActionTakenBy(userName);
        setVisibleEngageDialog(true);
    }

    const showPriorityDialog = (rowData) => {
        setCurrentEngageData(rowData);
        setPriorityStatus('Yes');
        setVisiblePriorityDialog(true);
    }

    return (
        <div className="card">
            <DataTable
                value={listWhereSchoolIs}
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
                emptyMessage='No list found.'
            >
                <Column field='name' header='NAME' style={{ minWidth: '24rem' }} />
                <Column
                    field='account_status'
                    header='ACCOUNT STATUS'
                    showFilterMenu={false}
                    body={(rowData) => <Tag value={rowData.account_status} severity={getStatusSeverity(rowData.account_status)} />}
                    filter
                    filterElement={(options) => <StatusFilter value={options.value} options={statuses} onChange={options.filterApplyCallback} getStatusSeverity={getStatusSeverity} />}
                />
                <Column
                    field='eligibility'
                    header='ELIGIBILITY'
                    showFilterMenu={false}
                    body={(rowData) => <Tag value={rowData.eligibility} severity={getEligibilitySeverity(rowData.eligibility)} />}
                    filter
                    filterElement={(options) => <EligibilityFilter value={options.value} options={eligibilities} onChange={options.filterApplyCallback} getEligibilitySeverity={getEligibilitySeverity} />}
                />
                <Column
                    header='ACTIONS'
                    body={(rowData) => (
                        <div className='card flex flex-column align-items-center gap-1'>
                            <ViewActionButton
                                rowData={rowData}
                                fetchOtherData={fetchOtherData}
                                loading={loading}
                                otherData={otherData}
                                op={op}
                            />
                            {userRole === 'User' ? (
                                <Button
                                    icon='pi pi-check'
                                    label='Engage'
                                    onClick={() => showEngageDialog(rowData)}
                                    className='bg-blue-500 text-white p-button p-component p-button-text p-2'
                                />
                            ) : (
                                <Button
                                    icon='pi pi-check'
                                    label='Priority'
                                    onClick={() => showPriorityDialog(rowData)}
                                    className='bg-red-500 text-white p-button p-component p-button-text p-2'
                                />
                            )}
                        </div>
                    )}
                />
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
            <PriorityToEngage
                visible={visiblePriorityDialog}
                onProceed={proceed}
                onClose={() => setVisiblePriorityDialog(false)}
            />
        </div>
    );
}