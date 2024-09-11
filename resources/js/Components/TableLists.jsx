import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
// import { className } from 'primereact/utils';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Button } from 'primereact/button';

export default function TableLists({ selectedOption }) {

    const [lists, setLists] = useState([]);
    const [otherData, setOtherData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const op = useRef(null);

    const fetchOtherData = async (id, event) => {

        setLoading(true)
        try {

            const response = await axios.get(`/get-other-data/${id}`);
            setOtherData(response.data);
            op.current.toggle(event);
            setLoading(false);

        } catch {
            console.error('Error fetching data: ', error);
            setLoading(false);
        } finally {
            setLoading(false);
        }
    }

    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        account_status: { value: null, matchMode: FilterMatchMode.EQUALS },
        eligibility: { value: null, matchMode: FilterMatchMode.EQUALS }
    });

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

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {

                const response = await axios.get('/get-lists', {
                    params: { store: selectedOption || null }
                });

                setLists(response.data);
                setLoading(false);

            } catch (error) {

                console.error('Error fetching data: ', error);
                setLoading(false);

            } finally {
                setLoading(false);
            }
        }

        fetchData();

    }, [selectedOption]);

    const onglobalFilterValueChange = (e) => {
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
                    <InputText className='px-7' value={globalFilterValue} onChange={onglobalFilterValueChange} placeholder='Keyword Search' />
                </IconField>
            </div>
        );
    }

    const statusBodyTemplate = (rowData) => {
        return (
            <Tag value={rowData.account_status} severity={getStatusSeverity(rowData.account_status)} />
        );
    }

    const eligibilityBodyTemplate = (rowData) => {
        return (
            <Tag value={rowData.eligibility} severity={getEligibilitySeverity(rowData.eligibility)} />
        );
    }

    const statusItemTemplate = (option) => {
        return <Tag value={option} severity={getStatusSeverity(option)} />
    }

    const eligibilityItemTemplate = (option) => {
        return <Tag value={option} severity={getEligibilitySeverity(option)} />
    }

    const statusRowFilterTemplate = (options) => {
        return (
            <Dropdown
                value={options.value}
                options={statuses}
                onChange={(e) => options.filterApplyCallback(e.value)}
                itemTemplate={statusItemTemplate}
                placeholder='Select One'
                className="p-column-filter"
                showClear
                style={{ minWidth: '12rem' }}
            />
        );
    }

    const eligibilityRowFilterTemplate = (options) => {
        return (
            <Dropdown
                value={options.value}
                options={eligibilities}
                onChange={(e) => options.filterApplyCallback(e.value)}
                itemTemplate={eligibilityItemTemplate}
                placeholder='Select One'
                className="p-column-filter"
                showClear
                style={{ minWidth: '12rem' }}
            />
        );
    }

    const header = renderHeader();

    return (
        <div className="card">
            <DataTable
                value={lists}
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
                <Column field='name' header='Name' style={{ minWidth: '24rem' }} />
                <Column
                    field='account_status'
                    header='Status'
                    showFilterMenu={false}
                    filterMenuStyle={{ width: '8rem' }}
                    style={{ minWidth: '8rem' }}
                    body={statusBodyTemplate}
                    filter
                    filterElement={statusRowFilterTemplate}
                />
                <Column
                    field='eligibility'
                    header='Eligibility'
                    showFilterMenu={false}
                    filterMenuStyle={{ width: '8rem' }}
                    style={{ minWidth: '8rem' }}
                    body={eligibilityBodyTemplate}
                    filter
                    filterElement={eligibilityRowFilterTemplate}
                />
                <Column
                    header='Actions'
                    body={(rowData) => (
                        <div className='card flex flex-column align-items-center gap-3'>
                            <Button
                                type='button'
                                icon='pi pi-eye'
                                label='View'
                                onClick={(e) => fetchOtherData(rowData.id, e)}
                                loading={loading}
                                className='bg-gray-500 text-white p-button p-component p-button-text p-2'
                            />
                            <OverlayPanel ref={op} showCloseIcon closeOnEscape dismissable={false}>
                                <DataTable value={Array.isArray(otherData) ? otherData : [otherData]}
                                    size='small'
                                    scrollable
                                    className='text-xs'
                                >
                                    <Column field='school' header='School' />
                                    <Column field='district' header='District' />
                                    <Column field='gtd' header='Granted' />
                                    <Column field='prncpl' header='Principal' />
                                    <Column field='tsndng' header='Outstanding' />
                                    <Column field='ntrst' header='Interest' />
                                    <Column field='mrtztn' header='Amortization' />
                                    <Column field='ewrbddctn' header='EWRB Deduction' />
                                    <Column field='nthp' header='NTHP' />
                                    <Column field='nddctd' header='Undeducted' />
                                    <Column field='dedstat' header='DedStat' />
                                    <Column field='ntprcd' header='Net Proceed' />
                                    <Column field='mntd' header='Amount Due' />
                                    <Column field='engagement_status' header='Engagement Status' />
                                    <Column field='progress_report' header='Progress Report' />
                                </DataTable>
                            </OverlayPanel>
                        </div>
                    )}
                    style={{ minWidth: '8rem' }}
                />
            </DataTable>
        </div>
    );
}