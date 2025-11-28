<?php

namespace Tests\Feature\API;

use App\Models\MaterialItem;
use App\Models\Ticket;
use App\Models\TicketDetails;
use App\Models\TicketType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;

class TicketApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Use forceCreate to bypass fillable restrictions and force username
        $this->user = User::forceCreate([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'username' => 'testuser',
            'password' => bcrypt('password'),
            'email_verified_at' => now(),
        ]);

        Sanctum::actingAs($this->user);
        $this->department = Role::create(['name' => 'inspector']);

        $this->findingType = TicketType::create([
            'name' => 'Leak Found',
            'type' => 'actual_findings_type',
        ]);

        $this->ticketType = TicketType::create([
            'name' => 'Service',
            'type' => 'ticket_type',
        ]);

        $this->concernType = TicketType::create([
            'name' => 'Broken Fuse',
            'type' => 'concern_type',
        ]);

        $this->material1 = MaterialItem::create(['material' => 'Bolt', 'cost' => 10]);
        $this->material2 = MaterialItem::create(['material' => 'Wire', 'cost' => 20]);
    }

    /**
     * Helper method to create a ticket with assigned user
     */
    protected function createTicketWithUser(?User $user = null): Ticket
    {
        $user = $user ?? $this->user;

        $ticket = Ticket::create([
            'ticket_no' => 'TICKET-' . random_int(100000, 999999),
            'assign_by_id' => $user->id,
            'assign_department_id' => $this->department->id,
            'severity' => 'low',
            'status' => 'pending',
        ]);

        // Critical: Assign the user to the ticket (removed assigned_by)
        $ticket->assigned_users()->create([
            'user_id' => $user->id,
        ]);

        TicketDetails::create([
            'ticket_id' => $ticket->id,
            'ticket_type_id' => $this->ticketType->id,
            'concern_type_id' => $this->concernType->id,
            'channel_id' => 1,
        ]);

        return $ticket;
    }

    public function test_it_returns_all_tickets()
    {
        $ticket = $this->createTicketWithUser();

        $response = $this->getJson('/api/tickets');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'ticket_no',
                        'status',
                        'details' => [
                            'id',
                            'ticket_type_id',
                            'concern_type_id'
                        ]
                    ]
                ]
            ]);
    }

    public function test_it_shows_a_single_ticket()
    {
        $ticket = $this->createTicketWithUser();

        $response = $this->getJson('/api/tickets/' . $ticket->id);

        $response->assertOk()
            ->assertJsonPath('data.id', $ticket->id)
            ->assertJsonPath('data.details.ticket_type_id', $this->ticketType->id);
    }

    public function test_it_updates_ticket_details_and_materials()
    {
        $ticket = $this->createTicketWithUser();

        $payload = [
            'status' => 'executed',
            'actual_findings_id' => $this->findingType->id,
            'action_plan' => 'Fixed wiring',
            'remarks' => 'All good now',
            'date_arrival' => '2025-11-07 09:00:00',
            'date_dispatched' => '2025-11-07 10:00:00',
            'date_accomplished' => '2025-11-07 11:00:00',
            'materials' => [
                ['material_item_id' => $this->material1->id],
                ['material_item_id' => $this->material2->id]
            ]
        ];

        $response = $this->patchJson('/api/tickets/' . $ticket->id, $payload);

        $response->assertOk()
            ->assertJsonPath('data.status', 'executed')
            ->assertJsonPath('data.executed_by_id', $this->user->id)
            ->assertJsonPath('data.date_arrival', '2025-11-07 09:00:00')
            ->assertJsonPath('data.date_dispatched', '2025-11-07 10:00:00')
            ->assertJsonPath('data.date_accomplished', '2025-11-07 11:00:00')
            ->assertJsonPath('data.details.actual_findings_id', $this->findingType->id)
            ->assertJsonPath('data.details.action_plan', 'Fixed wiring')
            ->assertJsonPath('data.details.remarks', 'All good now')
            ->assertJsonPath('data.materials.0.material_item_id', $this->material1->id)
            ->assertJsonPath('data.materials.1.material_item_id', $this->material2->id);

        $this->assertDatabaseCount('ticket_materials', 2);
    }

    public function test_it_uploads_attachments()
    {
        Storage::fake('public');
        $ticket = $this->createTicketWithUser();

        // Test single file upload
        $file = UploadedFile::fake()->image('test.jpg');

        $response = $this->patchJson("/api/tickets/{$ticket->id}", [
            'status' => 'executed',
            'attachment' => $file,
        ]);

        $response->assertOk();
        $this->assertCount(1, json_decode($ticket->fresh()->attachments, true));

        // Test multiple files upload
        $files = [
            UploadedFile::fake()->image('test1.jpg'),
            UploadedFile::fake()->image('test2.jpg'),
        ];

        $response = $this->patchJson("/api/tickets/{$ticket->id}", [
            'status' => 'executed',
            'attachments' => $files,
        ]);

        $response->assertOk();
        $this->assertCount(3, json_decode($ticket->fresh()->attachments, true)); // 1 + 2
    }

    public function test_it_handles_alternative_materials_format()
    {
        $ticket = $this->createTicketWithUser();

        // Test simple array format [1,2,3]
        $payload = [
            'status' => 'executed',
            'materials' => [$this->material1->id, $this->material2->id]
        ];

        $response = $this->patchJson("/api/tickets/{$ticket->id}", $payload);

        $response->assertOk()
            ->assertJsonCount(2, 'data.materials')
            ->assertJsonPath('data.materials.0.material_item_id', $this->material1->id)
            ->assertJsonPath('data.materials.1.material_item_id', $this->material2->id);
    }
}
