<?php

namespace App\Http\Controllers;

use App\Models\DataLmtLists;
use App\Models\School;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SchoolController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {

            $schools = School::select('id', 'school', 'district')->get();

            return response()->json($schools);
        } catch (\Exception $e) {
            Log::error("Error getting schools: " . $e->getMessage());
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        try {

            $school = School::select(['ttp', 'comma', 'f_v_b', 'bdo_nb', 'c_b_s', 'c_s_v', 'e_b_i', 'f_c_b', 'gsis_cl', 'gsis_fa', 'gsis_el', 'memba', 'phil_life', 'plfac', 'p_b', 'ucpb', 'w_b', 'grand_total', 'separation', 'elem_sec'])
                ->where('id', $id)
                ->first();

            if (!$school) {
                return response()->json(['errors' => 'Data not found.'], 404);
            }

            return response()->json($school);
        } catch (\Exception $e) {

            Log::error("Error fetching school profile: " . $e->getMessage());
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(School $school)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, School $school)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(School $school)
    {
        //
    }
}
