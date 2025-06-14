<?php

namespace App\Exports;

use App\Models\DataLmtLists;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class EngagedListExport implements FromCollection, WithHeadings, WithMapping
{
    protected $month;
    protected $converted;
    protected $user;

    public function __construct($month = null, $converted = null, $user = null)
    {
        $this->month = $month;
        $this->converted = $converted;
        $this->user = $user;
    }

    public function collection()
    {
        $query = DataLmtLists::where('engagement_status', 'Engaged')
            ->select('store', 'area', 'school', 'name', 'account_status', 'renewal_remarks', 'converted', 'converted_by', 'progress_report', 'action_taken_by', 'updated_at')
            ->orderBy('updated_at', 'desc');

        // Apply role-based filters
        if ($this->user) {
            $userRole = strtolower($this->user->roles);
            if ($userRole === 'team_leader') {
                $query->where('store', $this->user->store);
            } elseif ($userRole === 'loan_specialist') {
                $query->where('store', $this->user->store)
                    ->where('area', $this->user->area);
            }
        }

        // Apply month filter if selected
        if ($this->month !== null) {
            $query->whereMonth('updated_at', $this->month + 1);
        }

        // Apply conversion filter if selected
        if ($this->converted !== null) {
            $query->where('converted', $this->converted);
        }

        return $query->get();
    }

    public function headings(): array
    {
        return [
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
            'Date Engaged'
        ];
    }

    public function map($row): array
    {
        return [
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
        ];
    }
}
