<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\TransactionSeries;
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
        $query = TransactionSeries::with('creator')
            ->withCount('transactions')
            ->orderBy('effective_from', 'desc');

        // Filter by active status if requested
        if ($request->has('active_only') && $request->active_only) {
            $query->active();
        }

        $series = $query->paginate(15);

        // Add statistics to each series
        $series->getCollection()->transform(function ($item) {
            $item->statistics = $this->transactionNumberService->getSeriesStatistics($item);
            return $item;
        });

        // Check if any series is near limit
        $nearLimitWarning = $this->transactionNumberService->checkSeriesNearLimit();

        // Return JSON for AJAX requests
        if ($request->wantsJson() || $request->expectsJson()) {
            return response()->json($series);
        }

        return inertia('settings/transaction-series/index', [
            'series' => $series,
            'nearLimitWarning' => $nearLimitWarning,
            'activeSeries' => $this->transactionNumberService->getActiveSeries(),
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
            'start_number' => 'required|integer|min:1',
            'end_number' => 'nullable|integer|min:1|gt:start_number',
            'format' => 'required|string|max:255',
            'is_active' => 'boolean',
            'effective_from' => 'required|date',
            'effective_to' => 'nullable|date|after:effective_from',
            'notes' => 'nullable|string',
        ]);

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
            'end_number' => 'nullable|integer|min:' . ($transactionSeries->current_number + 1),
            'format' => 'required|string|max:255',
            'is_active' => 'boolean',
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
}
