import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import TableLists from '@/Components/TableLists';
import BarChart from '@/Components/BarChart';

export default function Dashboard({ auth }) {

    const [selectedOption, setSelectedOption] = useState('');
    const [offices, setOffices] = useState([]);

    const userRole = auth.user.roles;
    const office = auth.user.office;

    useEffect(() => {
        axios.get('/get-offices')
            .then(response => {
                setOffices(response.data);
            })
            .catch(error => {
                console.error('Error fetching data: ', error);
            });
    }, []);

    useEffect(() => {
        if (userRole === 'User') {
            setSelectedOption(office);
        }
    }, [userRole, office]);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Dashboard</h2>}
        >
            <Head title="Dashboard" />

            {/* main content */}
            <div className='w-full max-w-7xl mx-auto sm:px-6 lg:px-8'>
                {/* store selector */}
                <div className='bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 mb-4'>
                    <div className='flex items-center'>
                        <div className='p-2'>
                            <label className='text-gray-900'>STORE NAME:</label>
                        </div>
                        <div className="p-2">
                            {userRole === 'Administrator' ? (
                                <select
                                    value={selectedOption}
                                    onChange={(e) => {
                                        setSelectedOption(e.target.value);
                                    }}
                                    className='relative z-20 w-full rounded border py-3 px-5 outline-none'
                                >
                                    <option value="" disabled>Select</option>
                                    {offices.map((office, index) => (
                                        <option
                                            key={index}
                                            value={office.office}
                                        >
                                            {office.office}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type='text'
                                    value={selectedOption}
                                    readOnly
                                    className='relative z-20 w-full rounded border py-3 px-5 outline-none bg-gray-200'
                                />
                            )}
                        </div>
                    </div>
                </div>
                {/* cards */}
                <div className='grid grid-cols-2 gap-2 mb-4'>
                    <div className='text-white bg-red-500 p-4 shadow rounded-lg'>
                        <h3 className='text-lg'>Priority to Engaged</h3>
                        <p className='text-5xl font-bold'>12</p>
                    </div>
                    <div className='text-white bg-green-500 p-4 shadow rounded-lg'>
                        <h3 className='text-lg'>Total Engaged</h3>
                        <p className='text-5xl font-bold'>24</p>
                    </div>
                </div>

                {/* chart */}
                <div className='bg-white shadow rounded-lg p-4 mb-4'>
                    <h3 className='font-semibold text-xl'>Bar Chart</h3>
                    <BarChart selectedOption={selectedOption} />
                </div>

                {/* table lists */}

                <div className="bg-white shadow rounded-lg p-4 mb-4">
                    <h3 className='font-semibold text-xl mb-4'>Lists</h3>
                    <TableLists selectedOption={selectedOption} />
                </div>

            </div>

        </AuthenticatedLayout>
    );
}
