import React, { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '../Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import ViewSchoolProfile from '../Components/ActionButtons/ViewSchoolProfile';

export default function Schools({ auth }) {

    const [schools, setSchools] = useState([]);
    const [otherData, setOtherData] = useState([]);
    const [loading, setLoading] = useState(true);

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

    const header = (
        <div className="flex justify-content-between align-items-center">
            <h1 className='font-semibold p-4'>List of Schools</h1>
        </div>
    );

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
                        header={header}
                        loading={loading}
                        scrollable
                        scrollHeight='400px'
                        paginator
                        rows={10}
                        className="p-datatable-xs"
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
