<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ImportProgress implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $progress;
    public $totalRows;
    public $processedRows;
    public $fileName;

    public function __construct($progress, $totalRows, $processedRows, $fileName)
    {
        $this->progress = $progress;
        $this->totalRows = $totalRows;
        $this->processedRows = $processedRows;
        $this->fileName = $fileName;
    }

    public function broadcastOn()
    {
        return new Channel('import-progress');
    }

    public function broadcastAs()
    {
        return 'import.progress';
    }
} 