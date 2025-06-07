import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { Suspense } from 'react';
import { debounce } from 'lodash';

const PieChart = React.lazy(() => import('../Components/Charts/PieChart'));
const AuthenticatedLayout = React.lazy(() => import('../Layouts/AuthenticatedLayout'));
const DashboardCard = React.lazy(() => import('../Components/DashboardCard'));
const SelectFilter = React.lazy(() => import('../Components/SelectFilter'));
const TableLists = React.lazy(() => import('@/Components/Table/TableLists'));
const BarChart = React.lazy(() => import('@/Components/Charts/BarChart'));

const fetchData = async (url, setter, errorMessage) => {
    try {
        const response = await axios.get(url);
        setter(response.data);
        return response.data;
    } catch (error) {
        console.error(`${errorMessage}`, error);
    }
}

export default function Dashboard({ auth }) {
    const { roles: userRole, store, area } = auth.user;
    const isAdminOrDivisionLeader = userRole === 'administrator' || userRole === 'division_leader';
    const isTeamLeader = userRole === 'team_leader';
    const isLoanSpecialist = userRole === 'loan_specialist';

    // State for valueFilters and data
    const [valueFilters, setValueFilters] = useState({
        store: isAdminOrDivisionLeader ? '' : store,
        district: '',
        school: '',
        account_status: '',
        renewal_remarks: ''
    });

    // Separate state for pie chart filters
    const [pieChartFilters, setPieChartFilters] = useState({
        store: isAdminOrDivisionLeader ? '' : store,
        district: '',
        school: ''
    });

    // State for stores, districts, and schools
    const [stores, setStores] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [schools, setSchools] = useState([]);

    // State for total engaged, priority to engage, target conversion, and actual converted
    const [totalEngaged, setTotalEngaged] = useState(0);
    const [priorityToEngage, setPriorityToEngage] = useState(0);
    const [targetConverted, setTargetConverted] = useState(0);
    const [actualConverted, setActualConverted] = useState(0);
    const [loadingStates, setLoadingStates] = useState({
        totalEngaged: true,
        priorityToEngage: true,
        targetConverted: true,
        actualConverted: true
    });

    const accountStatusOptions = [
        'Current',
        'WRITTEN OFF',
        'Non Performing Pastdue',
        'Performing Pastdue',
        'New Possible PD',
        'Possible Non Performing',
        'NTB'
    ].map((status) => ({ value: status, label: status }));

    const renewalRemarksOptions = [
        'QUALIFIED',
        'NOT QUALIFIED',
        'FOR RECOVERY'
    ].map((remark) => ({ value: remark, label: remark }));

    // Effect for fetching initial data
    useEffect(() => {
        if (isAdminOrDivisionLeader) {
            fetchData('get-distinct-stores', setStores, 'Error fetching stores: ');
        } else if (store) {
            setValueFilters(prev => ({ ...prev, store: store }));
            fetchDistricts(store);
        }
    }, [userRole, store]);

    // Fetch districts based on selected store
    const fetchDistricts = (selectedStore) => {
        if (selectedStore) {
            fetchData(
                `/get-distinct-districts/?store=${selectedStore}`,
                setDistricts,
                'Error fetching districts: '
            );
        } else {
            setDistricts([]);
        }
        resetValueFilters(['district', 'school', 'account_status', 'renewal_remarks']);
    }

    // Effect for fetching schools whenever district changes
    useEffect(() => {
        if (valueFilters.district) {
            fetchData(`/get-distinct-schools/?district=${valueFilters.district}`, setSchools, 'Error fetching schools: ');
        } else {
            setSchools([]);
        }
        resetValueFilters(['school', 'account_status', 'renewal_remarks']);
    }, [valueFilters.district]);

    // Helper to reset specific valueFilters
    const resetValueFilters = (fields) => {
        setValueFilters((prev) => fields.reduce((acc, field) => ({ ...acc, [field]: '' }), { ...prev }));
    }

    // Debounce filter update
    const updateFilter = debounce((key, value) => {
        setValueFilters(prev => ({ ...prev, [key]: value }));
        
        // Update pie chart filters only for store, district, and school
        if (['store', 'district', 'school'].includes(key)) {
            setPieChartFilters(prev => ({ ...prev, [key]: value }));
        }
    }, 300);

    useEffect(() => {
        if (!valueFilters.account_status) {
            setValueFilters(prev => ({ ...prev, renewal_remarks: '' }));
        }
    }, [valueFilters.account_status]);

    // Fetch total engaged and priority to engage
    const fetchDashboardCounts = () => {
        setLoadingStates((prev) => ({ ...prev, totalEngaged: true, priorityToEngage: true }));
        fetchData('/get-count-total-engaged', setTotalEngaged, 'Error fetching total engaged')
            .finally(() => setLoadingStates((prev) => ({ ...prev, totalEngaged: false })));
        fetchData('/get-count-priority-to-engage', setPriorityToEngage, 'Error fetching priority to engage')
            .finally(() => setLoadingStates((prev) => ({ ...prev, priorityToEngage: false })));
    }

    useEffect(() => {
        fetchDashboardCounts();
    }, []);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Dashboard</h2>}
        >
            <Head title="Dashboard" />
            {/* main content */}
            <div className='w-full max-w-7xl mx-auto sm:px-6 lg:px-8'>
                {/* cards */}
                <div className='grid grid-cols sm:grid-cols-4 gap-2 mb-4'>
                    <DashboardCard
                        title='Priority to Engage'
                        count={priorityToEngage}
                        loading={loadingStates.priorityToEngage}
                        link={route('priorities')}
                        bgColor='bg-blue-500'
                    />
                    <DashboardCard
                        title='Total Engaged'
                        count={totalEngaged}
                        loading={loadingStates.totalEngaged}
                        link={route('engaged')}
                        bgColor='bg-green-500'
                    />
                </div>
                <div className='grid grid-cols sm:grid-cols-2 gap-2 mb-4 text-center items-center justify-center'>
                    <div className='bg-white shadow-sm sm:rounded-lg p-6 mb-4'>
                        {/* store selector */}
                        {isAdminOrDivisionLeader ? (
                            <SelectFilter
                                label='Store Name:'
                                options={stores.map((s) => ({ value: s.store, label: s.store }))}
                                value={valueFilters.store}
                                onChange={(value) => {
                                    updateFilter('store', value);
                                    fetchDistricts(value);
                                }}
                            />
                        ) : (
                            <div className="space-y-4 mb-4">
                                <div className="flex items-center mb-2">
                                    <label className='text-gray-900'>STORE NAME:</label>
                                    <input
                                        type='text'
                                        value={valueFilters.store}
                                        className='relative z-20 w-full rounded border py-3 px-5 outline-none'
                                        readOnly
                                    />
                                </div>
                                {isLoanSpecialist && area && (
                                    <div className="flex items-center">
                                        <label className='text-gray-900'>AREA NAME:</label>
                                        <input
                                            type='text'
                                            value={area}
                                            className='relative z-20 w-full rounded border py-3 px-5 outline-none'
                                            readOnly
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                        {/* district selector */}
                        <SelectFilter
                            label='District Name:'
                            options={districts.map((d) => ({ value: d.district, label: d.district }))}
                            value={valueFilters.district}
                            onChange={(value) => updateFilter('district', value)}
                        />
                        {/* school selector */}
                        <SelectFilter
                            label='School Name:'
                            options={schools.map((s) => ({ value: s.school, label: s.school }))}
                            value={valueFilters.school}
                            onChange={(value) => updateFilter('school', value)}
                        />
                        {/* account status */}
                        <SelectFilter
                            label='Account Status:'
                            options={accountStatusOptions}
                            value={valueFilters.account_status}
                            onChange={(value) => updateFilter('account_status', value)}
                        />
                        {/* renewal remarks */}
                        <SelectFilter
                            label='Renewal Remarks:'
                            options={renewalRemarksOptions}
                            value={valueFilters.renewal_remarks}
                            onChange={(value) => updateFilter('renewal_remarks', value)}
                        />
                    </div>
                    {/* chart */}
                    <div className='bg-white shadow-sm sm:rounded-lg p-6 mb-4'>
                        <PieChart
                            valueFilters={pieChartFilters}
                        />
                    </div>
                </div>
                <Suspense fallback={<div>Loading...</div>}>
                    {/* chart */}
                    <div className='bg-white shadow rounded-lg p-4 mb-4'>
                        <h3 className='font-semibold text-xl'>Bar Chart</h3>
                        <BarChart
                            valueFilters={valueFilters}
                        />
                    </div>
                    {/* table lists */}
                    <div className="bg-white shadow rounded-lg p-4 mb-4">
                        <h3 className='font-semibold text-xl mb-4'>Lists</h3>
                        <TableLists
                            valueFilters={valueFilters}
                            auth={auth}
                            refreshTotalEngaged={fetchDashboardCounts}
                            refreshPriorityToEngage={fetchDashboardCounts}
                        />
                    </div>
                </Suspense>
            </div>
        </AuthenticatedLayout>
    );
}
