<?php

namespace App\Http\Controllers;

use App\Exports\EngagedListExport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Facades\Excel;

class DownloadController extends Controller
{
    public function downloadEngagedList(Request $request)
    {
        try {
            $user = Auth::user();

            if ($request->format === 'csv') {
                $headers = [
                    'Content-Type' => 'text/csv',
                    'Content-Disposition' => 'attachment; filename="engaged_list.csv"',
                ];

                $callback = function() use ($request, $user) {
                    $data = (new EngagedListExport($request->month, $request->converted, $user))->collection();
                    $file = fopen('php://output', 'w');
                    
                    // Add headers
                    fputcsv($file, [
                        'Store',
                        'Area',
                        'School',
                        'Name',
                        'Account Status',
                        'Eligibility',
                        'Converted',
                        'Converted By',
                        'Progress Report',
                        'Engaged By',
                        'Date Engaged',
                    ]);
                    
                    // Add data rows
                    foreach ($data as $row) {
                        fputcsv($file, [
                            $row->store,
                            $row->area,
                            $row->school,
                            $row->name,
                            $row->account_status,
                            $row->renewal_remarks,
                            $row->converted,
                            $row->converted_by,
                            $row->progress_report,
                            $row->action_taken_by,
                            $row->updated_at
                        ]);
                    }
                    
                    fclose($file);
                };

                return response()->stream($callback, 200, $headers);
            } else {
                return Excel::download(
                    new EngagedListExport($request->month, $request->converted, $user),
                    'engaged_list.xlsx'
                );
            }
        } catch (\Exception $e) {
            Log::error("Error downloading engaged list: " . $e->getMessage());
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }
}
