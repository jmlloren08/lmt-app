<?php

namespace App\Http\Controllers;

use App\Models\DataLmtLists;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class DataLmtListsController extends Controller
{
    public function getDistinctStore()
    {
        try {

            $userRole = Auth::user()->roles;
            $userOffice = Auth::user()->office;

            $userRole === 'Administrator' ?
                $offices = DataLmtLists::select('office')->distinct()->get()
                :
                $offices = DataLmtLists::where('office', $userOffice)->distinct()->get();

            return response()->json($offices);
        } catch (\Exception $e) {

            Log::error("Error fetching stores: " . $e->getMessage());
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }
    public function getDistricts(Request $request)
    {
        try {
            $store = $request->store;
            $districts = DataLmtLists::where('office', $store)
                ->select('district')
                ->distinct()
                ->get();

            return response()->json($districts);
        } catch (\Exception $e) {

            Log::error("Error fetching districts: " . $e->getMessage());
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }
    public function getSchools(Request $request)
    {
        try {
            $district = $request->district;
            $schools = DataLmtLists::where('district', $district)
                ->select('school')
                ->distinct()
                ->get();

            return response()->json($schools);
        } catch (\Exception $e) {

            Log::error("Error fetching schools: " . $e->getMessage());
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }
    public function getListWhereSchoolIS(Request $request)
    {
        try {

            $school = $request->school;

            $query = DataLmtLists::query();

            if (!is_null($school)) {
                $query->where('school', $school);
            }

            $lists = $query->select('id', 'name', 'account_status', 'eligibility')->get();

            return response()->json($lists);
        } catch (\Exception $e) {

            Log::error("Error fetching schools: " . $e->getMessage());
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }
    public function getAccountStatusWhereSchoolIs(Request $request)
    {
        try {

            $school = $request->school;

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

                $query = DataLmtLists::where('account_status', $status);

                if (!is_null($school)) {
                    $query->where('school', $school);
                }

                $counts[$status] = $query->count();
            }

            return response()->json($counts);
        } catch (\Exception $e) {

            Log::error("Error fetching account status: " . $e->getMessage());
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
                'progress_report' => ['required', 'string'],
                'priority_to_engage' => ['required', 'string'],
                'action_taken_by' => ['required', 'string']
            ]);

            $engageData = DataLmtLists::findOrFail($id);

            $engageData->engagement_status = $request->engagement_status;
            $engageData->progress_report = $request->progress_report;
            $engageData->priority_to_engage = $request->priority_to_engage;
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
                ->select('id', 'office', 'district', 'school', 'name', 'account_status', 'eligibility', 'engagement_status', 'progress_report', 'action_taken_by')
                ->orderBy('updated_at', 'desc')
                ->get()
                :
                $listOfTotalEngaged = DataLmtLists::where('engagement_status', 'Engaged')
                ->where('office', $userStore)
                ->select('id', 'office', 'district', 'school', 'name', 'account_status', 'eligibility', 'engagement_status', 'progress_report', 'action_taken_by')
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
                ->select('id', 'office', 'district', 'school', 'name', 'account_status', 'eligibility')
                ->orderBy('updated_at', 'desc')
                ->get()
                :
                $listOfPriorityToEngage = DataLmtLists::where('priority_to_engage', 'Yes')
                ->where('office', $userStore)
                ->select('id', 'office', 'district', 'school', 'name', 'account_status', 'eligibility')
                ->orderBy('updated_at', 'desc')
                ->get();

            return response()->json($listOfPriorityToEngage);
        } catch (\Exception $e) {

            Log::error("Error getting list: " . $e->getMessage());
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }
}
