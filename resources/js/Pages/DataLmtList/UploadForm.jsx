import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import axios from "axios";

const UploadForm = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('');

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (
                selectedFile.type === "text/csv" ||
                selectedFile.type ===
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
                selectedFile.type === "application/vnd.ms-excel"
            ) {
                setFile(selectedFile);
                setError(null);
            } else {
                setError("Please upload a CSV or Excel file");
                setFile(null);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError("Please select a file");
            return;
        }

        setUploading(true);
        setError(null);
        setSuccess(null);
        setProgress(0);
        setStatus('Preparing upload...');

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await axios.post("/data-lmt-list/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').content,
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    setProgress(percentCompleted);
                    setStatus(`Uploading: ${percentCompleted}%`);
                },
            });

            if (response.status === 200) {
                setStatus('Processing data...');
                setProgress(100);
                setSuccess("File uploaded and processed successfully");
                router.reload();
            } else {
                setError(response.data.message || "Error uploading file");
            }
        } catch (err) {
            if (err.response) {
                if (err.response.status === 413) {
                    setError("File is too large. Please upload a file under 15MB.");
                } else {
                    setError(err.response.data.message || "Error uploading file");
                }
            } else {
                setError("Error uploading file. Please try again.");
            }
        } finally {
            setUploading(false);
        }
    };

    return (
        <>
            <Head title="Upload Data LMT List" />
            <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4">Upload LMT Data</h2>

                {error && (
                    <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select File (CSV or Excel)
                        </label>
                        <input
                            type="file"
                            accept=".csv,.xlsx,.xls"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-blue-50 file:text-blue-700
                            hover:file:bg-blue-100"
                        />
                    </div>

                    {uploading && (
                        <div className="space-y-2">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                            <p className="text-sm text-gray-600">{status}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={uploading || !file}
                        className={`w-full py-2 px-4 rounded-md text-white font-medium
                        ${
                            uploading || !file
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700"
                        }`}
                    >
                        {uploading ? "Uploading..." : "Upload File"}
                    </button>
                </form>
            </div>
        </>
    );
};

export default UploadForm;
