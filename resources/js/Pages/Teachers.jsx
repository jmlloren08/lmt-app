import React, { useState, useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';

import AuthenticatedLayout from '../Layouts/AuthenticatedLayout';
import UpdateSchoolDialog from '../Components/Dialogs/UpdateSchoolDialog';

export default function Schools({ auth }) {

    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStore, setSelectedStore] = useState(null);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedSchool, setSelectedSchool] = useState('');

    const toast = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await axios.get('/get-list-of-all-teachers');
                setTeachers(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data: ', error);
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const header = (
        <div className="flex justify-content-between align-items-center">
            <h1 className='font-semibold p-4'>List of Teachers (Schools to be identified)</h1>
        </div>
    );

    const handleShowAssignSchoolDialog = async (teacher) => {
        setSelectedTeacher(teacher.id);
        setSelectedStore(teacher.office);
        setDialogVisible(true);
    }

    const onSave = async () => {
        if (!selectedDistrict || !selectedSchool) {
            toast.current.show({ severity: 'warn', summary: 'Validation Error', detail: 'Please select a district and school before saving.', life: 3000 });
            return
        }
        try {
            const response = await axios.patch(`/update-teacher-school/${selectedTeacher}`, {
                district: selectedDistrict,
                school: selectedSchool
            });
            setTeachers((prevTeachers) =>
                prevTeachers.map((teacher) => {
                    if (teacher.id === selectedTeacher) {
                        return { ...teacher, district: selectedDistrict, school: selectedSchool }
                    }
                    return teacher;
                }).filter((teacher) => teacher.district === 'SCHOOL TO BE IDENTIFY' && teacher.school === 'SCHOOL TO BE IDENTIFY')
            );
            toast.current.show({ severity: 'success', summary: 'Success', detail: response.data.success, life: 3000 });
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: error.response?.data.message || 'An error while updating the school.', life: 3000 });
        } finally {
            setDialogVisible(false);
        }
    }

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Manage Teachers</h2>}
        >
            <Head title="Manage School" />
            <div className='card bg-white shadow rounded-lg p-4 mb-4'>
                <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
                    <DataTable
                        value={teachers}
                        header={header}
                        loading={loading}
                        scrollable
                        scrollHeight='400px'
                        paginator
                        rows={10}
                        className="p-datatable-xs"
                    >
                        <Column field="name" header="Name" sortable />
                        <Column field="office" header="Store Name" sortable />
                        <Column field="district" header="District Name" sortable />
                        <Column field="school" header="School Name" sortable />
                        <Column
                            header="Actions"
                            body={(rowData) => (
                                <div className='card flex flex-column align-items-center gap-1'>
                                    <button
                                        onClick={() => handleShowAssignSchoolDialog(rowData)}
                                        className='hover:text-blue-500 hover:cursor-pointer'
                                        title='Assign School'
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                        </svg>
                                    </button>
                                </div>
                            )}
                        />
                    </DataTable>
                </div>
            </div>
            <Toast ref={toast} />
            {dialogVisible && (
                <UpdateSchoolDialog
                    visible={dialogVisible}
                    selectedStore={selectedStore}
                    selectedTeacher={selectedTeacher}
                    selectedDistrict={selectedDistrict}
                    setSelectedDistrict={setSelectedDistrict}
                    selectedSchool={selectedSchool}
                    setSelectedSchool={setSelectedSchool}
                    onAssign={onSave}
                    onClose={() => setDialogVisible(false)}
                />
            )}
        </AuthenticatedLayout>
    );
}
