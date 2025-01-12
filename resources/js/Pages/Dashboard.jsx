import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { Suspense } from 'react';
import { debounce } from 'lodash';

const AuthenticatedLayout = React.lazy(() => import('../Layouts/AuthenticatedLayout'));
const DashboardCard = React.lazy(() => import('../Components/DashboardCard'));
const SelectFilter = React.lazy(() => import('../Components/SelectFilter'));
const TableLists = React.lazy(() => import('@/Components/TableLists'));
const BarChart = React.lazy(() => import('@/Components/BarChart'));

const fetchData = async (url, setter, errorMessage) => {
    try {
        const response = await axios.get(url);
        setter(response.data);
    } catch (error) {
        console.error(`${errorMessage}`, error);
    }
}

export default function Dashboard({ auth }) {

    const { roles: userRole, office: store } = auth.user;
    // State for filters and data
    const [filters, setFilters] = useState({
        store: userRole === 'User' ? store : '',
        district: '',
        school: '',
        account_status: '',
        renewal_remarks: ''
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
        if (userRole === 'Administrator') {
            fetchData('get-distinct-stores', setStores, 'Error fetching stores: ');
        }
        if (userRole === 'User' && store) {
            setFilters(prev => ({ ...prev, store: store }));
            fetchDistricts(store);
        }
    }, [userRole, store]);

    // Fetch districts based on selected store
    const fetchDistricts = (selectedStore) => {
        if (selectedStore) {
            fetchData(`/get-distinct-districts/?store=${selectedStore}`, setDistricts, 'Error fetching districts: ');
        } else {
            setDistricts([]);
        }
        resetFilters(['district', 'school', 'account_status', 'renewal_remarks']);
    }
    // Effect for fetching schools whenever district changes
    useEffect(() => {
        if (filters.district) {
            fetchData(`/get-distinct-schools/?district=${filters.district}`, setSchools, 'Error fetching schools: ');
        } else {
            setSchools([]);
        }
        resetFilters(['school', 'account_status', 'renewal_remarks']);
    }, [filters.district]);

    // Helper to reset specific filters
    const resetFilters = (fields) => {
        setFilters((prev) => fields.reduce((acc, field) => ({ ...acc, [field]: '' }), { ...prev }));
    }

    // Debounce filter update
    const updateFilter = debounce((key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    }, 300);

    useEffect(() => {
        if (!filters.account_status) {
            setFilters(prev => ({ ...prev, renewal_remarks: '' }));
        }
    }, [filters.account_status]);

    // Fetch total engaged and priority to engage
    const fetchDashboardCounts = () => {
        setLoadingStates((prev) => ({ ...prev, totalEngaged: true, priorityToEngage: true }));
        fetchData('/get-count-total-engaged', setTotalEngaged, 'Error fetchin total engaged')
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
                    <DashboardCard
                        title='Target Conversion'
                        count={targetConverted}
                        loading={loadingStates.targetConverted}
                        link={route('target-conversion')}
                        bgColor='bg-red-500'
                    />
                    <DashboardCard
                        title='Actual Converted'
                        count={actualConverted}
                        loading={loadingStates.actualConverted}
                        link={route('actual-converted')}
                        bgColor='bg-yellow-500'
                    />
                </div>
                <div className='grid grid-cols sm:grid-cols-2 gap-2 mb-4'>
                    <div className='bg-white shadow-sm sm:rounded-lg p-6 mb-4'>
                        {/* store selector */}
                        {userRole === 'Administrator' ? (
                            <SelectFilter
                                label='Store Name:'
                                options={stores.map((s) => ({ value: s.office, label: s.office }))}
                                value={filters.store}
                                onChange={(value) => updateFilter('store', value)}
                            />
                        ) : (
                            <div className="flex items-center mb-4">
                                <label className='text-gray-900'>STORE NAME:</label>
                                <input
                                    type='text'
                                    value={filters.store}
                                    className='relative z-20 w-full rounded border py-3 px-5 outline-none'
                                    readOnly
                                />
                            </div>
                        )}
                        {/* district selector */}
                        <SelectFilter
                            label='District Name:'
                            options={districts.map((d) => ({ value: d.district, label: d.district }))}
                            value={filters.district}
                            onChange={(value) => updateFilter('district', value)}
                        />
                        {/* school selector */}
                        <SelectFilter
                            label='School Name:'
                            options={schools.map((s) => ({ value: s.school, label: s.school }))}
                            value={filters.school}
                            onChange={(value) => updateFilter('school', value)}
                        />
                        {/* account status */}
                        <SelectFilter
                            label='Account Status:'
                            options={accountStatusOptions}
                            value={filters.account_status}
                            onChange={(value) => updateFilter('account_status', value)}
                        />
                        {/* renewal remarks */}
                        <SelectFilter
                            label='Renewal Remarks:'
                            options={renewalRemarksOptions}
                            value={filters.renewal_remarks}
                            onChange={(value) => updateFilter('renewal_remarks', value)}
                        />
                    </div>
                    {/* chart */}
                    <div className='bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 mb-4'>
                        <h3 className='font-semibold text-xl'>Pie Chart</h3>
                        <p>Pie chart data here...</p>
                    </div>
                </div>
                <Suspense fallback={<div>Loading...</div>}>
                    {/* chart */}
                    <div className='bg-white shadow rounded-lg p-4 mb-4'>
                        <h3 className='font-semibold text-xl'>Bar Chart</h3>
                        <BarChart
                            filters={filters}
                        />
                    </div>
                    {/* table lists */}
                    <div className="bg-white shadow rounded-lg p-4 mb-4">
                        <h3 className='font-semibold text-xl mb-4'>Lists</h3>
                        <TableLists
                            filter={filters}
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
