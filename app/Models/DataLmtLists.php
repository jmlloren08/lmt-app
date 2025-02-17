<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
        'eligibility',
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
        'action_taken_by'
    ];
}
