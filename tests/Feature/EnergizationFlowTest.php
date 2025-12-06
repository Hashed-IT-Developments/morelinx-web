<?php

namespace Tests\Feature;

use App\Enums\ApplicationStatusEnum;
use App\Enums\InspectionStatusEnum;
use App\Enums\ModuleName;
use App\Enums\PayableCategoryEnum;
use App\Enums\PayableStatusEnum;
use App\Enums\PayableTypeEnum;
use App\Enums\PaymentTypeEnum;
use App\Enums\PermissionsEnum;
use App\Enums\RolesEnum;
use App\Models\ApprovalFlowSystem\ApprovalFlow;
use App\Models\ApprovalFlowSystem\ApprovalFlowStep;
use App\Models\CustomerAccount;
use App\Models\CustomerApplication;
use App\Models\CustApplnInspection;
use App\Models\TransactionSeries;
use App\Models\User;
use App\Services\ApprovalFlowService;
use App\Services\PaymentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * Complete Energization Flow Test
 * 
 * This test suite covers the complete energization flow from application to signing:
 * 1. Create new customer application (status = for_inspection)
 * 2. Create inspection for energization using factory (assigned with inspector)
 * 3. Update inspection to 'approved' (triggers approval flow for inspection)
 * 4. Approve the inspection (in approval flow) - application status becomes 'verified'
 * 5. Update application to 'for_collection' via VerifyApplicationController@verify
 * 6. Pay the payables via PaymentService as full
 * 7. Application status should now be 'for_signing' (check PayableObserver)
 */
class EnergizationFlowTest extends TestCase
{
    use RefreshDatabase;

    protected User $superadmin;
    protected User $approver1;
    protected User $approver2;
    protected User $inspector;
    protected ApprovalFlowService $approvalService;
    protected PaymentService $paymentService;
    protected TransactionSeries $transactionSeries;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed roles and permissions
        $this->seed(\Database\Seeders\InitRolesAndPermissions::class);

        // Create users with different roles
        $this->superadmin = User::factory()->create(['name' => 'Super Admin']);
        $this->superadmin->assignRole(RolesEnum::SUPERADMIN);
        $this->superadmin->givePermissionTo([
            PermissionsEnum::ASSIGN_INSPECTOR,
            PermissionsEnum::APPROVE_INSPECTION,
        ]);

        $this->approver1 = User::factory()->create(['name' => 'Approver 1']);
        $this->approver1->assignRole(RolesEnum::ADMIN);

        $this->approver2 = User::factory()->create(['name' => 'Approver 2']);
        $this->approver2->assignRole(RolesEnum::SUPERADMIN);

        $this->inspector = User::factory()->create(['name' => 'Inspector']);
        $this->inspector->assignRole(RolesEnum::INSPECTOR);

        $this->approvalService = app(ApprovalFlowService::class);
        $this->paymentService = app(PaymentService::class);

        // Create active transaction series for OR generation
        $this->transactionSeries = TransactionSeries::create([
            'series_name' => '2025 Test Series',
            'prefix' => 'OR',
            'current_number' => 0,
            'start_number' => 1,
            'end_number' => 999999,
            'format' => '{PREFIX}{NUMBER:12}',
            'is_active' => true,
            'effective_from' => now()->startOfYear(),
            'created_by' => $this->superadmin->id,
        ]);
    }

    /**
     * Test complete energization flow
     * 
     * Flow:
     * 1. Create customer_application: status = for_inspection (automatically creates account via observer)
     * 2. Create inspection for energization using factory forInspectionApproval (assigned with inspector)
     * 3. Update inspection to 'approved' (triggers approval flow for inspection)
     * 4. Approve the inspection in approval flow - application status becomes 'verified'
     * 5. Update application to 'for_collection' via VerifyApplicationController@verify (creates 3 payables)
     * 6. Pay the payables via PaymentService as full
     * 7. Application status should now be 'for_signing' (via PayableObserver)
     */
    public function test_complete_energization_flow()
    {
        // === SETUP: Create approval flow for inspection ===
        $this->createInspectionApprovalFlow();

        // === STEP 1: Create new customer application with status = FOR_INSPECTION ===
        // Observer will automatically create CustomerAccount
        $application = CustomerApplication::factory()->create([
            'status' => ApplicationStatusEnum::FOR_INSPECTION,
            'first_name' => 'John',
            'last_name' => 'Doe',
        ]);

        $this->assertEquals(ApplicationStatusEnum::FOR_INSPECTION, $application->status);
        
        // Verify that customer account was created via observer
        $application->refresh();
        $this->assertNotNull($application->account, 'Customer account should be created automatically via observer');
        
        $customerAccount = $application->account;
        $this->assertNotNull($customerAccount);
        $this->assertNotEmpty($customerAccount->account_name);

        // === STEP 2: Create inspection for energization using factory ===
        // Use forInspectionApproval state to automatically assign inspector and set proper status
        // Use forEnergization to create materials
        $inspection = CustApplnInspection::factory()
            ->forEnergization(3) // Creates 3 materials
            ->create([
                'customer_application_id' => $application->id,
                'inspector_id' => $this->inspector->id,
                'schedule_date' => now()->format('Y-m-d'),
                'bill_deposit' => 1500.00,
                'labor_cost' => 2000.00,
                'status' => InspectionStatusEnum::FOR_INSPECTION_APPROVAL, // Override status since forEnergization sets to APPROVED
            ]);

        $inspection->refresh();
        $this->assertEquals(InspectionStatusEnum::FOR_INSPECTION_APPROVAL, $inspection->status);
        $this->assertEquals($this->inspector->id, $inspection->inspector_id);
        $this->assertNotNull($inspection->schedule_date);

        // === STEP 3: Inspector updates inspection to APPROVED ===
        // This triggers approval flow initialization for the inspection
        Sanctum::actingAs($this->inspector);
        $inspection->update([
            'status' => InspectionStatusEnum::APPROVED,
            'remarks' => 'Site is ready for energization',
            'inspection_time' => now(),
        ]);

        $inspection->refresh();
        $this->assertEquals(InspectionStatusEnum::APPROVED, $inspection->status);
        
        // Verify approval flow was initialized for the inspection
        $this->assertNotNull($inspection->approvalState, 'Approval flow should be initialized for inspection');
        $this->assertEquals('pending', $inspection->approvalState->status);
        $this->assertEquals(1, $inspection->approvalState->current_order);

        // === STEP 4: Approve the inspection through approval flow ===
        // First approver approves
        Sanctum::actingAs($this->approver1);
        $this->approvalService->approve($inspection, $this->approver1, 'Inspection approved - Step 1');

        $inspection->refresh();
        $this->assertEquals('pending', $inspection->approvalState->status);
        $this->assertEquals(2, $inspection->approvalState->current_order);

        // Second approver approves - this should complete the approval flow
        Sanctum::actingAs($this->approver2);
        $this->approvalService->approve($inspection, $this->approver2, 'Inspection approved - Final');

        $inspection->refresh();
        $application->refresh();

        // Verify inspection approval flow is completed
        $this->assertEquals('approved', $inspection->approvalState->status);

        // Verify customer application status is updated to FOR_VERIFICATION
        $this->assertEquals(ApplicationStatusEnum::FOR_VERIFICATION, $application->status);

        // === STEP 5: Update application to FOR_COLLECTION via VerifyApplicationController@verify ===
        // This creates 3 payables for energization
        Sanctum::actingAs($this->superadmin);
        
        $response = $this->postJson(route('verify-applications.verify'), [
            'application_id' => $application->id,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $application->refresh();
        $this->assertEquals(ApplicationStatusEnum::FOR_COLLECTION, $application->status);

        // Verify 3 payables were created (Bill Deposit, Material Cost, Labor Cost)
        $customerAccount->refresh();
        $payables = $customerAccount->payables()->where('payable_category', PayableCategoryEnum::ENERGIZATION)->get();
        
        $this->assertCount(3, $payables, 'Should have 3 energization payables');
        
        // Verify each payable type exists
        $billDeposit = $payables->firstWhere('type', PayableTypeEnum::BILL_DEPOSIT);
        $materialCost = $payables->firstWhere('type', PayableTypeEnum::MATERIAL_COST);
        $laborCost = $payables->firstWhere('type', PayableTypeEnum::LABOR_COST);
        
        $this->assertNotNull($billDeposit, 'Bill Deposit payable should exist');
        $this->assertNotNull($materialCost, 'Material Cost payable should exist');
        $this->assertNotNull($laborCost, 'Labor Cost payable should exist');
        
        // Verify amounts
        $this->assertEqualsWithDelta(1500.00, $billDeposit->total_amount_due, 0.01, 'Bill Deposit amount should be 1500.00');
        $this->assertEqualsWithDelta(2000.00, $laborCost->total_amount_due, 0.01, 'Labor Cost amount should be 2000.00');
        $this->assertGreaterThan(0, $materialCost->total_amount_due);
        
        // Verify all payables are unpaid initially
        foreach ($payables as $payable) {
            $this->assertEquals(PayableStatusEnum::UNPAID, $payable->status);
            $this->assertEqualsWithDelta($payable->total_amount_due, $payable->balance, 0.01, 'Balance should equal total amount due for unpaid payables');
        }

        // === STEP 6: Pay all payables in full via PaymentService ===
        $totalAmountDue = $payables->sum('total_amount_due');
        
        Sanctum::actingAs($this->superadmin);
        
        $paymentData = [
            'selected_payable_ids' => $payables->pluck('id')->toArray(),
            'payment_methods' => [
                [
                    'type' => PaymentTypeEnum::CASH,
                    'amount' => $totalAmountDue,
                ],
            ],
        ];

        $transaction = $this->paymentService->processPayment($paymentData, $customerAccount);
        
        $this->assertNotNull($transaction);
        $this->assertEqualsWithDelta($totalAmountDue, $transaction->total_amount, 0.01, 'Transaction total amount should match total amount due');
        $this->assertEquals('Full Payment', $transaction->payment_mode);

        // === STEP 7: Verify application status is now FOR_SIGNING ===
        // This happens automatically via PayableObserver when all 3 energization payables are paid
        $application->refresh();
        $this->assertEquals(ApplicationStatusEnum::FOR_SIGNING, $application->status);

        // Verify all payables are now paid
        $payables->each(function ($payable) {
            $payable->refresh();
            $this->assertEquals(PayableStatusEnum::PAID, $payable->status);
            $this->assertEqualsWithDelta(0, $payable->balance, 0.01, 'Paid payable balance should be 0');
        });
    }

    /**
     * Test energization flow with partial payment
     * Should NOT change status to FOR_SIGNING until all payables are paid
     */
    public function test_energization_flow_with_partial_payment()
    {
        // === SETUP ===
        $this->createInspectionApprovalFlow();

        // Fast-forward: Create application already at FOR_VERIFICATION status with account
        $application = CustomerApplication::factory()->create([
            'status' => ApplicationStatusEnum::FOR_VERIFICATION,
            'first_name' => 'Jane',
            'last_name' => 'Smith',
        ]);

        $application->refresh();
        $customerAccount = $application->account;
        $this->assertNotNull($customerAccount);

        // Create inspection (already approved)
        $inspection = CustApplnInspection::factory()
            ->forEnergization(3) // Need materials for material cost payable
            ->create([
                'customer_application_id' => $application->id,
                'status' => InspectionStatusEnum::APPROVED,
                'bill_deposit' => 1000.00,
                'labor_cost' => 1500.00,
            ]);

        // Mark approval as approved to bypass the flow
        if ($inspection->approvalState) {
            $inspection->approvalState->update(['status' => 'approved']);
        }

        // === Create payables via verify ===
        Sanctum::actingAs($this->superadmin);
        
        $response = $this->postJson(route('verify-applications.verify'), [
            'application_id' => $application->id,
        ]);

        $response->assertRedirect();

        $application->refresh();
        $this->assertEquals(ApplicationStatusEnum::FOR_COLLECTION, $application->status);

        $customerAccount->refresh();
        $payables = $customerAccount->payables()->where('payable_category', PayableCategoryEnum::ENERGIZATION)->get();
        $this->assertCount(3, $payables);

        // === Pay only 2 out of 3 payables ===
        $payablesToPay = $payables->take(2);
        $partialAmount = $payablesToPay->sum('total_amount_due');

        $paymentData = [
            'selected_payable_ids' => $payablesToPay->pluck('id')->toArray(),
            'payment_methods' => [
                [
                    'type' => PaymentTypeEnum::CASH,
                    'amount' => $partialAmount,
                ],
            ],
        ];

        $transaction = $this->paymentService->processPayment($paymentData, $customerAccount);
        
        $this->assertNotNull($transaction);

        // === Verify application is still FOR_COLLECTION (not FOR_SIGNING) ===
        $application->refresh();
        $this->assertEquals(ApplicationStatusEnum::FOR_COLLECTION, $application->status);

        // === Pay the remaining payable ===
        $remainingPayable = $payables->last();
        $remainingPayable->refresh();
        
        $paymentData = [
            'selected_payable_ids' => [$remainingPayable->id],
            'payment_methods' => [
                [
                    'type' => PaymentTypeEnum::CASH,
                    'amount' => $remainingPayable->balance,
                ],
            ],
        ];

        $transaction2 = $this->paymentService->processPayment($paymentData, $customerAccount);
        $this->assertNotNull($transaction2);

        // Verify the remaining payable is paid
        $remainingPayable->refresh();
        $this->assertEquals(PayableStatusEnum::PAID, $remainingPayable->status);
        $this->assertEqualsWithDelta(0, $remainingPayable->balance, 0.01, 'Remaining payable balance should be 0 after payment');

        // === NOW application should be FOR_SIGNING ===
        $application->refresh();
        $this->assertEquals(ApplicationStatusEnum::FOR_SIGNING, $application->status);
    }

    /**
     * Test energization flow with inspection disapproval
     * Should not create payables if inspection is not approved
     */
    public function test_energization_flow_with_inspection_disapproval()
    {
        // === SETUP ===
        $this->createInspectionApprovalFlow();

        $application = CustomerApplication::factory()->create([
            'status' => ApplicationStatusEnum::FOR_INSPECTION,
            'first_name' => 'Bob',
            'last_name' => 'Wilson',
        ]);

        $application->refresh();
        $customerAccount = $application->account;
        $this->assertNotNull($customerAccount);

        // Create inspection
        $inspection = CustApplnInspection::factory()
            ->forInspectionApproval()
            ->create([
                'customer_application_id' => $application->id,
                'inspector_id' => $this->inspector->id,
            ]);

        // === Inspector updates to DISAPPROVED instead of APPROVED ===
        Sanctum::actingAs($this->inspector);
        $inspection->update([
            'status' => InspectionStatusEnum::DISAPPROVED,
            'remarks' => 'Site not ready',
        ]);

        $inspection->refresh();
        $this->assertEquals(InspectionStatusEnum::DISAPPROVED, $inspection->status);

        // Application should still be FOR_INSPECTION
        $application->refresh();
        $this->assertEquals(ApplicationStatusEnum::FOR_INSPECTION, $application->status);

        // === Try to verify application - should fail ===
        Sanctum::actingAs($this->superadmin);
        
        $response = $this->postJson(route('verify-applications.verify'), [
            'application_id' => $application->id,
        ]);

        $response->assertRedirect();
        $response->assertSessionHasErrors();

        // Application should still be FOR_INSPECTION
        $application->refresh();
        $this->assertEquals(ApplicationStatusEnum::FOR_INSPECTION, $application->status);

        // No payables should be created
        $customerAccount->refresh();
        $payables = $customerAccount->payables()->where('payable_category', PayableCategoryEnum::ENERGIZATION)->get();
        $this->assertCount(0, $payables);
    }

    // ==================== HELPER METHODS ====================

    /**
     * Create inspection approval flow with 2 steps
     */
    protected function createInspectionApprovalFlow(): void
    {
        $flow = ApprovalFlow::create([
            'name' => 'Inspection Approval',
            'module' => ModuleName::FOR_INSPECTION_APPROVAL,
            'department_id' => null,
            'created_by' => $this->superadmin->id,
        ]);

        ApprovalFlowStep::create([
            'approval_flow_id' => $flow->id,
            'order' => 1,
            'role_id' => $this->approver1->roles->first()->id,
        ]);

        ApprovalFlowStep::create([
            'approval_flow_id' => $flow->id,
            'order' => 2,
            'role_id' => $this->approver2->roles->first()->id,
        ]);
    }
}
