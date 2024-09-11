<?php

namespace App\Http\Controllers;

use App\Models\DataLmtLists;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class DataLmtListsController extends Controller
{
    public function getDistinctOffice()
    {
        try {

            $users = Auth::user()->roles;
            $userOffice = Auth::user()->office;

            $users === 'Administrator' ? $offices = DataLmtLists::select('office')->distinct()->get() : $offices = DataLmtLists::where('office', $userOffice)->distinct()->get();

            return response()->json($offices);
        } catch (\Exception $e) {

            Log::error("Error fetching offices: " . $e->getMessage());
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }
    public function getLists(Request $request)
    {
        try {

            $users = Auth::user()->roles;
            $userOffice = Auth::user()->office;
            $store = $request->store;

            $query = DataLmtLists::query();

            if ($users === 'Administrator') {
                if (!is_null($store)) {
                    $query->where('office', $store);
                }
            } else {
                $query->where('office', $userOffice);
            }

            $lists = $query->select('id', 'name', 'account_status', 'eligibility')->get();

            return response()->json($lists);
        } catch (\Exception $e) {

            Log::error("Error fetching lists: " . $e->getMessage());
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }
    public function getAccountStatus(Request $request)
    {
        try {

            $users = Auth::user()->roles;
            $userOffice = Auth::user()->office;
            $store = $request->store;

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

            // query the data for each status, optionally filtering by store
            foreach ($statuses as $status) {

                $query = DataLmtLists::where('account_status', $status);

                if ($users === 'Administrator') {
                    if (!is_null($store)) {
                        $query->where('office', $store);
                    }
                } else {
                    $query->where('office', $userOffice);
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

            $otherData = DataLmtLists::select('school', 'district', 'gtd', 'prncpl', 'tsndng', 'ntrst', 'mrtztn', 'ewrbddctn', 'nthp', 'nddctd', 'dedstat', 'ntprcd', 'mntd', 'engagement_status', 'progress_report')
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
}
