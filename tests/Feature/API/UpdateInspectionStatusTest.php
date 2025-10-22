<?php

namespace Tests\Feature\API;

use App\Enums\InspectionStatusEnum;
use App\Models\CaAttachment;
use App\Models\CaBillInfo;
use App\Models\CustApplnInspection;
use App\Models\CustomerApplication;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UpdateInspectionStatusTest extends TestCase
{
    use RefreshDatabase;

    public function test_approving_an_inspection_does_not_create_a_new_application()
    {
        Sanctum::actingAs(User::factory()->create());

        $app = CustomerApplication::factory()->create();

        $inspection = CustApplnInspection::factory()->create([
            'customer_application_id' => $app->id,
            'status' => InspectionStatusEnum::FOR_INSPECTION(),
        ]);

        $response = $this->putJson("/api/inspections/{$inspection->id}", [
            'status' => InspectionStatusEnum::APPROVED(),
        ]);

        $response->assertStatus(200)
                 ->assertJson(['success' => true]);

        $inspection->refresh();

        $this->assertEquals(InspectionStatusEnum::APPROVED(), $inspection->status);

        $this->assertDatabaseCount('customer_applications', 1);
    }

    public function test_disapproving_an_inspection_clones_application_and_copies_files()
    {
        $this->markTestIncomplete('Needs fix after recent changes to file storage handling.');
        Storage::fake('public');
        Sanctum::actingAs(User::factory()->create());

        // create fake files that the original app references
        Storage::disk('public')->put('attachments/orig-id-front.jpg', 'attachment-content');
        Storage::disk('public')->put('sketches/orig-sketch.jpg', 'sketch-content');
        // optional thumbs if your app uses thumb_ prefix
        Storage::disk('public')->put('attachments/thumb_orig-id-front.jpg', 'thumb');
        Storage::disk('public')->put('sketches/thumb_orig-sketch.jpg', 'thumb');

        $origApp = CustomerApplication::factory()->create([
            'sketch_lat_long' => 'sketches/orig-sketch.jpg',
        ]);

        CaBillInfo::factory()->create([
            'customer_application_id' => $origApp->id,
        ]);

        CaAttachment::factory()->create([
            'customer_application_id' => $origApp->id,
            'type' => 'id_front',
            'path' => 'attachments/orig-id-front.jpg',
        ]);

        $inspection = CustApplnInspection::factory()->create([
            'customer_application_id' => $origApp->id,
            'status' => InspectionStatusEnum::FOR_INSPECTION(),
        ]);

        $response = $this->putJson("/api/inspections/{$inspection->id}", [
            'status' => InspectionStatusEnum::DISAPPROVED(),
        ]);

        $response->assertStatus(200)->assertJson(['success' => true]);

        $inspection->refresh();
        $this->assertEquals(InspectionStatusEnum::DISAPPROVED(), $inspection->status);

        $this->assertDatabaseCount('customer_applications', 2);

        $newApp = CustomerApplication::where('id', '!=', $origApp->id)->latest('created_at')->first();
        $this->assertNotNull($newApp, 'Expected a cloned application to be present');

        $this->assertDatabaseHas('ca_bill_infos', ['customer_application_id' => $newApp->id]);

        $this->assertDatabaseHas('ca_attachments', [
            'customer_application_id' => $newApp->id,
            'type' => 'id_front',
        ]);

        // Storage assertions: original files still exist
        Storage::disk('public')->assertExists('attachments/orig-id-front.jpg');
        Storage::disk('public')->assertExists('sketches/orig-sketch.jpg');

        $attachmentFiles = Storage::disk('public')->files('attachments');
        $this->assertTrue(count(array_filter($attachmentFiles, fn($f) => $f !== 'attachments/orig-id-front.jpg')) >= 1, 'Expected copied attachment file');

        $sketchFiles = Storage::disk('public')->files('sketches');
        $this->assertTrue(count(array_filter($sketchFiles, fn($f) => $f !== 'sketches/orig-sketch.jpg')) >= 1, 'Expected copied sketch file');

        // assert a new inspection row exists for the cloned application
        $this->assertDatabaseHas('cust_appln_inspections', [
            'customer_application_id' => $newApp->id,
        ]);
    }
}
