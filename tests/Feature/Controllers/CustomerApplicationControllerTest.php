<?php

namespace Tests\Feature\Controllers;

use App\Models\CustomerApplication;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustomerApplicationControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_summary_endpoint_returns_application_data()
    {
        // Create a user
        $user = User::factory()->create();
        
        // Create a customer application
        $application = CustomerApplication::factory()->create();
        
        // Act as the user and make request
        $response = $this->actingAs($user)
            ->getJson(route('customer-applications.summary', ['application' => $application->id]));
        
        // Assert the response
        $response->assertStatus(200)
            ->assertJsonStructure([
                'id',
                'account_number',
                'full_name',
                'identity',
                'email_address',
                'full_address',
                'status',
                'attachments_count',
                'attachments' => [
                    '*' => [
                        'id',
                        'type',
                        'path',
                        'url',
                        'filename',
                        'extension',
                        'is_image',
                        'mime_type',
                        'size',
                                        'created_at',
                'created_at_formatted',
                'created_at_human',
                'updated_at',
                    ]
                ],
                'inspections_count',
                'customer_type',
                'barangay',
                'district',
                'bill_info',
            ]);
        
        // Assert specific data
        $response->assertJson([
            'id' => $application->id,
            'full_name' => $application->full_name,
        ]);
    }

    public function test_summary_endpoint_requires_authentication()
    {
        // Create a customer application
        $application = CustomerApplication::factory()->create();
        
        // Make request without authentication
        $response = $this->getJson(route('customer-applications.summary', ['application' => $application->id]));
        
        // Assert unauthorized
        $response->assertStatus(401); // Unauthorized JSON response
    }

    public function test_summary_endpoint_uses_caching()
    {
        // Create a user and application
        $user = User::factory()->create();
        $application = CustomerApplication::factory()->create();
        
        // Clear any existing cache
        \Illuminate\Support\Facades\Cache::forget("application_summary_{$application->id}_{$application->status}");
        
        // First request should hit the database and cache the result
        $startTime = microtime(true);
        $response1 = $this->actingAs($user)
            ->getJson(route('customer-applications.summary', ['application' => $application->id]));
        $firstRequestTime = microtime(true) - $startTime;
        
        // Second request should be faster (served from cache)
        $startTime = microtime(true);
        $response2 = $this->actingAs($user)
            ->getJson(route('customer-applications.summary', ['application' => $application->id]));
        $secondRequestTime = microtime(true) - $startTime;
        
        // Both responses should be successful and identical
        $response1->assertStatus(200);
        $response2->assertStatus(200);
        $this->assertEquals($response1->json(), $response2->json());
        
        // Second request should generally be faster (though this isn't guaranteed in all environments)
        // We'll just verify the cache key exists
        $cacheKey = "application_summary_{$application->id}_{$application->status}";
        $this->assertTrue(\Illuminate\Support\Facades\Cache::has($cacheKey));
    }
}