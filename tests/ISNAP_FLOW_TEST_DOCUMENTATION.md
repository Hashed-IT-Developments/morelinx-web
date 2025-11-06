# ISNAP Application Flow - Test Documentation

**Document Version:** 1.0  
**Date:** January 6, 2025  
**System:** MoreLinx Web - ISNAP Module  

---

## Table of Contents

1. [Overview](#overview)
2. [Test Environment Setup](#test-environment-setup)
3. [Business Rules & Requirements](#business-rules--requirements)
4. [Test Flow Diagram](#test-flow-diagram)
5. [Test Cases](#test-cases)
6. [Test Execution Guide](#test-execution-guide)
7. [Expected Results Summary](#expected-results-summary)
8. [Troubleshooting](#troubleshooting)

---

## Overview

### Purpose
This document provides comprehensive test cases for the ISNAP (Installation Service for New Applicants Program) application flow, covering the complete journey from application creation to payment processing.

### Scope
- ISNAP customer application creation
- Document upload functionality
- Application approval process
- Payable generation
- Payment processing
- Search and listing functionality
- Integration testing

### Test Suite Location
```
tests/Feature/IsnapApplicationFlowTest.php
```

---

## Test Environment Setup

### Prerequisites

1. **Database**: Fresh database with migrations
2. **Storage**: Fake storage configured for file uploads
3. **Users**: Multiple roles required (Admin, Cashier, Approver)
4. **Permissions**: ISNAP-related permissions enabled
5. **Transaction Series**: Active OR number series configured

### Required Test Data

#### Roles & Permissions
```php
- Admin: CREATE_CUSTOMER_APPLICATIONS
- Cashier: VIEW_TRANSACTIONS, MANAGE_PAYMENTS
- Approver: SUPERADMIN (all permissions)
```

#### Supporting Data
```php
- CustomerType: Residential/Regular
- Barangay: Test barangay with town
- TransactionSeries: Active OR series (start: 1, end: 1000)
```

### Setup Command
```bash
php artisan test --filter IsnapApplicationFlowTest
```

---

## Business Rules & Requirements

### ISNAP Application Rules

1. **Application Creation**
   - Applications with `is_isnap = true` start with status `isnap_pending`
   - ISNAP applications **skip** the inspection flow entirely
   - Customer account is automatically created via observer
   - No `CustApplnInspection` record is created

2. **Document Requirements**
   - Documents stored in `isnap_documents` folder
   - Attachments marked with type `isnap`
   - Accepted formats: JPG, JPEG, PNG, PDF, DOC, DOCX
   - Maximum file size: 5MB per file
   - Thumbnails generated automatically for images

3. **Approval Process**
   - Only applications with status `isnap_pending` can be approved
   - Application must have `is_isnap = true`
   - Approval creates ISNAP fee payable (₱500.00 default)
   - Status changes to `isnap_for_collection` after approval
   - Duplicate payables are prevented

4. **Payable Generation**
   - Type: `isnap_fee`
   - Amount: ₱500.00 (configurable via `calculateIsnapAmount()`)
   - Status: `unpaid` initially
   - Bill month: Current month (YYYYMM format)

5. **Payment Processing**
   - Standard transaction flow applies
   - Supports full and partial payments
   - OR number generated automatically
   - Payment updates payable status accordingly

---

## Test Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    ISNAP APPLICATION FLOW                        │
└─────────────────────────────────────────────────────────────────┘

1. CREATE APPLICATION
   ├─ Input: Customer data + is_isnap = true
   ├─ Process: CustomerApplicationController@store
   ├─ Output: CustomerApplication (status: isnap_pending)
   └─ Side Effect: CustomerAccount created via observer
   
2. UPLOAD DOCUMENTS
   ├─ Input: Multiple files (jpg, pdf, etc.)
   ├─ Process: IsnapController@storeDocuments
   ├─ Output: CaAttachment records (type: isnap)
   └─ Side Effect: Files stored in public/isnap_documents
   
3. APPROVE APPLICATION
   ├─ Input: CustomerApplication ID
   ├─ Process: IsnapController@approve
   ├─ Validation:
   │  ├─ is_isnap must be true
   │  ├─ status must be 'isnap_pending'
   │  └─ no existing ISNAP payable
   ├─ Output: 
   │  ├─ Status changed to 'isnap_for_collection'
   │  └─ Payable created (type: isnap_fee, amount: ₱500)
   
4. SEARCH IN TRANSACTIONS
   ├─ Input: Account number or name
   ├─ Process: TransactionsController@index
   ├─ Output: Customer account with unpaid payables
   └─ Display: ISNAP fee in transaction details
   
5. PROCESS PAYMENT
   ├─ Input: Payable IDs + payment details
   ├─ Process: TransactionsController@processPayment
   ├─ Output:
   │  ├─ Transaction created
   │  ├─ OR number generated
   │  ├─ Payment records created
   │  └─ Payable status updated (paid/partially_paid)
   
6. VERIFICATION
   └─ Validate:
      ├─ Payable balance is correct
      ├─ Transaction total matches payment
      └─ OR number is properly formatted
```

---

## Test Cases

### TC-01: Create ISNAP Application

**Objective:** Verify ISNAP application is created with correct status and bypasses inspection

**Test Data:**
```php
is_isnap: true
status: Expected = isnap_pending
```

**Steps:**
1. Authenticate as Admin
2. Submit customer application form with `is_isnap = true`
3. Verify response is successful

**Validation:**
- ✓ Application record created in database
- ✓ `is_isnap` field is true
- ✓ `status` is `isnap_pending`
- ✓ Customer account created
- ✓ NO inspection record created

**Expected Result:** PASS

---

### TC-02: Upload ISNAP Documents

**Objective:** Verify document upload functionality with multiple file types

**Test Data:**
```php
Files:
- isnap_id.jpg (800x600, image)
- isnap_proof.pdf (1MB, document)
- isnap_certification.png (800x600, image)
```

**Steps:**
1. Authenticate as Approver
2. Create ISNAP application
3. Upload 3 documents via upload endpoint

**Validation:**
- ✓ Success message: "3 documents uploaded successfully"
- ✓ 3 CaAttachment records created
- ✓ All attachments have type = 'isnap'
- ✓ Files exist in storage
- ✓ Thumbnails generated for images

**Expected Result:** PASS

---

### TC-03: Upload Documents - Validation

**Objective:** Verify document upload validation rules

**Test Scenarios:**

**Scenario A: No documents**
- Input: Empty array
- Expected: 422 validation error on 'documents' field

**Scenario B: Invalid file type**
- Input: virus.exe file
- Expected: 422 validation error on 'documents.0'

**Scenario C: File too large**
- Input: 6MB PDF file
- Expected: 422 validation error on 'documents.0'

**Validation:**
- ✓ Appropriate error messages returned
- ✓ No attachments created in database

**Expected Result:** PASS (all scenarios fail appropriately)

---

### TC-04: Approve ISNAP Application

**Objective:** Verify approval creates payable and updates status

**Test Data:**
```php
Application:
- is_isnap: true
- status: isnap_pending
```

**Steps:**
1. Authenticate as Approver
2. Create ISNAP application with status 'isnap_pending'
3. Call approve endpoint

**Validation:**
- ✓ Success message returned
- ✓ Application status changed to 'isnap_for_collection'
- ✓ Payable created with:
  - customer_account_id: matches application
  - type: isnap_fee
  - total_amount_due: 500.00
  - status: unpaid
  - amount_paid: 0
  - balance: 500.00

**Expected Result:** PASS

---

### TC-05: Approve ISNAP - Invalid Status

**Objective:** Verify approval is blocked for non-pending applications

**Test Data:**
```php
Application:
- is_isnap: true
- status: isnap_for_collection (already approved)
```

**Steps:**
1. Create already-approved ISNAP application
2. Attempt to approve again

**Validation:**
- ✓ Error message returned
- ✓ Status remains unchanged
- ✓ No new payable created

**Expected Result:** PASS

---

### TC-06: Approve Non-ISNAP Application

**Objective:** Verify approval is blocked for non-ISNAP applications

**Test Data:**
```php
Application:
- is_isnap: false
- status: in_process
```

**Steps:**
1. Create regular (non-ISNAP) application
2. Attempt to use ISNAP approve endpoint

**Validation:**
- ✓ Error: "This application is not registered as an ISNAP application."
- ✓ No payable created

**Expected Result:** PASS

---

### TC-07: Prevent Duplicate Payable

**Objective:** Verify system prevents duplicate ISNAP payables

**Test Data:**
```php
Application: ISNAP with existing payable
```

**Steps:**
1. Create ISNAP application
2. Manually create ISNAP fee payable
3. Attempt to approve application

**Validation:**
- ✓ Error: "ISNAP payable already exists for this application."
- ✓ Only 1 payable exists in database

**Expected Result:** PASS

---

### TC-08: Search ISNAP Member in Transactions

**Objective:** Verify customer search in transactions module

**Test Data:**
```php
Account Number: 2025-TEST-001
ISNAP Payable: ₱500.00 (unpaid)
```

**Steps:**
1. Authenticate as Cashier
2. Create ISNAP application with payable
3. Search by account number in transactions

**Validation:**
- ✓ 200 status response
- ✓ Customer account data in Inertia response
- ✓ Transaction details include ISNAP payable
- ✓ Payable amount is correct

**Expected Result:** PASS

---

### TC-09: Process Full Payment for ISNAP Fee

**Objective:** Verify complete payment processing flow

**Test Data:**
```php
Payable: ₱500.00 (unpaid)
Payment: ₱500.00 (cash, full payment)
```

**Steps:**
1. Authenticate as Cashier
2. Create ISNAP application with approved payable
3. Process full payment (₱500.00)

**Validation:**
- ✓ Transaction created with:
  - total_amount: 500.00
  - status: completed
  - or_number: Generated (format: OR-YYYYMM-######)
- ✓ Payable updated:
  - status: paid
  - amount_paid: 500.00
  - balance: 0
- ✓ Payment record created linking transaction and payable

**Expected Result:** PASS

---

### TC-10: Process Partial Payment for ISNAP Fee

**Objective:** Verify partial payment functionality

**Test Data:**
```php
Payable: ₱500.00 (unpaid)
Payment: ₱300.00 (partial)
```

**Steps:**
1. Create ISNAP application with approved payable
2. Process partial payment (₱300.00)

**Validation:**
- ✓ Transaction created:
  - total_amount: 300.00
  - status: completed
- ✓ Payable updated:
  - status: partially_paid
  - amount_paid: 300.00
  - balance: 200.00

**Expected Result:** PASS

---

### TC-11: View ISNAP Members List

**Objective:** Verify ISNAP members listing page

**Test Data:**
```php
ISNAP Applications: 3
Non-ISNAP Applications: 2 (should not appear)
```

**Steps:**
1. Authenticate as Admin
2. Create 3 ISNAP applications
3. Create 2 regular applications
4. Visit ISNAP index page

**Validation:**
- ✓ Only 3 ISNAP applications shown
- ✓ Non-ISNAP applications excluded
- ✓ Pagination works
- ✓ Correct Inertia component rendered

**Expected Result:** PASS

---

### TC-12: Search ISNAP Members

**Objective:** Verify search functionality on ISNAP list

**Test Data:**
```php
Searchable Account: 2025-SEARCH-001
Other Accounts: 2 more ISNAP applications
```

**Steps:**
1. Create 3 ISNAP applications
2. Search by specific account number
3. Verify filtered results

**Validation:**
- ✓ Only 1 result returned
- ✓ Search term preserved in response
- ✓ Correct application shown

**Expected Result:** PASS

---

### TC-13: Complete ISNAP Flow - Integration Test

**Objective:** End-to-end integration test covering entire flow

**Flow:**
```
CREATE → UPLOAD DOCS → APPROVE → SEARCH → PAY → VERIFY
```

**Steps:**

1. **Create Application**
   - Post customer application with is_isnap = true
   - Verify status = isnap_pending

2. **Upload Documents**
   - Upload 1 document
   - Verify attachment created

3. **Approve Application**
   - Post to approve endpoint
   - Verify status = isnap_for_collection
   - Verify payable created (₱500.00)

4. **Process Payment**
   - Search customer in transactions
   - Process full payment (₱500.00)
   - Verify transaction created

5. **Final Verification**
   - Payable status = paid
   - Payable balance = 0
   - Transaction OR number generated
   - Transaction status = completed

**Expected Result:** PASS (all steps succeed)

---

## Test Execution Guide

### Running All ISNAP Tests

```bash
# Run complete test suite
php artisan test --filter IsnapApplicationFlowTest

# Run with coverage
php artisan test --filter IsnapApplicationFlowTest --coverage

# Run specific test
php artisan test --filter test_create_isnap_application_with_correct_status
```

### Expected Output

```
PASS  Tests\Feature\IsnapApplicationFlowTest
✓ create isnap application with correct status
✓ upload isnap documents
✓ upload isnap documents validation
✓ approve isnap application creates payable
✓ approve isnap application with invalid status
✓ approve non isnap application
✓ approve isnap application prevents duplicate payable
✓ search isnap member in transactions
✓ process payment for isnap fee
✓ process partial payment for isnap fee
✓ view isnap members list
✓ search isnap members
✓ complete isnap flow integration

Tests:    13 passed (44 assertions)
Duration: ~15s
```

---

## Expected Results Summary

### Database State After Complete Flow

**customer_applications:**
```
id: 1
account_number: AUTO-GENERATED
is_isnap: true
status: isnap_for_collection
first_name: Juan
last_name: Dela Cruz
```

**customer_accounts:**
```
id: 1
account_number: [same as application]
account_status: active
```

**ca_attachments:**
```
id: 1
customer_application_id: 1
type: isnap
path: isnap_documents/[filename]_[unique_id].jpg
```

**payables:**
```
id: 1
customer_account_id: 1
type: isnap_fee
customer_payable: ISNAP Fee - [account_number]
total_amount_due: 500.00
amount_paid: 500.00
balance: 0.00
status: paid
```

**transactions:**
```
id: 1
customer_account_id: 1
or_number: OR-202501-000001
total_amount: 500.00
payment_type: cash
status: completed
```

**payments:**
```
id: 1
transaction_id: 1
payable_id: 1
amount: 500.00
```

---

## Troubleshooting

### Common Issues

#### Issue 1: Queue Connection Error
**Symptom:** Error connecting to Pusher during tests

**Solution:**
```php
// In TestCase.php setUp()
Queue::fake(); // Already implemented
```

#### Issue 2: Storage Disk Not Found
**Symptom:** Storage errors during file upload tests

**Solution:**
```php
// In test setUp()
Storage::fake('public');
```

#### Issue 3: Transaction Series Not Found
**Symptom:** Payment processing fails with no active series

**Solution:**
```php
// Ensure transaction series is created in setUp()
TransactionSeries::factory()->create([
    'status' => 'active',
    'current_number' => 1,
]);
```

#### Issue 4: Permission Denied
**Symptom:** 403 errors during test execution

**Solution:**
```php
// Verify user has correct permissions
$user->givePermissionTo([
    PermissionsEnum::MANAGE_PAYMENTS,
    PermissionsEnum::VIEW_TRANSACTIONS,
]);
```

#### Issue 5: Payable Not Created
**Symptom:** Approval succeeds but no payable record

**Solution:**
- Check application status is 'isnap_pending'
- Verify is_isnap is true
- Check customer_account_id exists
- Review IsnapController@calculateIsnapAmount()

---

## Test Coverage

### Code Coverage Targets

| Component | Target | Actual |
|-----------|--------|--------|
| IsnapController | 100% | TBD |
| Payable Creation Flow | 100% | TBD |
| Payment Processing | 95% | TBD |
| Document Upload | 100% | TBD |

### Test Metrics

- **Total Test Cases:** 13
- **Integration Tests:** 1
- **Unit Tests:** 12
- **Expected Assertions:** ~44
- **Execution Time:** ~15 seconds

---

## Related Documentation

1. `docs/TRANSACTION_SERIES_QUICK_REFERENCE.md` - OR number generation
2. `app/Http/Controllers/IsnapController.php` - ISNAP controller implementation
3. `app/Services/PayableService.php` - Payable creation service
4. `routes/web.php` - ISNAP route definitions

---
