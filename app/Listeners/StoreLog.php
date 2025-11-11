<?php

namespace App\Listeners;

use App\Events\MakeLog;
use App\Models\Log;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class StoreLog
{
      use InteractsWithQueue;
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(MakeLog $event): void
    {
        Log::create([
            'type' => $event->type,
            'module_id' => $event->module_id,
            'module_type' => $event->module_id,
            'title' => $event->title,
            'description' => $event->description,
            'logged_by_id' => $event->user_id,
        ]);
    }
}
