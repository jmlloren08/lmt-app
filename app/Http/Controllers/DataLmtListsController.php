<?php

namespace App\Http\Controllers;

use App\Models\DataLmtLists;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\DataLmtListsImport;

class DataLmtListsController extends Controller
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

            // Create import instance
            $import = new DataLmtListsImport();
            
            try {
                Log::info("Starting Excel import process");
                
                // Get total rows for progress tracking
                Log::info("Reading Excel file to get total rows");
                
                // Read the file in chunks to get total rows
                $totalRows = 0;
                $reader = Excel::toArray($import, $file);
                if (empty($reader) || empty($reader[0])) {
                    throw new \Exception("No data found in the Excel file");
                }
                
                $totalRows = count($reader[0]);
                Log::info("Total rows to process: {$totalRows}");
                
                if ($totalRows === 0) {
                    throw new \Exception("No data found in the Excel file");
                }
                
                $import->setTotalRows($totalRows);
                
                // Import the data with memory management
                Log::info("Starting data import");
                
                // Clear the reader to free memory
                unset($reader);
                gc_collect_cycles();
                
                // Import the data
                Excel::import($import, $file);
                
                Log::info("File processed successfully");
                
                // Get current data after import
                Log::info("Fetching current data");
                $currentData = DataLmtLists::getCurrentData();
                
                return response()->json([
                    'message' => 'File uploaded and processed successfully.',
                    'data' => $currentData,
                    'file_info' => [
                        'name' => $fileName,
                        'size' => $fileSize,
                        'processed_at' => now()->toDateTimeString(),
                        'total_rows' => $totalRows
                    ]
                ]);
            } catch (\Maatwebsite\Excel\Validators\ValidationException $e) {
                $failures = $e->failures();
                $errors = [];
                foreach ($failures as $failure) {
                    $errors[] = [
                        'row' => $failure->row(),
                        'attribute' => $failure->attribute(),
                        'values' => $failure->values(),
                        'errors' => $failure->errors()
                    ];
                }
                Log::error("Validation errors during import: " . json_encode($errors));
                return response()->json([
                    'message' => 'Validation errors occurred during import',
                    'errors' => $errors
                ], 422);
            } catch (\Exception $e) {
                Log::error("Error during import: " . $e->getMessage());
                Log::error("Stack trace: " . $e->getTraceAsString());
                throw $e;
            }
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
    public function getDistinctStore()
    {
        try {

            $userRole = Auth::user()->roles;
            $userOffice = Auth::user()->office;

            $userRole === 'Administrator' ?
                $offices = DataLmtLists::select('office')
                ->distinct()
                ->orderBy('office', 'asc')
                ->get()
                :
                $offices = DataLmtLists::where('office', $userOffice)
                ->distinct()
                ->orderBy('office', 'asc')
                ->get();

            return response()->json($offices);
        } catch (\Exception $e) {

            Log::error("Error fetching stores: " . $e->getMessage());
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }
    public function getDistinctDistrict(Request $request)
    {
        try {

            $store = $request->store;
            $districts = DataLmtLists::where('office', $store)
                ->whereNot('district', 'SCHOOL TO BE IDENTIFY')
                ->select('district')
                ->distinct()
                ->orderBy('district', 'asc')
                ->get();

            return response()->json($districts);
        } catch (\Exception $e) {

            Log::error("Error fetching districts: " . $e->getMessage());
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }
    public function getDistinctSchool(Request $request)
    {
        try {

            $district = $request->district;
            $schools = DataLmtLists::where('district', $district)
                ->whereNot('school', 'SCHOOL TO BE IDENTIFY')
                ->select('school')
                ->distinct()
                ->orderBy('school', 'asc')
                ->get();

            return response()->json($schools);
        } catch (\Exception $e) {

            Log::error("Error fetching schools: " . $e->getMessage());
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }
    public function getListWhereFilters(Request $request)
    {
        try {

            $validated = $request->validate([
                'store' => ['nullable', 'string'],
                'district' => ['nullable', 'string'],
                'school' => ['nullable', 'string'],
                'account_status' => ['nullable', 'string'],
                'renewal_remarks' => ['nullable', 'string']
            ]);

            $filters = [
                'office' => $validated['store'],
                'district' => $validated['district'],
                'school' => $validated['school'],
                'account_status' => $validated['account_status'],
                'renewal_remarks' => $validated['renewal_remarks']
            ];

            $query = DataLmtLists::query();

            foreach ($filters as $column => $value) {
                $query->when($value, function ($q) use ($column, $value) {
                    return $q->where($column, $value);
                });
            }

            $lists = $query->select('id', 'name', 'account_status', 'renewal_remarks')
                ->whereNull('engagement_status')
                ->get();

            return response()->json(['lists' => $lists]);
        } catch (\Exception $e) {

            Log::error("Error fetching schools: " . $e->getMessage());
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }
    public function getAccountStatusWhereFilters(Request $request)
    {
        try {

            $query = DataLmtLists::query();

            if ($request->filled('store')) {
                $query->where('office', $request->store);
            }
            if ($request->filled('district')) {
                $query->where('district', $request->district);
            }
            if ($request->filled('school')) {
                $query->where('school', $request->school);
            }
            if ($request->filled('account_status')) {
                $query->where('account_status', $request->account_status);
            }
            if ($request->filled('renewal_remarks')) {
                $query->where('renewal_remarks', $request->renewal_remarks);
            }

            $statuses = [
                'Current',
                'WRITTEN OFF',
                'Non Performing Pastdue',
                'Performing Pastdue',
                'New Possible PD',
                'Possible Non Performing',
                'NTB'
            ];

            $counts = [];
            foreach ($statuses as $status) {
                $statusQuery = clone $query;
                $statusQuery->where('account_status', $status);
                $counts[$status] = $statusQuery->count();
            }

            return response()->json(['counts' => $counts]);
        } catch (\Exception $e) {

            Log::error("Error fetching account status: " . $e->getMessage());
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }
    public function getCountBorrowersWhereFilters(Request $request)
    {
        try {

            $query = DataLmtLists::query();

            if ($request->filled('store')) {
                $query->where('office', $request->store);
            }
            if ($request->filled('district')) {
                $query->where('district', $request->district);
            }
            if ($request->filled('school')) {
                $query->where('school', $request->school);
            }
            if ($request->filled('account_status')) {
                $query->where('account_status', $request->account_status);
            }
            if ($request->filled('renewal_remarks')) {
                $query->where('renewal_remarks', $request->renewal_remarks);
            }

            $existingBorrowerCount = (clone $query)->where('client_status', 'Existing Borrower')->count();
            $nonBorrowerCount = (clone $query)->where('client_status', 'Non-Borrowers')->count();

            $borrowers = [
                'existing_borrower' => $existingBorrowerCount,
                'non_borrower' => $nonBorrowerCount
            ];

            return response()->json($borrowers);
        } catch (\Exception $e) {

            Log::error("Error fetching borrowers: " . $e->getMessage());
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }
    public function getOtherData($id)
    {
        try {

            $otherData = DataLmtLists::select('gtd', 'prncpl', 'tsndng', 'ntrst', 'mrtztn', 'ewrbddctn', 'nthp', 'nddctd', 'dedstat', 'ntprcd', 'mntd', 'engagement_status', 'progress_report')
                ->where('id', $id)
                ->first();

            if (!$otherData) {
                return response()->json(['errors' => 'Data not found.'], 404);
            }

            return response()->json($otherData);
        } catch (\Exception $e) {

            Log::error("Error fetching other data: " . $e->getMessage());
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }
    public function saveEngageData(Request $request, $id)
    {
        try {

            $request->validate([
                'engagement_status' => ['required', 'string'],
                'priority_to_engage' => ['nullable', 'string'],
                'progress_report' => ['required', 'string'],
                'action_taken_by' => ['required', 'string']
            ]);

            $engageData = DataLmtLists::findOrFail($id);

            $engageData->engagement_status = $request->engagement_status;
            $engageData->priority_to_engage = $request->priority_to_engage;
            $engageData->progress_report = $request->progress_report;
            $engageData->action_taken_by = $request->action_taken_by;
            $engageData->save();

            return response()->json(['success' => 'Teacher successfully engaged.']);
        } catch (\Exception $e) {

            Log::error("Error saving engaged data: " . $e->getMessage());
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }
    public function updatePriorityToEngage(Request $request, $id)
    {
        try {

            $request->validate([
                'priority_to_engage' => ['required', 'string']
            ]);

            $priority_to_engage = DataLmtLists::findOrFail($id);

            $priority_to_engage->priority_to_engage = $request->priority_to_engage;
            $priority_to_engage->save();

            return response()->json(['success' => 'Data has been successfully prioritized.']);
        } catch (\Exception $e) {

            Log::error("Error prioritizing data: " . $e->getMessage());
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }
    public function getCountTotalEngaged()
    {
        try {

            $userRole = Auth::user()->roles;
            $userStore = Auth::user()->office;

            $userRole === 'Administrator' ?
                $countTotalEngaged = DataLmtLists::where('engagement_status', 'Engaged')->count()
                :
                $countTotalEngaged = DataLmtLists::where('engagement_status', 'Engaged')
                ->where('office', $userStore)
                ->count();

            return response()->json($countTotalEngaged);
        } catch (\Exception $e) {

            Log::error("Error getting count data: " . $e->getMessage());
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }
    public function getCountPriorityToEngage()
    {
        try {

            $userRole = Auth::user()->roles;
            $userStore = Auth::user()->office;

            $userRole === 'Administrator' ?
                $countPriorityToEngage = DataLmtLists::where('priority_to_engage', 'Yes')->count()
                :
                $countPriorityToEngage = DataLmtLists::where('priority_to_engage', 'Yes')
                ->where('office', $userStore)
                ->count();

            return response()->json($countPriorityToEngage);
        } catch (\Exception $e) {

            Log::error("Error getting count data: " . $e->getMessage());
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }
    public function getListForTotalEngaged()
    {
        try {

            $userRole = Auth::user()->roles;
            $userStore = Auth::user()->office;

            $userRole === 'Administrator' ?
                $listOfTotalEngaged = DataLmtLists::where('engagement_status', 'Engaged')
                ->select('id', 'office', 'district', 'school', 'name', 'account_status', 'renewal_remarks', 'engagement_status', 'progress_report', 'action_taken_by')
                ->orderBy('updated_at', 'desc')
                ->get()
                :
                $listOfTotalEngaged = DataLmtLists::where('engagement_status', 'Engaged')
                ->where('office', $userStore)
                ->select('id', 'office', 'district', 'school', 'name', 'account_status', 'renewal_remarks', 'engagement_status', 'progress_report', 'action_taken_by')
                ->orderBy('updated_at', 'desc')
                ->get();

            return response()->json($listOfTotalEngaged);
        } catch (\Exception $e) {

            Log::error("Error getting list: " . $e->getMessage());
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }
    public function getListForPriorityToEngage()
    {
        try {

            $userRole = Auth::user()->roles;
            $userStore = Auth::user()->office;

            $userRole === 'Administrator' ?
                $listOfPriorityToEngage = DataLmtLists::where('priority_to_engage', 'Yes')
                ->select('id', 'office', 'district', 'school', 'name', 'account_status', 'renewal_remarks')
                ->orderBy('updated_at', 'desc')
                ->get()
                :
                $listOfPriorityToEngage = DataLmtLists::where('priority_to_engage', 'Yes')
                ->where('office', $userStore)
                ->select('id', 'office', 'district', 'school', 'name', 'account_status', 'renewal_remarks')
                ->orderBy('updated_at', 'desc')
                ->get();

            return response()->json($listOfPriorityToEngage);
        } catch (\Exception $e) {

            Log::error("Error getting list: " . $e->getMessage());
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }
}
