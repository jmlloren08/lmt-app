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

            $users = User::select('name', 'email', 'email_verified_at', 'created_at', 'updated_at', 'roles')->get();

            return response()->json($users);
        } catch (\Exception $e) {

            Log::error("Error fetching users: " . $e->getMessage());
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }
}
