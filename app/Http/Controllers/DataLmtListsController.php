<?php

namespace App\Http\Controllers;

use App\Models\DataLmtLists;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

use function PHPUnit\Framework\isNull;

class DataLmtListsController extends Controller
{
    public function getDistinctOffice()
    {
        try {

            $offices = DataLmtLists::select('office')->distinct()->get();

            return response()->json($offices);
        } catch (\Exception $e) {

            Log::error("Error fetching offices: " . $e->getMessage());
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }
    public function getLists(Request $request)
    {
        try {
            // get the selected store from the request
            $store = $request->store;
            // if a store is selected, filter the data by the selected store
            $query = DataLmtLists::query();
            // if store found
            if (!is_null($store)) {
                $query->where('office', $store);
            }
            // fetch the lists based on the query
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

            // get the selected store from the request
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
                if (!is_null($store)) {
                    $query->where('office', $store);
                }
                $counts[$status] = $query->count();
            }

            return response()->json($counts);
        } catch (\Exception $e) {

            Log::error("Error fetching account status: " . $e->getMessage());
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }
}
