<?php

namespace App\Http\Controllers;

use App\Models\DataLmtLists;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use App\Jobs\ProcessDataLmtListsImport;

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
    public function getDistinctStore()
    {
        try {
            $user = Auth::user();
            $userRole = strtolower($user->roles);

            $query = DataLmtLists::select('store')
                ->distinct()
                ->orderBy('store', 'asc');

            // Administrator and Division Leader can see all stores
            if ($userRole === 'administrator' || $userRole === 'division_leader') {
                return response()->json($query->get());
            }

            // Team Leader and Loan Specialist can only see their assigned store
            if ($userRole === 'team_leader' || $userRole === 'loan_specialist') {
                return response()->json([['store' => $user->store]]);
            }

            return response()->json([]);
        } catch (\Exception $e) {
            Log::error("Error fetching stores: " . $e->getMessage());
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }
    public function getDistinctDistrict(Request $request)
    {
        try {
            $user = Auth::user();
            $userRole = strtolower($user->roles);
            $store = $request->store;

            if (!$store) {
                return response()->json(['message' => 'Store parameter is required'], 400);
            }

            $query = DataLmtLists::where('store', $store)
                ->whereNot('district', 'SCHOOL TO BE IDENTIFY')
                ->select('district')
                ->distinct()
                ->orderBy('district', 'asc');

            // All roles can see districts for their assigned store
            if ($userRole === 'administrator' || $userRole === 'division_leader' || 
                ($userRole === 'team_leader' && $store === $user->store) ||
                ($userRole === 'loan_specialist' && $store === $user->store)) {
                return response()->json($query->get());
            }

            return response()->json(['message' => 'Unauthorized access'], 403);
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
            $user = Auth::user();
            $userRole = strtolower($user->roles);

            $validated = $request->validate([
                'store' => ['nullable', 'string'],
                'district' => ['nullable', 'string'],
                'school' => ['nullable', 'string'],
                'account_status' => ['nullable', 'string'],
                'renewal_remarks' => ['nullable', 'string']
            ]);

            $query = DataLmtLists::query();

            // Apply role-based filters
            if ($userRole === 'team_leader') {
                $query->where('store', $user->store);
            } elseif ($userRole === 'loan_specialist') {
                $query->where('store', $user->store)
                      ->where('area', $user->area);
            }

            // Apply user filters
            foreach ($validated as $column => $value) {
                $query->when($value, function ($q) use ($column, $value) {
                    return $q->where($column, $value);
                });
            }

            $lists = $query->select('id', 'name', 'account_status', 'renewal_remarks')
                ->whereNull('engagement_status')
                ->get();

            return response()->json(['lists' => $lists]);
        } catch (\Exception $e) {
            Log::error("Error fetching filtered data: " . $e->getMessage());
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }
    public function getAccountStatusWhereFilters(Request $request)
    {
        try {
            $user = Auth::user();
            $userRole = strtolower($user->roles);

            $query = DataLmtLists::query();

            // Apply role-based filters
            if ($userRole === 'team_leader') {
                $query->where('store', $user->store);
            } elseif ($userRole === 'loan_specialist') {
                $query->where('store', $user->store)
                      ->where('area', $user->area);
            }

            // Apply store, district, and school filters for pie chart
            if ($request->filled('store')) {
                $query->where('store', $request->store);
            }
            if ($request->filled('district')) {
                $query->where('district', $request->district);
            }
            if ($request->filled('school')) {
                $query->where('school', $request->school);
            }

            // Only apply account_status and renewal_remarks filters if they are provided
            // and if this is not a pie chart request
            if (!$request->isPieChart) {
                if ($request->filled('account_status')) {
                    $query->where('account_status', $request->account_status);
                }
                if ($request->filled('renewal_remarks')) {
                    $query->where('renewal_remarks', $request->renewal_remarks);
                }
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
                $query->where('store', $request->store);
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
            $user = Auth::user();
            $userRole = strtolower($user->roles);

            $query = DataLmtLists::where('engagement_status', 'Engaged');

            // Apply role-based filters
            if ($userRole === 'team_leader') {
                $query->where('store', $user->store);
            } elseif ($userRole === 'loan_specialist') {
                $query->where('store', $user->store)
                      ->where('area', $user->area);
            }

            $count = $query->count();
            return response()->json($count);
        } catch (\Exception $e) {
            Log::error("Error getting count data: " . $e->getMessage());
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }
    public function getCountPriorityToEngage()
    {
        try {
            $user = Auth::user();
            $userRole = strtolower($user->roles);

            $query = DataLmtLists::where('priority_to_engage', 'Yes');

            // Apply role-based filters
            if ($userRole === 'team_leader') {
                $query->where('store', $user->store);
            } elseif ($userRole === 'loan_specialist') {
                $query->where('store', $user->store)
                      ->where('area', $user->area);
            }

            $count = $query->count();
            return response()->json($count);
        } catch (\Exception $e) {
            Log::error("Error getting count data: " . $e->getMessage());
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }
    public function getListForTotalEngaged()
    {
        try {
            $user = Auth::user();
            $userRole = strtolower($user->roles);

            $query = DataLmtLists::where('engagement_status', 'Engaged')
                ->select('id', 'store', 'district', 'school', 'name', 'account_status', 'renewal_remarks', 'engagement_status', 'progress_report', 'action_taken_by')
                ->orderBy('updated_at', 'desc');

            // Apply role-based filters
            if ($userRole === 'team_leader') {
                $query->where('store', $user->store);
            } elseif ($userRole === 'loan_specialist') {
                $query->where('store', $user->store)
                      ->where('area', $user->area);
            }

            $list = $query->get();
            return response()->json($list);
        } catch (\Exception $e) {
            Log::error("Error getting list: " . $e->getMessage());
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }
    public function getListForPriorityToEngage()
    {
        try {
            $user = Auth::user();
            $userRole = strtolower($user->roles);

            $query = DataLmtLists::where('priority_to_engage', 'Yes')
                ->select('id', 'store', 'district', 'school', 'name', 'account_status', 'renewal_remarks')
                ->orderBy('updated_at', 'desc');

            // Apply role-based filters
            if ($userRole === 'team_leader') {
                $query->where('store', $user->store);
            } elseif ($userRole === 'loan_specialist') {
                $query->where('store', $user->store)
                      ->where('area', $user->area);
            }

            $list = $query->get();
            return response()->json($list);
        } catch (\Exception $e) {
            Log::error("Error getting list: " . $e->getMessage());
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }
    public function getDistinctArea(Request $request)
    {
        try {
            $user = Auth::user();
            $userRole = strtolower($user->roles);
            $store = $request->store;
            $district = $request->district;

            if (!$store || !$district) {
                return response()->json(['message' => 'Store and district parameters are required'], 400);
            }

            $query = DataLmtLists::where('store', $store)
                ->where('district', $district)
                ->whereNot('area', 'SCHOOL TO BE IDENTIFY')
                ->select('area')
                ->distinct()
                ->orderBy('area', 'asc');

            // Administrator can see all areas
            if ($userRole === 'administrator') {
                return response()->json($query->get());
            }

            return response()->json(['message' => 'Unauthorized access'], 403);
        } catch (\Exception $e) {
            Log::error("Error fetching areas: " . $e->getMessage());
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }
}
