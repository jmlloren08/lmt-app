<?php

namespace App\Models;

use App\Imports\DataLmtListsImport;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Maatwebsite\Excel\Facades\Excel;

class DataLmtLists extends Model
{
    use HasFactory;

    protected $fillable = [
        'store',
        'name',
        'account_status',
        'renewal_remarks',
        'school',
        'district',
        'area',
        'assigned_to',
        'is_priority',
        'priority_requested_at',
        'priority_requested_by',
        'gtd',
        'prncpl',
        'tsndng',
        'ntrst',
        'mrtztn',
        'ewrbddctn',
        'nthp',
        'nddctd',
        'dedstat',
        'ntprcd',
        'mntd',
        'client_status',
        'engagement_status',
        'progress_report',
        'priority_to_engage',
        'action_taken_by',
        'is_archived',
        'upload_date',
        'uploaded_by'
    ];

    protected $casts = [
        'is_priority' => 'boolean',
        'priority_requested_at' => 'timestamp',
        'is_archived' => 'boolean',
        'upload_date' => 'timestamp',
    ];


    public static function processUpload($file)
    {
        // Archive existing records
        self::where('is_archived', false)->update(['is_archived' => true]);

        // Import new data
        Excel::import(new DataLmtListsImport, $file);
    }

    public static function getStoresList()
    {
        return self::where('is_archived', false)
            ->select('store')
            ->distinct()
            ->orderBy('store')
            ->pluck('store');
    }
}
