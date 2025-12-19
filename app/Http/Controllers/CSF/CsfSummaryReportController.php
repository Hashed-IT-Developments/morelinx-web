<?php

namespace App\Http\Controllers\CSF;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\TicketType;
use App\Models\User;
use Illuminate\Http\Request;

class CSFSummaryReportController extends Controller
{
    public function index(Request $request): \Inertia\Response
    {
        $validated = $request->validate([
            'from_date' => 'nullable|date',
            'to_date' => 'nullable|date|after_or_equal:from_date',
            'ticket_type_id' => 'nullable|exists:ticket_types,id',
            'concern_type_id' => 'nullable|exists:ticket_types,id',
            'submission_type' => 'nullable|string|in:log,ticket',
            'status' => 'nullable|string',
            'user_id' => 'nullable|exists:users,id',
            'sort_field' => 'nullable|string',
            'sort_direction' => 'nullable|string|in:asc,desc',
        ]);

        $defaultFromDate = now()->startOfMonth()->format('Y-m-d');
        $defaultToDate = now()->format('Y-m-d');

        $fromDate = $validated['from_date'] ?? $defaultFromDate;
        $toDate = $validated['to_date'] ?? $defaultToDate;
        $selectedTicketTypeId = $validated['ticket_type_id'] ?? null;
        $selectedConcernTypeId = $validated['concern_type_id'] ?? null;
        $selectedSubmissionType = $validated['submission_type'] ?? null;
        $selectedStatus = $validated['status'] ?? null;
        $selectedUserId = $validated['user_id'] ?? null;
        $sortField = $validated['sort_field'] ?? 'created_at';
        $sortDirection = $validated['sort_direction'] ?? 'desc';

        $ticketTypesAll = TicketType::select('id', 'name', 'type')->orderBy('name')->get();

        $ticketTypes = $ticketTypesAll->filter(function ($t) {
            return isset($t->type) && strtolower($t->type) === 'ticket_type';
        })->values();
        $concernTypes = $ticketTypesAll->filter(function ($t) {
            return isset($t->type) && strtolower($t->type) === 'concern_type';
        })->values();

        $users = cache()->remember('ticket_users_list', 3600, function () {
            return User::select('id', 'name')->orderBy('name')->get();
        });

        $ticketsQuery = $this->buildTicketsQuery(
            $fromDate,
            $toDate,
            $selectedSubmissionType,
            $selectedTicketTypeId,
            $selectedConcernTypeId,
            $selectedStatus,
            $selectedUserId
        );


        $allTickets = $ticketsQuery->get()->map(function ($ticket) {
            return $this->mapTicketData($ticket);
        });

        $allTickets = $this->applySorting($allTickets, $sortField, $sortDirection);

        $ticketsPaginated = $ticketsQuery->paginate(20);

        $tickets = collect($ticketsPaginated->items())->map(function ($ticket) {
            return $this->mapTicketData($ticket);
        });

        $tickets = $this->applySorting($tickets, $sortField, $sortDirection);

        return inertia('csf/summary-report/index', [
            'tickets' => $tickets,
            'allTickets' => $allTickets,
            'pagination' => [
                'current_page' => $ticketsPaginated->currentPage(),
                'last_page' => $ticketsPaginated->lastPage(),
                'per_page' => $ticketsPaginated->perPage(),
                'total' => $ticketsPaginated->total(),
            ],
            'ticket_types' => $ticketTypes,
            'concern_types' => $concernTypes,
            'users' => $users,
            'filters' => [
                'from_date' => $fromDate,
                'to_date' => $toDate,
                'submission_type' => $selectedSubmissionType,
                'ticket_type_id' => $selectedTicketTypeId,
                'concern_type_id' => $selectedConcernTypeId,
                'status' => $selectedStatus,
                'user_id' => $selectedUserId,
                'sort_field' => $sortField,
                'sort_direction' => $sortDirection,
            ],
        ]);
    }

    private function applySorting($tickets, string $sortField, string $sortDirection)
    {
        if ($sortDirection === 'asc') {
            return $tickets->sortBy($sortField)->values();
        }

        return $tickets->sortByDesc($sortField)->values();
    }

    private function buildTicketsQuery(
        string $fromDate,
        string $toDate,
        ?string $submissionType,
        ?int $ticketTypeId,
        ?int $concernTypeId,
        ?string $status,
        ?int $userId
    ) {
        $query = Ticket::query()
            ->with([
                'details.ticket_type:id,name',
                'details.concern_type:id,name',
                'cust_information:id,ticket_id,town_id,barangay_id,consumer_name,account_id',
                'cust_information.town:id,name',
                'cust_information.barangay:id,name',
                'cust_information.account:id,account_number,account_name',
                'assign_by:id,name',
            ])
            ->whereDate('created_at', '>=', $fromDate)
            ->whereDate('created_at', '<=', $toDate);

        if ($ticketTypeId) {
            $query->whereHas('details', function ($q) use ($ticketTypeId) {
                $q->where('ticket_type_id', $ticketTypeId);
            });
        }

        if ($concernTypeId) {
            $query->whereHas('details', function ($q) use ($concernTypeId) {
                $q->where('concern_type_id', $concernTypeId);
            });
        }

        if ($submissionType) {
            $query->where('submission_type', $submissionType);
        }

        if ($status) {
            $query->where('status', $status);
        }

        if ($userId) {
            $query->where(function ($q) use ($userId) {
                $q->where('assign_by_id', $userId)
                  ->orWhereHas('assigned_users', function ($q2) use ($userId) {
                      $q2->where('user_id', $userId);
                  });
            });
        }

        return $query->orderBy('created_at', 'desc');
    }

    private function mapTicketData($ticket): array
    {
        return [
            'id' => $ticket->id,
            'ticket_no' => $ticket->ticket_no,
            'submission_type' => $ticket->submission_type,
            'account_number' => $ticket->account_number ?? ($ticket->cust_information?->account?->account_number ?? 'N/A'),
            'customer_name' => $ticket->cust_information?->consumer_name ?? ($ticket->cust_information?->account?->account_name ?? 'N/A'),
            'ticket_type' => $ticket->details?->ticket_type?->name ?? 'N/A',
            'concern_type' => $ticket->details?->concern_type?->name ?? 'N/A',
            'status' => $ticket->status,
            'town' => $ticket->cust_information?->town?->name ?? 'N/A',
            'barangay' => $ticket->cust_information?->barangay?->name ?? 'N/A',
            'created_at' => $ticket->created_at?->format('Y-m-d') ?? 'N/A',
            'user' => $ticket->assign_by?->name ?? 'N/A',
        ];
    }
}
