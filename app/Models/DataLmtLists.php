<?php

namespace App\Models;

use App\Imports\DataLmtListsImport;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Maatwebsite\Excel\Facades\Excel;

class DataLmtLists extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'office',
        'name',
        'account_status',
        'renewal_remarks',
        'school',
        'district',
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
        'area',
        'engagement_status',
        'progress_report',
        'priority_to_engage',
        'action_taken_by',
        'is_archived',
        'upload_date',
        'uploaded_by',
    ];
    public static function processUpload($file)
    {
        // Archive existing records
        self::where('is_archived', false)->update(['is_archived' => true]);

        // Import new data
        Excel::import(new DataLmtListsImport, $file);
    }
    public function getCurrentData()
    {
        return self::where('is_archived', false)->get();
    }
    public function getArchivedData()
    {
        return self::where('is_archived', true)->get();
    }
}
