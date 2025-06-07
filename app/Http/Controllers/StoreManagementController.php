<?php

namespace App\Http\Controllers;

use App\Models\DataLmtLists;
use App\Models\User;
use App\Models\UserStoreAssignment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class StoreManagementController extends Controller
{
    /**
     * Display the store management page
     */
    public function index()
    {
        try {
            $users = User::select('id', 'name', 'email', 'roles', 'store', 'area')
                ->where('roles', '!=', 'administrator')
                ->get();

            return Inertia::render('StoreManagement/Index', [
                'users' => $users,
                'userRole' => Auth::user()->roles,
            ]);
        } catch (\Exception $e) {
            Log::error("Error rendering store management page: " . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to load store management page');
        }
    }

    public function getDistinctStores()
    {
        try {
            $userRole = Auth::user()->roles;

            $query = DataLmtLists::select('store')
                ->distinct()
                ->orderBy('store', 'asc');

            if ($userRole === 'administrator' || $userRole === 'division_leader' || $userRole === 'team_leader') {
                $stores = $query->get()->map(function ($store) {
                    return [
                        'value' => $store->store,
                        'label' => $store->store
                    ];
                });
                return response()->json($stores);
            }

            return response()->json([]);
        } catch (\Exception $e) {
            Log::error("Error fetching stores: " . $e->getMessage());
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }

    public function assignStore(Request $request, User $user)
    {
        $request->validate([
            'store_name' => 'required|string|max:255',
            'area_name' => 'nullable|string|max:255',
        ]);

        try {
            DB::beginTransaction();

            // Update user store
            $user->store = $request->store_name;
            $user->area = $request->area_name;
            $user->save();

            // Create or update the user store assignment
            UserStoreAssignment::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'store_name' => $request->store_name,
                    'area_name' => $request->area_name,
                    'assigned_by' => Auth::id(),
                ]
            );

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Store assigned successfully',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error assigning store: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to assign store: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function getAreasForStore($storeName)
    {
        try {
            $areas = DataLmtLists::select('area')
                ->where('store', $storeName)
                ->whereNotNull('area')
                ->distinct()
                ->orderBy('area', 'asc')
                ->get()
                ->map(function ($area) {
                    return [
                        'value' => $area->area,
                        'label' => $area->area
                    ];
                });

            return response()->json($areas);
        } catch (\Exception $e) {
            Log::error("Error fetching areas for store {$storeName}: " . $e->getMessage());
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }
}
