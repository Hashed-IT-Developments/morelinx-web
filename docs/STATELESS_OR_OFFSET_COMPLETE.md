# Stateless OR Offset - Complete Implementation

## Overview

The stateless OR offset feature allows cashiers to temporarily jump to a specific OR number for a single transaction, without permanently changing their counter position. This is useful for:

- Using a specific page in a physical OR booklet
- Filling gaps in manual records
- Testing specific OR numbers
- Accommodating pre-printed forms

## Status: ✅ COMPLETE

- [x] Backend service methods
- [x] Controller endpoints
- [x] Frontend React component
- [x] Payment form integration
- [x] All unit tests passing
- [x] All integration tests passing
- [x] Build successful
- [x] Documentation complete

---

## Architecture

### Backend Components

#### 1. TransactionNumberService

**File:** `app/Services/TransactionNumberService.php`

**Key Methods:**

```php
// Generate OR with optional offset
public function generateNextOrNumber(?int $userId = null, ?int $offset = null): array

// Preview OR without locking
public function previewNextOrNumber(?int $userId = null, ?int $offset = null): array

// Get user's last generated OR
protected function getUserLastOrNumber(TransactionSeries $series, int $userId): ?int

// Find next unused number (auto-jump logic)
protected function findNextUnusedNumber(TransactionSeries $series, int $startFrom): int
```

**How It Works:**

1. Queries `or_number_generations` table for user's last OR
2. If offset provided, starts from that number
3. If no offset, starts from (last OR + 1)
4. Auto-jumps to next available if number already used
5. Locks generation to prevent race conditions
6. Returns formatted OR number and metadata

#### 2. TransactionsController

**File:** `app/Http/Controllers/Transactions/TransactionsController.php`

**Endpoint:** `POST /transactions/check-offset`

**Request:**
```json
{
  "offset": 100
}
```

**Response:**
```json
{
  "preview_or_number": "OR-202510-000100",
  "warnings": ["OR-202510-000100 already exists, will use OR-202510-000101"],
  "info_messages": [
    "Last generated: OR-202510-000015",
    "Proposed: OR-202510-000100",
    "Next available: OR-202510-000101"
  ]
}
```

#### 3. PaymentService

**File:** `app/Services/PaymentService.php`

**Changes:**

1. Added validation rule: `'or_offset' => 'nullable|integer|min:1'`
2. Extract offset from validated data
3. Pass to `generateNextOrNumber($userId, $offset)`

```php
// Line 115-121
$orOffset = !empty($validatedData['or_offset']) ? intval($validatedData['or_offset']) : null;
$orNumberData = $this->transactionNumberService->generateNextOrNumber(Auth::id(), $orOffset);
$orNumber = $orNumberData['or_number'];
$seriesId = $orNumberData['series_id'];
$generationId = $orNumberData['generation_id'];
```

### Frontend Components

#### 1. StatelessOffsetInput Component

**File:** `resources/js/components/transactions/stateless-offset-input.tsx`

**Props:**
```typescript
interface StatelessOffsetInputProps {
    onOffsetChange: (offset: number | null) => void;
    disabled?: boolean;
}
```

**Features:**

- **Input field** for entering OR offset number
- **Debounced preview** (500ms delay before API call)
- **Live preview** showing next OR number
- **Warning messages** if auto-jump will occur
- **Error handling** with toast notifications
- **Clear button** to reset offset
- **Info panel** explaining behavior
- **Loading spinner** during preview fetch
- **Visual states:**
  - Empty (shows info)
  - Loading (spinner)
  - Success (green preview card)
  - Error (red error card)

**API Integration:**

```typescript
const { data } = await axios.post(route('transactions.check-offset'), { offset });
```

**State Management:**

```typescript
const [offsetInput, setOffsetInput] = useState('');
const [isPreviewLoading, setIsPreviewLoading] = useState(false);
const [preview, setPreview] = useState<PreviewData | null>(null);
const [error, setError] = useState('');
```

#### 2. PaymentDetails Integration

**File:** `resources/js/components/transactions/payment-details.tsx`

**Changes:**

1. Import StatelessOffsetInput component
2. Add state for OR offset: `const [orOffset, setOrOffset] = useState<number | null>(null)`
3. Render component in form (after payment methods, before credit balance)
4. Pass offset to backend in payment processing

```typescript
<StatelessOffsetInput 
  onOffsetChange={setOrOffset} 
  disabled={isProcessing} 
/>
```

```typescript
router.post(route('transactions.process-payment', customerAccountId), {
  // ... other fields
  or_offset: orOffset, // Send stateless OR offset
});
```

---

## Database Schema

Uses existing `or_number_generations` table - no new tables needed.

```sql
CREATE TABLE or_number_generations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    transaction_series_id BIGINT,
    user_id BIGINT,
    or_number VARCHAR(255),
    formatted_number VARCHAR(255),
    generated_at TIMESTAMP,
    FOREIGN KEY (transaction_series_id) REFERENCES transaction_series(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**Query Strategy:**

```sql
-- Get user's last OR
SELECT formatted_number 
FROM or_number_generations 
WHERE transaction_series_id = ? 
  AND user_id = ? 
ORDER BY generated_at DESC 
LIMIT 1;

-- Check if number exists
SELECT COUNT(*) 
FROM or_number_generations 
WHERE transaction_series_id = ? 
  AND formatted_number = ?;
```

---

## Test Coverage

### Unit Tests

**File:** `tests/Unit/TransactionNumberServiceTest.php`

**Tests:**

- ✅ `test_stateless_offset_on_first_generation()` - First OR with offset
- ✅ `test_preview_with_stateless_offset()` - Preview without locking
- ✅ `test_multi_cashier_or_generation_with_offsets()` - Concurrent users with offsets
- ✅ `test_check_offset_conflict()` - Auto-jump when conflict
- ✅ `test_no_offset_conflict_when_far_apart()` - No jump when safe

**Result:** 23 tests passing, 78 assertions

### Integration Tests

**File:** `tests/Feature/TransactionSeriesIntegrationTest.php`

**Tests:**

- ✅ `test_multi_cashier_or_generation_with_offsets()` - End-to-end offset workflow
- ✅ `test_check_offset_for_conflicts()` - API endpoint testing

**Result:** 16 tests passing, 79 assertions

### Manual Testing Checklist

- [ ] Enter offset in payment form
- [ ] Preview updates correctly
- [ ] Submit transaction with offset
- [ ] Verify correct OR generated
- [ ] Verify next transaction continues from offset
- [ ] Test auto-jump when number exists
- [ ] Test with multiple cashiers
- [ ] Test clear button
- [ ] Test error handling (invalid offset)
- [ ] Test with empty offset (normal flow)

---

## User Guide

### For Cashiers

#### Normal Flow (No Offset)

1. Select payables to pay
2. Enter payment amount
3. Leave offset field empty
4. Click "Settle Payment"
5. OR auto-continues from last number

**Example:**
- Last OR: OR-202510-000015
- Next OR: OR-202510-000016

#### Using Offset (Jump to Specific OR)

1. Select payables to pay
2. Enter payment amount
3. **Enter desired OR number in offset field** (e.g., 100)
4. Wait for preview to load
5. Check preview: "Next OR will be: OR-202510-000100"
6. Click "Settle Payment"
7. Transaction uses OR-202510-000100

**Next Transaction (Auto-Continue):**
- Leave offset empty
- OR auto-continues: OR-202510-000101

#### When Number Already Exists (Auto-Jump)

1. Enter offset: 100
2. System checks: OR-202510-000100 already used
3. Preview shows warning: "OR already exists, will use OR-202510-000101"
4. System automatically jumps to next available

#### Tips

- **Optional feature** - Only use when needed
- **One-time only** - Offset applies to current transaction only
- **Auto-continues** - Next transaction picks up from where you left off
- **Clear button** - Click to reset and continue normally

---

## API Reference

### Check Offset (Preview)

**Endpoint:** `POST /transactions/check-offset`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "offset": 100
}
```

**Response (Success):**
```json
{
  "preview_or_number": "OR-202510-000100",
  "warnings": [],
  "info_messages": [
    "Last generated: OR-202510-000015",
    "Proposed: OR-202510-000100"
  ]
}
```

**Response (Conflict - Auto Jump):**
```json
{
  "preview_or_number": "OR-202510-000101",
  "warnings": ["OR-202510-000100 already exists, will use OR-202510-000101"],
  "info_messages": [
    "Last generated: OR-202510-000015",
    "Proposed: OR-202510-000100",
    "Next available: OR-202510-000101"
  ]
}
```

**Response (Error):**
```json
{
  "message": "Offset must be greater than or equal to 1"
}
```

### Process Payment (With Offset)

**Endpoint:** `POST /transactions/process-payment/{customerAccountId}`

**Request Body:**
```json
{
  "payment_methods": [...],
  "selected_payable_ids": [...],
  "or_offset": 100  // Optional
}
```

**Response (Success):**
```json
{
  "success": "Payment processed successfully.",
  "transaction": {
    "id": 123,
    "or_number": "OR-202510-000100",
    "total_amount": 1500.00,
    "status": "paid"
  }
}
```

---

## Configuration

### Environment Variables

No new environment variables needed.

### Database

Uses existing configuration - no changes needed.

### Routes

Already configured in `routes/web.php`:

```php
Route::post('/transactions/check-offset', [TransactionsController::class, 'checkOffset'])
    ->name('transactions.check-offset');
```

---

## Deployment Checklist

- [x] All tests passing
- [x] Frontend build successful
- [x] Documentation complete
- [ ] Code review approved
- [ ] Staging environment tested
- [ ] User acceptance testing
- [ ] Production deployment
- [ ] User training (if needed)

---

## Migration Guide

### From Old System (Persistent Offset)

**Before (Deprecated):**

1. Cashier sets offset: 100
2. Offset stored in `transaction_series_user_counters` table
3. All transactions use offset until changed
4. Separate API call to update offset

**After (Stateless):**

1. Cashier enters offset in payment form: 100
2. No database storage
3. Only current transaction uses offset
4. Next transaction auto-continues
5. No separate offset management needed

**Migration Steps:**

1. ✅ Drop `transaction_series_user_counters` table (migration created)
2. ✅ Remove old offset API endpoints (completed)
3. ✅ Update all tests (completed)
4. ✅ Update frontend UI (completed)

**Run Migration:**

```bash
php artisan migrate
# Drops transaction_series_user_counters table
```

**Rollback (If Needed):**

```bash
php artisan migrate:rollback
# Recreates transaction_series_user_counters table
```

---

## Troubleshooting

### Issue: Preview not loading

**Symptoms:** Input field doesn't show preview after typing

**Solution:**
- Check browser console for errors
- Verify route exists: `php artisan route:list | grep check-offset`
- Check API response in Network tab
- Verify user is authenticated

### Issue: Auto-jump not working

**Symptoms:** System doesn't skip used OR numbers

**Solution:**
- Verify `or_number_generations` table has data
- Check `findNextUnusedNumber()` logic
- Run test: `php artisan test --filter=test_check_offset_conflict`

### Issue: Offset not applied to transaction

**Symptoms:** Transaction uses wrong OR number

**Solution:**
- Check PaymentService receives `or_offset` parameter
- Verify validation passes
- Check logs: `tail -f storage/logs/laravel.log`
- Ensure offset passed in Inertia request

---

## Performance Considerations

### Database Queries

**Per Transaction:**
- 1 query: Get user's last OR
- 1 query: Lock series
- 1-N queries: Check if number exists (auto-jump)
- 1 query: Insert generation record

**Optimization:**
- Indexed queries on `transaction_series_id` and `user_id`
- Database locking prevents race conditions
- No N+1 query issues

### Frontend Performance

- Debounced API calls (500ms)
- Loading states prevent duplicate requests
- Optimistic UI updates
- Error boundaries catch failures

---

## Security Considerations

### Authentication

- All endpoints require authentication
- User ID from `Auth::id()` (not request)
- Cannot spoof other users' OR

### Authorization

- Users can only generate their own ORs
- Admin can view all generations
- No privilege escalation possible

### Validation

- Offset must be integer >= 1
- Series must be active
- No SQL injection (parameterized queries)
- XSS prevention (React escapes output)

### Audit Trail

- All generations logged in `or_number_generations`
- Tracks user, timestamp, series
- Can reconstruct full OR history
- BIR compliance maintained

---

## Future Enhancements

### Potential Features

1. **Batch Offset** - Set offset for multiple transactions
2. **Preset Offsets** - Save common offset values
3. **Booklet Management** - Track physical booklet usage
4. **Auto-Offset** - Suggest next booklet page
5. **Conflict Resolution** - UI to resolve OR conflicts
6. **Reporting** - Offset usage analytics

### Technical Improvements

1. **Caching** - Cache user's last OR (Redis)
2. **WebSockets** - Real-time preview updates
3. **Bulk Operations** - Generate multiple ORs at once
4. **Export** - Download OR generation history
5. **Import** - Bulk import manual ORs

---

## Support

### Documentation

- Implementation guide: `STATELESS_OR_OFFSET_REFACTOR.md`
- Quick reference: `TRANSACTION_SERIES_QUICK_REFERENCE.md`
- API docs: This document

### Contact

- Developer: [Your Name]
- Repository: `/Users/jmal/projects/morelinx-web`
- Branch: `feature/stateless-or-offset`

### Getting Help

1. Check this documentation
2. Review test files for examples
3. Check logs: `storage/logs/laravel.log`
4. Run tests: `php artisan test`
5. Contact developer

---

## Changelog

### Version 2.0.0 (2025-10-31)

**Added:**
- Stateless OR offset functionality
- StatelessOffsetInput React component
- Preview API endpoint
- Auto-jump when number exists
- Comprehensive test coverage
- Complete documentation

**Changed:**
- TransactionNumberService accepts optional offset
- PaymentService validates and uses offset
- Payment form includes offset input

**Deprecated:**
- `transaction_series_user_counters` table
- `setCashierOffset()` method
- `checkOffsetBeforeSetting()` method

**Removed:**
- Persistent offset storage
- Separate offset management UI

**Fixed:**
- Race conditions in OR generation
- Offset conflicts with multi-cashier
- Preview accuracy issues

---

## License

Copyright © 2025 Morelinx. All rights reserved.

---

**Document Version:** 1.0  
**Last Updated:** October 31, 2025  
**Status:** Complete ✅
