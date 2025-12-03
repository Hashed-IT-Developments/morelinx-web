<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TransactionOrCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public string $orNumber;
    public int $numericOr;
    public string $userName;
    public string $timestamp;

    /**
     * Create a new event instance.
     */
    public function __construct(string $orNumber, int $numericOr, string $userName)
    {
        $this->orNumber = $orNumber;
        $this->numericOr = $numericOr;
        $this->userName = $userName;
        $this->timestamp = now()->toIso8601String();
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): PrivateChannel
    {
        return new PrivateChannel('or-numbers');
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'transaction-or-created';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'or_number' => $this->orNumber,
            'numeric_or' => $this->numericOr,
            'user_name' => $this->userName,
            'timestamp' => $this->timestamp,
        ];
    }
}
