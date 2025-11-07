<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateTicketRequest;
use App\Http\Resources\TicketResource;
use App\Models\Ticket;
use App\Models\TicketDetails;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class TicketController extends Controller implements HasMiddleware
{
    public static function middleware()
    {
        return [
            new Middleware('auth:sanctum')
        ];
    }

    public function index()
    {
        $tickets = Ticket::with([
            'details',
            'details.concern_type',
            'cust_information',
            'cust_information.barangay',
            'cust_information.town',
            'assigned_users',
            'assigned_users.user',
            'assigned_department'
        ])->get();

        return TicketResource::collection($tickets);
    }

    public function show(Ticket $ticket)
    {
        $ticket->load([
            'details',
            'details.concern_type',
            'cust_information',
            'cust_information.barangay',
            'cust_information.town',
            'assigned_users',
            'assigned_users.user',
            'assigned_department'
        ]);

        return new TicketResource($ticket);
    }

    public function update(UpdateTicketRequest $request, Ticket $ticket)
    {
        $details = TicketDetails::where('ticket_id', $ticket->id)->first();

        $ticket->update([
            // 'severity'              => $request->severity,
            'status'                => $request->status,
            'executed_by_id'        => auth()->id(),
            'date_arrival'          => $request->date_arrival,
            'date_dispatched'       => $request->date_dispatched,
            'date_accomplished'     => $request->date_accomplished,
        ]);

         if ($details) {
            $details->update([
                'actual_findings_id'    => $request->actual_findings_id,
                'action_plan'           => $request->action_plan,
                'remarks'               => $request->remarks,
            ]);
        }

        return new TicketResource($ticket->fresh()->load([
            'details',
            'details.concern_type',
            'cust_information',
            'cust_information.barangay',
            'cust_information.town',
            'assigned_users',
            'assigned_users.user',
            'assigned_department'
        ]));
    }
}
