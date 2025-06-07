<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class UserManagementController extends Controller
{
    public function index()
    {
        $users = User::select('id', 'name', 'email', 'roles')
            ->where('roles', '!=', 'administrator')
            ->get();

        return Inertia::render('UserManagement/Index', [
            'users' => $users,
            'userRole' => Auth::user()->roles,
        ]);
    }

    public function assignRole(Request $request, User $user)
    {
        $request->validate([
            'role' => ['required', 'string', Rule::in(['division_leader', 'team_leader', 'loan_specialist'])],
        ]);

        try {
            DB::beginTransaction();
            // Update user role
            $user->roles = $request->role;
            $user->save();
            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Role assigned successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to assign role: ' . $e->getMessage()
            ], 500);
        }
    }
}
