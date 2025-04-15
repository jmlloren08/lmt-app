import React, { useEffect, useState } from 'react';
import ProgressBar from './ProgressBar';

export default function ImportProgress({ isVisible, onClose }) {
    const [progress, setProgress] = useState(0);
    const [totalRows, setTotalRows] = useState(0);
    const [processedRows, setProcessedRows] = useState(0);
    const [fileName, setFileName] = useState('');

    useEffect(() => {
        if (!isVisible) return;

        // Listen for progress updates
        window.Echo.channel('import-progress')
            .listen('.import.progress', (e) => {
                setProgress(e.progress);
                setTotalRows(e.totalRows);
                setProcessedRows(e.processedRows);
                setFileName(e.fileName);

                // Close the progress modal when import is complete
                if (e.progress === 100) {
                    setTimeout(() => {
                        onClose();
                        // Refresh the page to show new data
                        window.location.reload();
                    }, 2000);
                }
            });

        return () => {
            window.Echo.leave('import-progress');
        };
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl font-semibold mb-4">Importing File</h2>
                <p className="text-sm text-gray-600 mb-2">{fileName}</p>
                <ProgressBar progress={progress} />
                <p className="text-sm text-gray-600">
                    Processed {processedRows} of {totalRows} rows ({progress.toFixed(1)}%)
                </p>
                {progress === 100 && (
                    <p className="text-sm text-green-600 mt-2">
                        Import completed successfully!
                    </p>
                )}
            </div>
        </div>
    );
}