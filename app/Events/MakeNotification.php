<?php

namespace App\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MakeNotification
{
    use Dispatchable, SerializesModels;

    public string $type;
    public int $recipientId;
    public array $data;

    public function __construct(string $type, int $recipientId, array $data)
    {
        $this->type = $type;
        $this->recipientId = $recipientId;
        $this->data = $data;
    }
}
