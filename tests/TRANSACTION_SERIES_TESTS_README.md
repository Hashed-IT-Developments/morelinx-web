# Transaction Series Test Suite

This test suite provides comprehensive coverage for the Transaction Series feature, which manages BIR-compliant OR (Official Receipt) number generation for the Philippines.

## Test Files

### 1. Unit Tests

#### `tests/Unit/TransactionNumberServiceTest.php`
Tests the core `TransactionNumberService` class that handles OR number generation and series management.

**Test Coverage:**
- ✅ OR number generation (first, sequential, custom formats)
- ✅ Exception handling (no active series, series limit reached)
- ✅ Manual OR number validation
- ✅ Series CRUD operations (create, update, activate, deactivate)
- ✅ Series statistics and limit warnings
- ✅ Concurrent OR number generation with database locking
- ✅ Unlimited series support (no end_number)

**18 tests, 51 assertions**

#### `tests/Unit/TransactionSeriesModelTest.php`
Tests the `TransactionSeries` model and its methods, scopes, and relationships.

**Test Coverage:**
- ✅ Model creation and validation
- ✅ Relationships (creator, transactions)
- ✅ Query scopes (active, effectiveOn)
- ✅ Limit checking methods (hasReachedLimit, isNearLimit)
- ✅ Usage calculations (getUsagePercentage, getRemainingNumbers)
- ✅ OR number formatting with various templates
- ✅ Soft deletes
- ✅ Type casting

**13 tests, 37 assertions**

---

### 2. Feature Tests

#### `tests/Feature/Settings/TransactionSeriesControllerTest.php`
Tests the HTTP endpoints for managing transaction series through the web interface.

**Test Coverage:**
- ✅ Viewing series index page with pagination
- ✅ Creating new series with validation
- ✅ Updating series details
- ✅ Activating/deactivating series
- ✅ Deleting unused series
- ✅ Preventing deletion of series with transactions
- ✅ Viewing series details with statistics
- ✅ Near-limit warnings in UI
- ✅ Filtering active series only
- ✅ Authentication requirements

**15 tests, 119 assertions**

#### `tests/Feature/TransactionSeriesIntegrationTest.php`
Integration tests that verify the complete payment flow with transaction series.

**Test Coverage:**
- ✅ Automatic OR number generation during payment processing
- ✅ Sequential OR number generation across multiple payments
- ✅ Series switching between payments
- ✅ Payment failure handling (no active series, series limit reached)
- ✅ Auto-generated OR numbers (manual entry not yet implemented)
- ✅ Duplicate OR number prevention
- ✅ Transaction-series relationships
- ✅ Concurrent payment processing with database locking
- ✅ Date-based OR number formatting (year/month changes)
- ✅ Series statistics accuracy after multiple transactions

**11 tests, 41 assertions**

---

## Running the Tests

### Run all transaction series tests:
```bash
php artisan test --filter=TransactionSeries
```

### Run specific test files:
```bash
# Unit tests
php artisan test tests/Unit/TransactionNumberServiceTest.php
php artisan test tests/Unit/TransactionSeriesModelTest.php

# Feature tests
php artisan test tests/Feature/Settings/TransactionSeriesControllerTest.php
php artisan test tests/Feature/TransactionSeriesIntegrationTest.php
```

### Run with coverage (if configured):
```bash
php artisan test --coverage --filter=TransactionSeries
```

---

## Test Summary

| Test Type | File | Tests | Assertions |
|-----------|------|-------|------------|
| Unit | TransactionNumberServiceTest | 18 | 51 |
| Unit | TransactionSeriesModelTest | 13 | 37 |
| Feature | TransactionSeriesControllerTest | 15 | 119 |
| Integration | TransactionSeriesIntegrationTest | 11 | 41 |
| **Total** | | **39** | **197** |

---

## Key Test Scenarios

### 1. BIR Compliance
- Sequential numbering without gaps
- Proper OR number formatting (OR-YYYYMM-000001)
- Date-based number formatting
- Series limit enforcement

### 2. Concurrency
- Database-level locking prevents duplicate OR numbers
- Multiple concurrent payments generate unique sequential numbers
- Thread-safe counter increments

### 3. Series Management
- Only one series can be active at a time
- Activating a new series automatically deactivates others
- Cannot delete series with associated transactions
- Proper soft deletes for audit trail

### 4. Error Handling
- Graceful failure when no active series exists
- Clear error messages when series limit is reached
- Validation prevents invalid series creation

### 5. Statistics & Monitoring
- Accurate usage percentage calculations
- Remaining numbers tracking
- Near-limit warnings (90%+ usage)
- Transaction count per series

---

## Future Test Considerations

### Pending Features (Documented but Not Yet Implemented)
- ⏳ Manual OR number entry in payment flow
- ⏳ Automatic series switching based on effective dates
- ⏳ Email notifications for series near limit
- ⏳ Multi-branch series support

### Recommended Additional Tests
- [ ] Performance testing with high transaction volumes
- [ ] Edge cases for year/month boundaries
- [ ] Series migration from old system
- [ ] BIR audit report generation
- [ ] Browser tests for frontend UI components

---

## Test Data Requirements

All tests use Laravel's `RefreshDatabase` trait, which:
- Creates a fresh database for each test class
- Rolls back transactions after each test
- Ensures isolated test environments

### Factories Used
- `User::factory()`
- `CustomerApplication::factory()`
- `Transaction::factory()`
- `Payable` (created directly with specific test data)

### Test Database
Tests use SQLite in-memory database by default (configured in `phpunit.xml`).

---

## Debugging Failed Tests

### Common Issues

1. **"No active transaction series found"**
   - Ensure test setup creates an active series
   - Check that series hasn't been deactivated by another operation

2. **"Series has reached its limit"**
   - Verify end_number is set correctly
   - Check current_number hasn't exceeded end_number

3. **Duplicate OR numbers**
   - Database locking issues
   - Check transaction isolation levels

4. **Type comparison failures**
   - PHP float vs integer comparisons
   - Use appropriate assertion methods

### Debug Commands
```bash
# Run single test with verbose output
php artisan test --filter=test_name_here -v

# Stop on first failure
php artisan test --filter=TransactionSeries --stop-on-failure

# See detailed error traces
php artisan test --filter=TransactionSeries --display-errors
```

---

## Maintenance

### When to Update Tests

1. **Feature Changes**: Update tests when modifying TransactionNumberService or TransactionSeries model
2. **New Endpoints**: Add controller tests for new API routes
3. **Business Logic**: Update integration tests for payment flow changes
4. **Bug Fixes**: Add regression tests for fixed bugs

### Test Maintenance Checklist
- [ ] All tests pass locally before committing
- [ ] New features have corresponding tests
- [ ] Edge cases are covered
- [ ] Error scenarios are tested
- [ ] Documentation updated for new tests

---

## References

- [Transaction Series Implementation Documentation](../docs/TRANSACTION_SERIES_IMPLEMENTATION.md)
- [Transaction Series Quick Reference](../docs/TRANSACTION_SERIES_QUICK_REFERENCE.md)
- Laravel Testing Documentation: https://laravel.com/docs/testing
- PHPUnit Documentation: https://phpunit.de/documentation.html

---

**Last Updated:** October 27, 2025  
**Total Test Coverage:** 39 tests, 197 assertions  
**Status:** ✅ All tests passing
