<?php

namespace App\Http\Controllers;

use App\Models\DataLmtLists;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TeacherController extends Controller
{
    public function index()
    {
        try {

            $teachers = DataLmtLists::select('id', 'name', 'office', 'district', 'school')
                ->where('district', '=', 'SCHOOL TO BE IDENTIFY')
                ->where('school', '=', 'SCHOOL TO BE IDENTIFY')
                ->get();

            return response()->json($teachers);
        } catch (\Exception $e) {
            Log::error("Error getting teachers: " . $e->getMessage());
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }
    public function update(Request $request, $id)
    {
        try {

            $request->validate([
                'district' => 'required',
                'school' => 'required'
            ]);

            if (!$id) {
                return response()->json(['error' => 'Teacher ID is required.'], 400);
            }

            DataLmtLists::where('id', $id)
                ->update([
                    'district' => $request->district,
                    'school' => $request->school
                ]);

            return response()->json(['success' => 'Teacher successfully assigned school.']);
        } catch (\Exception $e) {
            Log::error("Error updating teachers: " . $e->getMessage());
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }
}
