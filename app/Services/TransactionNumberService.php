<?php

namespace App\Services;

use App\Models\Transaction;
use App\Models\TransactionSeries;
use App\Models\TransactionSeriesUserCounter;
use App\Models\OrNumberGeneration;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;

class TransactionNumberService
{
    /**
     * Preview the next OR number for a specific user without consuming it.
     * This is an ESTIMATE and may change when actually generating due to race conditions.
     *
     * @param int $userId The cashier/user to preview for
     * @return array ['or_number' => string, 'warning' => string, 'is_estimate' => bool, 'has_counter' => bool, 'offset' => int|null]
     * @throws Exception if no active series is found
     */
    /**
     * Preview the next OR number for a user with optional stateless offset.
     * This is a non-locking preview - actual number may differ during generation.
     *
     * @param int $userId
     * @param int|null $offset Optional stateless offset to start from (overrides history)
     * @return array
     * @throws Exception
     */
    public function previewNextOrNumber(int $userId, ?int $offset = null): array
    {
        $series = $this->getActiveSeries();

        if (!$series) {
            throw new Exception('No active transaction series found. Please contact administrator.');
        }

        // Determine proposed number: use offset if provided, otherwise continue from user's last OR
        if ($offset !== null) {
            $proposedNumber = $offset;
        } else {
            $lastOrNumber = $this->getUserLastOrNumber($series, $userId);
            $proposedNumber = $lastOrNumber !== null ? $lastOrNumber + 1 : $series->start_number;
        }

        // Check series bounds
        if ($series->end_number && $proposedNumber > $series->end_number) {
            throw new Exception("Requested OR number {$proposedNumber} exceeds series limit ({$series->end_number}).");
        }

        // Check if this number is already taken
        $existingGeneration = OrNumberGeneration::where('transaction_series_id', $series->id)
            ->where('actual_number', $proposedNumber)
            ->first();

        if ($existingGeneration) {
            // Number is taken - preview what auto-jump would do
            $nextAvailable = $this->findNextUnusedNumber($series, $proposedNumber);
            $orNumber = $series->formatNumber($nextAvailable);

            return [
                'or_number' => $orNumber,
                'warning' => "Preview: OR #{$proposedNumber} is taken. System will auto-jump to #{$nextAvailable}.",
                'is_estimate' => true,
                'proposed_number' => $proposedNumber,
                'actual_number' => $nextAvailable,
            ];
        }

        // Number appears available
        $orNumber = $series->formatNumber($proposedNumber);

        return [
            'or_number' => $orNumber,
            'warning' => 'Preview only: Number may change if another cashier generates at the same time.',
            'is_estimate' => true,
            'proposed_number' => $proposedNumber,
            'actual_number' => $proposedNumber,
        ];
    }

    /**
     * Generate the next OR number from the active series for a specific user (cashier).
     * Uses database locking to ensure thread-safe number generation.
     * Supports stateless offset - user can optionally specify where to start.
     *
     * @param int $userId The cashier/user generating the OR
     * @param int|null $offset Optional stateless offset to start from (overrides history)
     * @return array ['or_number' => string, 'series_id' => int, 'generation_id' => int, 'actual_number' => int, 'jumped' => bool]
     * @throws Exception if no active series is found or series has reached its limit
     */
    public function generateNextOrNumber(int $userId, ?int $offset = null): array
    {
        return DB::transaction(function () use ($userId, $offset) {
            // Get the active series (only one can be active)
            $series = TransactionSeries::lockForUpdate()->where('is_active', true)->first();

            if (!$series) {
                throw new Exception(
                    'No active transaction series found. Please contact administrator to activate a series.'
                );
            }

            // Determine proposed number: use offset if provided, otherwise continue from user's last OR
            if ($offset !== null) {
                $proposedNumber = $offset;
                $generationMethod = 'manual'; // User manually specified offset
            } else {
                $lastOrNumber = $this->getUserLastOrNumber($series, $userId);
                if ($lastOrNumber !== null) {
                    $proposedNumber = $lastOrNumber + 1;
                    $generationMethod = 'auto'; // Auto-continue from last
                } else {
                    $proposedNumber = $series->start_number;
                    $generationMethod = 'auto'; // First-time auto from series start
                }
            }

            // Find next available number (with auto-jump if proposed is taken)
            $actualNumber = $this->findNextUnusedNumber($series, $proposedNumber);
            $jumped = $actualNumber !== $proposedNumber;

            // Format the OR number
            $orNumber = $series->formatNumber($actualNumber);

            // Create OR generation record for BIR audit trail
            $generation = OrNumberGeneration::create([
                'transaction_series_id' => $series->id,
                'or_number' => $orNumber,
                'actual_number' => $actualNumber,
                'generated_by_user_id' => $userId,
                'generated_at' => now(),
                'generation_method' => $jumped ? 'jumped' : $generationMethod,
                'status' => 'generated', // Will be updated to 'used' when transaction is saved
                'metadata' => [
                    'proposed_number' => $proposedNumber,
                    'actual_number' => $actualNumber,
                    'jumped' => $jumped,
                    'offset_used' => $offset,
                ],
            ]);

            // Update series current_number to track highest generated (legacy compatibility)
            if ($actualNumber > $series->current_number) {
                $series->current_number = $actualNumber;
                $series->save();
            }

            Log::info('Generated OR number (stateless)', [
                'or_number' => $orNumber,
                'actual_number' => $actualNumber,
                'generation_id' => $generation->id,
                'series_id' => $series->id,
                'series_name' => $series->series_name,
                'user_id' => $userId,
                'proposed_number' => $proposedNumber,
                'generation_method' => $generation->generation_method,
                'jumped' => $jumped,
                'offset_used' => $offset,
            ]);

            return [
                'or_number' => $orNumber,
                'series_id' => $series->id,
                'generation_id' => $generation->id,
                'actual_number' => $actualNumber,
                'jumped' => $jumped,
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
            // Validate and adjust end_number based on format
            if (isset($data['format']) && isset($data['end_number'])) {
                $data['end_number'] = $this->validateEndNumberForFormat($data['format'], $data['end_number']);
            }

            // If creating an active series, deactivate all other series (only one can be active)
            if ($data['is_active'] ?? false) {
                TransactionSeries::where('is_active', true)
                    ->update(['is_active' => false]);
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
            // Validate and adjust end_number based on format
            if (isset($data['format']) && isset($data['end_number'])) {
                $data['end_number'] = $this->validateEndNumberForFormat($data['format'], $data['end_number']);
            } elseif (isset($data['format']) && !isset($data['end_number'])) {
                // Format changed but end_number not provided, validate existing end_number
                $data['end_number'] = $this->validateEndNumberForFormat($data['format'], $series->end_number);
            }

            // If activating a series that was previously inactive, deactivate all other series
            if (isset($data['is_active']) && $data['is_active'] && !$series->is_active) {
                TransactionSeries::where('id', '!=', $series->id)
                    ->where('is_active', true)
                    ->update(['is_active' => false]);
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
     * Update the start number for a series.
     *
     * @param TransactionSeries $series
     * @param int $newStartNumber
     * @return TransactionSeries
     */
    public function updateSeriesStartNumber(TransactionSeries $series, int $newStartNumber): TransactionSeries
    {
        // Validate that new start number is within range
        if ($series->end_number && $newStartNumber > $series->end_number) {
            throw new Exception("Start number cannot exceed the series end number ({$series->end_number}).");
        }

        $oldCurrent = $series->current_number;
        $series->current_number = $newStartNumber - 1; // Set to one before desired start
        $series->save();

        Log::info('Updated series start number', [
            'series_id' => $series->id,
            'series_name' => $series->series_name,
            'old_current' => $oldCurrent,
            'new_current' => $series->current_number,
            'next_or_will_be' => $newStartNumber,
        ]);

        return $series;
    }

    /**
     * Activate a specific series (deactivates all other series - only one can be active at a time).
     *
     * @param TransactionSeries $series
     * @return TransactionSeries
     */
    public function activateSeries(TransactionSeries $series): TransactionSeries
    {
        return DB::transaction(function () use ($series) {
            // Deactivate all other series (only one can be active)
            TransactionSeries::where('id', '!=', $series->id)
                ->where('is_active', true)
                ->update(['is_active' => false]);

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
     * Validate and adjust end_number to match the format's number of digits.
     * 
     * @param string $format The format string (e.g., "{PREFIX}{NUMBER:10}")
     * @param int|null $endNumber The proposed end number
     * @return int The validated/adjusted end number
     * @throws Exception if format is invalid
     */
    protected function validateEndNumberForFormat(string $format, ?int $endNumber): int
    {
        // Extract the number of digits from format (e.g., {NUMBER:10} -> 10)
        if (preg_match('/{NUMBER:(\d+)}/', $format, $matches)) {
            $digits = min((int)$matches[1], 12); // Cap at 12 digits max
            $maxNumber = (int)str_repeat('9', $digits); // e.g., 10 digits -> 9999999999
            
            // If end_number exceeds max for this format, cap it
            if ($endNumber && $endNumber > $maxNumber) {
                Log::warning('end_number exceeded format limit', [
                    'format' => $format,
                    'requested_end_number' => $endNumber,
                    'max_allowed' => $maxNumber,
                    'adjusted_to' => $maxNumber,
                ]);
                return $maxNumber;
            }
            
            return $endNumber ?? $maxNumber;
        }
        
        // If no {NUMBER:X} format found, return as-is
        return $endNumber ?? 999999;
    }

    /**
     * Get the currently active series (there should only be one).
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

    // ============================================================
    // CASHIER SELF-SERVICE METHODS
    // ============================================================

    /**
     * Check offset conflicts BEFORE setting (for confirmation prompt).
     *
     * @param int $userId The cashier/user
     * @param int $offset The desired starting offset
     * @return array ['has_conflicts' => bool, 'warnings' => array, 'info' => array]
     * @throws Exception
     */
    public function checkOffsetBeforeSetting(int $userId, int $offset): array
    {
        $series = $this->getActiveSeries();

        if (!$series) {
            throw new Exception('No active transaction series found. Please contact administrator.');
        }

        // Check series bounds only
        if ($series->end_number && $offset > $series->end_number) {
            return [
                'has_conflicts' => true,
                'warnings' => ["Offset {$offset} exceeds series limit ({$series->end_number})"],
                'info' => [],
            ];
        }

        if ($offset < $series->start_number) {
            return [
                'has_conflicts' => true,
                'warnings' => ["Offset {$offset} is below series start ({$series->start_number})"],
                'info' => [],
            ];
        }

        // Check for nearby cashiers (within ±50 range)
        $nearbyCashiers = TransactionSeriesUserCounter::where('transaction_series_id', $series->id)
            ->where('user_id', '!=', $userId)
            ->where(function ($query) use ($offset) {
                $query->whereBetween('start_offset', [$offset - 50, $offset + 50]);
            })
            ->with('user:id,name')
            ->get();

        $warnings = [];
        $info = [];
        
        if ($nearbyCashiers->isNotEmpty()) {
            foreach ($nearbyCashiers as $nearbyCashier) {
                $distance = abs($nearbyCashier->start_offset - $offset);
                $direction = $nearbyCashier->start_offset < $offset ? 'below' : 'above';
                
                if ($nearbyCashier->start_offset === $offset) {
                    $warnings[] = "⚠️ {$nearbyCashier->user->name} is already using offset {$offset}. You may generate conflicting OR numbers.";
                } else {
                    $warnings[] = "⚠️ {$nearbyCashier->user->name} is using offset {$nearbyCashier->start_offset} ({$distance} numbers {$direction} yours). Consider spacing offsets further apart.";
                }
            }

            return [
                'has_conflicts' => true,
                'warnings' => $warnings,
                'info' => ['Do you want to continue with this offset?'],
            ];
        }

        // No conflicts - all clear
        // Get counter info
        $counter = TransactionSeriesUserCounter::where('transaction_series_id', $series->id)
            ->where('user_id', $userId)
            ->first();

        if ($counter) {
            $previousGenerations = OrNumberGeneration::where('transaction_series_id', $series->id)
                ->where('generated_by_user_id', $userId)
                ->count();

            if ($counter->last_generated_number !== null) {
                $info[] = "You have generated {$previousGenerations} OR(s) previously.";
                $info[] = "Your position will be updated to offset {$offset}. Your next OR will start from this new position.";
            } else {
                $info[] = "Your first OR will start from offset {$offset}.";
            }
        } else {
            $info[] = "Your first OR will start from offset {$offset}.";
        }

        return [
            'has_conflicts' => false,
            'warnings' => [],
            'info' => $info,
        ];
    }

    /**
     * Set or update a cashier's starting offset.
     * Cashiers can freely change offset anytime - incrementation is based on actual OR generations.
     * 
     * Note: Offset only affects the FIRST OR if cashier hasn't generated any yet.
     * After first generation, next OR = last_generated_number + 1 (offset is ignored).
     *
     * @param int $userId The cashier/user
     * @param int $offset The desired starting offset
     * @return array ['success' => bool, 'message' => string, 'counter' => TransactionSeriesUserCounter|null, 'info' => array]
     * @throws Exception
     */
    public function setCashierOffset(int $userId, int $offset): array
    {
        return DB::transaction(function () use ($userId, $offset) {
            $series = $this->getActiveSeries();

            if (!$series) {
                throw new Exception('No active transaction series found. Please contact administrator.');
            }

            // Check series bounds only
            if ($series->end_number && $offset > $series->end_number) {
                return [
                    'success' => false,
                    'message' => "Offset {$offset} exceeds series limit ({$series->end_number})",
                    'counter' => null,
                    'info' => [],
                ];
            }

            if ($offset < $series->start_number) {
                return [
                    'success' => false,
                    'message' => "Offset {$offset} is below series start ({$series->start_number})",
                    'counter' => null,
                    'info' => [],
                ];
            }

            // Get or create counter
            $counter = TransactionSeriesUserCounter::where('transaction_series_id', $series->id)
                ->where('user_id', $userId)
                ->first();

            $info = [];

            if ($counter) {
                $oldOffset = $counter->start_offset;
                $oldLastGenerated = $counter->last_generated_number;
                
                // Check if offset is actually changing
                if ($oldOffset === $offset) {
                    // Offset unchanged - don't reset anything
                    return [
                        'success' => true,
                        'message' => 'Your offset is already set to ' . $offset . '. No changes made.',
                        'counter' => $counter,
                        'info' => ['Your current position remains at offset ' . $offset . '.'],
                    ];
                }
                
                $previousGenerations = OrNumberGeneration::where('transaction_series_id', $series->id)
                    ->where('generated_by_user_id', $userId)
                    ->count();

                // When offset is changed, reset the sequence to start from the new offset
                if ($counter->last_generated_number !== null) {
                    $info[] = "You have generated {$previousGenerations} OR(s) previously.";
                    $info[] = "Your position has been updated from offset {$oldOffset} to {$offset}. Your next OR will start from this new position.";
                } else {
                    $info[] = "Your offset has been updated from {$oldOffset} to {$offset}.";
                }
                
                // Update offset and RESET last_generated_number to start fresh from new offset
                $counter->update([
                    'start_offset' => $offset,
                    'last_generated_number' => null, // Reset to start fresh from new offset
                    'is_auto_assigned' => false,
                    'offset_changed_at' => now(), // Track when offset was changed
                    'generations_at_current_offset' => 0, // Reset counter for new offset
                ]);
                
                // CRITICAL: Force fresh data from DB by clearing from identity map
                $counter = $counter->fresh();

                Log::info('Cashier updated offset', [
                    'user_id' => $userId,
                    'series_id' => $series->id,
                    'old_offset' => $oldOffset,
                    'new_offset' => $offset,
                    'old_last_generated' => $oldLastGenerated,
                    'new_last_generated' => $counter->last_generated_number,
                    'verified_null' => $counter->last_generated_number === null,
                ]);

                return [
                    'success' => true,
                    'message' => 'Your starting position has been updated successfully.',
                    'counter' => $counter->fresh(),
                    'info' => $info,
                ];
            }

            // Create new counter
            $counter = TransactionSeriesUserCounter::create([
                'transaction_series_id' => $series->id,
                'user_id' => $userId,
                'start_offset' => $offset,
                'current_number' => 0,
                'last_generated_number' => null,
                'is_auto_assigned' => false,
                'offset_changed_at' => now(),
                'generations_at_current_offset' => 0,
            ]);

            Log::info('Cashier set offset', [
                'user_id' => $userId,
                'series_id' => $series->id,
                'offset' => $offset,
            ]);

            $info[] = "Your first OR will start from offset {$offset}.";

            return [
                'success' => true,
                'message' => 'Your starting position has been set successfully.',
                'counter' => $counter,
                'info' => $info,
            ];
        });
    }

    /**
     * Get current cashier information (position, stats, etc.).
     *
     * @param int $userId
     * @return array|null Cashier info or null if no active series
     */
    public function getCashierInfo(int $userId): ?array
    {
        $series = $this->getActiveSeries();

        if (!$series) {
            return null;
        }

        $counter = TransactionSeriesUserCounter::where('transaction_series_id', $series->id)
            ->where('user_id', $userId)
            ->first();
        
        // Refresh to ensure we have the latest data (in case offset was just changed)
        if ($counter) {
            $counter->refresh();
        }

        if (!$counter) {
            // User doesn't have a counter yet - show what they would get if they generate now
            $suggestedOffset = $this->calculateNextAvailableOffset($series);

            return [
                'next_or_number' => $series->formatNumber($suggestedOffset),
                'offset' => null,
                'is_auto_assigned' => false,
                'total_generated' => 0,
                'last_generated_number' => null,
                'last_generated_or' => null,
                'has_counter' => false,
                'suggested_offset' => $suggestedOffset,
                'series_name' => $series->series_name,
                'series_format' => $series->format,
                'series_start' => $series->start_number,
                'series_end' => $series->end_number,
            ];
        }

        // Calculate next OR preview
        // If cashier has generated ORs before, continue from last generated
        // Otherwise, start from their offset
        $proposedNumber = $counter->last_generated_number !== null
            ? $counter->last_generated_number + 1
            : $counter->start_offset;

        // Get highest generated number in series to check if cashier is behind
        $highestGenerated = OrNumberGeneration::where('transaction_series_id', $series->id)
            ->max('actual_number');

        // ALWAYS check if proposed number is already taken (for accurate preview)
        $existingGeneration = OrNumberGeneration::where('transaction_series_id', $series->id)
            ->where('actual_number', $proposedNumber)
            ->first();

        $willAutoJump = false;
        $isOutdated = false;
        $warning = null;
        $nextOrNumber = $proposedNumber;

        if ($existingGeneration) {
            // Number is taken - need to find what they'll ACTUALLY get
            $willAutoJump = true;
            $currentCheck = $proposedNumber;
            $found = false;
            
            // Look for the next gap within reasonable range (check up to 1000 numbers)
            for ($i = 0; $i < 1000; $i++) {
                $exists = OrNumberGeneration::where('transaction_series_id', $series->id)
                    ->where('actual_number', $currentCheck)
                    ->exists();
                
                if (!$exists) {
                    $nextOrNumber = $currentCheck;
                    $found = true;
                    break;
                }
                $currentCheck++;
            }

            // If still not found after 1000 iterations, fall back to highest + 1
            if (!$found) {
                $nextOrNumber = ($highestGenerated ?? $series->start_number - 1) + 1;
            }

            // Check who generated the conflicting number(s)
            $takenByCurrentUser = $existingGeneration->generated_by_user_id === $userId;
            
            // Update warning to be more specific about auto-jump
            $jumpDistance = $nextOrNumber - $proposedNumber;
            $skippedCount = $jumpDistance - 1; // Numbers skipped in between
            
            if ($skippedCount > 0) {
                // Check if skipped numbers are by same user or others
                $skippedGenerations = OrNumberGeneration::where('transaction_series_id', $series->id)
                    ->whereBetween('actual_number', [$proposedNumber, $nextOrNumber - 1])
                    ->get();
                
                $allBySameUser = $skippedGenerations->every(fn($gen) => $gen->generated_by_user_id === $userId);
                
                // Show which numbers are being skipped for clarity
                if ($skippedCount <= 3) {
                    // Show individual skipped numbers if there are only a few
                    $skippedNumbers = range($proposedNumber + 1, $nextOrNumber - 1);
                    $skippedList = implode(', ', array_map(fn($n) => "#{$n}", $skippedNumbers));
                    
                    if ($allBySameUser) {
                        $warning = "OR #{$proposedNumber} is already taken (by you previously). System will auto-jump to #{$nextOrNumber} (skipping {$skippedList} - already used).";
                    } else {
                        $warning = "OR #{$proposedNumber} is already taken. System will auto-jump to #{$nextOrNumber} (skipping {$skippedList} - already generated).";
                    }
                } else {
                    // Show count for many skipped numbers
                    $startSkip = $proposedNumber + 1;
                    $endSkip = $nextOrNumber - 1;
                    
                    if ($allBySameUser) {
                        $warning = "OR #{$proposedNumber} is already taken (by you previously). System will auto-jump to #{$nextOrNumber} (skipping {$skippedCount} numbers: #{$startSkip} to #{$endSkip} - already used).";
                    } else {
                        $warning = "OR #{$proposedNumber} is already taken. System will auto-jump to #{$nextOrNumber} (skipping {$skippedCount} numbers: #{$startSkip} to #{$endSkip} - already generated).";
                    }
                }
            } else {
                // No numbers skipped, just jumping to next available
                if ($takenByCurrentUser) {
                    $warning = "OR #{$proposedNumber} is already taken (by you previously). System will use #{$nextOrNumber} instead.";
                } else {
                    $warning = "OR #{$proposedNumber} is already taken by another cashier. System will use #{$nextOrNumber} instead.";
                }
            }
            
            // Check if cashier is significantly outdated (will keep auto-jumping)
            // Only flag as outdated if they'll jump beyond many numbers
            if ($jumpDistance > 50) {
                $isOutdated = true;
                $warning .= " Consider updating your offset to {$nextOrNumber} to avoid continuous auto-jumping.";
            }
        }

        // Get generation stats
        $generationsCount = OrNumberGeneration::where('transaction_series_id', $series->id)
            ->where('generated_by_user_id', $userId)
            ->count();

        $usedCount = OrNumberGeneration::where('transaction_series_id', $series->id)
            ->where('generated_by_user_id', $userId)
            ->where('status', 'used')
            ->count();

        // Get the last generated OR formatted
        $lastGeneratedOr = $counter->last_generated_number 
            ? $series->formatNumber($counter->last_generated_number)
            : null;

        return [
            'next_or_number' => $series->formatNumber($nextOrNumber),
            'offset' => $counter->start_offset,
            'is_auto_assigned' => $counter->is_auto_assigned,
            'total_generated' => $generationsCount,
            'generated_at_current_offset' => $counter->generations_at_current_offset ?? 0,
            'offset_changed_at' => $counter->offset_changed_at?->format('Y-m-d H:i:s'),
            'last_generated_number' => $counter->last_generated_number,
            'last_generated_or' => $lastGeneratedOr,
            'has_counter' => true,
            'current_number' => $counter->current_number,
            'total_used' => $usedCount,
            'series_name' => $series->series_name,
            'series_format' => $series->format,
            'series_start' => $series->start_number,
            'series_end' => $series->end_number,
            'will_auto_jump' => $willAutoJump,
            'is_outdated' => $isOutdated,
            'warning' => $warning,
            'proposed_number' => $proposedNumber,
            'highest_in_series' => $highestGenerated,
        ];
    }

    /**
     * Mark an OR number as used (after transaction is successfully created).
     *
     * @param int $generationId
     * @param int $transactionId
     * @return void
     * @throws Exception
     */
    public function markOrNumberAsUsed(int $generationId, int $transactionId): void
    {
        $generation = OrNumberGeneration::find($generationId);

        if (!$generation) {
            throw new Exception("OR generation record not found: {$generationId}");
        }

        $generation->update([
            'status' => 'used',
            'transaction_id' => $transactionId,
            'used_at' => now(),
        ]);

        Log::info('Marked OR number as used', [
            'generation_id' => $generationId,
            'or_number' => $generation->or_number,
            'transaction_id' => $transactionId,
        ]);
    }

    /**
     * Void an OR number (if transaction is cancelled).
     *
     * @param int $generationId
     * @param int $voidedByUserId
     * @param string $reason
     * @return void
     * @throws Exception
     */
    public function voidOrNumber(int $generationId, int $voidedByUserId, string $reason): void
    {
        $generation = OrNumberGeneration::find($generationId);

        if (!$generation) {
            throw new Exception("OR generation record not found: {$generationId}");
        }

        $generation->update([
            'status' => 'voided',
            'voided_at' => now(),
            'voided_by_user_id' => $voidedByUserId,
            'void_reason' => $reason,
        ]);

        Log::warning('Voided OR number', [
            'generation_id' => $generationId,
            'or_number' => $generation->or_number,
            'voided_by' => $voidedByUserId,
            'reason' => $reason,
        ]);
    }

    // ============================================================
    // STATELESS OFFSET HELPER METHODS
    // ============================================================

    /**
     * Get the user's last generated OR number from their transaction history.
     * Returns null if user has never generated an OR.
     *
     * @param TransactionSeries $series
     * @param int $userId
     * @return int|null
     */
    private function getUserLastOrNumber(TransactionSeries $series, int $userId): ?int
    {
        $lastGeneration = OrNumberGeneration::where('transaction_series_id', $series->id)
            ->where('generated_by_user_id', $userId)
            ->where('status', '!=', 'voided')
            ->orderBy('actual_number', 'desc')
            ->first();

        return $lastGeneration?->actual_number;
    }

    /**
     * Find the next unused OR number starting from a given number.
     * Auto-jumps over taken numbers.
     *
     * @param TransactionSeries $series
     * @param int $startFrom
     * @return int
     * @throws Exception
     */
    private function findNextUnusedNumber(TransactionSeries $series, int $startFrom): int
    {
        $currentNumber = $startFrom;
        $maxAttempts = 1000; // Prevent infinite loop
        $attempts = 0;

        while ($attempts < $maxAttempts) {
            // Check series limit
            if ($series->end_number && $currentNumber > $series->end_number) {
                throw new Exception("Transaction series has reached its limit ({$series->end_number}).");
            }

            // Check if number is available
            $exists = OrNumberGeneration::where('transaction_series_id', $series->id)
                ->where('actual_number', $currentNumber)
                ->exists();

            if (!$exists) {
                return $currentNumber; // Found an unused number!
            }

            $currentNumber++;
            $attempts++;
        }

        throw new Exception("Could not find available OR number after {$maxAttempts} attempts.");
    }

    // ============================================================
    // DEPRECATED MULTI-CASHIER HELPER METHODS (TO BE REMOVED)
    // ============================================================

    /**
     * Get or create a user counter with a row-level lock.
     * If the counter doesn't exist, auto-assign the next available offset.
     *
     * @param TransactionSeries $series
     * @param int $userId
     * @return TransactionSeriesUserCounter
     * @throws Exception
     */
    private function getUserCounterWithLock(TransactionSeries $series, int $userId): TransactionSeriesUserCounter
    {
        // CRITICAL FIX: Use a completely fresh query to bypass Eloquent's identity map
        // We must get the LATEST data from the database, not from any cache
        $counter = DB::table('transaction_series_user_counters')
            ->where('transaction_series_id', $series->id)
            ->where('user_id', $userId)
            ->lockForUpdate()
            ->first();
        
        // If found, hydrate into an Eloquent model
        if ($counter) {
            $counter = TransactionSeriesUserCounter::find($counter->id);
            
            Log::debug('Fetched counter with raw query + lockForUpdate', [
                'user_id' => $counter->user_id,
                'start_offset' => $counter->start_offset,
                'last_generated_number' => $counter->last_generated_number,
                'is_null' => $counter->last_generated_number === null,
            ]);
        }

        // If counter doesn't exist, create it with auto-assigned offset
        if (!$counter) {
            $nextOffset = $this->calculateNextAvailableOffset($series);
            
            $counter = TransactionSeriesUserCounter::create([
                'transaction_series_id' => $series->id,
                'user_id' => $userId,
                'start_offset' => $nextOffset,
                'current_number' => 0,
                'last_generated_number' => null,
                'is_auto_assigned' => true,
            ]);

            Log::info('Auto-assigned cashier offset', [
                'user_id' => $userId,
                'series_id' => $series->id,
                'offset' => $nextOffset,
            ]);
        }

        return $counter;
    }

    /**
     * Find the next available OR number for a given counter.
     * Uses last_generated_number if available, otherwise uses start_offset.
     * Implements auto-jump logic to skip over numbers already generated by other cashiers.
     *
     * @param TransactionSeries $series
     * @param TransactionSeriesUserCounter $counter
     * @return array ['number' => int, 'jumped' => bool, 'jump_reason' => string|null]
     * @throws Exception
     */
    private function findNextAvailableNumber(TransactionSeries $series, TransactionSeriesUserCounter $counter): array
    {
        // Debug logging to track the issue
        Log::debug('findNextAvailableNumber called', [
            'user_id' => $counter->user_id,
            'start_offset' => $counter->start_offset,
            'last_generated_number' => $counter->last_generated_number,
            'is_null' => $counter->last_generated_number === null,
        ]);
        
        // If cashier has generated ORs before, continue from last generated number
        // Otherwise, start from their offset
        if ($counter->last_generated_number !== null) {
            $proposedNumber = $counter->last_generated_number + 1;
            Log::debug('Using last_generated_number + 1', ['proposed' => $proposedNumber]);
        } else {
            $proposedNumber = $counter->start_offset;
            Log::debug('Using start_offset', ['proposed' => $proposedNumber]);
        }
        
        // Check series limit BEFORE checking if number is taken
        if ($series->end_number && $proposedNumber > $series->end_number) {
            throw new Exception(
                "Transaction series '{$series->series_name}' has reached its limit ({$series->end_number}). " .
                "Cannot generate OR number {$proposedNumber}."
            );
        }
        
        // Check if this number is already used
        $existingGeneration = OrNumberGeneration::where('transaction_series_id', $series->id)
            ->where('actual_number', $proposedNumber)
            ->first();

        if (!$existingGeneration) {
            // Number is available and within limit
            return [
                'number' => $proposedNumber,
                'jumped' => false,
                'jump_reason' => null,
            ];
        }

        // Number is taken - need to auto-jump
        // CRITICAL FIX: Find the next AVAILABLE gap starting from proposed number
        // Don't just jump to highest + 1, find the nearest unused number
        $currentCheck = $proposedNumber + 1;
        $maxIterations = 10000; // Prevent infinite loops
        $found = false;
        
        for ($i = 0; $i < $maxIterations; $i++) {
            // Check series limit
            if ($series->end_number && $currentCheck > $series->end_number) {
                throw new Exception(
                    "Transaction series '{$series->series_name}' has reached its limit ({$series->end_number}). " .
                    "No available OR numbers found."
                );
            }
            
            // Check if this number is available
            $exists = OrNumberGeneration::where('transaction_series_id', $series->id)
                ->where('actual_number', $currentCheck)
                ->exists();
            
            if (!$exists) {
                $found = true;
                break;
            }
            
            $currentCheck++;
        }
        
        if (!$found) {
            throw new Exception(
                "Could not find available OR number after checking {$maxIterations} numbers. " .
                "Please contact administrator."
            );
        }
        
        $nextAvailable = $currentCheck;

        Log::warning('Auto-jumped OR number due to conflict', [
            'user_id' => $counter->user_id,
            'series_id' => $series->id,
            'proposed_number' => $proposedNumber,
            'jumped_to' => $nextAvailable,
            'numbers_checked' => $i + 1,
            'reason' => 'Conflict with existing OR generation',
        ]);

        return [
            'number' => $nextAvailable,
            'jumped' => true,
            'jump_reason' => "OR number {$proposedNumber} was already generated",
        ];
    }

    /**
     * Calculate the next available offset for auto-assignment.
     * Returns the next available number after all existing OR generations.
     *
     * @param TransactionSeries $series
     * @return int
     */
    private function calculateNextAvailableOffset(TransactionSeries $series): int
    {
        // Find the lowest unused OR number starting from series start_number
        // This ensures new cashiers fill in from the beginning, not from the end
        
        $startNumber = $series->start_number;
        
        // Get all generated OR numbers for this series, ordered
        $generatedNumbers = OrNumberGeneration::where('transaction_series_id', $series->id)
            ->orderBy('actual_number')
            ->pluck('actual_number')
            ->toArray();

        // If no numbers generated yet, start from the beginning
        if (empty($generatedNumbers)) {
            return $startNumber;
        }

        // Find the first gap starting from start_number
        $currentCheck = $startNumber;
        foreach ($generatedNumbers as $generatedNumber) {
            if ($currentCheck < $generatedNumber) {
                // Found a gap! Return the first unused number
                return $currentCheck;
            }
            // Move to next number to check
            $currentCheck = max($currentCheck, $generatedNumber) + 1;
        }

        // No gaps found, return the next number after highest generated
        return $currentCheck;
    }

    /**
     * Check if a proposed offset conflicts with existing OR generations or other cashiers.
     *
     * @param TransactionSeries $series
     * @param int $proposedOffset
     * @param int|null $excludeUserId User to exclude from check (for updating own offset)
     * @return array ['has_conflict' => bool, 'conflict_reason' => string|null, 'suggested_offset' => int|null]
     */
    private function checkOffsetConflicts(TransactionSeries $series, int $proposedOffset, ?int $excludeUserId = null): array
    {
        // Check if this offset number has already been generated
        $existingGeneration = OrNumberGeneration::where('transaction_series_id', $series->id)
            ->where('actual_number', $proposedOffset)
            ->first();

        if ($existingGeneration) {
            $suggested = $this->calculateNextAvailableOffset($series);
            return [
                'has_conflict' => true,
                'conflict_reason' => "OR number {$proposedOffset} has already been generated",
                'suggested_offset' => $suggested,
            ];
        }

        // Check if another cashier is already starting at or near this offset
        $nearbyCounter = TransactionSeriesUserCounter::where('transaction_series_id', $series->id)
            ->where('start_offset', '<=', $proposedOffset)
            ->where('start_offset', '>', $proposedOffset - 50) // Within 50 numbers
            ->when($excludeUserId, fn($q) => $q->where('user_id', '!=', $excludeUserId))
            ->first();

        if ($nearbyCounter) {
            $suggested = $this->calculateNextAvailableOffset($series);
            return [
                'has_conflict' => true,
                'conflict_reason' => "Another cashier has an offset near {$proposedOffset}. Consider using a different range to avoid conflicts.",
                'suggested_offset' => $suggested,
            ];
        }

        // Check series bounds
        if ($series->end_number && $proposedOffset > $series->end_number) {
            return [
                'has_conflict' => true,
                'conflict_reason' => "Offset {$proposedOffset} exceeds series limit ({$series->end_number})",
                'suggested_offset' => null,
            ];
        }

        if ($proposedOffset < $series->start_number) {
            return [
                'has_conflict' => true,
                'conflict_reason' => "Offset {$proposedOffset} is below series start ({$series->start_number})",
                'suggested_offset' => $series->start_number,
            ];
        }

        // No conflicts
        return [
            'has_conflict' => false,
            'conflict_reason' => null,
            'suggested_offset' => null,
        ];
    }
}
