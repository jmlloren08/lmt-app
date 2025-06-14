<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessDataLmtListsImport;
use App\Models\DataLmtLists;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class UploadController extends Controller
{
    public function createUploadForm()
    {
        try {
            return Inertia::render('DataLmtList/UploadForm');
        } catch (\Exception $e) {
            Log::error('Error rendering upload form: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to render upload form'], 500);
        }
    }

    public function upload(Request $request)
    {
        // Validate the request
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|mimes:csv,xlsx,xls|max:15360' // 15MB
        ]);

        if ($validator->fails()) {
            Log::error("File upload validation failed: " . json_encode($validator->errors()));
            return response()->json([
                'message' => 'Invalid file format or file too large. Please upload a CSV or Excel file under 15MB.',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            Log::info("Starting file upload process");

            // Process the file upload
            $file = $request->file('file');
            $fileName = $file->getClientOriginalName();
            $fileSize = $file->getSize();

            Log::info("File details: " . json_encode([
                'name' => $fileName,
                'size' => $fileSize,
                'type' => $file->getMimeType()
            ]));

            // Check if there are any records to archive
            $existingRecords = DataLmtLists::where('is_archived', false)->count();
            Log::info("Found {$existingRecords} existing records to archive");

            if ($existingRecords > 0) {
                Log::info("Archiving existing records");
                DataLmtLists::where('is_archived', false)->update(['is_archived' => true]);
            } else {
                Log::info("No existing records to archive");
            }

            // Store the file temporarily
            $tempPath = $file->store('temp');
            $fullPath = storage_path('app/' . $tempPath);

            // Get total rows without loading the entire file
            $totalRows = 0;
            $handle = fopen($fullPath, 'r');
            if ($handle) {
                while (fgets($handle) !== false) {
                    $totalRows++;
                }
                fclose($handle);
            }
            $totalRows--; // Subtract header row

            Log::info("Total rows to process: {$totalRows}");

            // Dispatch the import job
            ProcessDataLmtListsImport::dispatch($fullPath, $totalRows, $fileName);

            return redirect()->route('upload-form')->with('success', 'File is being processed. You will be notified once the import is complete.');
        } catch (\Exception $e) {
            Log::error("Error processing file: " . $e->getMessage());
            Log::error("Stack trace: " . $e->getTraceAsString());
            return response()->json([
                'message' => 'Error processing file: ' . $e->getMessage()
            ], 500);
        }
    }
    public function getCurrentData()
    {
        try {
            $data = DataLmtLists::getCurrentData();
            return response()->json(['data' => $data]);
        } catch (\Exception $e) {
            Log::error("Error fetching current data: " . $e->getMessage());
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }
    public function getArchivedData()
    {
        try {
            $data = DataLmtLists::getArchivedData();
            return response()->json(['data' => $data]);
        } catch (\Exception $e) {
            Log::error("Error fetching archived data: " . $e->getMessage());
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }
}
