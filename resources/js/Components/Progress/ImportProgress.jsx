import React, { useEffect, useState } from 'react';
import Pusher from 'pusher-js';

const ImportProgress = ({ isVisible, onClose }) => {
    const [progress, setProgress] = useState(0);
    const [totalRows, setTotalRows] = useState(0);
    const [processedRows, setProcessedRows] = useState(0);
    const [fileName, setFileName] = useState('');
    const [completed, setCompleted] = useState(false);

    useEffect(() => {
        // Initialize Pusher
        const pusher = new Pusher(import.meta.env.VITE_PUSHER_APP_KEY, {
            cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
            encrypted: true,
        });

        // Subscribe to the import-progress channel
        const channel = pusher.subscribe('import-progress');

        // Listen for the ImportProgress event
        channel.bind('ImportProgress', (data) => {
            console.log('Received progress update:', data);
            setProgress(data.progress);
            setTotalRows(data.totalRows);
            setProcessedRows(data.processedRows);
            setFileName(data.fileName);

            if (data.progress >= 100) {
                setCompleted(true);
                setTimeout(() => {
                    window.location.reload();
                }, 3000);
            }
        });

        // Clean up when component unmounts
        return () => {
            channel.unbind_all();
            channel.unsubscribe();
            pusher.disconnect();
        };
    }, [isVisible]);

    if (!isVisible) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <h3 className="text-lg font-medium mb-4">
                    {completed ? "Import Completed!" : "Importing Data..."}
                </h3>

                <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">
                        {fileName ? `Processing: ${fileName}` : 'Uploading file...'}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                        {processedRows} of {totalRows} rows processed ({progress.toFixed(2)}%)
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>

                {completed ? (
                    <button
                        onClick={onClose}
                        className="w-full py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                        Close
                    </button>
                ) : (
                    <p className="text-xs text-gray-500 italic">
                        Please don't close this window during the import process.
                    </p>
                )}
            </div>
        </div>
    );
};

export default ImportProgress;