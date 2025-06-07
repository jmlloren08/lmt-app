import React, { useState, useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { Message } from 'primereact/message';
import { confirmDialog } from 'primereact/confirmdialog';
import axios from 'axios';

export default function StoreAssignment({ auth }) {
    const [assignments, setAssignments] = useState([]);
    const [availableStores, setAvailableStores] = useState([]);
    const [teamLeaders, setTeamLeaders] = useState([]);
    const [showAssignDialog, setShowAssignDialog] = useState(false);
    const [selectedStore, setSelectedStore] = useState(null);
    const [selectedTeamLeader, setSelectedTeamLeader] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const toast = useRef(null);

    useEffect(() => {
        fetchAssignments();
        fetchAvailableStores();
        fetchTeamLeaders();
    }, []);

    const fetchAssignments = async () => {
        try {
            const response = await axios.get('/store-assignments');
            setAssignments(response.data);
            setError(null);
        } catch (err) {
            setError('Failed to load store assignments');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableStores = async () => {
        try {
            const response = await axios.get('/available-stores');
            setAvailableStores(response.data.map(store => ({
                label: store,
                value: store
            })));
        } catch (err) {
            console.error('Failed to load available stores:', err);
        }
    };

    const fetchTeamLeaders = async () => {
        try {
            const response = await axios.get('/get-users-list', {
                params: { role: 'team_leader' }
            });
            setTeamLeaders(response.data.map(user => ({
                label: user.name,
                value: user.id
            })));
        } catch (err) {
            console.error('Failed to load team leaders:', err);
        }
    };

    const handleAssignStore = async () => {
        if (!selectedStore || !selectedTeamLeader) return;

        try {
            await axios.post('/assign-store', {
                team_leader_id: selectedTeamLeader,
                store: selectedStore
            });

            toast.current.show({
                severity: 'success',
                summary: 'Success',
                detail: 'Store assigned successfully',
                life: 3000
            });

            setShowAssignDialog(false);
            setSelectedStore(null);
            setSelectedTeamLeader(null);
            fetchAssignments();
            fetchAvailableStores();
        } catch (err) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: err.response?.data?.message || 'Failed to assign store',
                life: 3000
            });
        }
    };

    const confirmRemoveAssignment = (id) => {
        confirmDialog({
            message: 'Are you sure you want to remove this store assignment?',
            header: 'Confirm Removal',
            icon: 'pi pi-exclamation-triangle',
            accept: () => handleRemoveAssignment(id)
        });
    };

    const handleRemoveAssignment = async (id) => {
        try {
            await axios.delete(`/store-assignments/${id}`);
            
            toast.current.show({
                severity: 'success',
                summary: 'Success',
                detail: 'Store assignment removed successfully',
                life: 3000
            });

            fetchAssignments();
            fetchAvailableStores();
        } catch (err) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to remove store assignment',
                life: 3000
            });
        }
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <Button
                icon="pi pi-trash"
                className="p-button-rounded p-button-danger p-button-text"
                onClick={() => confirmRemoveAssignment(rowData.id)}
            />
        );
    };

    const assignDialogFooter = (
        <>
            <Button 
                label="Cancel" 
                icon="pi pi-times" 
                className="p-button-text" 
                onClick={() => setShowAssignDialog(false)} 
            />
            <Button 
                label="Assign" 
                icon="pi pi-check" 
                className="p-button-text" 
                onClick={handleAssignStore} 
                disabled={!selectedStore || !selectedTeamLeader}
            />
        </>
    );

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Store Assignments</h2>}
        >
            <Head title="Store Assignments" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        {error && (
                            <Message severity="error" text={error} className="w-full mb-4" />
                        )}

                        <div className="mb-4">
                            <Button
                                label="Assign Store"
                                icon="pi pi-plus"
                                className="p-button-success"
                                onClick={() => setShowAssignDialog(true)}
                            />
                        </div>

                        <DataTable
                            value={assignments}
                            loading={loading}
                            responsiveLayout="scroll"
                            paginator
                            rows={10}
                            emptyMessage="No store assignments found"
                        >
                            <Column field="store" header="Store" sortable />
                            <Column field="team_leader.name" header="Team Leader" sortable />
                            <Column 
                                field="assigned_at" 
                                header="Assigned Date" 
                                sortable
                                body={(rowData) => new Date(rowData.assigned_at).toLocaleDateString()}
                            />
                            <Column body={actionBodyTemplate} exportable={false} style={{ width: '8rem' }} />
                        </DataTable>

                        <Dialog
                            visible={showAssignDialog}
                            style={{ width: '450px' }}
                            header="Assign Store"
                            modal
                            className="p-fluid"
                            footer={assignDialogFooter}
                            onHide={() => setShowAssignDialog(false)}
                        >
                            <div className="field mt-4">
                                <label htmlFor="store">Store</label>
                                <Dropdown
                                    id="store"
                                    value={selectedStore}
                                    options={availableStores}
                                    onChange={(e) => setSelectedStore(e.value)}
                                    placeholder="Select a store"
                                    className="w-full"
                                />
                            </div>
                            <div className="field mt-4">
                                <label htmlFor="teamLeader">Team Leader</label>
                                <Dropdown
                                    id="teamLeader"
                                    value={selectedTeamLeader}
                                    options={teamLeaders}
                                    onChange={(e) => setSelectedTeamLeader(e.value)}
                                    placeholder="Select a team leader"
                                    className="w-full"
                                />
                            </div>
                        </Dialog>

                        <Toast ref={toast} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}