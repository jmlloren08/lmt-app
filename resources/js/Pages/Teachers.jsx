import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Users({ auth }) {

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Manage Teachers</h2>}
        >
            <Head title="Settings" />
            <div className='card bg-white shadow rounded-lg p-4 mb-4'>
                <h3 className='font-semibold text-xl mb-4'>List of all teachers</h3>
            </div >

        </AuthenticatedLayout >
    );
}