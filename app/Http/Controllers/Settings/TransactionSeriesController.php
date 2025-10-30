<?php

namespace App\Http\Controllers\Settings;

use App\Enums\RolesEnum;
use App\Http\Controllers\Controller;
use App\Models\TransactionSeries;
use App\Models\User;
use App\Services\TransactionNumberService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class TransactionSeriesController extends Controller
{
    protected TransactionNumberService $transactionNumberService;

    public function __construct(TransactionNumberService $transactionNumberService)
    {
        $this->transactionNumberService = $transactionNumberService;
    }

    /**
     * Display a listing of the transaction series.
     */
    public function index(Request $request)
    {
        $query = TransactionSeries::with(['creator', 'assignedUser'])
            ->withCount('transactions')
            ->orderBy('effective_from', 'desc');

        // Filter by active status if requested
        if ($request->has('active_only') && $request->active_only) {
            $query->active();
        }

        $series = $query->paginate(10);

        // Add statistics to each series
        $series->getCollection()->transform(function ($item) {
            $item->statistics = $this->transactionNumberService->getSeriesStatistics($item);
            return $item;
        });

        // Check if any series is near limit
        $nearLimitWarning = $this->transactionNumberService->checkSeriesNearLimit();

        // Get treasury staff for assignment
        $treasuryStaff = User::role(RolesEnum::TREASURY_STAFF)
            ->select('id', 'name', 'email')
            ->orderBy('name')
            ->get();

        // Return JSON for AJAX requests
        if ($request->wantsJson() || $request->expectsJson()) {
            return response()->json($series);
        }

        return inertia('settings/transaction-series/index', [
            'series' => $series,
            'nearLimitWarning' => $nearLimitWarning,
            'treasuryStaff' => $treasuryStaff,
        ]);
    }

    /**
     * Store a newly created transaction series.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'series_name' => 'required|string|max:255',
            'prefix' => 'nullable|string|max:10',
            'start_number' => 'required|integer|min:1|max:999999999999999', // Support up to 15 digits
            'end_number' => 'nullable|integer|min:1|max:999999999999999|gt:start_number',
            'format' => 'required|string|max:255',
            'is_active' => 'boolean',
            'assigned_to_user_id' => 'nullable|exists:users,id',
            'effective_from' => 'required|date',
            'effective_to' => 'nullable|date|after:effective_from',
            'notes' => 'nullable|string',
        ]);

        // Check for range conflicts
        $conflict = $this->checkRangeConflict(
            $validated['start_number'],
            $validated['end_number'] ?? PHP_INT_MAX
        );

        if ($conflict) {
            return back()->withErrors([
                'start_number' => "Range conflicts with existing series: {$conflict->series_name} ({$conflict->start_number} - {$conflict->end_number})"
            ])->withInput();
        }

        // Set the current number to 0 (will start from start_number on first use)
        $validated['current_number'] = 0;
        $validated['created_by'] = Auth::id();

        try {
            $series = $this->transactionNumberService->createSeries($validated);

            return redirect()->route('transaction-series.index')
                ->with('success', 'Transaction series created successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to create transaction series', [
                'error' => $e->getMessage(),
                'data' => $validated,
            ]);

            return back()->withErrors(['error' => 'Failed to create transaction series: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Display the specified transaction series.
     */
    public function show(TransactionSeries $transactionSeries)
    {
        $transactionSeries->load(['creator', 'transactions' => function ($query) {
            $query->latest()->take(50);
        }]);

        $statistics = $this->transactionNumberService->getSeriesStatistics($transactionSeries);

        return inertia('settings/transaction-series/show', [
            'series' => $transactionSeries,
            'statistics' => $statistics,
        ]);
    }

    /**
     * Update the specified transaction series.
     */
    public function update(Request $request, TransactionSeries $transactionSeries)
    {
        $validated = $request->validate([
            'series_name' => 'required|string|max:255',
            'prefix' => 'nullable|string|max:10',
            'end_number' => 'nullable|integer|min:' . ($transactionSeries->current_number + 1) . '|max:999999999999999',
            'format' => 'required|string|max:255',
            'is_active' => 'boolean',
            'assigned_to_user_id' => 'nullable|exists:users,id',
            'effective_from' => 'required|date',
            'effective_to' => 'nullable|date|after:effective_from',
            'notes' => 'nullable|string',
        ]);

        try {
            $series = $this->transactionNumberService->updateSeries($transactionSeries, $validated);

            return redirect()->route('transaction-series.index')
                ->with('success', 'Transaction series updated successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to update transaction series', [
                'series_id' => $transactionSeries->id,
                'error' => $e->getMessage(),
            ]);

            return back()->withErrors(['error' => 'Failed to update transaction series: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Activate a specific series.
     */
    public function activate(TransactionSeries $transactionSeries)
    {
        try {
            $this->transactionNumberService->activateSeries($transactionSeries);

            return back()->with('success', "Transaction series '{$transactionSeries->series_name}' has been activated.");
        } catch (\Exception $e) {
            Log::error('Failed to activate transaction series', [
                'series_id' => $transactionSeries->id,
                'error' => $e->getMessage(),
            ]);

            return back()->withErrors(['error' => 'Failed to activate transaction series: ' . $e->getMessage()]);
        }
    }

    /**
     * Deactivate a specific series.
     */
    public function deactivate(TransactionSeries $transactionSeries)
    {
        try {
            $this->transactionNumberService->deactivateSeries($transactionSeries);

            return back()->with('success', "Transaction series '{$transactionSeries->series_name}' has been deactivated.");
        } catch (\Exception $e) {
            Log::error('Failed to deactivate transaction series', [
                'series_id' => $transactionSeries->id,
                'error' => $e->getMessage(),
            ]);

            return back()->withErrors(['error' => 'Failed to deactivate transaction series: ' . $e->getMessage()]);
        }
    }

    /**
     * Get series statistics (for AJAX requests).
     */
    public function statistics(TransactionSeries $transactionSeries)
    {
        return response()->json(
            $this->transactionNumberService->getSeriesStatistics($transactionSeries)
        );
    }

    /**
     * Preview the next OR number for the current user.
     * Used in POS to show cashiers what their next OR will be.
     */
    public function previewOrNumber(Request $request)
    {
        try {
            $user = Auth::user();
            $previewOr = $this->transactionNumberService->previewNextOrNumber($user);
            $series = $this->transactionNumberService->getActiveSeriesForUser($user);

            return response()->json([
                'next_or' => $previewOr,
                'series_id' => $series?->id,
                'series_name' => $series?->series_name,
                'usage_percentage' => $series?->getUsagePercentage(),
                'remaining_numbers' => $series?->getRemainingNumbers(),
                'is_near_limit' => $series?->isNearLimit(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Assign a series to a specific user/cashier.
     */
    public function assignToUser(Request $request, TransactionSeries $transactionSeries)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        try {
            $user = User::findOrFail($validated['user_id']);
            $this->transactionNumberService->assignSeriesToUser($transactionSeries, $user);

            return back()->with('success', "Series assigned to {$user->name} successfully.");
        } catch (\Exception $e) {
            Log::error('Failed to assign series to user', [
                'series_id' => $transactionSeries->id,
                'user_id' => $validated['user_id'],
                'error' => $e->getMessage(),
            ]);

            return back()->withErrors(['error' => 'Failed to assign series: ' . $e->getMessage()]);
        }
    }

    /**
     * Update the start number for a series (where cashier's numbering will continue from).
     */
    public function updateStartNumber(Request $request, TransactionSeries $transactionSeries)
    {
        $validated = $request->validate([
            'start_number' => 'required|integer|min:1|max:999999999999999', // Support up to 15 digits
        ]);

        try {
            $this->transactionNumberService->updateSeriesStartNumber(
                $transactionSeries,
                $validated['start_number']
            );

            return back()->with('success', 'Series start number updated successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to update series start number', [
                'series_id' => $transactionSeries->id,
                'new_start' => $validated['start_number'],
                'error' => $e->getMessage(),
            ]);

            return back()->withErrors(['error' => 'Failed to update start number: ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified transaction series (soft delete).
     */
    public function destroy(TransactionSeries $transactionSeries)
    {
        // Only allow deletion if no transactions are associated
        if ($transactionSeries->transactions()->count() > 0) {
            return back()->withErrors(['error' => 'Cannot delete a series that has associated transactions.']);
        }

        try {
            $transactionSeries->delete();

            return redirect()->route('transaction-series.index')
                ->with('success', 'Transaction series deleted successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to delete transaction series', [
                'series_id' => $transactionSeries->id,
                'error' => $e->getMessage(),
            ]);

            return back()->withErrors(['error' => 'Failed to delete transaction series: ' . $e->getMessage()]);
        }
    }

    /**
     * Check if a number range conflicts with existing series.
     */
    private function checkRangeConflict(int $startNumber, int $endNumber): ?TransactionSeries
    {
        return TransactionSeries::where(function ($query) use ($startNumber, $endNumber) {
            // Check if new range overlaps with existing range
            $query->where(function ($q) use ($startNumber, $endNumber) {
                // New start is within existing range
                $q->where('start_number', '<=', $startNumber)
                    ->where(function ($q2) use ($startNumber) {
                        $q2->whereNull('end_number')
                            ->orWhere('end_number', '>=', $startNumber);
                    });
            })->orWhere(function ($q) use ($startNumber, $endNumber) {
                // New end is within existing range
                $q->where('start_number', '<=', $endNumber)
                    ->where(function ($q2) use ($endNumber) {
                        $q2->whereNull('end_number')
                            ->orWhere('end_number', '>=', $endNumber);
                    });
            })->orWhere(function ($q) use ($startNumber, $endNumber) {
                // Existing range is completely within new range
                $q->where('start_number', '>=', $startNumber)
                    ->where(function ($q2) use ($endNumber) {
                        $q2->whereNull('end_number')
                            ->orWhere('end_number', '<=', $endNumber);
                    });
            });
        })->first();
    }

    /**
     * Get suggested start and end numbers for a new series.
     */
    public function suggestRange(Request $request)
    {
        $rangeSize = $request->input('range_size', 1000000000);

        // Get the highest end number from existing series
        $highestEnd = TransactionSeries::whereNotNull('end_number')
            ->max('end_number');

        // If no series exist, start from 1
        if (!$highestEnd) {
            return response()->json([
                'start_number' => 1,
                'end_number' => $rangeSize,
            ]);
        }

        // Suggest next available range
        $suggestedStart = $highestEnd + 1;
        $suggestedEnd = $suggestedStart + $rangeSize - 1;

        // Make sure we don't exceed maximum
        if ($suggestedEnd > 999999999999999) {
            $suggestedEnd = 999999999999999;
        }

        return response()->json([
            'start_number' => $suggestedStart,
            'end_number' => $suggestedEnd,
        ]);
    }
}
