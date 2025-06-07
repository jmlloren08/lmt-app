<?php

namespace App\Imports;

use App\Events\ImportProgress;
use App\Models\DataLmtLists;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class DataLmtListsImport implements ToModel, WithHeadingRow, WithValidation, WithChunkReading
{
    private $processedCount = 0;
    private $totalRows = 0;
    private $batchSize = 50; // Reduced chunk size
    private $lastMemoryCheck = 0;
    private $fileName;

    public function setTotalRows($totalRows)
    {
        $this->totalRows = $totalRows;
    }

    public function setFileName($fileName)
    {
        $this->fileName = $fileName;
    }

    public function chunkSize(): int
    {
        return $this->batchSize;
    }

    public function model(array $row)
    {
        $this->processedCount++;
        
        // Log progress every 50 rows
        if ($this->processedCount % 50 === 0) {
            $progress = round(($this->processedCount / $this->totalRows) * 100, 2);
            Log::info("Processing row {$this->processedCount} of {$this->totalRows} ({$progress}%)");
            
            // Broadcast progress
            event(new ImportProgress($progress, $this->totalRows, $this->processedCount, $this->fileName));
            
            // Check memory usage every 1000 rows
            if ($this->processedCount - $this->lastMemoryCheck >= 1000) {
                $this->lastMemoryCheck = $this->processedCount;
                $memoryUsage = memory_get_usage(true) / 1024 / 1024;
                Log::info("Memory usage: {$memoryUsage} MB");
                
                // Clear memory if usage is high
                if ($memoryUsage > 256) { // 256MB threshold
                    gc_collect_cycles();
                    DB::disconnect();
                    DB::reconnect();
                }
            }
        }

        // Skip empty rows
        if (empty(array_filter($row))) {
            return null;
        }

        return new DataLmtLists([
            'store' => $row['store'] ?? null,
            'name' => $row['name'] ?? null,
            'account_status' => $row['account_status'] ?? null,
            'renewal_remarks' => $row['renewal_remarks'] ?? null,
            'school' => $row['school'] ?? null,
            'district' => $row['district'] ?? null,
            'gtd' => $row['gtd'] ?? null,
            'prncpl' => $row['prncpl'] ?? null,
            'tsndng' => $row['tsndng'] ?? null,
            'ntrst' => $row['ntrst'] ?? null,
            'mrtztn' => $row['mrtztn'] ?? null,
            'ewrbddctn' => $row['ewrbddctn'] ?? null,
            'nthp' => $row['nthp'] ?? null,
            'nddctd' => $row['nddctd'] ?? null,
            'dedstat' => $row['dedstat'] ?? null,
            'ntprcd' => $row['ntprcd'] ?? null,
            'mntd' => $row['mntd'] ?? null,
            'client_status' => $row['client_status'] ?? null,
            'area' => $row['area'] ?? null,
            'engagement_status' => $row['engagement_status'] ?? null,
            'progress_report' => $row['progress_report'] ?? null,
            'priority_to_engage' => $row['priority_to_engage'] ?? null,
            'action_taken_by' => $row['action_taken_by'] ?? null,
            'is_archived' => false,
            'upload_date' => now(),
            'uploaded_by' => Auth::id(),
        ]);
    }

    public function rules(): array
    {
        return [
            'store' => 'required|string',
            'name' => 'required|string',
            'account_status' => 'required|string',
            // 'renewal_remarks' => 'required|string',
            'school' => 'required|string',
            'district' => 'required|string',
            'client_status' => 'required|string',
            'area' => 'required|string',
        ];
    }
}
