<?php

namespace App\Services;

use App\Models\Transaction;
use App\Models\TransactionSeries;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;

class TransactionNumberService
{
    /**
     * Generate the next OR number from the active series.
     * Uses database locking to ensure thread-safe number generation.
     *
     * @param \DateTime|null $date The date for which to generate the OR number
     * @return array ['or_number' => string, 'series_id' => int]
     * @throws Exception if no active series is found or series has reached its limit
     */
    public function generateNextOrNumber($date = null): array
    {
        $date = $date ?? now();

        return DB::transaction(function () use ($date) {
            // Get the active series with row-level lock
            $series = TransactionSeries::active()
                ->effectiveOn($date)
                ->lockForUpdate()
                ->first();

            if (!$series) {
                throw new Exception('No active transaction series found. Please configure a series first.');
            }

            // Check if series has reached its limit
            if ($series->hasReachedLimit()) {
                throw new Exception(
                    "Transaction series '{$series->series_name}' has reached its limit ({$series->end_number}). " .
                    "Please create and activate a new series."
                );
            }

            // Increment the counter
            $nextNumber = $series->current_number + 1;

            // If this is the first number, use start_number
            if ($series->current_number == 0) {
                $nextNumber = $series->start_number;
            }

            // Update the series counter
            $series->current_number = $nextNumber;
            $series->save();

            // Format the OR number according to the series format
            $orNumber = $series->formatNumber($nextNumber, $date);

            Log::info('Generated OR number', [
                'or_number' => $orNumber,
                'series_id' => $series->id,
                'series_name' => $series->series_name,
                'counter' => $nextNumber,
            ]);

            return [
                'or_number' => $orNumber,
                'series_id' => $series->id,
            ];
        });
    }

    /**
     * Validate a manual OR number to ensure it's not a duplicate.
     *
     * @param string $orNumber
     * @param int|null $excludeTransactionId Transaction ID to exclude from duplicate check (for updates)
     * @return bool
     */
    public function validateManualOrNumber(string $orNumber, ?int $excludeTransactionId = null): bool
    {
        $query = Transaction::where('or_number', $orNumber);

        if ($excludeTransactionId) {
            $query->where('id', '!=', $excludeTransactionId);
        }

        return !$query->exists();
    }

    /**
     * Create a new transaction series.
     *
     * @param array $data
     * @return TransactionSeries
     * @throws Exception
     */
    public function createSeries(array $data): TransactionSeries
    {
        return DB::transaction(function () use ($data) {
            // If this series is marked as active, deactivate all other series
            if ($data['is_active'] ?? false) {
                $this->deactivateAllSeries();
            }

            $series = TransactionSeries::create($data);

            Log::info('Created new transaction series', [
                'series_id' => $series->id,
                'series_name' => $series->series_name,
                'is_active' => $series->is_active,
            ]);

            return $series;
        });
    }

    /**
     * Update an existing transaction series.
     *
     * @param TransactionSeries $series
     * @param array $data
     * @return TransactionSeries
     */
    public function updateSeries(TransactionSeries $series, array $data): TransactionSeries
    {
        return DB::transaction(function () use ($series, $data) {
            // If activating this series, deactivate all others
            if (isset($data['is_active']) && $data['is_active'] && !$series->is_active) {
                $this->deactivateAllSeries();
            }

            $series->update($data);

            Log::info('Updated transaction series', [
                'series_id' => $series->id,
                'series_name' => $series->series_name,
                'changes' => $data,
            ]);

            return $series->fresh();
        });
    }

    /**
     * Activate a specific series (deactivates all others).
     *
     * @param TransactionSeries $series
     * @return TransactionSeries
     */
    public function activateSeries(TransactionSeries $series): TransactionSeries
    {
        return DB::transaction(function () use ($series) {
            // Deactivate all other series
            $this->deactivateAllSeries();

            // Activate this series
            $series->is_active = true;
            $series->save();

            Log::info('Activated transaction series', [
                'series_id' => $series->id,
                'series_name' => $series->series_name,
            ]);

            return $series;
        });
    }

    /**
     * Deactivate a specific series.
     *
     * @param TransactionSeries $series
     * @return TransactionSeries
     */
    public function deactivateSeries(TransactionSeries $series): TransactionSeries
    {
        $series->is_active = false;
        $series->save();

        Log::info('Deactivated transaction series', [
            'series_id' => $series->id,
            'series_name' => $series->series_name,
        ]);

        return $series;
    }

    /**
     * Deactivate all series.
     */
    protected function deactivateAllSeries(): void
    {
        TransactionSeries::where('is_active', true)->update(['is_active' => false]);
    }

    /**
     * Get the currently active series.
     *
     * @return TransactionSeries|null
     */
    public function getActiveSeries(): ?TransactionSeries
    {
        return TransactionSeries::active()->first();
    }

    /**
     * Get series statistics.
     *
     * @param TransactionSeries $series
     * @return array
     */
    public function getSeriesStatistics(TransactionSeries $series): array
    {
        return [
            'id' => $series->id,
            'series_name' => $series->series_name,
            'is_active' => $series->is_active,
            'current_number' => $series->current_number,
            'start_number' => $series->start_number,
            'end_number' => $series->end_number,
            'transactions_count' => $series->transactions()->count(),
            'usage_percentage' => $series->getUsagePercentage(),
            'remaining_numbers' => $series->getRemainingNumbers(),
            'is_near_limit' => $series->isNearLimit(),
            'has_reached_limit' => $series->hasReachedLimit(),
            'effective_from' => $series->effective_from?->format('Y-m-d'),
            'effective_to' => $series->effective_to?->format('Y-m-d'),
        ];
    }

    /**
     * Check if any active series is near its limit (90% or more).
     *
     * @return array|null Series info if near limit, null otherwise
     */
    public function checkSeriesNearLimit(): ?array
    {
        $activeSeries = $this->getActiveSeries();

        if ($activeSeries && $activeSeries->isNearLimit()) {
            return $this->getSeriesStatistics($activeSeries);
        }

        return null;
    }
}
