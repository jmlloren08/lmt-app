import React from 'react';
import { Head } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';

export default function NoAuthorization() {
    return (
        <GuestLayout>
            <Head title="No Authorization" />

            <div className="flex flex-col items-center justify-center bg-gray-100">
                <div className="max-w-md w-full bg-white p-8 text-center">
                    <div className="mb-6">
                        <svg className="mx-auto h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">No Authorization</h1>
                    <p className="text-gray-600 mb-6">
                        Your account is currently pending role assignment. Please contact your administrator to get the appropriate role assigned to your account.
                    </p>
                    <div className="flex justify-center space-x-4">
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="inline-flex items-center px-4 py-2 bg-red-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-red-700 focus:bg-red-700 active:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition ease-in-out duration-150"
                        >
                            Logout
                        </Link>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
} 