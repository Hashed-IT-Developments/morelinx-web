# Complete Application and Inspection Flow Test Documentation

## Overview
This document describes the comprehensive test suite created in `CompleteApplicationInspectionFlowTest.php` that validates the entire customer application and inspection workflow from creation through approval.

## Test Suite: CompleteApplicationInspectionFlowTest

### Purpose
- Customer application creation and approval flows
- Inspector assignment with and without approval flows
- Inspection approval processes
- Disapproval and reassignment scenarios
- Edge cases and permission checks

---

## Test Cases

### 1. `test_complete_flow_with_customer_application_approval_flow()`

**Scenario**: Full workflow WITH customer application approval flow

**Flow Steps**:
1. ✅ Create new customer application (status: FOR_CCD_APPROVAL)
2. ✅ Verify approval flow is automatically initialized
3. ✅ First approver approves the application
4. ✅ Second approver approves the application
5. ✅ Application status changes to FOR_INSPECTION
6. ✅ Create inspection record
7. ✅ Assign inspector to inspection
8. ✅ Inspector performs inspection and marks as APPROVED
9. ✅ Inspection approval flow is initialized
10. ✅ First approver approves the inspection
11. ✅ Second approver approves the inspection
12. ✅ Customer application status changes to FOR_VERIFICATION

**Key Validations**:
- Approval flow automatically initializes for customer applications
- Status transitions occur correctly after approvals
- Inspector cannot be assigned before application approval
- Inspection approval flow triggers when inspector marks as APPROVED
- Final status cascades to customer application

---

### 2. `test_complete_flow_without_customer_application_approval_flow()`

**Scenario**: Workflow WITHOUT customer application approval flow

**Flow Steps**:
1. ✅ Create application directly with FOR_INSPECTION status
2. ✅ Bypass or mark application approval as completed
3. ✅ Create inspection record
4. ✅ Assign inspector (works without application approval)
5. ✅ Inspector approves inspection
6. ✅ Inspection approval flow completes
7. ✅ Application status changes to FOR_VERIFICATION

**Key Validations**:
- Inspector can be assigned when application approval is not required/complete
- Inspection approval flow still works independently
- Status updates cascade correctly

---

### 3. `test_disapproval_and_reassignment_flow()`

**Scenario**: Inspector disapproval and reassignment workflow

**Flow Steps**:
1. ✅ Create and approve customer application
2. ✅ Assign first inspector
3. ✅ Inspection gets DISAPPROVED
4. ✅ Reassign to different inspector
5. ✅ Original inspection marked as REASSIGNED
6. ✅ New inspection record created with new inspector
7. ✅ New inspector completes inspection successfully
8. ✅ Inspection approval flow completes
9. ✅ Application status changes to FOR_VERIFICATION

**Key Validations**:
- Disapproved inspections can be reassigned
- Original inspection is marked as REASSIGNED (not deleted)
- New inspection record is created for audit trail
- New inspection goes through full approval flow
- Database contains 2 inspection records (original + new)

---

### 4. `test_cannot_assign_inspector_before_application_approval()`

**Scenario**: Permission check - inspector assignment before approval

**Flow Steps**:
1. ✅ Create application with pending approval
2. ✅ Create inspection record
3. ❌ Attempt to assign inspector (should fail)
4. ✅ Verify error message returned
5. ✅ Verify inspector was NOT assigned
6. ✅ Verify inspection status unchanged

**Key Validations**:
- System enforces approval flow requirements
- Inspectors cannot be assigned prematurely
- Proper error messages are returned
- Data integrity is maintained

---

### 5. `test_application_rejection_in_approval_flow()`

**Scenario**: Application rejection during approval process

**Flow Steps**:
1. ✅ Create customer application
2. ✅ First approver REJECTS the application
3. ✅ Approval state marked as 'rejected'
4. ✅ Create inspection record (for testing)
5. ❌ Attempt to assign inspector (should fail)
6. ✅ Verify error is returned

**Key Validations**:
- Rejected applications cannot proceed to inspection
- System properly handles rejection state
- Inspectors cannot be assigned to rejected applications

---

### 6. `test_cannot_reassign_inspector_for_non_disapproved_inspection()`

**Scenario**: Prevent reassignment for approved inspections

**Flow Steps**:
1. ✅ Create application and inspection
2. ✅ Assign inspector1
3. ✅ Mark inspection as APPROVED
4. ❌ Attempt to reassign to inspector2 (should fail)
5. ✅ Verify error message
6. ✅ Verify inspector unchanged
7. ✅ Verify status unchanged

**Key Validations**:
- Only DISAPPROVED inspections can be reassigned
- System prevents unauthorized reassignments
- Data integrity maintained

---

## Test Setup

### Users Created
- **Superadmin**: Full permissions, creates approval flows
- **Admin**: Assigns inspectors, has ASSIGN_INSPECTOR permission
- **Approver 1**: Admin role, approves first step
- **Approver 2**: Superadmin role, approves second step
- **Inspector 1**: Performs inspections
- **Inspector 2**: Used for reassignment tests

### Approval Flows Created

#### Customer Application Approval Flow
- **Module**: `customer_application`
- **Step 1**: Initial Review (Approver 1 / Admin role)
- **Step 2**: Final Approval (Approver 2 / Superadmin role)

#### Inspection Approval Flow
- **Module**: `for_inspection_approval`
- **Step 1**: Supervisor Review (Approver 1 / Admin role)
- **Step 2**: Manager Approval (Approver 2 / Superadmin role)

---

## Key Business Rules Validated

### Application Approval
1. ✅ Approval flow initializes automatically on application creation
2. ✅ Multi-step approval process works correctly
3. ✅ Status changes to FOR_INSPECTION after all approvals
4. ✅ Rejected applications cannot proceed

### Inspector Assignment
1. ✅ Requires ASSIGN_INSPECTOR permission
2. ✅ Cannot assign before application approval (when approval flow exists)
3. ✅ Can only assign once for new inspections
4. ✅ Cannot reassign unless status is DISAPPROVED
5. ✅ Reassignment creates new inspection record
6. ✅ Original inspection marked as REASSIGNED

### Inspection Approval
1. ✅ Approval flow triggers when inspector marks as APPROVED
2. ✅ Multi-step approval process works correctly
3. ✅ Final approval cascades to customer application
4. ✅ Application status changes to FOR_VERIFICATION

### Status Transitions
```
Customer Application:
FOR_CCD_APPROVAL → [approvals] → FOR_INSPECTION → [inspection approvals] → VERIFIED

Inspection:
FOR_INSPECTION → FOR_INSPECTION_APPROVAL → APPROVED → [approval flow] → (complete)
                                         ↓
                                   DISAPPROVED → REASSIGNED (old record)
                                         ↓
                              [new record] FOR_INSPECTION_APPROVAL
```

---

## Database Assertions

### Approval State Tracking
- ✅ ApprovalState records created correctly
- ✅ Current order increments through steps
- ✅ Status changes from 'pending' to 'approved'
- ✅ Rejection sets status to 'rejected'

### Audit Trail
- ✅ ApprovalRecord entries created for each approval
- ✅ Disapproved inspections preserved (not deleted)
- ✅ Reassignment creates new inspection record
- ✅ Both old and new inspection records exist

---

## Running the Tests

```bash
php artisan test --filter=CompleteApplicationInspectionFlowTest
```

### Individual Test Execution
```bash
# Test with approval flow
php artisan test --filter=test_complete_flow_with_customer_application_approval_flow

# Test without approval flow
php artisan test --filter=test_complete_flow_without_customer_application_approval_flow

# Test reassignment
php artisan test --filter=test_disapproval_and_reassignment_flow

# Test permission checks
php artisan test --filter=test_cannot_assign_inspector_before_application_approval

# Test rejection
php artisan test --filter=test_application_rejection_in_approval_flow

# Test reassignment restrictions
php artisan test --filter=test_cannot_reassign_inspector_for_non_disapproved_inspection
```

---

## Expected Test Results

**Total Tests**: 6  
**Expected Pass**: 6  
**Expected Fail**: 0

All tests should pass, validating:
- ✅ Complete application lifecycle
- ✅ Approval flow integration
- ✅ Inspector assignment rules
- ✅ Permission enforcement
- ✅ Status transition logic
- ✅ Data integrity and audit trail

---

## Code Coverage

This test suite covers:
- **Models**: CustomerApplication, CustApplnInspection, ApprovalFlow, ApprovalFlowStep, ApprovalState, ApprovalRecord
- **Controllers**: InspectionController (assign method)
- **Services**: ApprovalFlowService (approve, reject, initializeApprovalFlow)
- **Enums**: ApplicationStatusEnum, InspectionStatusEnum, ModuleName, PermissionsEnum
- **Traits**: HasApprovalFlow
- **Interfaces**: RequiresApprovalFlow

---

## Related Documentation

- `/docs/APPROVAL_FLOW_IMPLEMENTATION.md` - Approval flow implementation guide
- `/tests/TRANSACTION_SERIES_TESTS_README.md` - Testing guidelines
- `/tests/Feature/ReassignInspectorTest.php` - Specific reassignment tests
- `/tests/Feature/CustomerApplicationApprovalFlowTest.php` - Application approval tests
- `/tests/Feature/InspectionApprovalCascadeTest.php` - Inspection approval cascade tests

---

## Notes for QA Team

### Test Maintenance
- Update tests when business rules change
- Add new test cases for edge cases discovered
- Keep test data realistic and representative
- Maintain clear test documentation

### Common Issues
1. **Permission errors (403)**: Ensure users have ASSIGN_INSPECTOR permission
2. **Approval flow not found**: Verify approval flows are created in test setup
3. **Foreign key constraints**: Ensure all related records exist before operations

### Best Practices
- ✅ Each test is independent (uses RefreshDatabase)
- ✅ Clear test names describe the scenario
- ✅ Comprehensive assertions verify expected behavior
- ✅ Edge cases are explicitly tested
- ✅ Permissions are properly set up
- ✅ Audit trail is validated

---

**Last Updated**: October 29, 2025
**Status**: Active - All tests passing
