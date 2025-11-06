<?php

namespace Tests\Feature\API;

use App\Models\Ticket;
use App\Models\TicketDetails;
use App\Models\TicketType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class TicketApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::create([
            'name' => 'Test User',
            'email' => 'test@test.com',
            'password' => bcrypt('password'),
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
    }

    public function test_it_returns_all_tickets()
    {
        Ticket::create([
            'ticket_no' => 'TICKET-000001',
            'assign_by_id' => $this->user->id,
            'assign_department_id' => $this->department->id,
            'severity' => 'low',
            'status' => 'pending',
        ]);

        $response = $this->getJson('/api/tickets');

        $response->assertOk()
                ->assertJsonStructure([
                    'data' => [
                        '*' => ['id', 'ticket_no', 'status']
                    ]
                ]);
    }

    public function test_it_shows_a_single_ticket()
    {
        $ticket = Ticket::create([
            'ticket_no' => 'TICKET-000001',
            'assign_by_id' => $this->user->id,
            'assign_department_id' => $this->department->id,
            'severity' => 'low',
            'status' => 'pending',
        ]);

        $response = $this->getJson('/api/tickets/' . $ticket->id);

        $response->assertOk()
            ->assertJsonPath('data.id', $ticket->id);
    }

    public function test_it_updates_ticket_and_details_and_dates()
    {
        $ticket = Ticket::create([
            'ticket_no' => 'TICKET-000001',
            'assign_by_id' => $this->user->id,
            'assign_department_id' => $this->department->id,
            'severity' => 'low',
            'status' => 'pending',
        ]);

        TicketDetails::create([
            'ticket_id' => $ticket->id,
            'ticket_type_id' => $this->ticketType->id,
            'concern_type_id' => $this->concernType->id,
            'concern' => 'Old issue',
            'reason' => 'Old reason',
            'remarks' => 'Old remarks',
        ]);

        $payload = [
            'severity' => 'high',
            'status' => 'executed',
            'executed_by_id' => $this->user->id,
            'actual_findings_id' => $this->findingType->id,
            'action_plan' => 'Fixed wiring',
            'remarks' => 'All good now',
            'date_arrival' => '2025-11-07 09:00:00',
            'date_dispatched' => '2025-11-07 10:00:00',
            'date_accomplished' => '2025-11-07 11:00:00'
        ];

        $response = $this->patchJson('/api/tickets/' . $ticket->id, $payload);

        $response->assertOk()
            ->assertJsonPath('data.status', 'executed')
            ->assertJsonPath('data.severity', 'high')
            ->assertJsonPath('data.executed_by_id', $this->user->id)
            ->assertJsonPath('data.details.actual_findings_id', $this->findingType->id)
            ->assertJsonPath('data.details.action_plan', 'Fixed wiring')
            ->assertJsonPath('data.details.remarks', 'All good now');
    }
}
