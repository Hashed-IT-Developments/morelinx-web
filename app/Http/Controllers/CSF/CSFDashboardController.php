<?php

namespace App\Http\Controllers\CSF;

use App\Enums\TicketSeverity;
use App\Enums\TicketStatusEnum;
use App\Http\Controllers\Controller;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class CSFDashboardController extends Controller
{
    public function index()
    {
        


        return inertia('csf/tickets/dashboard', [
            'tickets_count' => Inertia::defer(function() {
               
                $tickets = $this->getTicketsCountByStatus(
                    null, null
                );
                return $tickets;
            }),
            
            'tickets_completed_count' =>  Inertia::defer(function() {
                $tickets = $this->getTicketsCountByStatus(null, 'completed');
                return $tickets;
            }),
             'tickets_not_executed_count' =>  Inertia::defer(function() {
                $tickets = $this->getTicketsCountByStatus(null, 'not_executed');
                return $tickets;
            }),
             'tickets_executed_count' =>  Inertia::defer(function() {
                $tickets = $this->getTicketsCountByStatus(null, 'executed');
                return $tickets;
            }),
            'tickets_pending_count' =>  Inertia::defer(function() {
                $tickets = $this->getTicketsCountByStatus(null, 'pending');
                return $tickets;
            }),
            'my_tickets_count' =>  Inertia::defer(function() {
                $user_id = Auth::user()->id;
                $tickets = $this->getTicketsCountByStatus($user_id, null);
                return $tickets;
            }),

            'tickets_grouped_by_status' => Inertia::defer(function() {
                return $this->getTicketsGroupedByStatus();
            }),
            'tickets_grouped_by_department' => Inertia::defer(function() {
                return $this->getTicketsGroupedByDepartment();
            }),
            'ticket_completion_rate' => Inertia::defer(function() {
                return $this->getTicketCompletionRate();
            }),
            'tickets_by_severity' => Inertia::defer(function() {
                return $this->getTicketBySeverity();
            }),
            
        ]);
        
    }

    private function getTicketsCountByStatus($user_id = null,$status = null)
    {
        $query = Ticket::query();

        if ($status) {
            $query->where('status', $status);
        }

        if ($user_id !== null) {
            $query->whereHas('assigned_users', function ($q) use ($user_id) {
            $q->where('user_id', $user_id);
            });
        }

        return $query->count();
    }

private function getTicketsGroupedByStatus(){
    $statuses = TicketStatusEnum::getValues();

    $ticketCounts = Ticket::query()
        ->select('status', DB::raw('count(*) as total'))
        ->groupBy('status')
        ->pluck('total', 'status');

    return collect($statuses)->map(function($status) use ($ticketCounts) {
        return [
            'name' => $status,
            'count' => $ticketCounts->get($status, 0)
        ];
    });
}


private function getTicketsGroupedByDepartment(){
        $roles = Role::all();

    $ticketCounts = Ticket::query()
        ->select('assign_department_id', DB::raw('count(*) as total'))
        ->groupBy('assign_department_id')
        ->pluck('total', 'assign_department_id');

    $tickets = $roles->map(function($role) use ($ticketCounts) {
        return [
           
            'name' => $role->name,
            'count' => $ticketCounts->get($role->id, 0)
        ];
    });
        
   
    return $tickets;
}

private function getTicketCompletionRate(){
    $totalTickets = $this->getTicketsCountByStatus();
    $completedTickets = $this->getTicketsCountByStatus(null, 'completed');

    if ($totalTickets === 0) {
        return 0;
    }

    return ($completedTickets / $totalTickets) * 100;
}

private function getTicketBySeverity($severity = null){
    if ($severity) {
        return Ticket::where('severity', $severity)->count();
    }

    
    $severities = TicketSeverity::getValues();

    $ticketCounts = Ticket::query()
        ->select('severity', DB::raw('count(*) as total'))
        ->groupBy('severity')
        ->pluck('total', 'severity');

    return collect($severities)->map(function($severity) use ($ticketCounts) {
        return [
            'name' => $severity,
            'count' => $ticketCounts->get($severity, 0)
        ];
    });
}

}
