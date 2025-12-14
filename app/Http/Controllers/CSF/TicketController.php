<?php

namespace App\Http\Controllers\CSF;

use App\Enums\TicketStatusEnum;
use App\Events\MakeLog;
use App\Events\MakeNotification;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTicketRequest;
use App\Models\CustomerAccount;
use App\Models\Notification;
use App\Models\Ticket;
use App\Models\TicketCustInformation;
use App\Models\TicketDetails;
use App\Models\TicketType;
use App\Models\TicketUser;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class TicketController extends Controller
{
    public function dashboard()
    {
        return inertia('csf/tickets/dashboard');
    }

    public function index(Request $request)
    {
        return inertia('csf/tickets/index', [
            'search' => $request->input('search', ''),

            'tickets' => Inertia::defer(function () use ($request) {

                $query = Ticket::with([
                    'details.ticket_type',
                    'cust_information',
                    'cust_information.barangay',
                    'cust_information.town',
                    'assigned_department',
                    'assigned_users',
                    'assigned_users.user'
                ]);

                if ($request->filled('search')) {
                    $search = $request->search;
                    $query->where(function ($q) use ($search) {
                        $q->where('ticket_no', 'like', "%{$search}%")
                        ->orWhereHas('cust_information', function ($cq) use ($search) {
                            $cq->where('consumer_name', 'like', "%{$search}%");
                        });
                    });
                }

                if ($request->filled('from') && $request->filled('to')) {
                    $query->whereBetween('created_at', [
                       Carbon::parse( $request->from) ,
                     Carbon::parse(   $request->to) 
                    ]);
                }                
        

                if ($request->filled('status')) {
                    $query->where('status', $request->status);
                }

                if ($request->filled('department')) {
                    $query->where('assign_department_id', $request->department);
                }

               if ($request->filled('channel')) {
                    $query->whereHas('details', function ($q) use ($request) {
                        $q->where('channel_id', $request->channel);
                    });
                }

                if ($request->filled('type')) {
                    $query->whereHas('details', function ($q) use ($request) {
                        $q->where('ticket_type_id', $request->type);
                    });
                }

                if ($request->filled('concern')) {
                    $query->whereHas('details', function ($q) use ($request) {
                        $q->where('concern_type_id', $request->concern);
                    });
                }

                 if ($request->filled('actual_finding')) {
                    $query->whereHas('details', function ($q) use ($request) {
                        $q->where('actual_findings_id', $request->actual_finding);
                    });
                }
              

                return $query->paginate(20);
            }),

            'statuses' => TicketStatusEnum::getValues(),

            'roles' => Inertia::defer(function () {
                return Role::orderBy('name')->get();
            }),

            'filters' => [
                'from' => $request->from,
                'to' => $request->to,
                'department' => $request->department,
                'channel' => $request->channel,
                'type' => $request->type,
                'concern' => $request->concern,
                'status' => $request->status,
                'actual_finding' => $request->actual_finding,
            ]
        ]);

    }


    public function create(Request $request)
    {
        return inertia('csf/tickets/create', [
            'roles' => Inertia::defer(function () {
                $roles = Role::whereNot('name', 'user')
                ->orWhereNot('name', 'superadmin')
                ->orWhereNot('name', 'admin')
                ->get();
                return $roles;
            }),
            'ticket_types' => Inertia::defer(function () {
                $ticket_types = TicketType::where('type', '=', 'ticket_type')->get();

                return $ticket_types;
            }),
            'concern_types' => Inertia::defer(function () {
                $concern_types = TicketType::where('type', '=', 'concern_type')->get();

                return $concern_types;
            }),

            'accounts' => Inertia::defer(function () use($request) {

                $query = CustomerAccount::with([
                    'customerApplication',
                    'tickets'
                ]);

                if ($request->filled('search')) {
                    $search = $request->input('search');
                    $query->search($search);
                }

                $allAccounts = $query->orderBy('account_name')->paginate(20);

                return $allAccounts;
            }),
            'search' => $request->input('search', '')
        ]);
    }


    public function settings()
    {
        return inertia('csf/tickets/settings', [
            'ticket_types' => Inertia::defer(function () {
                return TicketType::where('type', '=', 'ticket_type')->get();
            }),
            'concern_types' => Inertia::defer(function () {
                return TicketType::where('type', '=', 'concern_type')->get();
            }),
            'actual_findings_types' => Inertia::defer(function () {
                return TicketType::where('type', '=', 'actual_findings_type')->get();
            }),
            'channels' => Inertia::defer(function () {
                return TicketType::where('type', '=', 'channel')->get();
            }),

        ]);
    }


    public function settingsSave(Request $request, $type)
    {

        foreach ($request->fields as $ticketType) {
            TicketType::create([
                'name' => $ticketType['name'],
                'type' => $type
            ]);
        }
          return redirect()->back()->with('success', 'Ticket types added successfully.');
           }


    public function settingsEdit(Request $request)
    {

        $ticketType = TicketType::find($request->id);

        if ($ticketType) {
            $ticketType->name = $request->name;
            $ticketType->save();

            return redirect()->back()->with('success', 'Ticket type updated successfully.');
        } else {
            return redirect()->back()->with('error', 'Ticket type not found.');
        }
    }

    public function settingsDelete(Request $request)
    {
        $ticketType = TicketType::find($request->id);

        if ($ticketType) {
            $ticketType->delete();

            return redirect()->back()->with('success', 'Ticket type deleted successfully.');
        } else {
            return redirect()->back()->with('error', 'Ticket type not found.');
        }
    }

    private function generateTicketNumber()
    {
        $latestTicket = Ticket::lockForUpdate()
            ->orderBy('id', 'desc')
            ->first();

        $nextNumber = $latestTicket
            ? intval(substr($latestTicket->ticket_no, -6)) + 1
            : 1;

        return 'TICKET-' . str_pad($nextNumber, 6, '0', STR_PAD_LEFT);
    }



    public function store(StoreTicketRequest $request)
    {
        $ticketsData = $request->input('tickets', []);

        DB::beginTransaction(); 

        try {
            foreach ($ticketsData as $ticketData) {

                $assignUser = null;

                if (!empty($ticketData['assign_user_id'])) {
                    $assignUser = User::find($ticketData['assign_user_id']);
                }

                $ticket = Ticket::create([
                    'ticket_no' => $this->generateTicketNumber(),
                    'submission_type' => $ticketData['submission_type'],
                    'assign_by_id' => Auth::user()->id,
                    'assign_department_id' => $ticketData['assign_department_id'] ?? null,
                    'account_number' => $ticketData['account_number'],
                ]);

                TicketCustInformation::create([
                    'ticket_id' => $ticket->id,
                    'account_id' => $ticketData['account_id'],
                    'consumer_name' => $ticketData['consumer_name'],
                    'caller_name' => $ticketData['caller_name'],
                    'phone' => $ticketData['phone'],
                    'landmark' => $ticketData['landmark'],
                    'sitio' => $ticketData['sitio'],
                    'town_id' => $ticketData['district'],
                    'barangay_id' => $ticketData['barangay'],
                ]);

                TicketDetails::create([
                    'ticket_id' => $ticket->id,
                    'channel_id' => $ticketData['channel'],
                    'ticket_type_id' => $ticketData['ticket_type'],
                    'concern_type_id' => $ticketData['concern_type'],
                    'concern' => $ticketData['concern'],
                    'reason' => $ticketData['reason'],
                    'remarks' => $ticketData['remarks'],
                ]);

                if ($ticketData['submission_type'] === 'log') {
                    TicketUser::create([
                        'ticket_id' => $ticket->id,
                        'user_id' => Auth::user()->id,
                    ]);

                    if (!empty($ticketData['mark_as_completed'])) {
                        $ticket->status = 'completed';
                        $ticket->date_accomplished = now();
                        $ticket->save();

                        event(new MakeLog('csf', $ticket->id, 'Log Created', 'A new log has been created and marked as completed.', Auth::user()->id));
                    } else {
                        event(new MakeLog('csf', $ticket->id, 'Log Created', 'A new log has been created.', Auth::user()->id));
                    }

                    continue; 
                }

                if ($assignUser) {
                    TicketUser::create([
                        'ticket_id' => $ticket->id,
                        'user_id' => $assignUser->id,
                    ]);

                    event(new MakeNotification('ticket_assigned', $assignUser->id, [
                        'title' => 'Ticket Created',
                        'description' => 'A new ticket has been assigned to you.',
                        'link' => '/tickets/view?ticket_id=' . $ticket->id,
                    ]));

                    event(new MakeLog('csf', $ticket->id, 'Ticket Created', 'A new ticket has been created.', Auth::user()->id));
                }
            }

            DB::commit(); 
            return redirect()->back()->with('success', 'Tickets processed successfully.');
        } catch (\Exception $e) {
            DB::rollBack(); 
            return redirect()->back()->with('error', 'Failed to process tickets: ' . $e->getMessage());
        }
    }


    public function myTickets(Request $request){

        return inertia('csf/tickets/my-tickets', [
            'tickets' => Inertia::defer(function () use ($request) {

                $tickets = Ticket::where(function ($query) {
                    $query->whereHas('assigned_users', function ($q) {
                        $q->where('user_id', Auth::user()->id);
                    })->orWhere(function ($q) {
                        $q->where('assign_department_id', Auth::user()->roles->first()?->id);
                    });
                })
                ->when($request->filled('status'), function ($query) use ($request) {
                    $query->where('status', $request->input('status'));
                }, function ($query) {
                    $query->where('status', 'pending');
                })
                ->with([
                    'details',
                    'details.concern_type',
                    'details.ticket_type',
                    'details.channel',
                    'details.actual_finding',
                    'cust_information',
                    'cust_information.barangay',
                    'cust_information.town',
                    'assigned_users',
                    'assigned_users.user'
                ])->paginate(10);

               return $tickets;
            }),
            'status' => $request->input('status', 'pending'),
            'actual_findings_types' => Inertia::defer(function () {
                return TicketType::where('type', '=', 'actual_findings_type')->get();
            })
        ]);


    }

    public function view(Request $request){

        $notification = Notification::find($request->notification_id);

        if($notification){
            $notification->is_read = true;
            $notification->save();
        }


        return inertia('csf/tickets/show', [
            'ticket' => Inertia::defer (function () use ($request) {
                return Ticket::with([
                    'details',
                    'details.channel',
                    'details.concern_type',
                    'details.actual_finding',
                    'details.ticket_type',
                    'cust_information',
                    'cust_information.barangay',
                    'cust_information.town',
                    'assigned_users.user',
                    'logs'
                ])->find($request->ticket_id);
            })
        ]);

    }


    public function assign(Request $request){



        $ticket = Ticket::find($request->ticket_id);

        if(!$ticket) {
            return redirect()->back()->with('error', 'Ticket not found.');
        }

        if ($request['type'] === 'user') {

         $assignUser = User::find($request['assign_user_id']);

        if(!$assignUser) {
            return redirect()->back()->with('error', 'User not found.');
        }

         TicketUser::where('ticket_id', $ticket->id)->delete();


        TicketUser::create([
            'ticket_id' => $ticket->id,
            'user_id' => $assignUser->id,
        ]);


        event(new MakeNotification('ticket_assigned', $assignUser->id, [
        'title' => 'Ticket Assigned',
        'description' => 'A new ticket has been assigned to you.',
        'link' => '/tickets/view?ticket_id=' . $ticket->id,
        ]));

        event(new MakeLog('csf', $ticket->id, 'Ticket Assigned', 'Ticket Assigned to '. $assignUser->name, Auth::user()->id));




        }




       if ($request->has('type') && $request->type === 'department') {

        $ticket->assign_department_id = $request->assign_department_id;
        $ticket->save();

        TicketUser::where('ticket_id', $ticket->id)->delete();
        }


        return redirect()->back()->with('success', 'Ticket assigned successfully.');

    }

    public function statusUpdate(Request $request)
    {
        $ticket = Ticket::find($request->ticket_id);
        $status = $request->status;

        if (!$ticket) {
            return redirect()->back()->with('error', 'Ticket not found.');
        }

        $ticket->status = $status;
        $ticket->save();

        return redirect()->back()->with('success', 'Ticket status updated successfully.');
    }
    public function getTicketTypes(Request $request)
    {
        $type = $request->input('type');

        $ticketTypes = TicketType::where('type', $type)->get();

        return response()->json($ticketTypes);
    }


    public function update(Request $request)
    {
        $ticket = Ticket::find($request->id);
        $ticketDetails = TicketDetails::where('ticket_id', $ticket->id)->first();

        $oldSeverity = $ticket->severity;
        $oldStatus = $ticket->status;
        $oldResolvedBy = $ticket->resolved_by_id;
        $oldActualFindings = $ticketDetails->actual_findings_id;
        $oldActionPlan = $ticketDetails->action_plan;
        $oldRemarks = $ticketDetails->remarks;

        $ticket->update([
            'severity' => $request['severity'],
            'status' => $request['status'],
            'resolved_by_id' => $request['resolved_by_id'],
        ]);

        $ticketDetails->update([
            'actual_findings_id' => $request['actual_findings_id'],
            'action_plan' => $request['action_plan'],
            'remarks' => $request['remarks'],
        ]);

        $changes = [];

        if ($oldSeverity != $request['severity']) {
            $changes[] = "severity ({$oldSeverity} -> {$request['severity']})";
        }

        if ($oldStatus != $request['status']) {
            $changes[] = "status ({$oldStatus} -> {$request['status']})";
        }

        if ($oldResolvedBy != $request['resolved_by_id']) {
            $oldResolvedByName = $oldResolvedBy ? User::find($oldResolvedBy)->name : 'none';
            $newResolvedByName = $request['resolved_by_id'] ? User::find($request['resolved_by_id'])->name : 'none';
            $changes[] = "resolved by ({$oldResolvedByName} -> {$newResolvedByName})";
        }

        if ($oldActualFindings != $request['actual_findings_id']) {
            $oldFindingsName = $oldActualFindings ? TicketType::find($oldActualFindings)->name : 'none';
            $newFindingsName = $request['actual_findings_id'] ? TicketType::find($request['actual_findings_id'])->name : 'none';
            $changes[] = "actual findings ({$oldFindingsName} -> {$newFindingsName})";
        }

        if ($oldActionPlan != $request['action_plan']) {
            $changes[] = "action plan";
        }

        if ($oldRemarks != $request['remarks']) {
            $changes[] = "remarks";
        }

        if (!empty($changes)) {
            $changeCount = count($changes);
            if ($changeCount === 1) {
                $formattedChanges = $changes[0];
            } elseif ($changeCount === 2) {
                $formattedChanges = $changes[0] . ' and ' . $changes[1];
            } else {
                $lastChange = array_pop($changes);
                $formattedChanges = implode(', ', $changes) . ' and ' . $lastChange;
            }

            $description = "Ticket updated: " . $formattedChanges;

            if (strlen($description) > 255) {
                $description = substr($description, 0, 252) . '...';
            }

            event(new MakeLog('csf', $ticket->id, 'Ticket Processed', $description, Auth::user()->id));
        }

        return redirect()->back()->with('success', 'Ticket updated successfully.');
    }
}

