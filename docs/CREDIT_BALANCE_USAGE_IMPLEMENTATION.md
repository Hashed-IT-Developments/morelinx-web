# Credit Balance Usage Implementation

## Overview
This document explains how the credit balance deduction feature works when customers apply their available credit to payments.

## How It Works

### User Flow

1. **Customer searches** their account in Point of Payments
2. **System displays** available credit balance (if > 0)
3. **User checks** "Use Available Credit Balance" checkbox in Payment Details
4. **System auto-calculates** how much credit to apply (min of available credit or subtotal)
5. **User submits** payment with reduced amount needed
6. **Backend processes**:
   - Deducts credit from customer's balance
   - Records the credit usage in `credit_balance_definitions`
   - Applies credit + cash/check/card payment to payables
   - Updates transaction description

## Backend Implementation

### PaymentService.php

#### 1. Credit Balance Application
```php
if (!empty($validatedData['use_credit_balance']) && $validatedData['use_credit_balance'] === true) {
    $creditBalance = $customerApplication->creditBalance;
    
    if ($creditBalance && $creditBalance->credit_balance > 0) {
        // Calculate how much credit to apply
        $creditApplied = min($creditBalance->credit_balance, $totalAmountDue);
        // Note: Credit will be deducted after transaction is created for consistent source tracking
    }
}

// ... (transaction is created) ...

// Deduct credit from customer's balance (now that we have transaction ID)
if ($creditApplied > 0 && $creditBalance) {
    $creditBalance->deductCredit(
        $creditApplied,
        'applied_to_transaction_' . $transaction->id
    );
}
```

#### 2. Adjusted Payment Calculation
```php
$adjustedAmountDue = $totalAmountDue - $creditApplied;
$totalCombinedPayment = $totalPaymentAmount + $creditApplied;
```

#### 3. Transaction Recording
- `total_amount` = Cash/Check/Card + Credit Applied
- `description` = Includes note about credit applied
- `payment_mode` = Based on combined payment vs total due

#### 4. Payment Allocation
The combined payment (credit + cash) is allocated across payables in order.

### Validation Rules
```php
'use_credit_balance' => 'nullable|boolean',
```

## Frontend Implementation

### Payment Details Component

#### 1. Credit Balance Checkbox
```tsx
{hasCreditBalance && (
    <div className="mb-4">
        <label>
            <input 
                type="checkbox"
                checked={useCreditBalance}
                onChange={handleToggleCreditBalance}
            />
            Use Available Credit Balance
        </label>
        <div>Available: ₱{availableCreditBalance.toFixed(2)}</div>
        <div>Applying: ₱{creditToApply.toFixed(2)}</div>
    </div>
)}
```

#### 2. Auto-Calculation
```tsx
const handleToggleCreditBalance = (checked: boolean) => {
    setUseCreditBalance(checked);
    if (checked && hasCreditBalance) {
        const maxCredit = Math.min(availableCreditBalance!, subtotal);
        setCreditToApply(maxCredit);
    } else {
        setCreditToApply(0);
    }
};
```

#### 3. Adjusted Subtotal Display
```tsx
const adjustedSubtotal = Math.max(0, subtotal - creditToApply);

// Shows:
// Original: ₱500.00 - Credit: ₱100.00
// Adjusted Subtotal: ₱400.00
```

#### 4. Submitting to Backend
```tsx
router.post(route('transactions.process-payment', customerApplicationId), {
    payment_methods: paymentMethods,
    selected_payable_ids: selectedPayableIds,
    use_credit_balance: useCreditBalance, // ✅ Sent to backend
});
```

## Database Records Created

### When Credit is Applied

**CreditBalanceDefinition created by `deductCredit()`:**
```
| id | credit_balance_id | amount  | last_balance | source                        |
|----|------------------|---------|--------------|-------------------------------|
| 5  | 2                | -100.00 | 150.00       | applied_to_transaction_123    |
```

**CreditBalance updated:**
```
Before: credit_balance = 150.00
After:  credit_balance = 50.00
```

**Transaction created:**
```
total_amount = 500.00 (400 cash + 100 credit)
description = "Payment for energization charges (Credit applied: ₱100.00)"
```

## Example Scenarios

### Scenario 1: Full Credit Usage
- **Total Due:** ₱300.00
- **Available Credit:** ₱500.00
- **Credit Applied:** ₱300.00 (full amount due)
- **Cash Needed:** ₱0.00
- **Remaining Credit:** ₱200.00

### Scenario 2: Partial Credit Usage
- **Total Due:** ₱500.00
- **Available Credit:** ₱100.00
- **Credit Applied:** ₱100.00 (all available credit)
- **Cash Needed:** ₱400.00
- **Remaining Credit:** ₱0.00

### Scenario 3: Credit + Overpayment
- **Total Due:** ₱300.00
- **Available Credit:** ₱100.00
- **Credit Applied:** ₱100.00
- **Cash Paid:** ₱250.00
- **Combined Payment:** ₱350.00
- **Overpayment:** ₱50.00 → Added back to credit balance
- **Final Credit:** ₱0 + ₱50 = ₱50.00

## Audit Trail

Every credit balance transaction is recorded in `credit_balance_definitions`:

```sql
SELECT 
    id,
    amount,
    last_balance,
    source,
    created_at
FROM credit_balance_definitions
WHERE credit_balance_id = 2
ORDER BY created_at DESC;
```

**Example Output:**
```
| id | amount  | last_balance | source                            | created_at          |
|----|---------|--------------|-----------------------------------|---------------------|
| 8  | 50.00   | 0.00         | overpayment_from_transaction_123  | 2025-10-23 10:30:00 |
| 7  | -100.00 | 150.00       | applied_to_transaction_122        | 2025-10-23 10:25:00 |
| 6  | 150.00  | 0.00         | overpayment_from_transaction_121  | 2025-10-23 09:00:00 |
```

## Transaction Description Examples

### With Credit Applied
```
"Payment for energization charges (Credit applied: ₱100.00)"
```

### With Credit + Overpayment
```
"Payment for energization charges (Credit applied: ₱100.00) (Overpayment: ₱50.00 credited)"
```

### Partial Payment with Credit
```
"Partial payment for energization charges (Remaining: ₱200.00) (Credit applied: ₱100.00)"
```

## Benefits

1. **✅ Automated Credit Management** - No manual tracking needed
2. **✅ Complete Audit Trail** - Every credit usage is logged
3. **✅ Accurate Balances** - Real-time credit balance updates
4. **✅ User-Friendly** - Auto-calculates maximum credit to apply
5. **✅ Flexible** - Works with cash, check, and card payments
6. **✅ Transaction History** - Clear descriptions show credit usage

## Testing Checklist

- [ ] Customer with credit can apply it to payment
- [ ] Credit balance decreases correctly
- [ ] CreditBalanceDefinition is created with negative amount
- [ ] Transaction description includes credit applied
- [ ] Overpayment after credit usage adds back to balance
- [ ] Cannot apply more credit than available
- [ ] Cannot apply more credit than amount due
- [ ] Works with multiple payment methods (cash + credit)
- [ ] Works with check/card + credit
- [ ] Partial payment with credit shows correct remaining balance
