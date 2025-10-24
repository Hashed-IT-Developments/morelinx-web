<?php

namespace App\Http\Controllers;

use App\Models\CustomerAccount;
use App\Models\Ticket;
use App\Models\TicketCustInformation;
use App\Models\TicketDetails;
use App\Models\TicketType;
use App\Models\TicketUser;
use App\Models\User;
use DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class TicketController extends Controller
{
    public function dashboard()
    {
        return inertia('cms/tickets/dashboard');
    }

    public function index(Request $request)
    {
        return inertia('cms/tickets/index', [
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


    public function create()
    {


        return inertia('cms/tickets/create', [
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

            'accounts' => Inertia::defer(function () {

                $allAccounts = CustomerAccount::orderBy('account_name')->paginate(20);

                return $allAccounts;
            })
        ]);
    }


    public function settings()
    {
        return inertia('cms/tickets/settings', [
            'ticket_types' => Inertia::defer(function () {
                return TicketType::where('type', '=', 'ticket_type')->get();
            }),
            'concern_types' => Inertia::defer(function () {
                return TicketType::where('type', '=', 'concern_type')->get();
            })
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

    public function walkInSave(Request $request)
    {

        Log::info('Walk-in ticket creation request:', $request->all());

        $assignUser = null;
        $assignUsers = null;

        if ($request->has('assign_user')) {
            $assignUser = User::find($request->input('assign_user'));
        } 


        if($request->has('assign_department')) {
            $assignUsers = User::whereHas('roles', function ($query) use ($request) {
                $query->where('name', $request->input('assign_department'));
            })->get();

       
        }

        $ticket = Ticket::create([
            'ticket_no' => $this->generateTicketNumber(),
            'assign_by_id' => auth()->user()->id,
        ]);



        TicketCustInformation::create([
            'ticket_id' => $ticket->id,
            'consumer_name' => $request->consumer_name,
            'landmark' => $request->landmark,
            'sitio' => $request->sitio,
            'town_id' => $request->district,
            'barangay_id' => $request->barangay,
        ]);

        TicketDetails::create([
            'ticket_id' => $ticket->id,
            'ticket_type_id' => $request->ticket_type,
            'concern_type_id' => $request->concern_type,
            'concern' => $request->concern,
            'reason' => $request->reason,
            'remarks' => $request->remarks,
        ]);


        if ($assignUser) {

            TicketUser::create([
                'ticket_id' => $ticket->id,
                'user_id' => $assignUser->id,
            ]);

            return redirect()->back()->with('success', 'Walk-in ticket created successfully.');

        }


        if ($assignUsers) {
            DB::beginTransaction();
            try {
                foreach ($assignUsers as $user) {
                    TicketUser::create([
                        'ticket_id' => $ticket->id,
                        'user_id' => $user->id,
                    ]);
                }
            } catch (\Exception $e) {
                DB::rollBack();
                return redirect()->back()->with('error', 'Failed to create walk-in tickets.');
            }
            DB::commit();

            return redirect()->back()->with('success', 'Walk-in ticket created successfully.');

        }
    }

}

