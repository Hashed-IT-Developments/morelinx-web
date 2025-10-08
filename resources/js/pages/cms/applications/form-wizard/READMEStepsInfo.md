# Simplified Step Visibility System

## 🎯 Much Easier Approach!

Instead of complex visibility rules, you can now simply define which steps should appear for each rate class (and customer type combination).

**Important**: The `account-info` step is **always visible** and will be automatically included as the first step, even if you forget to include it in your configuration.

## 📋 How to Configure Steps

### Simple Rate Class Mapping

```typescript
export const STEP_VISIBILITY_MAP = {
    // Just list the steps you want for each rate class!
    [RATE_CLASSES.RESIDENTIAL]: ['account-info', 'address-info', 'contact-info', 'requirements', 'bill-info', 'review'],
    [RATE_CLASSES.POWER]: ['account-info', 'address-info', 'contact-info', 'government-info', 'review'],
    [RATE_CLASSES.COMMERCIAL]: ['account-info', 'address-info', 'contact-info', 'government-info', 'review'],
    [RATE_CLASSES.CITY_OFFICES]: ['account-info', 'address-info', 'contact-info', 'attachment-info', 'bill-info', 'review'],
    // ... more rate classes
};
```

### Specific Combinations (Override defaults)

```typescript
export const STEP_VISIBILITY_MAP = {
    // Rate class defaults
    [RATE_CLASSES.POWER]: ['account-info', 'address-info', 'contact-info', 'government-info', 'review'],

    // Specific overrides for rate_class + customer_type combinations
    [`${RATE_CLASSES.POWER}:${CUSTOMER_TYPES.TEMPORARY_RESIDENTIAL}`]: [
        'account-info',
        'address-info',
        'contact-info',
        'requirements',
        'bill-info',
        'review',
    ],
};
```

## ✅ Current Configuration

| Rate Class            | Customer Type         | Steps                                                                        |
| --------------------- | --------------------- | ---------------------------------------------------------------------------- |
| **Residential**       | Any                   | account-info, address-info, contact-info, requirements, bill-info, review    |
| **Power**             | General               | account-info, address-info, contact-info, government-info, review            |
| **Commercial**        | Any                   | account-info, address-info, contact-info, government-info, review            |
| **City Offices**      | Any                   | account-info, address-info, contact-info, attachment-info, bill-info, review |
| **City Streetlights** | Any                   | account-info, address-info, contact-info, attachment-info, bill-info, review |
| **Other Government**  | Any                   | account-info, address-info, contact-info, attachment-info, bill-info, review |
| **Power**             | Temporary Commercial  | account-info, address-info, contact-info, government-info, review            |
| **Power**             | Temporary Residential | account-info, address-info, contact-info, requirements, bill-info, review    |

## 🚀 Adding New Configurations

### Option 1: Direct Addition

```typescript
// Add to STEP_VISIBILITY_MAP
[RATE_CLASSES.NEW_RATE_CLASS]: ['account-info', 'address-info', 'new-step', 'review'],
```

### Option 2: Programmatic Addition

```typescript
// Use helper function
addStepVisibility('new_rate_class', ['account-info', 'address-info', 'new-step', 'review']);

// For specific combinations
addStepVisibility('power', ['account-info', 'special-step', 'review'], 'special_customer');
```

## 🛡️ Safety Features

1. **Account Info Always Visible**: The `account-info` step is automatically included as the first step for all configurations, even if you forget to add it.
2. **Fallback Protection**: If no configuration is found for a rate class, only `account-info` will be shown.
3. **Order Preservation**: Steps appear in the exact order you define them in the array.

## 🎉 Benefits of This Approach

1. **Super Simple**: Just list the steps you want!
2. **Visual**: You can immediately see what steps appear for each case
3. **Easy to Modify**: Change a single array to modify step visibility
4. **No Complex Logic**: No need to understand complex visibility rules
5. **Order Matters**: Steps appear in the order you define them
6. **Override Friendly**: Specific combinations override general rate class rules

## 📝 Example: Adding a New Rate Class

```typescript
// Old approach: Complex visibility rules with multiple conditions
visibilityRules: {
    rateClasses: [...],
    customerTypes: [...],
    combinations: [...],
    customRule: (context) => { /* complex logic */ }
}

// New approach: Simple list!
[RATE_CLASSES.AGRICULTURAL]: ['account-info', 'address-info', 'environmental-impact', 'review']
```

## 🔄 Migration from Old System

The old complex system has been replaced with this simple mapping. If you need to add a new configuration:

1. Add your rate class to `RATE_CLASSES` (if needed)
2. Add your customer type to `CUSTOMER_TYPES` (if needed)
3. Add a line to `STEP_VISIBILITY_MAP` with the steps you want
4. Done! 🎉

Much easier to understand and maintain!
