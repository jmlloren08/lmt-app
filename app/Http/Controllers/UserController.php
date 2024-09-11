<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    public function getUsers()
    {
        try {

            $users = User::select('id', 'name', 'email', 'email_verified_at', 'created_at', 'updated_at', 'roles')->orderBy('updated_at', 'desc')->get();

            return response()->json($users);
        } catch (\Exception $e) {

            Log::error("Error fetching users: " . $e->getMessage());
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }
    public function update(Request $request, $id)
    {
        try {

            $request->validate([
                'roles' => ['required', 'string']
            ]);

            $roles = User::findOrFail($id);

            $roles->roles = $request->roles;
            $roles->save();

            return response()->json(['success' => 'Role successfully assigned.']);
        } catch (\Exception $e) {

            Log::error("Error assigning role: " . $e->getMessage());
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }
    public function cancel(Request $request, $id)
    {
        try {

            $roles = User::findOrFail($id);

            $roles->roles = $request->roles;
            $roles->save();

            return response()->json(['success' => 'Role successfully cancelled.']);
        } catch (\Exception $e) {

            Log::error("Error cancelling role: " . $e->getMessage());
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }
    public function delete($id)
    {
        try {

            User::where('id', $id)->delete();

            return response()->json(['success' => 'User removed successfully.'], 200);
        } catch (\Exception $e) {

            Log::error("Error removing user: " . $e->getMessage());
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }
}
