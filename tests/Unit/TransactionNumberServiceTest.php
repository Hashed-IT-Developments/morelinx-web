<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Services\TransactionNumberService;
use App\Models\TransactionSeries;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Exception;

class TransactionNumberServiceTest extends TestCase
{
    use RefreshDatabase;

    protected TransactionNumberService $service;
    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new TransactionNumberService();
        $this->user = User::factory()->create();
    }

    /**
     * Test generating the first OR number from a new series.
     */
    public function test_generate_first_or_number()
    {
        // Create an active series
        $series = TransactionSeries::create([
            'series_name' => '2025 Test Series',
            'current_number' => 0,
            'start_number' => 1,
            'end_number' => 999999,
            'format' => 'OR-{YEAR}{MONTH}-{NUMBER:6}',
            'is_active' => true,
            'effective_from' => now()->startOfYear(),
            'created_by' => $this->user->id,
        ]);

        $result = $this->service->generateNextOrNumber();

        $this->assertIsArray($result);
        $this->assertArrayHasKey('or_number', $result);
        $this->assertArrayHasKey('series_id', $result);
        $this->assertEquals($series->id, $result['series_id']);
        
        // Check that OR number format is correct
        $this->assertStringContainsString('OR-', $result['or_number']);
        $this->assertStringContainsString('-000001', $result['or_number']);
        
        // Verify series counter was incremented
        $series->refresh();
        $this->assertEquals(1, $series->current_number);
    }

    /**
     * Test sequential OR number generation.
     */
    public function test_generate_sequential_or_numbers()
    {
        $series = TransactionSeries::create([
            'series_name' => '2025 Test Series',
            'current_number' => 0,
            'start_number' => 1,
            'end_number' => 999999,
            'format' => 'OR-{YEAR}{MONTH}-{NUMBER:6}',
            'is_active' => true,
            'effective_from' => now()->startOfYear(),
            'created_by' => $this->user->id,
        ]);

        // Generate multiple OR numbers
        $result1 = $this->service->generateNextOrNumber();
        $result2 = $this->service->generateNextOrNumber();
        $result3 = $this->service->generateNextOrNumber();

        // Verify they are sequential
        $this->assertStringContainsString('-000001', $result1['or_number']);
        $this->assertStringContainsString('-000002', $result2['or_number']);
        $this->assertStringContainsString('-000003', $result3['or_number']);

        // Verify counter
        $series->refresh();
        $this->assertEquals(3, $series->current_number);
    }

    /**
     * Test OR number format with different templates.
     */
    public function test_or_number_format_with_custom_template()
    {
        $series = TransactionSeries::create([
            'series_name' => 'Custom Format Series',
            'current_number' => 0,
            'start_number' => 100,
            'end_number' => 999999,
            'format' => 'OR2-{YEAR}-{NUMBER:8}',
            'is_active' => true,
            'effective_from' => now()->startOfYear(),
            'created_by' => $this->user->id,
        ]);

        $result = $this->service->generateNextOrNumber();
        
        $this->assertStringStartsWith('OR2-', $result['or_number']);
        $this->assertStringContainsString('-00000100', $result['or_number']);
    }

    /**
     * Test that an exception is thrown when no active series exists.
     */
    public function test_throws_exception_when_no_active_series()
    {
        $this->expectException(Exception::class);
        $this->expectExceptionMessage('No active transaction series found');

        $this->service->generateNextOrNumber();
    }

    /**
     * Test that an exception is thrown when series reaches its limit.
     */
    public function test_throws_exception_when_series_reaches_limit()
    {
        $series = TransactionSeries::create([
            'series_name' => 'Limited Series',
            'current_number' => 99,
            'start_number' => 1,
            'end_number' => 100,
            'format' => 'OR-{YEAR}{MONTH}-{NUMBER:6}',
            'is_active' => true,
            'effective_from' => now()->startOfYear(),
            'created_by' => $this->user->id,
        ]);

        // Generate one more number (should be 100, the limit)
        $result = $this->service->generateNextOrNumber();
        $this->assertNotNull($result);

        // Try to generate another (should fail)
        $this->expectException(Exception::class);
        $this->expectExceptionMessage('has reached its limit');
        
        $this->service->generateNextOrNumber();
    }

    /**
     * Test validating manual OR numbers.
     */
    public function test_validate_manual_or_number_unique()
    {
        // Valid OR number (doesn't exist)
        $isValid = $this->service->validateManualOrNumber('OR-202510-999999');
        $this->assertTrue($isValid);
    }

    /**
     * Test validating duplicate manual OR numbers.
     */
    public function test_validate_manual_or_number_duplicate()
    {
        // Create a transaction with an OR number
        Transaction::factory()->create([
            'or_number' => 'OR-202510-123456',
        ]);

        // Try to validate the same OR number
        $isValid = $this->service->validateManualOrNumber('OR-202510-123456');
        $this->assertFalse($isValid);
    }

    /**
     * Test creating a new series.
     */
    public function test_create_series()
    {
        $data = [
            'series_name' => 'New Series 2026',
            'start_number' => 1,
            'end_number' => 999999,
            'format' => 'OR-{YEAR}{MONTH}-{NUMBER:6}',
            'is_active' => false,
            'effective_from' => '2026-01-01',
            'created_by' => $this->user->id,
        ];

        $series = $this->service->createSeries($data);

        $this->assertInstanceOf(TransactionSeries::class, $series);
        $this->assertEquals('New Series 2026', $series->series_name);
        $this->assertFalse($series->is_active);
    }

    /**
     * Test creating an active series deactivates other series.
     */
    public function test_create_active_series_deactivates_others()
    {
        // Create an existing active series
        $oldSeries = TransactionSeries::create([
            'series_name' => 'Old Active Series',
            'current_number' => 100,
            'start_number' => 1,
            'end_number' => 999999,
            'format' => 'OR-{YEAR}{MONTH}-{NUMBER:6}',
            'is_active' => true,
            'effective_from' => now()->startOfYear(),
            'created_by' => $this->user->id,
        ]);

        // Create a new active series
        $newSeries = $this->service->createSeries([
            'series_name' => 'New Active Series',
            'start_number' => 1,
            'end_number' => 999999,
            'format' => 'OR-{YEAR}{MONTH}-{NUMBER:6}',
            'is_active' => true,
            'effective_from' => now()->addYear()->startOfYear(),
            'created_by' => $this->user->id,
        ]);

        // Verify old series was deactivated
        $oldSeries->refresh();
        $this->assertFalse($oldSeries->is_active);
        $this->assertTrue($newSeries->is_active);
    }

    /**
     * Test activating a series.
     */
    public function test_activate_series()
    {
        $series = TransactionSeries::create([
            'series_name' => 'Inactive Series',
            'current_number' => 0,
            'start_number' => 1,
            'end_number' => 999999,
            'format' => 'OR-{YEAR}{MONTH}-{NUMBER:6}',
            'is_active' => false,
            'effective_from' => now()->startOfYear(),
            'created_by' => $this->user->id,
        ]);

        $this->service->activateSeries($series);

        $series->refresh();
        $this->assertTrue($series->is_active);
    }

    /**
     * Test activating a series deactivates all other series.
     */
    public function test_activate_series_deactivates_others()
    {
        $series1 = TransactionSeries::create([
            'series_name' => 'Series 1',
            'current_number' => 0,
            'start_number' => 1,
            'end_number' => 999999,
            'format' => 'OR-{YEAR}{MONTH}-{NUMBER:6}',
            'is_active' => true,
            'effective_from' => now()->startOfYear(),
            'created_by' => $this->user->id,
        ]);

        $series2 = TransactionSeries::create([
            'series_name' => 'Series 2',
            'current_number' => 0,
            'start_number' => 1,
            'end_number' => 999999,
            'format' => 'OR-{YEAR}{MONTH}-{NUMBER:6}',
            'is_active' => false,
            'effective_from' => now()->addYear()->startOfYear(),
            'created_by' => $this->user->id,
        ]);

        // Activate series 2
        $this->service->activateSeries($series2);

        $series1->refresh();
        $series2->refresh();

        $this->assertFalse($series1->is_active);
        $this->assertTrue($series2->is_active);
    }

    /**
     * Test deactivating a series.
     */
    public function test_deactivate_series()
    {
        $series = TransactionSeries::create([
            'series_name' => 'Active Series',
            'current_number' => 0,
            'start_number' => 1,
            'end_number' => 999999,
            'format' => 'OR-{YEAR}{MONTH}-{NUMBER:6}',
            'is_active' => true,
            'effective_from' => now()->startOfYear(),
            'created_by' => $this->user->id,
        ]);

        $this->service->deactivateSeries($series);

        $series->refresh();
        $this->assertFalse($series->is_active);
    }

    /**
     * Test getting active series.
     */
    public function test_get_active_series()
    {
        // Create multiple series with only one active
        TransactionSeries::create([
            'series_name' => 'Inactive Series',
            'current_number' => 0,
            'start_number' => 1,
            'end_number' => 999999,
            'format' => 'OR-{YEAR}{MONTH}-{NUMBER:6}',
            'is_active' => false,
            'effective_from' => now()->subYear()->startOfYear(),
            'created_by' => $this->user->id,
        ]);

        $activeSeries = TransactionSeries::create([
            'series_name' => 'Active Series',
            'current_number' => 0,
            'start_number' => 1,
            'end_number' => 999999,
            'format' => 'OR-{YEAR}{MONTH}-{NUMBER:6}',
            'is_active' => true,
            'effective_from' => now()->startOfYear(),
            'created_by' => $this->user->id,
        ]);

        $result = $this->service->getActiveSeries();

        $this->assertNotNull($result);
        $this->assertEquals($activeSeries->id, $result->id);
        $this->assertEquals('Active Series', $result->series_name);
    }

    /**
     * Test getting series statistics.
     */
    public function test_get_series_statistics()
    {
        $series = TransactionSeries::create([
            'series_name' => 'Test Series',
            'current_number' => 500,
            'start_number' => 1,
            'end_number' => 1000,
            'format' => 'OR-{YEAR}{MONTH}-{NUMBER:6}',
            'is_active' => true,
            'effective_from' => now()->startOfYear(),
            'created_by' => $this->user->id,
        ]);

        $stats = $this->service->getSeriesStatistics($series);

        $this->assertIsArray($stats);
        $this->assertEquals('Test Series', $stats['series_name']);
        $this->assertEquals(500, $stats['current_number']);
        $this->assertEquals(50.0, round($stats['usage_percentage'], 1)); // 500/1000 = 50%
        $this->assertEquals(500, $stats['remaining_numbers']);
        $this->assertFalse($stats['is_near_limit']); // Below 90%
        $this->assertFalse($stats['has_reached_limit']);
    }

    /**
     * Test checking if series is near limit.
     */
    public function test_check_series_near_limit()
    {
        $series = TransactionSeries::create([
            'series_name' => 'Nearly Full Series',
            'current_number' => 950,
            'start_number' => 1,
            'end_number' => 1000,
            'format' => 'OR-{YEAR}{MONTH}-{NUMBER:6}',
            'is_active' => true,
            'effective_from' => now()->startOfYear(),
            'created_by' => $this->user->id,
        ]);

        $warning = $this->service->checkSeriesNearLimit();

        $this->assertNotNull($warning);
        $this->assertEquals('Nearly Full Series', $warning['series_name']);
        $this->assertTrue($warning['is_near_limit']);
    }

    /**
     * Test thread-safe OR number generation (concurrent requests).
     */
    public function test_concurrent_or_number_generation()
    {
        $series = TransactionSeries::create([
            'series_name' => 'Concurrent Test Series',
            'current_number' => 0,
            'start_number' => 1,
            'end_number' => 999999,
            'format' => 'OR-{YEAR}{MONTH}-{NUMBER:6}',
            'is_active' => true,
            'effective_from' => now()->startOfYear(),
            'created_by' => $this->user->id,
        ]);

        $orNumbers = [];

        // Simulate concurrent requests by generating multiple OR numbers
        // in rapid succession (database locking should prevent duplicates)
        DB::transaction(function () use (&$orNumbers) {
            for ($i = 0; $i < 10; $i++) {
                $result = $this->service->generateNextOrNumber();
                $orNumbers[] = $result['or_number'];
            }
        });

        // Verify all OR numbers are unique
        $uniqueOrNumbers = array_unique($orNumbers);
        $this->assertCount(10, $uniqueOrNumbers);

        // Verify they are sequential
        $this->assertStringContainsString('-000001', $orNumbers[0]);
        $this->assertStringContainsString('-000010', $orNumbers[9]);
    }

    /**
     * Test updating a series.
     */
    public function test_update_series()
    {
        $series = TransactionSeries::create([
            'series_name' => 'Original Name',
            'current_number' => 0,
            'start_number' => 1,
            'end_number' => 999999,
            'format' => 'OR-{YEAR}{MONTH}-{NUMBER:6}',
            'is_active' => false,
            'effective_from' => now()->startOfYear(),
            'created_by' => $this->user->id,
        ]);

        $updated = $this->service->updateSeries($series, [
            'series_name' => 'Updated Name',
            'notes' => 'Test notes',
        ]);

        $this->assertEquals('Updated Name', $updated->series_name);
        $this->assertEquals('Test notes', $updated->notes);
    }

    /**
     * Test series with no end number (unlimited).
     */
    public function test_series_with_no_end_number()
    {
        $series = TransactionSeries::create([
            'series_name' => 'Unlimited Series',
            'current_number' => 999998,
            'start_number' => 1,
            'end_number' => null, // No limit
            'format' => 'OR-{YEAR}{MONTH}-{NUMBER:6}',
            'is_active' => true,
            'effective_from' => now()->startOfYear(),
            'created_by' => $this->user->id,
        ]);

        // Should be able to generate numbers without hitting limit
        $result = $this->service->generateNextOrNumber();
        $this->assertNotNull($result);
        
        $stats = $this->service->getSeriesStatistics($series->fresh());
        $this->assertFalse($stats['has_reached_limit']);
        $this->assertFalse($stats['is_near_limit']);
        $this->assertNull($stats['remaining_numbers']);
    }
}
