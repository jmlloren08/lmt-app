import React, { useEffect, useState } from 'react';
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

export default function TableLists({ selectedOption }) {

    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [globalFilterValue, setGlobalFilterValue] = useState('');

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
                rows={10}
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
                <Column field='name' header='Name' style={{ minWidth: '12rem' }} />
                <Column
                    field='account_status'
                    header='Status'
                    showFilterMenu={false}
                    filterMenuStyle={{ width: '12rem' }}
                    style={{ minWidth: '12rem' }}
                    body={statusBodyTemplate}
                    filter
                    filterElement={statusRowFilterTemplate}
                />
                <Column
                    field='eligibility'
                    header='Eligibility'
                    showFilterMenu={false}
                    filterMenuStyle={{ width: '12rem' }}
                    style={{ minWidth: '12rem' }}
                    body={eligibilityBodyTemplate}
                    filter
                    filterElement={eligibilityRowFilterTemplate}
                />
                <Column
                    header='Actions'
                    body={(rowData) => (
                        <button className='p-button p-component p-button-text'>View</button>
                    )}
                    style={{ minWidth: '8rem' }}
                />
            </DataTable>
        </div>
    );
}