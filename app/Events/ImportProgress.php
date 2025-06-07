<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ImportProgress implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $progress;
    public $totalRows;
    public $processedRows;
    public $fileName;

    public function __construct($progress, $totalRows, $processedRows, $fileName)
    {
        Log::info('ImportProgress event constructed', [
            'progress' => $progress,
            'totalRows' => $totalRows,
            'processedRows' => $processedRows,
            'fileName' => $fileName
        ]);

        $this->progress = $progress;
        $this->totalRows = $totalRows;
        $this->processedRows = $processedRows;
        $this->fileName = $fileName;
    }

    public function broadcastOn()
    {
        Log::info('Broadcasting on import-progress channel');
        return new Channel('import-progress');
    }

    public function broadcastAs()
    {
        return 'ImportProgress';
    }

    public function broadcastWith()
    {
        $data = [
            'progress' => $this->progress,
            'totalRows' => $this->totalRows,
            'processedRows' => $this->processedRows,
            'fileName' => $this->fileName
        ];
        Log::info('Broadcasting data:', $data);
        return $data;
    }
}