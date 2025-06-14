import React, { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '../Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FilterMatchMode } from 'primereact/api';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { InputText } from 'primereact/inputtext';
import ViewSchoolProfile from '../Components/ActionButtons/ViewSchoolProfile';

export default function Schools({ auth }) {

    const [schools, setSchools] = useState([]);
    const [otherData, setOtherData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    });

    const op = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await axios.get('/get-list-of-all-schools');
                setSchools(response.data);
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

    const onGlobalFilterValueChange = (e) => {
        const value = e.target.value;
        let _filters = { ...filters };
        _filters['global'].value = value;
        setFilters(_filters);
        setGlobalFilterValue(value);
    }

    const renderHeader = () => {
        return (
            <>
                <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                    <IconField iconPosition='left'>
                        <InputIcon className='pi pi-search' />
                        <InputText className='px-7' value={globalFilterValue} onChange={onGlobalFilterValueChange} placeholder='Keyword Search' />
                    </IconField>
                </div>
            </>
        );
    }

    const header = renderHeader();

    const fetchOtherData = async (id, event) => {
        setLoading(true);
        try {
            const response = await axios.get(`/get-school-profile/${id}`);
            setOtherData(response.data);
            op.current.toggle(event);
        } catch (error) {
            console.error('Error fetching other data: ', error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Manage Schools</h2>}
        >
            <Head title="Manage School" />
            <div className='card bg-white shadow rounded-lg p-4 mb-4'>
                <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
                    <DataTable
                        value={schools}
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
                        <Column field="school" header="School Name" sortable />
                        <Column field="district" header="District Name" sortable />
                        <Column
                            header="Actions"
                            body={(rowData) => (
                                <div className='card flex flex-column align-items-center gap-1'>
                                    <ViewSchoolProfile
                                        rowData={rowData}
                                        fetchOtherData={fetchOtherData}
                                        loading={loading}
                                        otherData={otherData}
                                        op={op}
                                    />
                                </div>
                            )}
                        />
                    </DataTable>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
