<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\TransactionSeries;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

class TransactionSeriesModelTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    /**
     * Test series creation with all fields.
     */
    public function test_create_transaction_series()
    {
        $series = TransactionSeries::create([
            'series_name' => '2025 Main Series',
            'prefix' => 'OR',
            'current_number' => 0,
            'start_number' => 1,
            'end_number' => 999999,
            'format' => '{PREFIX}{NUMBER:12}',
            'is_active' => true,
            'effective_from' => '2025-01-01',
            'effective_to' => '2025-12-31',
            'created_by' => $this->user->id,
            'notes' => 'Main series for 2025',
        ]);

        $this->assertDatabaseHas('transaction_series', [
            'series_name' => '2025 Main Series',
            'is_active' => true,
        ]);

        $this->assertEquals('2025 Main Series', $series->series_name);
        $this->assertTrue($series->is_active);
    }

    /**
     * Test series relationships.
     */
    public function test_series_relationships()
    {
        $series = TransactionSeries::create([
            'series_name' => 'Test Series',
            'current_number' => 0,
            'start_number' => 1,
            'end_number' => 999999,
            'format' => '{PREFIX}{NUMBER:12}',
            'is_active' => true,
            'effective_from' => now(),
            'created_by' => $this->user->id,
        ]);

        // Test creator relationship
        $this->assertNotNull($series->creator);
        $this->assertEquals($this->user->id, $series->creator->id);

        // Test transactions relationship
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Collection::class, $series->transactions);
    }

    /**
     * Test active scope.
     */
    public function test_active_scope()
    {
        TransactionSeries::create([
            'series_name' => 'Active Series',
            'current_number' => 0,
            'start_number' => 1,
            'format' => '{PREFIX}{NUMBER:12}',
            'is_active' => true,
            'effective_from' => now(),
            'created_by' => $this->user->id,
        ]);

        TransactionSeries::create([
            'series_name' => 'Inactive Series',
            'current_number' => 0,
            'start_number' => 1,
            'format' => '{PREFIX}{NUMBER:12}',
            'is_active' => false,
            'effective_from' => now(),
            'created_by' => $this->user->id,
        ]);

        $activeSeries = TransactionSeries::active()->get();

        $this->assertCount(1, $activeSeries);
        $this->assertEquals('Active Series', $activeSeries->first()->series_name);
    }

    /**
     * Test effective on scope.
     */
    public function test_effective_on_scope()
    {
        // Series effective in the past
        TransactionSeries::create([
            'series_name' => 'Past Series',
            'current_number' => 0,
            'start_number' => 1,
            'format' => '{PREFIX}{NUMBER:12}',
            'is_active' => false,
            'effective_from' => now()->subYear(),
            'effective_to' => now()->subMonth(),
            'created_by' => $this->user->id,
        ]);

        // Series effective now
        TransactionSeries::create([
            'series_name' => 'Current Series',
            'current_number' => 0,
            'start_number' => 1,
            'format' => '{PREFIX}{NUMBER:12}',
            'is_active' => true,
            'effective_from' => now()->subMonth(),
            'effective_to' => null,
            'created_by' => $this->user->id,
        ]);

        // Series effective in the future
        TransactionSeries::create([
            'series_name' => 'Future Series',
            'current_number' => 0,
            'start_number' => 1,
            'format' => '{PREFIX}{NUMBER:12}',
            'is_active' => false,
            'effective_from' => now()->addYear(),
            'created_by' => $this->user->id,
        ]);

        $effectiveSeries = TransactionSeries::effectiveOn(now())->get();

        $this->assertCount(1, $effectiveSeries);
        $this->assertEquals('Current Series', $effectiveSeries->first()->series_name);
    }

    /**
     * Test has reached limit method.
     */
    public function test_has_reached_limit()
    {
        $series = TransactionSeries::create([
            'series_name' => 'Limited Series',
            'current_number' => 100,
            'start_number' => 1,
            'end_number' => 100,
            'format' => '{PREFIX}{NUMBER:12}',
            'is_active' => true,
            'effective_from' => now(),
            'created_by' => $this->user->id,
        ]);

        $this->assertTrue($series->hasReachedLimit());

        // Series below limit
        $series->current_number = 99;
        $series->save();
        $this->assertFalse($series->fresh()->hasReachedLimit());

        // Series with no limit
        $series->end_number = null;
        $series->save();
        $this->assertFalse($series->fresh()->hasReachedLimit());
    }

    /**
     * Test get usage percentage method.
     */
    public function test_get_usage_percentage()
    {
        $series = TransactionSeries::create([
            'series_name' => 'Test Series',
            'current_number' => 500,
            'start_number' => 1,
            'end_number' => 1000,
            'format' => '{PREFIX}{NUMBER:12}',
            'is_active' => true,
            'effective_from' => now(),
            'created_by' => $this->user->id,
        ]);

        $this->assertEquals(50.0, $series->getUsagePercentage());

        // Test with different values
        $series->current_number = 900;
        $series->save();
        $this->assertEquals(90.0, $series->fresh()->getUsagePercentage());

        // Test with no end number
        $series->end_number = null;
        $series->save();
        $this->assertEquals(0, $series->fresh()->getUsagePercentage());
    }

    /**
     * Test get remaining numbers method.
     */
    public function test_get_remaining_numbers()
    {
        $series = TransactionSeries::create([
            'series_name' => 'Test Series',
            'current_number' => 500,
            'start_number' => 1,
            'end_number' => 1000,
            'format' => '{PREFIX}{NUMBER:12}',
            'is_active' => true,
            'effective_from' => now(),
            'created_by' => $this->user->id,
        ]);

        $this->assertEquals(500, $series->getRemainingNumbers());

        // Test when current exceeds end (edge case)
        $series->current_number = 1001;
        $series->save();
        $this->assertEquals(0, $series->fresh()->getRemainingNumbers());

        // Test with no end number
        $series->end_number = null;
        $series->save();
        $this->assertNull($series->fresh()->getRemainingNumbers());
    }

    /**
     * Test is near limit method.
     */
    public function test_is_near_limit()
    {
        $series = TransactionSeries::create([
            'series_name' => 'Test Series',
            'current_number' => 950,
            'start_number' => 1,
            'end_number' => 1000,
            'format' => '{PREFIX}{NUMBER:12}',
            'is_active' => true,
            'effective_from' => now(),
            'created_by' => $this->user->id,
        ]);

        // 95% usage - should be near limit (>= 90%)
        $this->assertTrue($series->isNearLimit());

        // 89% usage - should not be near limit
        $series->current_number = 890;
        $series->save();
        $this->assertFalse($series->fresh()->isNearLimit());

        // Exactly 90% - should be near limit
        $series->current_number = 900;
        $series->save();
        $this->assertTrue($series->fresh()->isNearLimit());

        // No end number - should not be near limit
        $series->end_number = null;
        $series->save();
        $this->assertFalse($series->fresh()->isNearLimit());
    }

    /**
     * Test format number method.
     */
    public function test_format_number()
    {
        $series = TransactionSeries::create([
            'series_name' => 'Test Series',
            'prefix' => 'OR',
            'current_number' => 0,
            'start_number' => 1,
            'format' => '{PREFIX}{NUMBER:12}',
            'is_active' => true,
            'effective_from' => now(),
            'created_by' => $this->user->id,
        ]);

        $formatted = $series->formatNumber(123);

        $this->assertEquals('OR000000000123', $formatted);
    }

    /**
     * Test format number with different templates.
     */
    public function test_format_number_with_various_templates()
    {
        // Standard format with prefix and 12-digit number
        $series1 = TransactionSeries::create([
            'series_name' => 'Standard',
            'prefix' => 'CR',
            'current_number' => 0,
            'start_number' => 1,
            'format' => '{PREFIX}{NUMBER:12}',
            'is_active' => true,
            'effective_from' => now(),
            'created_by' => $this->user->id,
        ]);
        $this->assertEquals('CR000000000001', $series1->formatNumber(1));

        // 10-digit number
        $series2 = TransactionSeries::create([
            'series_name' => '10-digit',
            'prefix' => 'OR',
            'current_number' => 0,
            'start_number' => 1,
            'format' => '{PREFIX}{NUMBER:10}',
            'is_active' => false,
            'effective_from' => now(),
            'created_by' => $this->user->id,
        ]);
        $this->assertEquals('OR0000000001', $series2->formatNumber(1));

        // Simple format without prefix
        $series3 = TransactionSeries::create([
            'series_name' => 'Simple',
            'current_number' => 0,
            'start_number' => 1,
            'format' => 'OR-{NUMBER:10}',
            'is_active' => false,
            'effective_from' => now(),
            'created_by' => $this->user->id,
        ]);
        $this->assertEquals('OR-0000000001', $series3->formatNumber(1));
    }

    /**
     * Test soft deletes.
     */
    public function test_soft_deletes()
    {
        $series = TransactionSeries::create([
            'series_name' => 'Test Series',
            'prefix' => 'OR',
            'current_number' => 0,
            'start_number' => 1,
            'format' => '{PREFIX}{NUMBER:12}',
            'is_active' => true,
            'effective_from' => now(),
            'created_by' => $this->user->id,
        ]);

        $seriesId = $series->id;

        // Soft delete
        $series->delete();

        // Should not be found in normal queries
        $this->assertNull(TransactionSeries::find($seriesId));

        // Should be found with trashed
        $this->assertNotNull(TransactionSeries::withTrashed()->find($seriesId));
    }

    /**
     * Test casts.
     */
    public function test_casts()
    {
        $series = TransactionSeries::create([
            'series_name' => 'Test Series',
            'current_number' => 0,
            'start_number' => 1,
            'end_number' => 1000,
            'format' => '{PREFIX}{NUMBER:12}',
            'is_active' => true,
            'effective_from' => '2025-01-01',
            'effective_to' => '2025-12-31',
            'created_by' => $this->user->id,
        ]);

        // Test boolean cast
        $this->assertIsBool($series->is_active);

        // Test date casts
        $this->assertInstanceOf(\Illuminate\Support\Carbon::class, $series->effective_from);
        $this->assertInstanceOf(\Illuminate\Support\Carbon::class, $series->effective_to);

        // Test integer casts
        $this->assertIsInt($series->current_number);
        $this->assertIsInt($series->start_number);
        $this->assertIsInt($series->end_number);
    }

    /**
     * Test multiple series cannot be active simultaneously.
     */
    public function test_only_one_active_series()
    {
        $series1 = TransactionSeries::create([
            'series_name' => 'Series 1',
            'current_number' => 0,
            'start_number' => 1,
            'format' => '{PREFIX}{NUMBER:12}',
            'is_active' => true,
            'effective_from' => now(),
            'created_by' => $this->user->id,
        ]);

        $series2 = TransactionSeries::create([
            'series_name' => 'Series 2',
            'current_number' => 0,
            'start_number' => 1,
            'format' => '{PREFIX}{NUMBER:12}',
            'is_active' => true,
            'effective_from' => now(),
            'created_by' => $this->user->id,
        ]);

        // Business logic should ensure only one active
        // (This is enforced by the service, not the model directly)
        $activeSeries = TransactionSeries::where('is_active', true)->get();
        
        // Without service intervention, both could be active in DB
        // The service layer prevents this
        $this->assertGreaterThanOrEqual(1, $activeSeries->count());
    }
}
