# Transaction Series Implementation (BIR-Compliant OR Number Generation)

## Overview

This implementation provides a BIR-compliant transaction numbering system for the Philippines, allowing flexible management of OR (Official Receipt) number series.

## Features

✅ **Single Active Series**: Only one series active at a time  
✅ **Flexible Format**: OR-YYYYMM-000001 format with customizable templates  
✅ **Series Switching**: Change series based on dates or manually  
✅ **Manual OR Numbers**: Support for manually entered OR numbers  
✅ **Thread-Safe**: Database-level locking prevents duplicate numbers  
✅ **Series Limits**: Track and warn when approaching number limits  
✅ **Audit Trail**: Full history of series usage and changes  

## Database Schema

### `transaction_series` Table
- `series_name` - Descriptive name (e.g., "2025 Main Series")
- `prefix` - Optional prefix (null for standard format)
- `current_number` - Current counter value
- `start_number` - Starting number (usually 1)
- `end_number` - Optional ending number (BIR allocated range)
- `format` - Template for OR number generation
- `is_active` - Only one series can be active
- `effective_from` - When this series starts
- `effective_to` - When this series ends (nullable)
- `created_by` - User who created the series

### `transactions` Table (Updated)
- `transaction_series_id` - Foreign key to transaction_series
- `is_manual_or_number` - Boolean flag for manually entered OR numbers

## OR Number Format

### Default Format Template
```
OR-{YEAR}{MONTH}-{NUMBER:6}
```

### Available Placeholders
- `{YEAR}` - 4-digit year (2025)
- `{MONTH}` - 2-digit month (01-12)
- `{NUMBER}` or `{NUMBER:6}` - Sequential number with optional padding
- `{PREFIX}` - Series prefix (if set)

### Example Outputs
```
OR-202510-000001
OR-202510-000002
OR-202511-000001  (if series changes monthly)
OR-202512-999999
```

## How to Use

### 1. View Current Series

Navigate to **Settings > Transaction Series** to see:
- Active series
- Series history
- Usage statistics
- Warnings for series near limit (90%+)

### 2. Create a New Series

When creating a new series, specify:

```php
- Series Name: "2026 Main Series"
- Start Number: 1
- End Number: 999999 (optional)
- Format: OR-{YEAR}{MONTH}-{NUMBER:6}
- Effective From: 2026-01-01
- Is Active: false (activate when ready)
```

### 3. Switch Series

**Automatic Switching:**
- System uses the series marked as `is_active`
- Can have future series pre-configured

**Manual Switching:**
- Deactivate current series
- Activate new series
- System ensures only one active series

### 4. Manual OR Number Entry

When processing a payment, you can:
- Let the system generate the OR number (default)
- Manually enter an OR number (sets `is_manual_or_number = true`)

The system validates manual OR numbers to prevent duplicates.

## Service Layer

### TransactionNumberService

Key methods:

```php
// Generate next OR number
$result = $transactionNumberService->generateNextOrNumber();
// Returns: ['or_number' => 'OR-202510-000001', 'series_id' => 1]

// Validate manual OR number
$isValid = $transactionNumberService->validateManualOrNumber('OR-202510-999999');

// Get active series
$activeSeries = $transactionNumberService->getActiveSeries();

// Check if near limit
$warning = $transactionNumberService->checkSeriesNearLimit();

// Activate/deactivate series
$transactionNumberService->activateSeries($series);
$transactionNumberService->deactivateSeries($series);
```

## Common Scenarios

### Scenario 1: New Year Series Change

**Current Situation:**
- Current series: "2025 Main Series" (OR-202510-123456)
- Need: New series for 2026

**Steps:**
1. Create new series "2026 Main Series"
   - Start number: 1
   - Format: OR-{YEAR}{MONTH}-{NUMBER:6}
   - Effective from: 2026-01-01
   - Is active: false

2. On January 1, 2026:
   - Go to Settings > Transaction Series
   - Click "Activate" on 2026 series
   - System automatically deactivates 2025 series

3. Next transaction generates: OR-202601-000001

### Scenario 2: Running Out of Numbers

**Current Situation:**
- Series limit: 999,999
- Current number: 999,998
- Dashboard shows red warning

**Steps:**
1. Create new series immediately
   - Series name: "2025 Extension Series"
   - Start number: 1
   - End number: 999999
   - Format: OR2-{YEAR}{MONTH}-{NUMBER:6}
   - Effective from: today
   - Is active: true (or activate after creation)

2. Next transaction generates: OR2-202510-000001

### Scenario 3: Monthly Series Reset

**Current Situation:**
- BIR requires monthly number reset
- Need: New series each month

**Steps:**
1. Create series for each month
   - October: effective_from = 2025-10-01, effective_to = 2025-10-31
   - November: effective_from = 2025-11-01, effective_to = 2025-11-30

2. Activate the appropriate series each month

### Scenario 4: Manual OR Number Entry

**Use Case:** Backdating a transaction or correcting an error

**Steps:**
1. In payment processing screen
2. Check "Manual OR Number" option
3. Enter: OR-202510-123456
4. System validates (no duplicates)
5. Transaction created with `is_manual_or_number = true`

## API Endpoints

### List Series
```
GET /settings/transaction-series
```

### Create Series
```
POST /settings/transaction-series
Body: {
  series_name, start_number, end_number,
  format, is_active, effective_from, effective_to, notes
}
```

### Activate/Deactivate
```
POST /settings/transaction-series/{id}/activate
POST /settings/transaction-series/{id}/deactivate
```

### View Statistics
```
GET /settings/transaction-series/{id}/statistics
```

## BIR Compliance

✅ **Sequential Numbering**: Guaranteed by database counter  
✅ **No Gaps**: Each transaction increments counter  
✅ **Chronological**: Series have effective date ranges  
✅ **Audit Trail**: All series changes logged  
✅ **Non-Modifiable**: Transactions use soft deletes  
✅ **10-Year Retention**: Soft deletes preserve history  

## Testing

### Test OR Number Generation

```php
// In tinker or test
$service = app(\App\Services\TransactionNumberService::class);
$result = $service->generateNextOrNumber();
dump($result);
// ['or_number' => 'OR-202510-000001', 'series_id' => 1]
```

### Test Series Limit Warning

```php
$series = TransactionSeries::active()->first();
$series->current_number = 900000;
$series->end_number = 999999;
$series->save();

$warning = $service->checkSeriesNearLimit();
dump($warning); // Should show warning (90% used)
```

## Maintenance

### Monthly Tasks
- Check active series usage percentage
- Create next month's series (if using monthly reset)
- Review manual OR number entries

### Yearly Tasks
- Create new year series
- Activate on January 1
- Archive old series (soft delete if unused)

### When Approaching Limit
- Dashboard shows warning at 90%
- Create new series immediately
- Activate before reaching limit

## Troubleshooting

### Error: "No active transaction series found"
**Solution:** Activate a series in Settings > Transaction Series

### Error: "Series has reached its limit"
**Solution:** Create and activate a new series

### Duplicate OR Number Error
**Solution:** Check for manual entries, ensure only one active series

### Wrong OR Format
**Solution:** Update format template in series settings

## Future Enhancements

- [ ] Frontend UI components for series management
- [ ] Automatic series switching based on effective dates
- [ ] Email notifications when series near limit
- [ ] BIR-format series reports
- [ ] Multi-branch series support (if needed)
- [ ] Series templates for quick setup

## Migration from Old System

If you have existing transactions with old OR format:

1. ✅ Migrations already handle adding nullable `transaction_series_id`
2. ✅ Existing transactions work without series (nullable foreign key)
3. ✅ New transactions automatically use active series
4. Optional: Backfill old transactions with legacy series

## Support

For issues or questions:
- Check Laravel logs: `storage/logs/laravel.log`
- Review transaction series table in database
- Check PaymentService logs for OR number generation

---

**Last Updated:** October 27, 2025  
**Version:** 1.0.0  
**Status:** Production Ready (Backend Complete, Frontend Pending)
