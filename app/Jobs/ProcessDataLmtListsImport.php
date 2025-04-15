<?php

namespace App\Jobs;

use App\Events\ImportProgress;
use App\Imports\DataLmtListsImport;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Facades\Excel;

class ProcessDataLmtListsImport implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $filePath;
    protected $totalRows;
    protected $fileName;

    public function __construct($filePath, $totalRows, $fileName)
    {
        $this->filePath = $filePath;
        $this->totalRows = $totalRows;
        $this->fileName = $fileName;
    }

    public function handle()
    {
        try {
            Log::info("Starting background import process");
            
            $import = new DataLmtListsImport();
            $import->setTotalRows($this->totalRows);
            $import->setFileName($this->fileName);
            
            Excel::import($import, $this->filePath);
            
            // Broadcast completion
            event(new ImportProgress(100, $this->totalRows, $this->totalRows, $this->fileName));
            
            Log::info("Background import completed successfully");
            
            // Clean up the temporary file
            if (file_exists($this->filePath)) {
                unlink($this->filePath);
            }
        } catch (\Exception $e) {
            Log::error("Error in background import: " . $e->getMessage());
            throw $e;
        }
    }
} 