<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\Queue;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        
        // Fake the queue to prevent broadcasting events from trying to connect to Pusher
        // This allows model events to fire normally while preventing broadcast connection errors
        Queue::fake();
    }
}
