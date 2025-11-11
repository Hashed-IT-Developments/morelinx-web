<?php

namespace App\Listeners;

use App\Events\CreatedNotification;
use App\Events\MakeNotification;
use App\Models\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class StoreNotification implements ShouldQueue
{
    use InteractsWithQueue;

  
    public function __construct()
    {
       
    }


    public function handle(MakeNotification $event): void
    {
       $notification = Notification::create([
            'user_id' => $event->recipientId,
            'type' => $event->type,
            'title' => $event->data['title'],
            'description' => $event->data['description'],
            'link' => $event->data['link'] ?? null,
        ]);


        broadcast(new CreatedNotification($notification))->toOthers();
    }
}
