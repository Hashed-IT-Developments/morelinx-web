<?php

namespace App\Http\Controllers\CSF;

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
use Illuminate\Support\Facades\Auth;
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
                'details',
                'cust_information',
                'cust_information.barangay',
                'cust_information.town',
                'assigned_users',
                'assigned_users.user'
            ]);

            if ($request->filled('search')) {
                $search = $request->input('search');
                $query->where(function ($q) use ($search) {
                $q->where('ticket_no', 'like', "%{$search}%")
                  ->orWhereHas('cust_information', function ($cq) use ($search) {
                      $cq->where('consumer_name', 'like', "%{$search}%");
                  });
                });
            }

            if ($request->filled('status')) {
                $query->where('status', $request->input('status'));
            }

            return $query->paginate(10);
            })

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
                    'application'
                ]);

                if ($request->filled('search')) {
                    $search = $request->input('search');
                    $query->whereRaw('LOWER(account_name) LIKE ?', ['%' . strtolower($search) . '%'])
                          ->orWhereRaw('LOWER(account_number) LIKE ?', ['%' . strtolower($search) . '%']);
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
        $latestTicket = Ticket::latest()->first();
        $nextNumber = $latestTicket ? intval(substr($latestTicket->ticket_no, -6)) + 1 : 1;
        return 'TICKET-' . str_pad($nextNumber, 6, '0', STR_PAD_LEFT);
    }

    public function store(StoreTicketRequest $request)
    {


     

        $assignUser = null;
        $assignUsers = null;

        if ($request->has('assign_user_id')) {
            $assignUser = User::find($request->input('assign_user_id'));
        }


        if($request->has('assign_department_id')) {
            $assignUsers = User::whereHas('roles', function ($query) use ($request) {
                $query->where('id', $request->input('assign_department_id'));
            })->get();


        }

        $ticket = Ticket::create([
            'ticket_no' => $this->generateTicketNumber(),
            'assign_by_id' => Auth::user()->id,
            'assign_department_id' => $request->input('assign_department_id', null),
            'account_number' => $request->account_number,
        ]);


        TicketCustInformation::create([
            'ticket_id' => $ticket->id,
            'account_id' => $request->account_id,
            'consumer_name' => $request->consumer_name,
            'landmark' => $request->landmark,
            'sitio' => $request->sitio,
            'town_id' => $request->district,
            'barangay_id' => $request->barangay,
        ]);

        TicketDetails::create([
            'ticket_id' => $ticket->id,
            'channel_id' => $request->channel,
            'ticket_type_id' => $request->ticket_type,
            'concern_type_id' => $request->concern_type,
            'concern' => $request->concern,
            'reason' => $request->reason,
            'remarks' => $request->remarks,
        ]);

        if($request->submit_as === 'log') {
            $ticket->status = 'completed';
            $ticket->save();

            return redirect()->back()->with('success', 'Log created successfully. No ticket was created as per your selection.');
        }


        if ($assignUser) {

            TicketUser::create([
                'ticket_id' => $ticket->id,
                'user_id' => $assignUser->id,
            ]);

            event(new MakeNotification('ticket_assigned', $assignUser->id, [
                'title' => 'Ticket',
                'description' => 'A new ticket has been assigned to you.',
                'link' => '/tickets/view?ticket_id=' . $ticket->id,
            ]));

            event(new MakeLog('csf', $ticket->id, 'New Ticket Created', 'A new ticket has been created.', Auth::user()->id));

                return redirect()->back()->with('success', 'Ticket created successfully.');

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


        return inertia('csf/tickets/ticket', [
            'ticket' => Inertia::defer (function () use ($request) {
                return Ticket::with([
                    'details',
                    'details.channel',
                    'details.concern_type',
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

        }

        if(!$assignUser) {
            return redirect()->back()->with('error', 'User not found.');
        }

       TicketUser::where('ticket_id', $ticket->id)->delete();


        TicketUser::create([
            'ticket_id' => $ticket->id,
            'user_id' => $assignUser->id,
        ]);

     event(new MakeNotification('ticket_assigned', $assignUser->id, [
    'title' => 'Ticket',
    'description' => 'A new ticket has been assigned to you.',
    'link' => '/tickets/view?ticket_id=' . $ticket->id,
]));

event(new MakeLog('csf', $ticket->id, 'Ticket Assignation', 'Ticket Assigned to '. $assignUser->name, Auth::user()->id));




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

        $ticket->update([
            'severity' => $request['severity'],
            'status' => $request['status'],
            'executed_by_id' => $request['executed_by_id'],
        ]);

        $ticketDetails->update([
            'actual_findings_id' => $request['actual_findings_id'],
            'action_plan' => $request['action_plan'],
            'remarks' => $request['remarks'],

        ]);

        return redirect()->back()->with('success', 'Ticket updated successfully.');
    }
}

