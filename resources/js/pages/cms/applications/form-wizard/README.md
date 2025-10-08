# Enhanced Step Visibility System

This system now supports conditional step visibility based on both `rate_class` and `customer_type` fields, providing fine-grained control over which steps appear in the wizard form.

## Overview

The enhanced step configuration system allows you to:

1. **Show/hide steps based on rate class only**
2. **Show/hide steps based on customer type only**  
3. **Show/hide steps based on specific combinations of rate class and customer type**
4. **Use custom logic for complex business rules**

## Configuration Structure

```typescript
interface StepConfig {
    id: string;
    label: string;
    fields: readonly (keyof ApplicationFormValues)[];
    component: React.ComponentType;
    visibilityRules: {
        rateClasses?: string[];        // Show only for these rate classes
        customerTypes?: string[];      // Show only for these customer types
        combinations?: Array<{         // Show only for specific combinations
            rateClass: string;
            customerType: string;
        }>;
        customRule?: (context: {       // Custom logic function
            rateClass: string; 
            customerType: string 
        }) => boolean;
    };
}
```

## Visibility Logic Priority

The system evaluates visibility rules in this order:

1. **Custom Rule** (highest priority) - If defined, this function determines visibility
2. **Specific Combinations** - If defined, checks for exact rate_class + customer_type matches
3. **Rate Classes + Customer Types** - Both conditions must be satisfied (AND logic)

## Examples

### 1. Always Visible Step
```typescript
{
    id: 'account-info',
    label: 'Account Info',
    fields: ['rate_class', 'customer_type', /* ... */],
    component: StepAccountInfo,
    visibilityRules: stepVisibilityRules.alwaysVisible(), // Empty object {}
}
```

### 2. Rate Class Only
```typescript
{
    id: 'residential-only-step',
    label: 'Residential Features',
    fields: ['meter_type'],
    component: ResidentialStep,
    visibilityRules: stepVisibilityRules.residentialOnly(),
    // Equivalent to: { rateClasses: ['residential'] }
}
```

### 3. Customer Type Only
```typescript
{
    id: 'corporate-step',
    label: 'Corporate Information',
    fields: ['business_permit'],
    component: CorporateStep,
    visibilityRules: stepVisibilityRules.corporateOnly(),
    // Equivalent to: { customerTypes: ['corporation', 'government', 'cooperative'] }
}
```

### 4. Specific Combinations
```typescript
{
    id: 'special-step',
    label: 'Special Requirements',
    fields: ['special_permits'],
    component: SpecialStep,
    visibilityRules: stepVisibilityRules.specificCombinations([
        { rateClass: 'residential', customerType: 'individual' },
        { rateClass: 'commercial', customerType: 'corporation' },
    ]),
}
```

### 5. Custom Business Logic
```typescript
{
    id: 'advanced-step',
    label: 'Advanced Features',
    fields: ['advanced_config'],
    component: AdvancedStep,
    visibilityRules: stepVisibilityRules.customRule(({ rateClass, customerType }) => {
        // Complex business logic
        if (rateClass === 'power') {
            return ['corporation', 'government'].includes(customerType);
        }
        if (rateClass === 'industrial') {
            return customerType !== 'individual';
        }
        return true; // Show for all other combinations
    }),
}
```

## Predefined Visibility Rules

The system includes several predefined rules for common scenarios:

```typescript
export const stepVisibilityRules = {
    // Basic rules
    alwaysVisible: () => ({}),
    residentialOnly: () => ({ rateClasses: ['residential'] }),
    commercialAndIndustrialOnly: () => ({ rateClasses: ['commercial', 'industrial'] }),
    nonResidentialOnly: () => ({ rateClasses: ['commercial', 'industrial', 'power'] }),
    
    // Customer type rules
    individualOnly: () => ({ customerTypes: ['individual'] }),
    corporateOnly: () => ({ customerTypes: ['corporation', 'government', 'cooperative'] }),
    
    // Combination rules
    residentialIndividualOnly: () => ({ 
        combinations: [{ rateClass: 'residential', customerType: 'individual' }] 
    }),
    commercialCorporateOnly: () => ({ 
        combinations: [
            { rateClass: 'commercial', customerType: 'corporation' },
            { rateClass: 'commercial', customerType: 'government' },
        ] 
    }),
};
```

## Current Step Configuration

| Step | Residential Individual | Residential Corporate | Commercial Individual | Commercial Corporate | Industrial Corporate | Power Corporate |
|------|----------------------|---------------------|---------------------|-------------------|-------------------|---------------|
| Account Info | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Address Info | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Contact Info | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Requirements | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Bill Info | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Government Info | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Attachment Info | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Review | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

## Usage in Component

The main component automatically watches both fields and updates the visible steps:

```typescript
// In your WizardForm component
const currentRateClass = form.watch('rate_class');
const currentCustomerType = form.watch('customer_type');

const visibleSteps = React.useMemo(() => {
    return getVisibleSteps(currentRateClass, currentCustomerType);
}, [currentRateClass, currentCustomerType]);
```

## Adding New Steps

To add a new step with visibility rules:

1. Define your step component
2. Add the step configuration to `STEP_CONFIGS` array
3. Set the appropriate `visibilityRules`

```typescript
{
    id: 'my-new-step',
    label: 'My New Step',
    fields: ['field1', 'field2'],
    component: MyNewStepComponent,
    visibilityRules: stepVisibilityRules.customRule(({ rateClass, customerType }) => {
        // Your custom logic here
        return rateClass === 'commercial' && customerType === 'corporation';
    }),
}
```

## Benefits

- **Flexible**: Supports simple and complex visibility scenarios
- **Type Safe**: Full TypeScript support with proper typing
- **Reactive**: Automatically updates when form values change
- **Maintainable**: Centralized configuration makes changes easy
- **Extensible**: Easy to add new rules and combinations
- **Performance**: Memoized calculations prevent unnecessary re-renders

## Migration from Old System

If you have existing steps using the old `visibleForRateClasses` property:

**Old:**
```typescript
visibleForRateClasses: ['residential', 'commercial']
```

**New:**
```typescript
visibilityRules: { rateClasses: ['residential', 'commercial'] }
// or use predefined rule:
visibilityRules: stepVisibilityRules.rateClassOnly(['residential', 'commercial'])
```