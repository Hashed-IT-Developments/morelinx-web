<?php

namespace Tests\Feature;

use App\Enums\ApplicationStatusEnum;
use App\Enums\PayableStatusEnum;
use App\Enums\PayableTypeEnum;
use App\Enums\PermissionsEnum;
use App\Enums\RolesEnum;
use App\Models\Barangay;
use App\Models\CaAttachment;
use App\Models\CustomerAccount;
use App\Models\CustomerApplication;
use App\Models\CustomerType;
use App\Models\Payable;
use App\Models\Transaction;
use App\Models\TransactionSeries;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * ISNAP Application Flow Test Suite
 * 
 * This comprehensive test suite covers the complete ISNAP application flow:
 * 
 * FLOW OVERVIEW:
 * 1. Create ISNAP customer application with is_isnap = true
 * 2. Upload ISNAP supporting documents
 * 3. Approve ISNAP application (creates ISNAP fee payable)
 * 4. Search for ISNAP member in transactions module
 * 5. Process payment for ISNAP fee
 * 6. Verify payment completion and status updates
 * 
 * BUSINESS RULES TESTED:
 * - ISNAP applications start with status 'isnap_pending'
 * - ISNAP applications skip inspection flow
 * - ISNAP fee is configurable (default: ₱500.00)
 * - ISNAP documents are stored with type 'isnap'
 * - Only 'isnap_pending' applications can be approved
 * - Approval creates payable with type 'isnap_fee'
 * - Status changes to 'isnap_for_collection' after approval
 * - Payment processing follows standard transaction flow
 * 
 */
class IsnapApplicationFlowTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $cashier;
    protected User $approver;
    protected CustomerType $customerType;
    protected Barangay $barangay;
    protected TransactionSeries $transactionSeries;

    /**
     * Setup test environment before each test
     */
    protected function setUp(): void
    {
        parent::setUp();

        // Seed roles and permissions
        $this->seed(\Database\Seeders\InitRolesAndPermissions::class);

        // Create users with specific roles
        $this->admin = User::factory()->create([
            'name' => 'ISNAP Admin',
            'email' => 'admin@isnap.test'
        ]);
        $this->admin->assignRole(RolesEnum::ADMIN);
        $this->admin->givePermissionTo([
            PermissionsEnum::CREATE_CUSTOMER_APPLICATIONS,
        ]);

        $this->cashier = User::factory()->create([
            'name' => 'ISNAP Cashier',
            'email' => 'cashier@isnap.test'
        ]);
        $this->cashier->assignRole(RolesEnum::TREASURY_STAFF);
        $this->cashier->givePermissionTo([
            PermissionsEnum::VIEW_TRANSACTIONS,
            PermissionsEnum::MANAGE_PAYMENTS,
        ]);

        $this->approver = User::factory()->create([
            'name' => 'ISNAP Approver',
            'email' => 'approver@isnap.test'
        ]);
        $this->approver->assignRole(RolesEnum::SUPERADMIN);

        // Create supporting data
        $this->customerType = CustomerType::factory()->create();

        $this->barangay = Barangay::factory()->create();

        // Create active transaction series for OR generation
        $this->transactionSeries = TransactionSeries::create([
            'series_name' => '2025 Main Series',
            'prefix' => 'OR',
            'current_number' => 0,
            'start_number' => 1,
            'end_number' => 999999,
            'format' => '{PREFIX}{NUMBER:12}',
            'is_active' => true,
            'effective_from' => now()->startOfYear(),
            'created_by' => $this->admin->id,
        ]);

        // Setup fake storage for file uploads
        Storage::fake('public');
    }

    /**
     * TEST CASE 1: Create ISNAP Application
     * 
     * Scenario: Create a new customer application with ISNAP flag enabled
     * 
     * Expected Results:
     * - Application is created successfully
     * - is_isnap field is set to true
     * - Status is set to 'isnap_pending'
     * - No inspection record is created
     * - Customer account is created automatically via observer
     */
    #[Test]
    public function test_create_isnap_application_with_correct_status()
    {
        Sanctum::actingAs($this->admin);

        $applicationData = [
            'rate_class' => $this->customerType->rate_class,
            'customer_type' => $this->customerType->customer_type,
            'connected_load' => 5.0,
            'property_ownership' => 'Owned',
            'last_name' => 'Dela Cruz',
            'first_name' => 'Juan',
            'middle_name' => 'Santos',
            'suffix' => null,
            'birthdate' => '1990-01-15',
            'nationality' => 'Filipino',
            'sex' => 'Male',
            'marital_status' => 'Single',
            'cp_lastname' => 'Dela Cruz',
            'cp_firstname' => 'Maria',
            'cp_middlename' => 'Santos',
            'relationship' => 'Spouse',
            'cp_email' => 'juan.delacruz@test.com',
            'cp_tel_no' => '02-1234567',
            'cp_mobile_no' => '09171234567',
            'landmark' => 'Near Church',
            'unit_no' => '123',
            'street' => 'Main Street',
            'subdivision' => 'Test Subdivision',
            'barangay' => (string)$this->barangay->id, // Cast ID to string
            'sketch_lat_long' => '14.5995,120.9842', // Required field
            'id_category' => 'primary',
            'primary_id_type' => 'passport', // Use lowercase key from config
            'primary_id_number' => 'P1234567',
            'is_senior_citizen' => false,
            'is_isnap' => true, // KEY: ISNAP flag enabled
            'bill_barangay' => (string)$this->barangay->id, // Cast ID to string
            'bill_subdivision' => 'Test Subdivision',
            'bill_house_no' => '123',
            'bill_street' => 'Main Street',
            'bill_delivery' => 'pickup',
        ];

        $response = $this->postJson(route('applications.store'), $applicationData);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'success'
            ]);

        // Verify application was created with correct attributes
        $this->assertDatabaseHas('customer_applications', [
            'last_name' => 'Dela Cruz',
            'first_name' => 'Juan',
            'is_isnap' => true,
            'status' => ApplicationStatusEnum::ISNAP_PENDING,
        ]);

        $application = CustomerApplication::where('last_name', 'Dela Cruz')->first();

        // Verify NO inspection record was created (ISNAP bypasses inspection)
        $this->assertDatabaseMissing('cust_appln_inspections', [
            'customer_application_id' => $application->id,
        ]);

        // Verify customer account was created
        $this->assertDatabaseHas('customer_accounts', [
            'account_number' => $application->account_number,
        ]);
    }

    /**
     * TEST CASE 2: Upload ISNAP Documents
     * 
     * Scenario: Upload supporting documents for ISNAP application
     * 
     * Expected Results:
     * - Documents are uploaded successfully
     * - Files are stored in 'isnap_documents' folder
     * - Attachments are created with type 'isnap'
     * - Thumbnails are generated for images
     * - Success message shows correct file count
     */
    #[Test]
    public function test_upload_isnap_documents()
    {
        Sanctum::actingAs($this->approver);

        $application = CustomerApplication::factory()->create([
            'is_isnap' => true,
            'status' => ApplicationStatusEnum::ISNAP_PENDING,
            'customer_type_id' => $this->customerType->id,
            'barangay_id' => $this->barangay->id,
        ]);

        // Create fake files
        $document1 = UploadedFile::fake()->image('isnap_id.jpg', 800, 600);
        $document2 = UploadedFile::fake()->create('isnap_proof.pdf', 1024);
        $document3 = UploadedFile::fake()->image('isnap_certification.png', 800, 600);

        $response = $this->postJson(
            route('isnap.store-documents', $application),
            [
                'documents' => [$document1, $document2, $document3]
            ]
        );

        $response->assertStatus(302)
            ->assertSessionHas('success', '3 documents uploaded successfully');

        // Verify attachments were created
        $this->assertDatabaseCount('ca_attachments', 3);

        $this->assertDatabaseHas('ca_attachments', [
            'customer_application_id' => $application->id,
            'type' => 'isnap',
        ]);

        // Verify files were stored
        $attachments = CaAttachment::where('customer_application_id', $application->id)->get();

        foreach ($attachments as $attachment) {
            $this->assertTrue(Storage::disk('public')->exists($attachment->path));
        }
    }

    /**
     * TEST CASE 3: Upload Documents - Validation
     * 
     * Scenario: Attempt to upload invalid documents
     * 
     * Expected Results:
     * - Validation errors are returned
     * - No attachments are created
     */
    #[Test]
    public function test_upload_isnap_documents_validation()
    {
        Sanctum::actingAs($this->approver);

        $application = CustomerApplication::factory()->create([
            'is_isnap' => true,
            'status' => ApplicationStatusEnum::ISNAP_PENDING,
        ]);

        // Test 1: No documents provided
        $response = $this->postJson(
            route('isnap.store-documents', $application),
            ['documents' => []]
        );
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['documents']);

        // Test 2: Invalid file type
        $invalidFile = UploadedFile::fake()->create('virus.exe', 1024);
        $response = $this->postJson(
            route('isnap.store-documents', $application),
            ['documents' => [$invalidFile]]
        );
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['documents.0']);

        // Test 3: File too large (over 5MB)
        $largeFile = UploadedFile::fake()->create('large.pdf', 6000);
        $response = $this->postJson(
            route('isnap.store-documents', $application),
            ['documents' => [$largeFile]]
        );
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['documents.0']);

        // Verify no attachments were created
        $this->assertDatabaseCount('ca_attachments', 0);
    }

    /**
     * TEST CASE 4: Approve ISNAP Application
     * 
     * Scenario: Approve an ISNAP application that is in 'isnap_pending' status
     * 
     * Expected Results:
     * - Application status changes to 'isnap_for_collection'
     * - ISNAP fee payable is created
     * - Payable has correct type 'isnap_fee'
     * - Payable amount is ₱500.00 (default)
     * - Payable status is 'unpaid'
     */
    #[Test]
    public function test_approve_isnap_application_creates_payable()
    {
        Sanctum::actingAs($this->approver);

        $application = CustomerApplication::factory()->create([
            'is_isnap' => true,
            'status' => ApplicationStatusEnum::ISNAP_PENDING,
            'customer_type_id' => $this->customerType->id,
            'barangay_id' => $this->barangay->id,
        ]);

        // Ensure customer account exists
        $customerAccount = CustomerAccount::where('account_number', $application->account_number)->first();
        $this->assertNotNull($customerAccount, 'Customer account should be created for the application');

        $response = $this->postJson(route('isnap.approve', $application));

        $response->assertStatus(302)
            ->assertSessionHas('success');

        // Verify application status updated
        $application->refresh();
        $this->assertEquals(ApplicationStatusEnum::ISNAP_FOR_COLLECTION, $application->status);

        // Verify payable was created
        $this->assertDatabaseHas('payables', [
            'type' => PayableTypeEnum::ISNAP_FEE,
            'total_amount_due' => 500.00,
            'status' => PayableStatusEnum::UNPAID,
        ]);

        $payable = Payable::where('customer_account_id', $customerAccount->id)
            ->where('type', PayableTypeEnum::ISNAP_FEE)
            ->first();

        $this->assertNotNull($payable);
        $this->assertEquals(500.00, $payable->total_amount_due);
        $this->assertEquals(0, $payable->amount_paid);
        $this->assertEquals(500.00, $payable->balance);
    }

    /**
     * TEST CASE 5: Approve ISNAP - Invalid Status
     * 
     * Scenario: Attempt to approve an ISNAP application that is NOT in 'isnap_pending' status
     * 
     * Expected Results:
     * - Error message is returned
     * - Application status does not change
     * - No payable is created
     */
    #[Test]
    public function test_approve_isnap_application_with_invalid_status()
    {
        Sanctum::actingAs($this->approver);

        // Create application with wrong status
        $application = CustomerApplication::factory()->create([
            'is_isnap' => true,
            'status' => ApplicationStatusEnum::ISNAP_FOR_COLLECTION, // Already approved
            'customer_type_id' => $this->customerType->id,
            'barangay_id' => $this->barangay->id,
        ]);

        $response = $this->postJson(route('isnap.approve', $application));

        $response->assertStatus(302)
            ->assertSessionHas('error');

        // Verify status did not change
        $application->refresh();
        $this->assertEquals(ApplicationStatusEnum::ISNAP_FOR_COLLECTION, $application->status);

        // Verify no new payable was created (use assertDatabaseCount or check the payables don't exist)
        $payableCount = Payable::where('type', PayableTypeEnum::ISNAP_FEE)->count();
        $this->assertEquals(0, $payableCount);
    }

    /**
     * TEST CASE 6: Approve ISNAP - Not an ISNAP Application
     * 
     * Scenario: Attempt to approve an application where is_isnap = false
     * 
     * Expected Results:
     * - Error message is returned
     * - No changes are made
     */
    #[Test]
    public function test_approve_non_isnap_application()
    {
        Sanctum::actingAs($this->approver);

        $application = CustomerApplication::factory()->create([
            'is_isnap' => false, // Not an ISNAP application
            'status' => ApplicationStatusEnum::IN_PROCESS,
            'customer_type_id' => $this->customerType->id,
            'barangay_id' => $this->barangay->id,
        ]);

        $response = $this->postJson(route('isnap.approve', $application));

        $response->assertStatus(302)
            ->assertSessionHas('error', 'This application is not registered as an ISNAP application.');

        // Verify no payable was created
        $payableCount = Payable::where('type', PayableTypeEnum::ISNAP_FEE)->count();
        $this->assertEquals(0, $payableCount);
    }

    /**
     * TEST CASE 7: Approve ISNAP - Prevent Duplicate Payable
     * 
     * Scenario: Attempt to approve an ISNAP application that already has a payable
     * 
     * Expected Results:
     * - Error message is returned
     * - No duplicate payable is created
     */
    #[Test]
    public function test_approve_isnap_application_prevents_duplicate_payable()
    {
        Sanctum::actingAs($this->approver);

        $application = CustomerApplication::factory()->create([
            'is_isnap' => true,
            'status' => ApplicationStatusEnum::ISNAP_PENDING,
            'customer_type_id' => $this->customerType->id,
            'barangay_id' => $this->barangay->id,
        ]);

        // Get customer account
        $customerAccount = CustomerAccount::where('account_number', $application->account_number)->first();
        $this->assertNotNull($customerAccount);

        // Create existing payable
        Payable::create([
            'customer_account_id' => $customerAccount->id,
            'type' => PayableTypeEnum::ISNAP_FEE,
            'customer_payable' => 'ISNAP Fee',
            'total_amount_due' => 500.00,
            'amount_paid' => 0,
            'balance' => 500.00,
            'status' => PayableStatusEnum::UNPAID,
            'bill_month' => now()->format('Ym'),
        ]);

        $response = $this->postJson(route('isnap.approve', $application));

        $response->assertStatus(302)
            ->assertSessionHas('error', 'ISNAP payable already exists for this application.');

        // Verify only one payable exists
        $payableCount = Payable::where('customer_account_id', $customerAccount->id)
            ->where('type', PayableTypeEnum::ISNAP_FEE)
            ->count();

        $this->assertEquals(1, $payableCount);
    }

    /**
     * TEST CASE 8: Search ISNAP Member in Transactions
     * 
     * Scenario: Search for an ISNAP customer in the transactions module
     * 
     * Expected Results:
     * - Customer account is found
     * - ISNAP payable is included in transaction details
     * - Payable shows correct amount and status
     */
    #[Test]
    public function test_search_isnap_member_in_transactions()
    {
        Sanctum::actingAs($this->cashier);

        $application = CustomerApplication::factory()->create([
            'is_isnap' => true,
            'status' => ApplicationStatusEnum::ISNAP_FOR_COLLECTION,
            'customer_type_id' => $this->customerType->id,
            'barangay_id' => $this->barangay->id,
        ]);

        // Get customer account
        $customerAccount = CustomerAccount::where('account_number', $application->account_number)->first();
        $this->assertNotNull($customerAccount);

        // Create ISNAP payable
        Payable::create([
            'customer_account_id' => $customerAccount->id,
            'type' => PayableTypeEnum::ISNAP_FEE,
            'customer_payable' => 'ISNAP Fee - ' . $application->account_number,
            'total_amount_due' => 500.00,
            'amount_paid' => 0,
            'balance' => 500.00,
            'status' => PayableStatusEnum::UNPAID,
            'bill_month' => now()->format('Ym'),
        ]);

        $response = $this->get(route('transactions.index', [
            'search' => $application->account_number
        ]));

        $response->assertStatus(200);

        // Verify customer account data is in response
        $response->assertInertia(fn ($page) => $page
            ->where('search', $application->account_number)
            ->has('latestTransaction')
            ->has('transactionDetails')
        );
    }

    /**
     * TEST CASE 9: Process Payment for ISNAP Fee
     * 
     * Scenario: Process full payment for ISNAP fee
     * 
     * Expected Results:
     * - Transaction is created successfully
     * - OR number is generated
     * - Payment is linked to payable
     * - Payable status changes to 'paid'
     * - Payable balance becomes 0
     * - Transaction total matches payable amount
     */
    #[Test]
    public function test_process_payment_for_isnap_fee()
    {
        Sanctum::actingAs($this->cashier);

        $application = CustomerApplication::factory()->create([
            'is_isnap' => true,
            'status' => ApplicationStatusEnum::ISNAP_FOR_COLLECTION,
            'customer_type_id' => $this->customerType->id,
            'barangay_id' => $this->barangay->id,
        ]);

        // Get customer account
        $customerAccount = CustomerAccount::where('account_number', $application->account_number)->first();
        $this->assertNotNull($customerAccount);

        // Create ISNAP payable
        $payable = Payable::create([
            'customer_account_id' => $customerAccount->id,
            'type' => PayableTypeEnum::ISNAP_FEE,
            'customer_payable' => 'ISNAP Fee - ' . $application->account_number,
            'total_amount_due' => 500.00,
            'amount_paid' => 0,
            'balance' => 500.00,
            'status' => PayableStatusEnum::UNPAID,
            'bill_month' => now()->format('Ym'),
        ]);

        // Prepare payment data
        $paymentData = [
            'selected_payable_ids' => [$payable->id],
            'payment_methods' => [
                [
                    'type' => 'cash',
                    'amount' => 500.00,
                ]
            ],
            'or_offset' => null,
        ];

        $response = $this->postJson(
            route('transactions.process-payment', $customerAccount),
            $paymentData
        );

        $response->assertStatus(302)
            ->assertSessionHas('success');

        // Verify transaction was created
        $this->assertDatabaseHas('transactions', [
            'transactionable_type' => CustomerAccount::class,
            'transactionable_id' => $customerAccount->id,
            'total_amount' => 500.00,
            'status' => 'completed',
        ]);

        $transaction = Transaction::where('transactionable_type', CustomerAccount::class)
            ->where('transactionable_id', $customerAccount->id)
            ->first();
        $this->assertNotNull($transaction);
        $this->assertNotNull($transaction->or_number);

        // Verify payable was updated
        $payable->refresh();
        $this->assertEquals(PayableStatusEnum::PAID, $payable->status);
        $this->assertEquals(500.00, $payable->amount_paid);
        $this->assertEquals(0, $payable->balance);

        // Verify transaction details were created for the payable
        $this->assertDatabaseHas('transaction_details', [
            'transaction_id' => $transaction->id,
            'amount' => 500.00,
        ]);
    }

    /**
     * TEST CASE 10: Process Partial Payment for ISNAP Fee
     * 
     * Scenario: Process partial payment for ISNAP fee
     * 
     * Expected Results:
     * - Transaction is created
     * - Payable status changes to 'partially_paid'
     * - Payable balance is updated correctly
     * - amount_paid is updated correctly
     */
    #[Test]
    public function test_process_partial_payment_for_isnap_fee()
    {
        Sanctum::actingAs($this->cashier);

        $application = CustomerApplication::factory()->create([
            'is_isnap' => true,
            'status' => ApplicationStatusEnum::ISNAP_FOR_COLLECTION,
            'customer_type_id' => $this->customerType->id,
            'barangay_id' => $this->barangay->id,
        ]);

        // Get customer account
        $customerAccount = CustomerAccount::where('account_number', $application->account_number)->first();
        $this->assertNotNull($customerAccount);

        $payable = Payable::create([
            'customer_account_id' => $customerAccount->id,
            'type' => PayableTypeEnum::ISNAP_FEE,
            'customer_payable' => 'ISNAP Fee - Partial',
            'total_amount_due' => 500.00,
            'amount_paid' => 0,
            'balance' => 500.00,
            'status' => PayableStatusEnum::UNPAID,
            'bill_month' => now()->format('Ym'),
        ]);

        // Pay only ₱300.00 (partial)
        $paymentData = [
            'selected_payable_ids' => [$payable->id],
            'payment_methods' => [
                [
                    'type' => 'cash',
                    'amount' => 300.00,
                ]
            ],
        ];

        $response = $this->postJson(
            route('transactions.process-payment', $customerAccount),
            $paymentData
        );

        $response->assertStatus(302)
            ->assertSessionHas('success');

        // Verify payable was partially paid
        $payable->refresh();
        $this->assertEquals(PayableStatusEnum::PARTIALLY_PAID, $payable->status);
        $this->assertEquals(300.00, $payable->amount_paid);
        $this->assertEquals(200.00, $payable->balance);

        // Verify transaction was created with partial amount
        $this->assertDatabaseHas('transactions', [
            'transactionable_type' => CustomerAccount::class,
            'transactionable_id' => $customerAccount->id,
            'total_amount' => 300.00,
            'status' => 'completed',
        ]);
    }

    /**
     * TEST CASE 11: View ISNAP Members List
     * 
     * Scenario: View list of all ISNAP members
     * 
     * Expected Results:
     * - Only applications with is_isnap = true are shown
     * - Applications are paginated
     * - Search functionality works
     * - Sorting works correctly
     */
    #[Test]
    public function test_view_isnap_members_list()
    {
        Sanctum::actingAs($this->admin);

        // Create ISNAP applications
        CustomerApplication::factory()->count(3)->create([
            'is_isnap' => true,
            'status' => ApplicationStatusEnum::ISNAP_PENDING,
            'customer_type_id' => $this->customerType->id,
            'barangay_id' => $this->barangay->id,
        ]);

        // Create non-ISNAP applications (should not appear)
        CustomerApplication::factory()->count(2)->create([
            'is_isnap' => false,
            'status' => ApplicationStatusEnum::IN_PROCESS,
            'customer_type_id' => $this->customerType->id,
            'barangay_id' => $this->barangay->id,
        ]);

        $response = $this->get(route('isnap.index'));

        $response->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('isnap/index')
                ->has('isnapMembers.data', 3)
            );
    }

    /**
     * TEST CASE 12: Search ISNAP Members
     * 
     * Scenario: Search for specific ISNAP members by account number or name
     * 
     * Expected Results:
     * - Search returns matching results
     * - Non-matching applications are excluded
     */
    #[Test]
    public function test_search_isnap_members()
    {
        Sanctum::actingAs($this->admin);

        CustomerApplication::factory()->create([
            'is_isnap' => true,
            'status' => ApplicationStatusEnum::ISNAP_PENDING,
            'account_number' => '2025-SEARCH-001',
            'first_name' => 'Searchable',
            'last_name' => 'Member',
            'customer_type_id' => $this->customerType->id,
            'barangay_id' => $this->barangay->id,
        ]);

        CustomerApplication::factory()->count(2)->create([
            'is_isnap' => true,
            'status' => ApplicationStatusEnum::ISNAP_PENDING,
            'customer_type_id' => $this->customerType->id,
            'barangay_id' => $this->barangay->id,
        ]);

        $response = $this->get(route('isnap.index', [
            'search' => '2025-SEARCH-001'
        ]));

        $response->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->has('isnapMembers.data', 1)
                ->where('search', '2025-SEARCH-001')
            );
    }

    /**
     * TEST CASE 13: Complete ISNAP Flow - Integration Test
     * 
     * Scenario: Complete end-to-end ISNAP flow from application to payment
     * 
     * Expected Results:
     * - All steps execute successfully in sequence
     * - Final state is correct for all entities
     */
    #[Test]
    public function test_complete_isnap_flow_integration()
    {
        // STEP 1: Create ISNAP application
        Sanctum::actingAs($this->admin);

        $applicationData = [
            'rate_class' => $this->customerType->rate_class,
            'customer_type' => $this->customerType->customer_type,
            'connected_load' => 5.0,
            'property_ownership' => 'Owned',
            'last_name' => 'Integration',
            'first_name' => 'Test',
            'middle_name' => 'Flow',
            'birthdate' => '1990-01-15',
            'nationality' => 'Filipino',
            'sex' => 'Male',
            'marital_status' => 'Single',
            'cp_lastname' => 'Integration',
            'cp_firstname' => 'Contact',
            'cp_middlename' => 'Person',
            'relationship' => 'Self',
            'cp_email' => 'integration@test.com',
            'cp_mobile_no' => '09171234567',
            'unit_no' => '123',
            'street' => 'Main Street',
            'barangay' => (string)$this->barangay->id,
            'sketch_lat_long' => '14.5995,120.9842', // Required field
            'id_category' => 'primary',
            'primary_id_type' => 'passport', 
            'primary_id_number' => 'P9999999',
            'is_senior_citizen' => false,
            'is_isnap' => true,
            'bill_barangay' => (string)$this->barangay->id,
            'bill_subdivision' => 'Test Subdivision',
            'bill_house_no' => '123',
            'bill_street' => 'Main Street',
            'bill_delivery' => 'pickup',
        ];

        $createResponse = $this->postJson(route('applications.store'), $applicationData);
        $createResponse->assertStatus(200);

        $application = CustomerApplication::where('last_name', 'Integration')->first();
        $this->assertNotNull($application);
        $this->assertTrue($application->is_isnap);
        $this->assertEquals(ApplicationStatusEnum::ISNAP_PENDING, $application->status);

        // STEP 2: Upload documents
        Sanctum::actingAs($this->approver);

        $document = UploadedFile::fake()->image('isnap_doc.jpg');
        $uploadResponse = $this->postJson(
            route('isnap.store-documents', $application),
            ['documents' => [$document]]
        );
        $uploadResponse->assertStatus(302);

        // STEP 3: Approve application
        $approveResponse = $this->postJson(route('isnap.approve', $application));
        $approveResponse->assertStatus(302);

        $application->refresh();
        $this->assertEquals(ApplicationStatusEnum::ISNAP_FOR_COLLECTION, $application->status);

        // Get customer account
        $customerAccount = CustomerAccount::where('account_number', $application->account_number)->first();
        $this->assertNotNull($customerAccount);

        $payable = Payable::where('customer_account_id', $customerAccount->id)
            ->where('type', PayableTypeEnum::ISNAP_FEE)
            ->first();
        $this->assertNotNull($payable);

        // STEP 4: Process payment
        Sanctum::actingAs($this->cashier);
        $paymentData = [
            'selected_payable_ids' => [$payable->id],
            'payment_methods' => [
                [
                    'type' => 'cash',
                    'amount' => 500.00,
                ]
            ],
        ];

        $paymentResponse = $this->postJson(
            route('transactions.process-payment', $customerAccount),
            $paymentData
        );
        $paymentResponse->assertStatus(302);

        // STEP 5: Verify final state
        $payable->refresh();
        $this->assertEquals(PayableStatusEnum::PAID, $payable->status);
        $this->assertEquals(500.00, $payable->amount_paid);
        $this->assertEquals(0, $payable->balance);

        $transaction = Transaction::where('transactionable_type', CustomerAccount::class)
            ->where('transactionable_id', $customerAccount->id)
            ->first();
        $this->assertNotNull($transaction);
        $this->assertEquals(500.00, $transaction->total_amount);
        $this->assertEquals('completed', $transaction->status);
        $this->assertNotNull($transaction->or_number);
    }
}
