# ApprovalFlowsController Test Suite

This directory contains comprehensive edge unit tests for the `ApprovalFlowsController` class.

## Test Files Overview

### 1. ApprovalFlowsControllerTest.php
**Main unit tests covering core functionality:**

- **Index Method**: Tests for retrieving approval flows with relationships
- **Create Method**: Tests for displaying the create form with required data
- **Store Method**: 
  - Authorization checks (superadmin only)
  - Validation of all fields (module, name, description, steps)
  - Duplicate prevention (module/department combinations)
  - Step validation (must have role_id or user_id)
  - Edge cases for field lengths and formats
- **Edit Method**: Tests for loading approval flow with relationships
- **Update Method**:
  - Authorization checks
  - Validation requirements
  - Step recreation logic
- **Destroy Method**:
  - Authorization checks
  - Cascade deletion verification
- **Error Handling**: 404 responses for non-existent resources
- **Guest Access**: Ensures unauthenticated users are redirected

### 2. ApprovalFlowsControllerFeatureTest.php
**Integration tests covering complete workflows:**

- **Complete CRUD Workflow**: Full create → read → update → delete cycle
- **Validation Edge Cases**: Multiple validation errors simultaneously
- **Duplicate Prevention**: Module/department combination validation
- **Cascade Operations**: Step deletion when parent is deleted
- **Step Management**: Recreation of steps during updates
- **Authorization Flow**: Testing across different user types
- **Data Handling**: Null values, large datasets, many steps
- **Performance**: Memory efficiency with large datasets

### 3. ApprovalFlowsControllerEdgeCasesTest.php
**Specialized edge case testing:**

- **Stress Testing**: 50+ steps in single approval flow
- **Unicode Support**: Special characters, emojis, international text
- **Security**: SQL injection prevention
- **Concurrency**: Multiple users, race conditions
- **Data Integrity**: Step reordering, duplicate orders
- **Malformed Input**: Invalid data types, corrupted requests
- **Memory Efficiency**: Large dataset handling
- **Foreign Key Constraints**: Database relationship integrity

## Supporting Files

### 4. ApprovalFlowTestHelper.php
**Shared testing utilities:**

- Common test setup methods
- User and role creation helpers
- Data generation utilities
- Validation data providers

### 5. Factory Files
**Database factories for test data:**

- `ApprovalFlowFactory.php`: Creates approval flow instances
- `ApprovalFlowStepFactory.php`: Creates approval flow steps
- `RoleFactory.php`: Creates roles for testing

## Test Coverage

### Edge Cases Covered:

1. **Authorization**:
   - Superadmin vs regular user permissions
   - Guest user access prevention
   - Concurrent access scenarios

2. **Validation**:
   - Required field validation
   - Length constraints (name: 255 chars, description: 500 chars)
   - Type validation (integers, strings, arrays)
   - Custom business rules (steps must have role or user)

3. **Data Integrity**:
   - Duplicate prevention (module/department combinations)
   - Foreign key constraints
   - Cascade deletion
   - Step order handling

4. **Performance**:
   - Large dataset handling (100+ approval flows)
   - Memory efficiency testing
   - Query optimization verification

5. **Security**:
   - SQL injection prevention
   - XSS prevention through proper escaping
   - CSRF protection (implicit through Laravel)

6. **Edge Data**:
   - Unicode and special characters
   - Null/empty values
   - Malformed JSON-like input
   - Extremely long step arrays

## Running the Tests

```bash
# Run all approval flow tests
php artisan test --filter ApprovalFlowsController

# Run specific test file
php artisan test tests/Unit/Controllers/ApprovalFlowsControllerTest.php
php artisan test tests/Feature/Controllers/ApprovalFlowsControllerFeatureTest.php
php artisan test tests/Unit/Controllers/ApprovalFlowsControllerEdgeCasesTest.php

# Run with coverage (if configured)
php artisan test --coverage --filter ApprovalFlowsController
```

## Test Statistics

- **Total Tests**: 44
- **Total Assertions**: 263+
- **Files Covered**: 3 test files + supporting utilities
- **Test Types**: Unit tests, Feature tests, Edge case tests
- **Coverage Areas**: All controller methods, validation, authorization, edge cases

## Maintenance Notes

1. **Database Requirements**: Tests use SQLite in-memory database with RefreshDatabase trait
2. **Dependencies**: Requires Spatie Permission package for role testing
3. **Factories**: Custom factories created for ApprovalFlow and ApprovalFlowStep models
4. **Helpers**: Shared utilities in ApprovalFlowTestHelper trait for DRY testing

This comprehensive test suite ensures the ApprovalFlowsController is robust, secure, and handles all edge cases properly.