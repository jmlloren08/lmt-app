<?php

namespace App\Http\Controllers;

use App\Models\DataLmtLists;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TeacherController extends Controller
{
    public function getTeachers()
    {
        try {

            $teachers = DataLmtLists::select('name', 'school', 'position')->get();

            return response()->json($teachers);

        } catch (\Exception $e) {
            Log::error("Error getting schools: " . $e->getMessage());
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }
}
