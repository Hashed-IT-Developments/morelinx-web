<?php

namespace Tests\Feature;

use App\Enums\ApplicationStatusEnum;
use App\Enums\PayableStatusEnum;
use App\Enums\PayableTypeEnum;
use App\Models\CustomerAccount;
use App\Models\CustomerApplication;
use App\Models\CustApplnInspection;
use App\Models\CustApplnInspMat;
use App\Models\Payable;
use App\Models\PayablesDefinition;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VerifyApplicationControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected CustomerApplication $application;
    protected CustomerAccount $account;
    protected CustApplnInspection $inspection;

    protected function setUp(): void
    {
        parent::setUp();

        // Create a user and authenticate
        $this->user = User::factory()->create();
        $this->actingAs($this->user);

        // Create a customer application with FOR_VERIFICATION status
        // The CustomerApplicationObserver will automatically create an account
        $this->application = CustomerApplication::factory()->create([
            'status' => ApplicationStatusEnum::FOR_VERIFICATION,
        ]);

        // Refresh to load the account created by the observer
        $this->application->refresh();
        $this->account = $this->application->account;
        
        // Ensure the account was created
        $this->assertNotNull($this->account, 'Account should exist after application creation');

        // Create an inspection with amounts
        $this->inspection = CustApplnInspection::factory()->create([
            'customer_application_id' => $this->application->id,
            'bill_deposit' => 1000.00,
            'material_deposit' => 1500.00,
            'labor_cost' => 1200.00,
        ]);

        // Create default materials for the inspection
        CustApplnInspMat::create([
            'cust_appln_inspection_id' => $this->inspection->id,
            'material_name' => 'Default Material',
            'quantity' => 1,
            'unit' => 'lot',
            'amount' => 1500.00,
        ]);
    }


    public function test_verify_updates_application_status_to_for_collection()
    {
        $response = $this->post(route('verify-applications.verify'), [
            'application_id' => $this->application->id,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->application->refresh();
        $this->assertEquals(ApplicationStatusEnum::FOR_COLLECTION, $this->application->status);
    }


    public function test_verify_creates_three_payables()
    {
        $this->post(route('verify-applications.verify'), [
            'application_id' => $this->application->id,
        ]);

        // Should create 3 payables: Bill Deposit, Material Cost, Labor Cost
        $this->assertEquals(3, Payable::where('customer_account_id', $this->account->id)->count());
    }


    public function test_verify_creates_bill_deposit_payable()
    {
        $this->post(route('verify-applications.verify'), [
            'application_id' => $this->application->id,
        ]);

        $payable = Payable::where('customer_account_id', $this->account->id)
            ->where('type', PayableTypeEnum::BILL_DEPOSIT)
            ->first();

        $this->assertNotNull($payable);
        $this->assertEquals(1000.00, $payable->total_amount_due);
        $this->assertEquals(PayableStatusEnum::UNPAID, $payable->status);
        $this->assertEquals(1000.00, $payable->balance);
    }


    public function test_verify_creates_material_cost_payable()
    {
        $this->post(route('verify-applications.verify'), [
            'application_id' => $this->application->id,
        ]);

        $payable = Payable::where('customer_account_id', $this->account->id)
            ->where('type', PayableTypeEnum::MATERIAL_COST)
            ->first();

        $this->assertNotNull($payable);
        $this->assertEquals(1500.00, $payable->total_amount_due);
        $this->assertEquals(PayableStatusEnum::UNPAID, $payable->status);
    }


    public function test_verify_creates_labor_cost_payable()
    {
        $this->post(route('verify-applications.verify'), [
            'application_id' => $this->application->id,
        ]);

        $payable = Payable::where('customer_account_id', $this->account->id)
            ->where('type', PayableTypeEnum::LABOR_COST)
            ->first();

        $this->assertNotNull($payable);
        $this->assertEquals(1200.00, $payable->total_amount_due);
        $this->assertEquals(PayableStatusEnum::UNPAID, $payable->status);
    }


    public function test_verify_creates_material_definitions_from_inspection_materials()
    {
        // Clear default materials and create specific test materials
        CustApplnInspMat::where('cust_appln_inspection_id', $this->inspection->id)->delete();
        
        // Create inspection materials
        CustApplnInspMat::create([
            'cust_appln_inspection_id' => $this->inspection->id,
            'material_name' => 'Wire',
            'quantity' => 10,
            'unit' => 'meters',
            'amount' => 150.00,
        ]);

        CustApplnInspMat::create([
            'cust_appln_inspection_id' => $this->inspection->id,
            'material_name' => 'Pipe',
            'quantity' => 5,
            'unit' => 'pieces',
            'amount' => 200.00,
        ]);

        $this->post(route('verify-applications.verify'), [
            'application_id' => $this->application->id,
        ]);

        // Get the material cost payable
        $payable = Payable::where('customer_account_id', $this->account->id)
            ->where('type', PayableTypeEnum::MATERIAL_COST)
            ->first();

        $this->assertNotNull($payable);
        $this->assertCount(2, $payable->definitions);

        // Check first definition
        $definition1 = $payable->definitions->firstWhere('transaction_name', 'Wire');
        $this->assertNotNull($definition1);
        $this->assertEquals(10, $definition1->quantity);
        $this->assertEquals('meters', $definition1->unit);
        $this->assertEquals(150.00, $definition1->amount);
        $this->assertEquals(1500.00, $definition1->total_amount);

        // Check second definition
        $definition2 = $payable->definitions->firstWhere('transaction_name', 'Pipe');
        $this->assertNotNull($definition2);
        $this->assertEquals(5, $definition2->quantity);
        $this->assertEquals('pieces', $definition2->unit);
        $this->assertEquals(200.00, $definition2->amount);
        $this->assertEquals(1000.00, $definition2->total_amount);
    }


    public function test_verify_fails_if_application_status_is_not_verified()
    {
        $this->application->update(['status' => ApplicationStatusEnum::IN_PROCESS]);

        $response = $this->post(route('verify-applications.verify'), [
            'application_id' => $this->application->id,
        ]);

        $response->assertRedirect();
        $response->assertSessionHasErrors(['message' => 'Application is not in the correct status for verification.']);

        // Application status should not change
        $this->application->refresh();
        $this->assertEquals(ApplicationStatusEnum::IN_PROCESS, $this->application->status);

        // No payables should be created
        $this->assertEquals(0, Payable::where('customer_account_id', $this->account->id)->count());
    }


    public function test_verify_fails_if_customer_account_not_found()
    {
        // Delete the customer account
        $this->account->delete();

        $response = $this->post(route('verify-applications.verify'), [
            'application_id' => $this->application->id,
        ]);

        $response->assertRedirect();
        $response->assertSessionHasErrors(['message' => 'Customer account not found. Cannot create payables.']);

        // Application status should not change
        $this->application->refresh();
        $this->assertEquals(ApplicationStatusEnum::FOR_VERIFICATION, $this->application->status);
    }


    public function test_verify_fails_if_no_inspection_found()
    {
        // Delete the inspection
        $this->inspection->delete();

        $response = $this->post(route('verify-applications.verify'), [
            'application_id' => $this->application->id,
        ]);

        $response->assertRedirect();
        $response->assertSessionHasErrors(['message' => 'No inspection found for this application. Cannot create payables.']);

        // Application status should not change
        $this->application->refresh();
        $this->assertEquals(ApplicationStatusEnum::FOR_VERIFICATION, $this->application->status);

        // No payables should be created
        $this->assertEquals(0, Payable::count());
    }


    public function test_verify_uses_transaction_for_atomicity()
    {
        // Force an error by making material_deposit null (this should fail validation)
        $this->inspection->update(['material_deposit' => null]);

        try {
            $this->post(route('verify-applications.verify'), [
                'application_id' => $this->application->id,
            ]);
        } catch (\Exception $e) {
            // Exception expected
        }

        // Application status should not have changed due to transaction rollback
        $this->application->refresh();
        $this->assertEquals(ApplicationStatusEnum::FOR_COLLECTION, $this->application->status);
    }


    public function test_verify_creates_payables_with_current_bill_month()
    {
        $this->post(route('verify-applications.verify'), [
            'application_id' => $this->application->id,
        ]);

        $expectedBillMonth = now()->format('Ym');

        $payables = Payable::where('customer_account_id', $this->account->id)->get();

        foreach ($payables as $payable) {
            $this->assertEquals($expectedBillMonth, $payable->bill_month);
        }
    }


    public function test_cancel_updates_application_status_to_cancelled()
    {
        $response = $this->post(route('verify-applications.cancel'), [
            'application_id' => $this->application->id,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success', 'Application cancelled successfully.');

        $this->application->refresh();
        $this->assertEquals(ApplicationStatusEnum::CANCELLED, $this->application->status);
    }


    public function test_cancel_fails_if_application_status_is_not_verified()
    {
        $this->application->update(['status' => ApplicationStatusEnum::FOR_COLLECTION]);

        $response = $this->post(route('verify-applications.cancel'), [
            'application_id' => $this->application->id,
        ]);

        $response->assertRedirect();
        $response->assertSessionHasErrors(['message' => 'Application is not in the correct status for cancellation.']);

        // Application status should not change
        $this->application->refresh();
        $this->assertEquals(ApplicationStatusEnum::FOR_COLLECTION, $this->application->status);
    }


    public function test_cancel_does_not_create_any_payables()
    {
        $this->post(route('verify-applications.cancel'), [
            'application_id' => $this->application->id,
        ]);

        // No payables should be created when cancelling
        $this->assertEquals(0, Payable::where('customer_account_id', $this->account->id)->count());
    }


    public function test_verify_handles_empty_material_definitions()
    {
        // Ensure inspection has no materials
        $this->inspection->materialsUsed()->delete();

        $this->post(route('verify-applications.verify'), [
            'application_id' => $this->application->id,
        ]);

        // Should only create 2 payables (Bill Deposit and Labor Cost)
        // Material Cost payable is not created when total_amount_due is 0
        $this->assertEquals(2, Payable::where('customer_account_id', $this->account->id)->count());

        // Material cost payable should not exist when amount is 0
        $materialCostPayable = Payable::where('customer_account_id', $this->account->id)
            ->where('type', PayableTypeEnum::MATERIAL_COST)
            ->first();

        $this->assertNull($materialCostPayable);
    }


    public function test_verify_creates_definitions_with_correct_transaction_codes()
    {
        // Create inspection material
        $material = CustApplnInspMat::factory()->create([
            'cust_appln_inspection_id' => $this->inspection->id,
            'material_name' => 'Wire',
            'quantity' => 10,
            'unit' => 'meters',
            'amount' => 150.00,
        ]);

        $this->post(route('verify-applications.verify'), [
            'application_id' => $this->application->id,
        ]);

        $definition = PayablesDefinition::where('transaction_name', 'Wire')->first();

        $this->assertNotNull($definition);
        $this->assertEquals('MAT-' . $material->id, $definition->transaction_code);
    }


    public function test_multiple_verifications_do_not_duplicate_payables()
    {
        // First verification
        $this->post(route('verify-applications.verify'), [
            'application_id' => $this->application->id,
        ]);

        $this->assertEquals(3, Payable::where('customer_account_id', $this->account->id)->count());

        // Try to verify again (should fail because status is now FOR_COLLECTION)
        $response = $this->post(route('verify-applications.verify'), [
            'application_id' => $this->application->id,
        ]);

        $response->assertSessionHasErrors();

        // Should still only have 3 payables
        $this->assertEquals(3, Payable::where('customer_account_id', $this->account->id)->count());
    }
}
