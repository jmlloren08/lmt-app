import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Suspense } from 'react';

const Spinner = React.lazy(() => import('@/Components/Spinner'));
const TableLists = React.lazy(() => import('@/Components/TableLists'));
const BarChart = React.lazy(() => import('@/Components/BarChart'));

export default function Dashboard({ auth }) {

    const [selectedStore, setSelectedStore] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedSchool, setSelectedSchool] = useState('');
    const [stores, getStores] = useState([]);
    const [districts, getDistricts] = useState([]);
    const [schools, getSchools] = useState([]);
    const [totalEngaged, setTotalEngaged] = useState(0);
    const [priorityToEngage, setPriorityToEngage] = useState(0);
    const [priorityLoading, setPriorityLoading] = useState(true);
    const [totalEngagedLoading, setTotalEngagedLoading] = useState(true);

    const userRole = auth.user.roles;
    const store = auth.user.office;

    useEffect(() => {
        axios.get('/get-stores')
            .then(response => {
                getStores(response.data);
            })
            .catch(error => {
                console.error('Error fetching data: ', error);
            });
    }, []);

    useEffect(() => {
        if (userRole === 'User') {
            setSelectedStore(store);
            fetchDistricts(store);
        }
    }, [userRole, store]);

    const fetchDistricts = (store) => {
        axios.get(`get-districts?store=${store}`)
            .then(response => {
                getDistricts(response.data);
                setSelectedDistrict('');
                setSelectedSchool('');
            })
            .catch(error => {
                console.error('Error fetching districts: ', error);
            });
    }

    const fetchSchools = (district) => {
        axios.get(`get-schools?district=${district}`)
            .then(response => {
                getSchools(response.data);
                setSelectedSchool('');
            })
            .catch(error => {
                console.error('Error fetching schools: ', error);
            });
    }

    const handleStoreChange = (e) => {
        setSelectedDistrict('');
        setSelectedSchool('');
        setSelectedStore('');
        const store = e.target.value;
        setSelectedStore(store);
        fetchDistricts(store); //fetch district based on the selected store
    }

    const handleDistrictChange = (e) => {
        const district = e.target.value;
        setSelectedDistrict(district);
        fetchSchools(district); //fetch school based on the selected district
    }

    const handleSchoolChange = (e) => {
        const school = e.target.value;
        if (school) {
            setSelectedSchool(school);
        }
    }

    useEffect(() => {
        refreshTotalEngaged();
        refreshPriorityToEngage();
    }, []);

    const refreshTotalEngaged = () => {
        setTotalEngagedLoading(true);
        axios.get('/get-count-total-engaged')
            .then(response => {
                setTotalEngaged(response.data);
            })
            .catch(error => {
                console.error('Error fetching data: ', error);
            })
            .finally(() => {
                setTotalEngagedLoading(false);
            });
    }

    const refreshPriorityToEngage = () => {
        setPriorityLoading(true);
        axios.get('/get-count-priority-to-engage')
            .then(response => {
                setPriorityToEngage(response.data);
            })
            .catch(error => {
                console.error('Error fetching data: ', error);
            })
            .finally(() => {
                setPriorityLoading(false);
            });
    }

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Dashboard</h2>}
        >
            <Head title="Dashboard" />

            {/* main content */}
            <div className='w-full max-w-7xl mx-auto sm:px-6 lg:px-8'>
                <div className='bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 mb-4'>
                    {/* store selector */}
                    <div className="flex items-center">
                        <div className='p-2'>
                            <label className='text-gray-900'>STORE NAME:</label>
                        </div>
                        <div className="p-2">
                            {userRole === 'Administrator' ? (
                                <select
                                    value={selectedStore}
                                    onChange={handleStoreChange}
                                    className='relative z-20 w-full rounded border py-3 px-5 outline-none'
                                >
                                    <option value="" disabled>Select</option>
                                    {stores.map((store, index) => (
                                        <option
                                            key={index}
                                            value={store.office}
                                        >
                                            {store.office}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type='text'
                                    value={selectedStore}
                                    readOnly
                                    className='relative z-20 w-full rounded border py-3 px-5 outline-none bg-gray-200'
                                />
                            )}
                        </div>
                    </div>
                    {/* district selector */}
                    <div className='flex items-center'>
                        <div className='p-2'>
                            <label className='text-gray-900'>DISTRICT NAME:</label>
                        </div>
                        <div className="p-2">
                            <select
                                value={selectedDistrict}
                                onChange={handleDistrictChange}
                                className='relative z-20 w-full rounded border py-3 px-5 outline-none'
                            >
                                <option value="" disabled>Select</option>
                                {districts.map((district, index) => (
                                    <option
                                        key={index}
                                        value={district.district}
                                    >
                                        {district.district}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    {/* school selector */}
                    <div className='flex items-center'>
                        <div className='p-2'>
                            <label className='text-gray-900'>SCHOOL NAME:</label>
                        </div>
                        <div className="p-2">
                            <select
                                value={selectedSchool}
                                onChange={handleSchoolChange}
                                className='relative z-20 w-full rounded border py-3 px-5 outline-none'
                            >
                                <option value="" disabled>Select</option>
                                {schools.map((school, index) => (
                                    <option
                                        key={index}
                                        value={school.school}
                                    >
                                        {school.school}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
                {/* cards */}
                <div className='grid grid-cols-2 gap-2 mb-4'>
                    <div className='text-white bg-red-500 p-4 shadow rounded-lg'>
                        <h3 className='text-lg'>Priority to Engaged</h3>
                        <Link href={route('priorities')}><p className='text-5xl font-bold hover:underline'>{priorityLoading ? <Spinner /> : priorityToEngage}</p></Link>
                    </div>
                    <div className='text-white bg-green-500 p-4 shadow rounded-lg'>
                        <h3 className='text-lg'>Total Engaged</h3>
                        <Link href={route('reports')}><p className='text-5xl font-bold hover:underline'>{totalEngagedLoading ? <Spinner /> : totalEngaged}</p></Link>
                    </div>
                </div>
                <Suspense fallback={<div>Loading...</div>}>
                    {/* chart */}
                    <div className='bg-white shadow rounded-lg p-4 mb-4'>
                        <h3 className='font-semibold text-xl'>Bar Chart</h3>
                        <BarChart selectedSchool={selectedSchool} />
                    </div>
                    {/* table lists */}
                    <div className="bg-white shadow rounded-lg p-4 mb-4">
                        <h3 className='font-semibold text-xl mb-4'>Lists</h3>
                        <TableLists
                            selectedSchool={selectedSchool}
                            auth={auth}
                            refreshTotalEngaged={refreshTotalEngaged}
                            refreshPriorityToEngage={refreshPriorityToEngage}
                        />
                    </div>
                </Suspense>
            </div>

        </AuthenticatedLayout>
    );
}
