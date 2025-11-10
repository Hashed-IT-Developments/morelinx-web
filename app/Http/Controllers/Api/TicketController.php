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

    private const TICKET_RELATIONS = [
        'details',
        'details.ticket_type',
        'details.concern_type',
        'cust_information',
        'cust_information.barangay',
        'cust_information.town',
        'assigned_users',
        'assigned_users.user',
        'assigned_department'
    ];

    public function index()
    {
        return TicketResource::collection(Ticket::with(self::TICKET_RELATIONS)->get());
    }

    public function show(Ticket $ticket)
    {
        return new TicketResource($ticket->load(self::TICKET_RELATIONS));
    }

    public function update(UpdateTicketRequest $request, Ticket $ticket)
    {
        $details = TicketDetails::where('ticket_id', $ticket->id)->first();

        $ticket->update([
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

        $existing = json_decode($ticket->attachments, true) ?? [];
        $new = [];

        foreach (['attachment', 'attachments'] as $field) {
            if ($request->hasFile($field)) {
                $files = is_array($request->file($field))
                    ? $request->file($field)
                    : [$request->file($field)];

                foreach ($files as $file) {
                    $new[] = $file->store("tickets/{$ticket->id}", 'public');
                }
            }
        }

        if ($new) {
            $ticket->attachments = json_encode(array_unique(array_merge($existing, $new)));
            $ticket->save();
        }

        return new TicketResource($ticket->load(self::TICKET_RELATIONS));
    }
}
