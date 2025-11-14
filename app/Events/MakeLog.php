<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MakeLog
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public string $type;
    public string $module_id;
    public string $title;
    public string $description;
    public ?int $user_id;



    public function __construct(string $type, string $module_id, string $title, string $description, ?int $user_id)
    {
        $this->type = $type;
        $this->module_id = $module_id;
        $this->title = $title;
        $this->description = $description;
        $this->user_id = $user_id;
    }
 }
