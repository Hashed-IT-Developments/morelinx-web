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
    public function index(Request $request)
    {
        return inertia('csf/tickets/dashboard', [
            'tickets_count' => Inertia::defer(function () use($request){
                return $this->getTicketsCountByStatus($request, null, null);
            }),

            'tickets_completed_count' => Inertia::defer(function () use($request) {
                return $this->getTicketsCountByStatus($request, null, 'completed');
            }),

            'tickets_resolved_count' => Inertia::defer(function () use($request){
                return $this->getTicketsCountByStatus($request, null, 'resolved');
            }),

            'tickets_unresolved_count' => Inertia::defer(function () use($request){
                return $this->getTicketsCountByStatus($request, null, 'unresolved');
            }),

            'tickets_pending_count' => Inertia::defer(function () use($request){
                return $this->getTicketsCountByStatus($request, null, 'pending');
            }),

            'my_tickets_count' => Inertia::defer(function () use($request){
                $user_id = Auth::user()->id;
                return $this->getTicketsCountByStatus($request, $user_id, null);
            }),

            'tickets_grouped_by_status' => Inertia::defer(function () use($request) {
                return $this->getTicketsGroupedByStatus($request);
            }),

            'tickets_grouped_by_department' => Inertia::defer(function () use($request) {
                return $this->getTicketsGroupedByDepartment($request);
            }),

            'ticket_completion_rate' => Inertia::defer(function () use($request) {
                return $this->getTicketCompletionRate($request);
            }),

            'tickets_by_severity' => Inertia::defer(function () use($request) {
                return $this->getTicketBySeverity($request);
            }),

    
            'filter' => $request->all(),

        ]);
    }

    private function getTicketsCountByStatus($request = null, $user_id = null, $status = null)
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

        // Apply date filter
        if ($request->date_start) {
            $query->where('created_at', '>=', $request->date_start);
        }
        if ($request->date_end) {
            $query->where('created_at', '<=', $request->date_end);
        }

        return $query->count();
    }

    private function getTicketsGroupedByStatus($request = null)
    {
        $statuses = TicketStatusEnum::getValues();

        $query = Ticket::query();

        // Apply date filter
        if ($request->date_start) {
            $query->where('created_at', '>=', $request->date_start);
        }
        if ($request->date_end) {
            $query->where('created_at', '<=', $request->date_end);
        }

        $ticketCounts = $query
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

    private function getTicketsGroupedByDepartment($request = null)
    {
        $roles = Role::all();

        $query = Ticket::query();

        // Apply date filter
        if ($request->date_start) {
            $query->where('created_at', '>=', $request->date_start);
        }
        if ($request->date_end) {
            $query->where('created_at', '<=', $request->date_end);
        }

        $ticketCounts = $query
            ->select('assign_department_id', DB::raw('count(*) as total'))
            ->groupBy('assign_department_id')
            ->pluck('total', 'assign_department_id');

        return $roles->map(function($role) use ($ticketCounts) {
            return [
                'name' => $role->name,
                'count' => $ticketCounts->get($role->id, 0)
            ];
        });
    }

    private function getTicketCompletionRate($request = null)
    {
        $totalTickets = $this->getTicketsCountByStatus($request);
        $completedTickets = $this->getTicketsCountByStatus($request, null, 'completed');

        if ($totalTickets === 0) {
            return 0;
        }

        return ($completedTickets / $totalTickets) * 100;
    }

private function getTicketBySeverity($request = null, $severity = null)
{
    $query = Ticket::query();

 
    if ($request->date_start) {
        $query->where('created_at', '>=', $request->date_start);
    }

    if ($request->date_end) {
        $query->where('created_at', '<=', $request->date_end);
    }

   
    if ($severity) {
        $tickets = $query->where('severity', $severity)
        ->with([
        'details',
        'cust_information'

        ])
        ->get();

        return [
            'name'  => $severity,
            'count' => $tickets->count(),
            'data'  => $tickets,
        ];
    }

    $severities = TicketSeverity::getValues();

  
    $ticketsBySeverity = $query->get()->groupBy('severity');

    return collect($severities)->map(function ($severity) use ($ticketsBySeverity) {
        $tickets = $ticketsBySeverity->get($severity, collect());

        return [
            'name'  => $severity,
            'count' => $tickets->count(),
            'data'  => $tickets,
        ];
    });
}


}
