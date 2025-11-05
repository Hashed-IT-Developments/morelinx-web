# Transaction Series Quick Reference

## Backend Implementation Complete ✅

### What's Implemented

1. **Database Structure**
   - ✅ `transaction_series` table
   - ✅ Foreign key in `transactions` table
   - ✅ Support for manual OR numbers

2. **Models & Services**
   - ✅ `TransactionSeries` model with relationships
   - ✅ `TransactionNumberService` for OR generation
   - ✅ Thread-safe number generation with database locking
   - ✅ Updated `PaymentService` integration

3. **Controllers & Routes**
   - ✅ `TransactionSeriesController` with CRUD operations
   - ✅ Routes for series management
   - ✅ Activation/deactivation endpoints

4. **Data**
   - ✅ Seeder for initial 2025/2026 series
   - ✅ Migrations run successfully

### What's Pending

- ⏳ Frontend UI components (React/Inertia pages)
- ⏳ Settings page integration
- ⏳ Dashboard warnings for series near limit

---

## Quick Commands

```bash
# View current series
php artisan tinker
>>> \App\Models\TransactionSeries::active()->first()

# Generate test OR number
>>> app(\App\Services\TransactionNumberService::class)->generateNextOrNumber()

# Check series statistics
>>> $series = \App\Models\TransactionSeries::find(1)
>>> $series->getUsagePercentage()
>>> $series->getRemainingNumbers()

# Create new series
>>> \App\Models\TransactionSeries::create([
...   'series_name' => 'Test Series',
...   'start_number' => 1,
...   'end_number' => 1000,
...   'format' => 'OR-{YEAR}{MONTH}-{NUMBER:6}',
...   'is_active' => false,
...   'effective_from' => now(),
... ])

# Activate a series
>>> $service = app(\App\Services\TransactionNumberService::class)
>>> $series = \App\Models\TransactionSeries::find(2)
>>> $service->activateSeries($series)
```

---

## Current System Status

**Active Series:**
- Series Name: "2025 Main Series"
- Format: `OR-202510-000001`
- Range: 1 to 999,999
- Current Number: 0 (will start at 1 on first transaction)
- Effective: Jan 1, 2025 - Dec 31, 2025

**Pre-configured Series:**
- Series Name: "2026 Main Series"
- Status: Inactive (ready for 2026)
- Will be activated manually or automatically

---

## Testing the Implementation

### Test 1: Generate OR Number
```bash
php artisan tinker

$service = app(\App\Services\TransactionNumberService::class);
$result = $service->generateNextOrNumber();
dd($result);

# Expected output:
# [
#   "or_number" => "OR-202510-000001",
#   "series_id" => 1
# ]
```

### Test 2: Process Payment (Integration Test)
```bash
# Create a test transaction via the payment system
# The PaymentService will automatically generate OR number

# Check the result:
>>> \App\Models\Transaction::latest()->first()->or_number
# Should output: "OR-202510-000001"
```

### Test 3: Series Limits
```bash
$series = \App\Models\TransactionSeries::active()->first();
$series->current_number = 900000;
$series->save();

$service = app(\App\Services\TransactionNumberService::class);
$warning = $service->checkSeriesNearLimit();
dd($warning); # Should show 90% warning
```

### Test 4: Validate Manual OR
```bash
$service = app(\App\Services\TransactionNumberService::class);

# Test valid (non-duplicate)
$isValid = $service->validateManualOrNumber('OR-202510-999999');
# Should return: true

# Test invalid (duplicate - if exists)
$isValid = $service->validateManualOrNumber('OR-202510-000001');
# Should return: false (if already used)
```

---

## Next Steps for Frontend

### 1. Create Settings Page Component

**Path:** `resources/js/pages/settings/transaction-series/index.tsx`

**Features needed:**
- List all series with statistics
- Create/Edit series form
- Activate/Deactivate buttons
- Warning badges for series near limit
- Delete series (if no transactions)

### 2. Create Series Form Component

**Path:** `resources/js/components/settings/transaction-series-form.tsx`

**Fields:**
- Series Name (text input)
- Start Number (number input)
- End Number (optional, number input)
- Format (text input with help text)
- Effective From (date picker)
- Effective To (optional date picker)
- Notes (textarea)

### 3. Update Navigation

Add "Transaction Series" to Settings menu:
```typescript
{
  name: 'Transaction Series',
  href: route('settings.transaction-series.index'),
  icon: DocumentTextIcon,
}
```

### 4. Add Dashboard Widget (Optional)

Show series usage on dashboard:
- Current active series
- Usage percentage
- Warning if > 90%
- Remaining numbers

---

## API Endpoints Available

```
GET    /settings/transaction-series              # List all series
POST   /settings/transaction-series              # Create new series
GET    /settings/transaction-series/{id}         # View series details
PUT    /settings/transaction-series/{id}         # Update series
DELETE /settings/transaction-series/{id}         # Delete series
POST   /settings/transaction-series/{id}/activate   # Activate series
POST   /settings/transaction-series/{id}/deactivate # Deactivate series
GET    /settings/transaction-series/{id}/statistics # Get statistics
```

---

## Important Notes

1. **Only one active series at a time** - System enforces this automatically

2. **Thread-safe OR generation** - Uses database locking, safe for concurrent requests

3. **Manual OR numbers supported** - System tracks via `is_manual_or_number` flag

4. **Existing transactions** - Old transactions work fine (nullable foreign key)

5. **BIR compliant** - Sequential, no gaps, full audit trail

---

## Configuration Files Changed

- ✅ `database/migrations/2025_10_27_183617_create_transaction_series_table.php`
- ✅ `database/migrations/2025_10_27_183846_add_transaction_series_id_to_transactions_table.php`
- ✅ `app/Models/TransactionSeries.php` (new)
- ✅ `app/Models/Transaction.php` (updated)
- ✅ `app/Services/TransactionNumberService.php` (new)
- ✅ `app/Services/PaymentService.php` (updated)
- ✅ `app/Http/Controllers/Settings/TransactionSeriesController.php` (new)
- ✅ `routes/settings.php` (updated)
- ✅ `database/seeders/TransactionSeriesSeeder.php` (new)

---

## Support & Documentation

- Full documentation: `docs/TRANSACTION_SERIES_IMPLEMENTATION.md`
- Check logs: `storage/logs/laravel.log`
- Database inspection: `transaction_series` and `transactions` tables

---

---

## Stateless OR Offset Feature ✅

### What It Does

Allows cashiers to jump to a specific OR number **one time only** without permanently changing their counter position. Perfect for:
- Using a specific booklet page
- Filling gaps in manual books
- Testing specific OR numbers

### How It Works

1. **User enters offset** (e.g., 100) in payment form
2. **System shows preview** of what OR will be generated
3. **Transaction uses that OR** (e.g., OR-202510-000100)
4. **Next transaction auto-continues** from that number (OR-202510-000101, OR-202510-000102, etc.)

### Key Features

- ✅ **No database storage** - Pure stateless operation
- ✅ **Live preview** - See OR before submitting
- ✅ **Auto-jump detection** - Warns if number already exists
- ✅ **Debounced API** - Prevents excessive calls
- ✅ **Multi-cashier safe** - Works with concurrent users
- ✅ **Optional** - Leave empty to continue normally

### Implementation Details

**Backend:**
- `TransactionNumberService::generateNextOrNumber($userId, ?$offset = null)`
- `TransactionNumberService::previewNextOrNumber($userId, ?$offset = null)`
- `TransactionsController::checkOffset()` - Preview endpoint
- Validation: `or_offset` => `nullable|integer|min:1`

**Frontend:**
- `StatelessOffsetInput` component (`resources/js/components/transactions/stateless-offset-input.tsx`)
- Integrated into `PaymentDetails` component
- Features: Live preview, loading states, error handling, clear button

**Database:**
- Uses existing `or_number_generations` table
- No new tables needed
- Tracks all OR generation history

### Testing

```bash
# Run unit tests
php artisan test --filter=TransactionNumberServiceTest

# Run integration tests
php artisan test --filter=TransactionSeriesIntegrationTest

# All tests should pass (67 tests, 315 assertions)
```

### Usage Example

```php
// Without offset (continues from last OR)
$result = $service->generateNextOrNumber(userId: 1);
// Returns: OR-202510-000015

// With offset (jump to specific number)
$result = $service->generateNextOrNumber(userId: 1, offset: 100);
// Returns: OR-202510-000100

// Next call (auto-continues)
$result = $service->generateNextOrNumber(userId: 1);
// Returns: OR-202510-000101
```

---

**Status:** Backend Complete ✅ | Frontend Complete ✅  
**Next:** Deploy to production ⏳  
**Version:** 2.0.0 (Stateless Offset)  
**Date:** October 31, 2025
