<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TicketResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'                    => $this->id,
            'ticket_no'             => $this->ticket_no,
            'status'                => $this->status,
            'severity'              => $this->severity,
            'assign_by_id'          => $this->assign_by_id,
            'assign_department_id'  => $this->assign_department_id,
            'executed_by_id'        => $this->executed_by_id,
            'date_arrival'          => $this->date_arrival,
            'date_dispatched'       => $this->date_dispatched,
            'date_accomplished'     => $this->date_accomplished,
            'created_at'            => $this->created_at,
            'updated_at'            => $this->updated_at,

            'details' => $this->whenLoaded('details', function () {
                return [
                    'id'                 => $this->details->id,
                    'ticket_type_id'     => $this->details->ticket_type_id,
                    'concern_type_id'    => $this->details->concern_type_id,
                    'concern'            => $this->details->concern,
                    'reason'             => $this->details->reason,
                    'remarks'            => $this->details->remarks,
                    'actual_findings_id' => $this->details->actual_findings_id,
                    'action_plan'        => $this->details->action_plan,
                    'concern_type'       => $this->details->relationLoaded('concern_type')
                        ? [
                            'id'   => $this->details->concern_type->id,
                            'name' => $this->details->concern_type->name,
                          ]
                        : null,
                ];
            }),

            'cust_information' => $this->whenLoaded('cust_information', function () {
                return [
                    'id'            => $this->cust_information->id,
                    'account_id'    => $this->cust_information->account_id,
                    'consumer_name' => $this->cust_information->consumer_name,
                    'landmark'      => $this->cust_information->landmark,
                    'sitio'         => $this->cust_information->sitio,
                    'barangay_id'   => $this->cust_information->barangay_id,
                    'town_id'       => $this->cust_information->town_id,
                    'barangay'      => $this->cust_information->relationLoaded('barangay')
                        ? [
                            'id'   => $this->cust_information->barangay->id,
                            'name' => $this->cust_information->barangay->name,
                          ]
                        : null,
                    'town'         => $this->cust_information->relationLoaded('town')
                        ? [
                            'id'   => $this->cust_information->town->id,
                            'name' => $this->cust_information->town->name,
                          ]
                        : null,
                ];
            }),

            'assigned_users' => $this->whenLoaded('assigned_users', function () {
                return $this->assigned_users->map(function ($tu) {
                    return [
                        'id'      => $tu->id,
                        'user_id' => $tu->user_id,
                        'user'    => $tu->relationLoaded('user') ? [
                            'id'    => $tu->user->id,
                            'name'  => $tu->user->name,
                            'email' => $tu->user->email,
                        ] : null,
                    ];
                });
            }),

            'assigned_department' => $this->whenLoaded('assigned_department', function () {
                return [
                    'id'   => $this->assigned_department->id,
                    'name' => $this->assigned_department->name,
                ];
            }),
        ];
    }
}
