<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class IncreaseUploadSize
{
    public function handle(Request $request, Closure $next)
    {
        // Increase PHP's memory limit
        ini_set('memory_limit', '512M');
        
        // Increase max execution time
        ini_set('max_execution_time', '600');
        
        // Increase post max size
        ini_set('post_max_size', '15M');
        
        // Increase upload max filesize
        ini_set('upload_max_filesize', '15M');

        // Log limits after changes
        // Log::info('Updated PHP limits:', [
        //     'memory_limit' => ini_get('memory_limit'),
        //     'post_max_size' => ini_get('post_max_size'),
        //     'upload_max_filesize' => ini_get('upload_max_filesize'),
        //     'max_execution_time' => ini_get('max_execution_time'),
        // ]);
        
        return $next($request);
    }
} 