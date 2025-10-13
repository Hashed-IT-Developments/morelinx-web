# Approval Flow Implementation Guide

This document explains how to implement the flexible approval flow system in your models. The system allows you to define custom logic for when approval flows should be initiated based on model events and field changes.

## Table of Contents

1. [Overview](#overview)
2. [Basic Setup](#basic-setup)
3. [Implementation Patterns](#implementation-patterns)
4. [Examples](#examples)
5. [API Reference](#api-reference)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

## Overview

The approval flow system provides a flexible way to manage approval processes for different models. Instead of always initializing approval flows on model creation, you can now define custom logic to trigger approval flows based on:

- Model creation
- Model updates
- Specific field changes
- Custom business logic

## Basic Setup

### Step 1: Implement the Required Interface and Trait

Your model must implement the `RequiresApprovalFlow` interface and use the `HasApprovalFlow` trait:

```php
<?php

namespace App\Models;

use App\Contracts\RequiresApprovalFlow;
use App\Models\Traits\HasApprovalFlow;
use Illuminate\Database\Eloquent\Model;

class YourModel extends Model implements RequiresApprovalFlow
{
    use HasApprovalFlow;

    // Required methods from RequiresApprovalFlow interface
    public function getApprovalModule(): string
    {
        return ModuleName::YOUR_MODULE;
    }

    public function getApprovalDepartmentId(): ?int
    {
        return null; // or return specific department ID
    }

    public function shouldInitializeApprovalFlow(): bool
    {
        return true; // Default behavior - initialize on creation
    }
}
```

### Step 2: Define Custom Initialization Logic (Optional)

To customize when approval flows are initiated, implement the `shouldInitializeApprovalFlowOn()` method:

```php
public function shouldInitializeApprovalFlowOn(string $event): bool
{
    // Custom logic based on event type
    if ($event === 'created') {
        // Define when to initialize on creation
        return $this->some_field === 'some_value';
    }

    if ($event === 'updated') {
        // Define when to initialize on update
        return $this->isDirty('status') && $this->status === 'needs_approval';
    }

    return false;
}
```

## Implementation Patterns

### Pattern 1: Initialize on Creation (Default)

```php
class CustomerApplication extends Model implements RequiresApprovalFlow
{
    use HasApprovalFlow;

    public function getApprovalModule(): string
    {
        return ModuleName::CUSTOMER_APPLICATION;
    }

    public function getApprovalDepartmentId(): ?int
    {
        return null;
    }

    public function shouldInitializeApprovalFlow(): bool
    {
        return true; // Always initialize on creation
    }
}
```

### Pattern 2: Initialize Only on Status Change

```php
class CustApplnInspection extends Model implements RequiresApprovalFlow
{
    use HasApprovalFlow;

    public function getApprovalModule(): string
    {
        return ModuleName::INSPECTION;
    }

    public function getApprovalDepartmentId(): ?int
    {
        return null;
    }

    public function shouldInitializeApprovalFlow(): bool
    {
        return false; // Don't initialize on creation
    }

    public function shouldInitializeApprovalFlowOn(string $event): bool
    {
        if ($event === 'created') {
            return false; // Never on creation
        }

        if ($event === 'updated') {
            // Only when status changes to specific value
            return $this->isDirty('status') && 
                   $this->status === InspectionStatusEnum::FOR_INSPECTION_APPROVAL;
        }

        return false;
    }
}
```

### Pattern 3: Conditional Logic Based on Fields

```php
class Transaction extends Model implements RequiresApprovalFlow
{
    use HasApprovalFlow;

    public function getApprovalModule(): string
    {
        return ModuleName::TRANSACTION;
    }

    public function getApprovalDepartmentId(): ?int
    {
        return $this->department_id;
    }

    public function shouldInitializeApprovalFlow(): bool
    {
        return false; // Custom logic only
    }

    public function shouldInitializeApprovalFlowOn(string $event): bool
    {
        if ($event === 'created') {
            // Initialize if amount exceeds threshold
            return $this->amount > 10000;
        }

        if ($event === 'updated') {
            // Initialize if amount is increased beyond threshold
            return $this->isDirty('amount') && 
                   $this->amount > 10000 && 
                   $this->getOriginal('amount') <= 10000;
        }

        return false;
    }
}
```

### Pattern 4: Multiple Field Dependencies

```php
class Document extends Model implements RequiresApprovalFlow
{
    use HasApprovalFlow;

    public function shouldInitializeApprovalFlowOn(string $event): bool
    {
        if ($event === 'updated') {
            // Initialize when both status and category change
            return ($this->isDirty('status') && $this->status === 'submitted') &&
                   ($this->isDirty('category') && $this->category === 'sensitive');
        }

        return false;
    }
}
```

## Examples

### Example 1: Customer Inspection Workflow

```php
<?php

namespace App\Models;

use App\Contracts\RequiresApprovalFlow;
use App\Enums\InspectionStatusEnum;
use App\Enums\ModuleName;
use App\Models\Traits\HasApprovalFlow;
use Illuminate\Database\Eloquent\Model;

class CustApplnInspection extends Model implements RequiresApprovalFlow
{
    use HasApprovalFlow;

    protected $fillable = ['status', 'inspector_id', 'customer_application_id'];

    public function getApprovalModule(): string
    {
        return ModuleName::INSPECTION;
    }

    public function getApprovalDepartmentId(): ?int
    {
        return null;
    }

    public function shouldInitializeApprovalFlow(): bool
    {
        return false; // Don't initialize on creation
    }

    public function shouldInitializeApprovalFlowOn(string $event): bool
    {
        if ($event === 'updated') {
            // Only initialize when status changes to 'for_inspection_approval'
            return $this->isDirty('status') && 
                   $this->status === InspectionStatusEnum::FOR_INSPECTION_APPROVAL;
        }

        return false;
    }
}

// Usage:
$inspection = CustApplnInspection::create([
    'status' => InspectionStatusEnum::FOR_INSPECTION,
    'inspector_id' => 1,
    'customer_application_id' => 123
]);
// No approval flow initialized yet

$inspection->update([
    'status' => InspectionStatusEnum::FOR_INSPECTION_APPROVAL
]);
// Approval flow is now initialized!
```

### Example 2: Transaction Approval Based on Amount

```php
<?php

namespace App\Models;

use App\Contracts\RequiresApprovalFlow;
use App\Enums\ModuleName;
use App\Models\Traits\HasApprovalFlow;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model implements RequiresApprovalFlow
{
    use HasApprovalFlow;

    protected $fillable = ['amount', 'description', 'department_id'];

    public function getApprovalModule(): string
    {
        return ModuleName::TRANSACTION;
    }

    public function getApprovalDepartmentId(): ?int
    {
        return $this->department_id;
    }

    public function shouldInitializeApprovalFlow(): bool
    {
        return false; // Use custom logic
    }

    public function shouldInitializeApprovalFlowOn(string $event): bool
    {
        $threshold = 5000;

        if ($event === 'created') {
            // Initialize if transaction amount exceeds threshold
            return $this->amount > $threshold;
        }

        if ($event === 'updated') {
            // Initialize if amount is updated and now exceeds threshold
            return $this->isDirty('amount') && 
                   $this->amount > $threshold &&
                   ($this->getOriginal('amount') <= $threshold || is_null($this->getOriginal('amount')));
        }

        return false;
    }
}

// Usage:
$transaction = Transaction::create([
    'amount' => 3000,
    'description' => 'Office supplies'
]);
// No approval flow (amount below threshold)

$transaction->update(['amount' => 7000]);
// Approval flow initialized (amount now exceeds threshold)
```

## API Reference

### Required Interface Methods

#### `getApprovalModule(): string`
Returns the module name for this approval flow.

#### `getApprovalDepartmentId(): ?int`
Returns the department ID for this approval flow, or null for global flows.

#### `shouldInitializeApprovalFlow(): bool`
Legacy method for backward compatibility. Returns whether to initialize approval flow on creation.

### Optional Custom Methods

#### `shouldInitializeApprovalFlowOn(string $event): bool`
**Note: This method is NOT part of the `RequiresApprovalFlow` interface - it's an optional enhancement.**

Custom logic for when to initialize approval flows based on events. If this method is not implemented, the system falls back to using `shouldInitializeApprovalFlow()` for creation events only.

**Parameters:**
- `$event`: Either 'created' or 'updated'

**Returns:** `bool` - Whether to initialize the approval flow

### Available Methods from HasApprovalFlow Trait

#### Flow Management
- `initializeApprovalFlow(string $module, ?int $departmentId = null): ApprovalState`
- `approve($approver, ?string $remarks = null): bool`
- `reject($approver, string $remarks): bool`
- `resetApprovalFlow(): bool`

#### Status Checking
- `isApprovalComplete(): bool`
- `isApprovalRejected(): bool`
- `isApprovalPending(): bool`
- `canUserApprove($user): bool`

#### Information Retrieval
- `getApprovalHistory()`
- `getCurrentStepInfo(): ?array`
- `getApprovalProgress(): int`
- `getApprovalStatusText(): string`

#### Query Scopes
- `scopeVisibleToUser(Builder $query, $user)`
- `scopePendingApproval(Builder $query)`
- `scopeApproved(Builder $query)`
- `scopeRejected(Builder $query)`
- `scopeAtApprovalStep(Builder $query, int $step)`
- `scopeForRoleApproval(Builder $query, string $roleName)`

### Helpful Eloquent Methods

When implementing custom logic, these Eloquent methods are particularly useful:

- `$this->isDirty('field_name')` - Check if a field has been changed
- `$this->getOriginal('field_name')` - Get the original value before changes
- `$this->wasChanged('field_name')` - Check if a field was changed (in updated event)

## Best Practices

### 1. Use Enums for Status Values
Always use enums instead of hardcoded strings:

```php
// Good
return $this->status === InspectionStatusEnum::FOR_INSPECTION_APPROVAL;

// Bad
return $this->status === 'for_inspection_approval';
```

### 2. Implement Defensive Logic
Always check for null values and edge cases:

```php
public function shouldInitializeApprovalFlowOn(string $event): bool
{
    if ($event === 'updated') {
        return $this->isDirty('status') && 
               !is_null($this->status) &&
               $this->status === StatusEnum::NEEDS_APPROVAL;
    }
    
    return false;
}
```

### 3. Document Your Logic
Add clear comments explaining the business rules:

```php
public function shouldInitializeApprovalFlowOn(string $event): bool
{
    if ($event === 'updated') {
        // Business Rule: Approval required when inspection status 
        // changes to "for_inspection_approval"
        return $this->isDirty('status') && 
               $this->status === InspectionStatusEnum::FOR_INSPECTION_APPROVAL;
    }
    
    return false;
}
```

### 4. Test Edge Cases
Consider these scenarios in your implementation:
- What happens if the field is set to null?
- What if multiple fields change simultaneously?
- What if the same status is set multiple times?

### 5. Use Type Hints
Always use proper type hints for better IDE support and error prevention:

```php
public function shouldInitializeApprovalFlowOn(string $event): bool
{
    // Implementation
}
```

## Troubleshooting

### Common Issues

#### 1. Approval Flow Not Initializing
**Problem:** The approval flow doesn't start when expected.

**Solutions:**
- Check if your model implements `RequiresApprovalFlow`
- Verify the `HasApprovalFlow` trait is used
- Ensure `shouldInitializeApprovalFlowOn()` returns `true` for the right conditions
- Check the application logs for any errors

#### 2. Approval Flow Initializing Too Often
**Problem:** Approval flows are created when they shouldn't be.

**Solutions:**
- Review your `shouldInitializeApprovalFlowOn()` logic
- Use `isDirty()` to check for actual field changes
- Consider using more specific conditions

#### 3. Method Not Found Errors
**Problem:** `shouldInitializeApprovalFlowOn()` method not found.

**Solutions:**
- This method is optional - the system falls back to `shouldInitializeApprovalFlow()`
- If you want custom logic, implement the method in your model

### Debug Tips

#### 1. Add Logging
Temporarily add logging to debug your logic:

```php
public function shouldInitializeApprovalFlowOn(string $event): bool
{
    if ($event === 'updated') {
        $shouldInit = $this->isDirty('status') && 
                     $this->status === StatusEnum::NEEDS_APPROVAL;
        
        Log::info("Approval flow check", [
            'model' => get_class($this),
            'id' => $this->id,
            'event' => $event,
            'status_dirty' => $this->isDirty('status'),
            'current_status' => $this->status,
            'should_initialize' => $shouldInit
        ]);
        
        return $shouldInit;
    }
    
    return false;
}
```

#### 2. Use Tinker for Testing
Test your logic in Laravel Tinker:

```bash
php artisan tinker

$model = YourModel::find(1);
$model->status = 'new_status';
$model->shouldInitializeApprovalFlowOn('updated'); // Test your logic
```

#### 3. Check Model Events
Verify that model events are firing:

```php
// Add to your model temporarily
protected static function boot()
{
    parent::boot();
    
    static::updated(function ($model) {
        Log::info('Model updated', ['id' => $model->id, 'changes' => $model->getDirty()]);
    });
}
```

---

## Conclusion

This approval flow system provides flexibility while maintaining consistency across your application. By implementing the patterns and best practices outlined in this guide, you can create robust approval workflows that match your business requirements.

For additional support or questions, please refer to the codebase documentation or contact the development team.