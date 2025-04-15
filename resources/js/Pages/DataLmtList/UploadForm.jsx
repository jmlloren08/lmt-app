import React, { useState } from "react";
import { Head, router, useForm } from "@inertiajs/react";
import ImportProgress from '@/Components/Progress/ImportProgress';

const UploadForm = () => {
    const [showProgress, setShowProgress] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        file: null,
    });

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (
                selectedFile.type === "text/csv" ||
                selectedFile.type ===
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
                selectedFile.type === "application/vnd.ms-excel"
            ) {
                setData('file', selectedFile);
                errors.file = null;
            } else {
                errors.file = "Please upload a CSV or Excel file";
                setData('file', null);
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowProgress(true);
        post(route('data-lmt-list.upload'), {
            onSuccess: () => {
                // The progress component will handle the success state
            },
            onError: () => {
                setShowProgress(false);
            },
        });
    };

    return (
        <>
            <Head title="Upload Data LMT List" />
            <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4">Upload LMT Data</h2>

                {errors.file && (
                    <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
                        {errors.file}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Upload CSV or Excel File
                        </label>
                        <input
                            type="file"
                            onChange={handleFileChange}
                            className="mt-1 block w-full"
                            accept=".csv,.xlsx,.xls"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={processing || !data.file}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        {processing ? 'Uploading...' : 'Upload'}
                    </button>
                </form>
            </div>

            <ImportProgress
                isVisible={showProgress}
                onClose={() => setShowProgress(false)}
            />
        </>
    );
};

export default UploadForm;
