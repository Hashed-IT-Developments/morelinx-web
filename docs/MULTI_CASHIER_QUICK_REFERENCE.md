# Multi-Cashier Quick Reference

## For Developers

### Testing Locally

1. **Run Migrations**:
   ```bash
   php artisan migrate
   ```

2. **Seed Test Data**:
   ```bash
   php artisan db:seed --class=TransactionSeriesSeeder
   ```
   This creates 3 cashier counters with offsets: 1, 100, 200

3. **Login as Test User** and navigate to `/transactions`

4. **View Cashier Info** at the top of the page

5. **Test Flows**:
   - Set/change starting position
   - View next OR preview
   - Make a payment and verify OR number generated
   - Refresh info and see stats updated

### Key Concepts

**Flexible Offset Logic**:
- **First OR**: Uses `start_offset` value
- **Subsequent ORs**: Uses `last_generated_number + 1`
- **Offset Change**: Updates preference, doesn't affect existing sequence

**OR Number Format**: `{PREFIX}{NUMBER:digits}`
- Example: `CR0000000105` = Prefix "CR" + 10-digit number

**Auto-Jump**: If conflict detected, system automatically jumps to next available OR

**Conflict Detection**:
- System checks for cashiers within ±50 range before setting offset
- Shows warning dialog with conflicting cashiers' names and positions
- Allows proceeding with warning or choosing different offset
- Reduces likelihood of frequent auto-jumps

**Auto-Refresh**:
- Cashier info automatically updates after successful payment
- Also refreshes every 30 seconds in background
- Manual refresh button available for immediate update

**Warning States**:
- **No Series**: Red banner when no active transaction series
- **Outdated Offset**: Alert when offset is behind current series
- **Will Auto-Jump**: Indicator when next OR will skip numbers

### Code Locations

| Component | File |
|-----------|------|
| Service Logic | `app/Services/TransactionNumberService.php` |
| Payment Integration | `app/Services/PaymentService.php` |
| API Endpoints | `app/Http/Controllers/Transactions/TransactionsController.php` |
| Routes | `routes/web.php` (search for "preview-or") |
| Frontend Component | `resources/js/components/transactions/cashier-info-card.tsx` |
| Page Integration | `resources/js/pages/transactions/index.tsx` |
| Payment Component | `resources/js/components/transactions/payment-details.tsx` |
| Migrations | `database/migrations/2025_10_30_*` |
| Seeder | `database/seeders/TransactionSeriesSeeder.php` |

### Testing Commands

```bash
# Run all tests
php artisan test

# Run specific test suite
php artisan test tests/Feature/TransactionSeriesIntegrationTest.php

# Check database tables
php artisan db:table or_number_generations
php artisan db:table transaction_series_user_counters

# Inspect cashier counters
php artisan tinker --execute="
use App\Models\TransactionSeriesUserCounter;
TransactionSeriesUserCounter::with(['user:id,name'])->get();
"

# Check OR generations
php artisan tinker --execute="
use App\Models\OrNumberGeneration;
OrNumberGeneration::with(['generatedBy:id,name'])->latest()->take(10)->get();
"
```

### Common Issues

**Issue**: "No Active Transaction Series Found" (Red Warning Banner)
- **Cause**: No active transaction series created by administrator
- **Fix**: Contact administrator to create and activate a transaction series
- **Note**: Payments cannot be processed until series is active

**Issue**: "Next OR: Not Available"
- **Cause**: Cashier has no counter set yet
- **Fix**: Click "Set Position" button and enter your preferred starting offset

**Issue**: OR number doesn't match preview
- **Cause**: Another cashier generated OR before you
- **Fix**: Expected behavior! Preview is just an estimate
- **Solution**: Cashier info auto-refreshes after your payment to show updated preview

**Issue**: Warning about conflicting offset
- **Cause**: Chosen offset is within ±50 of another cashier's offset
- **Fix**: Either proceed with warning or choose a different offset with more spacing
- **Recommendation**: Use offsets 100+ apart (e.g., 1-99, 100-199, 200-299)

**Issue**: Tests failing
- **Cause**: Database not migrated or seeded
- **Fix**: Run migrations and refresh test database

### API Endpoints

```typescript
// Preview next OR
GET /transactions/preview-or
Response: {
  next_or_number: "CR0000000105",
  disclaimer: "...",
  warnings: []
}

// Get cashier info
GET /transactions/my-counter-info
Success Response: {
  next_or_number: "CR0000000105",
  offset: 100,
  is_auto_assigned: false,
  total_generated: 5,
  generated_at_current_offset: 5,
  last_generated_number: 104,
  last_generated_or: "CR0000000104",
  will_auto_jump: false,
  is_outdated: false,
  warning: null,
  highest_in_series: 250
}
Error Response (No Series): {
  message: "No active transaction series found."
} // Status: 404

// Check offset for conflicts (before setting)
POST /transactions/check-offset
Body: { offset: 150 }
Response: {
  has_conflicts: true,
  warnings: [
    "⚠️ John Doe is using offset 120 (30 numbers below yours)..."
  ],
  info_messages: ["Do you want to continue with this offset?"]
}

// Set offset
POST /transactions/set-my-offset
Body: { offset: 300 }
Response: {
  message: "...",
  next_or_number: "...",
  info_messages: [...]
}
```

### Database Schema Reference

```sql
-- OR Generations (Audit Trail)
or_number_generations
├── id
├── transaction_series_id (FK)
├── user_id (FK)
├── or_number (UNIQUE)
├── numeric_value
├── status (enum)
├── generated_at
├── used_at
├── transaction_id (FK, nullable)
├── voided_at
├── voided_by (FK, nullable)
├── void_reason
└── metadata (jsonb)

-- User Counters
transaction_series_user_counters
├── id
├── transaction_series_id (FK)
├── user_id (FK)
├── start_offset
├── current_number
├── last_generated_number
├── is_auto_assigned
└── UNIQUE(transaction_series_id, user_id)

-- Transactions (Updated)
transactions
├── ... existing fields ...
└── generation_id (FK, nullable)
```

### Adding New Features

**Example: Admin Dashboard for Monitoring**

1. **Create Controller Method**:
   ```php
   // TransactionSeriesController.php
   public function cashierStats()
   {
       $stats = TransactionSeriesUserCounter::with(['user', 'transactionSeries'])
           ->get()
           ->map(function ($counter) {
               return [
                   'cashier' => $counter->user->name,
                   'offset' => $counter->start_offset,
                   'total_generated' => $counter->transactionSeries
                       ->orNumberGenerations()
                       ->where('user_id', $counter->user_id)
                       ->count(),
                   'last_or' => $counter->last_generated_number,
               ];
           });
       
       return Inertia::render('TransactionSeries/CashierStats', [
           'stats' => $stats,
       ]);
   }
   ```

2. **Add Route**:
   ```php
   Route::get('/transaction-series/cashier-stats', [TransactionSeriesController::class, 'cashierStats'])
       ->name('transaction-series.cashier-stats');
   ```

3. **Create Frontend Page**: `resources/js/pages/transaction-series/cashier-stats.tsx`

## For Users

### How to Use

1. **Open Transactions Page** (`/transactions`)

2. **View Your Info** at the top:
   - Next OR Number (preview)
   - Your starting position
   - Statistics (ORs generated, last OR)

3. **Set Starting Position** (optional):
   - Click "Set Position" or "Change Position"
   - Enter your preferred offset number (e.g., 1, 100, 200)
   - Click "Save Position"

4. **Make Payments** as usual:
   - Search for customer
   - Select payables
   - Enter payment details
   - Submit payment
   - OR number automatically generated

5. **Monitor Your Activity**:
   - Stats update after each payment
   - Auto-refreshes every 30 seconds
   - Click refresh button for manual update

### Tips

- **Starting Position**: Choose an offset that doesn't conflict with other cashiers (e.g., 1-99, 100-199, 200-299)
  - System warns you if your offset is within ±50 of another cashier
  - Recommended spacing: 100+ numbers apart
- **Preview vs Actual**: Preview may differ from actual OR if other cashiers are working simultaneously
- **Changing Position**: You can change your offset anytime without affecting your existing OR sequence
- **Statistics**: Track your daily OR generation activity
  - Compact view shows summary (Next OR, Offset, Total Generated)
  - Expanded view shows detailed stats by current vs previous offsets
- **Auto-Refresh**: Cashier info automatically updates after each payment
  - No need to manually refresh to see next OR
  - Also auto-refreshes every 30 seconds

### Troubleshooting

**Red warning: "No Active Transaction Series Found"**
→ Contact administrator to create and activate a transaction series
→ Payments cannot be processed until this is fixed
→ Click "Retry" button after admin activates series

**"Next OR: Not Available"**
→ Set your starting position using the "Set Position" button

**Preview doesn't match actual OR**
→ Normal! Another cashier may have generated an OR before you
→ Cashier info auto-refreshes after your payment

**Warning about conflicting offset**
→ Your chosen offset is close to another cashier's position
→ Either proceed or choose different offset with more spacing
→ Recommended: 100+ numbers apart (e.g., 1, 100, 200, 300)

**Can't change starting position**
→ Contact system administrator (may need permissions)

**Next OR doesn't update after payment**
→ Should auto-refresh within 1 second
→ If not, click the manual refresh button
→ Check console for errors

## For Administrators

### Monitoring

**View All Cashier Activity**:
```sql
SELECT 
    u.name AS cashier,
    tsuc.start_offset AS offset,
    COUNT(ong.id) AS total_generated,
    MAX(ong.or_number) AS last_or,
    MAX(ong.generated_at) AS last_activity
FROM transaction_series_user_counters tsuc
LEFT JOIN users u ON tsuc.user_id = u.id
LEFT JOIN or_number_generations ong ON ong.user_id = u.id AND ong.status = 'used'
GROUP BY u.name, tsuc.start_offset
ORDER BY last_activity DESC;
```

**Check for Issues**:
```sql
-- Find frequently jumped ORs (potential conflicts)
SELECT DATE(generated_at) as date, COUNT(*) as jump_count
FROM or_number_generations
WHERE status = 'jumped'
GROUP BY DATE(generated_at)
HAVING COUNT(*) > 10
ORDER BY date DESC;

-- Find voided ORs
SELECT * FROM or_number_generations
WHERE status = 'voided'
ORDER BY voided_at DESC
LIMIT 20;
```

### Maintenance Tasks

**Reset Cashier Counter** (if needed):
```php
php artisan tinker
$counter = TransactionSeriesUserCounter::where('user_id', 123)->first();
$counter->start_offset = 1;
$counter->last_generated_number = null;
$counter->save();
```

**Generate BIR Report**:
```sql
-- All ORs for date range
SELECT 
    ong.or_number,
    t.id AS transaction_id,
    t.total_amount,
    u.name AS cashier,
    ong.generated_at,
    ong.status
FROM or_number_generations ong
LEFT JOIN transactions t ON ong.transaction_id = t.id
LEFT JOIN users u ON ong.user_id = u.id
WHERE ong.generated_at BETWEEN '2025-01-01' AND '2025-12-31'
ORDER BY ong.numeric_value;
```

**Deactivate Old Series** (at year-end):
```php
php artisan tinker
$oldSeries = TransactionSeries::where('series_name', '2025 OR Series')->first();
$oldSeries->is_active = false;
$oldSeries->save();

$newSeries = TransactionSeries::where('series_name', '2026 OR Series')->first();
$newSeries->is_active = true;
$newSeries->save();
```
