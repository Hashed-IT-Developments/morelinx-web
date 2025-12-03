<?php

namespace App\Http\Resources;

use App\Models\District;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class TicketResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */

        private static $districtCache = [];

    public function toArray(Request $request): array
    {
        $attachments = json_decode($this->attachments, true) ?: [];

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
            'attachments'           => array_map(
                fn($p) => Storage::disk('public')->url($p),
                $attachments
            ),
            'created_at'            => $this->created_at,
            'updated_at'            => $this->updated_at,

            'details' => $this->whenLoaded('details', function () {
                $d = $this->details;

                return [
                    'id'                 => $d->id,
                    'ticket_type_id'     => $d->ticket_type_id,
                    'concern_type_id'    => $d->concern_type_id,
                    'concern'            => $d->concern,
                    'reason'             => $d->reason,
                    'remarks'            => $d->remarks,
                    'actual_findings_id' => $d->actual_findings_id,
                    'action_plan'        => $d->action_plan,
                    'ticket_type' => $d->relationLoaded('ticket_type')
                        ? [
                            'id' => $d->ticket_type->id,
                            'name' => $d->ticket_type->name,
                        ]
                        : null,

                    'concern_type'       => $d->relationLoaded('concern_type')
                        ? [
                            'id'   => $d->concern_type->id,
                            'name' => $d->concern_type->name,
                        ]
                        : null,
                ];
            }),

            'cust_information' => $this->whenLoaded('cust_information', function () {
                $c = $this->cust_information;
                $barangay = $c->barangay;

                return [
                    'id'              => $c->id,
                    'account_id'      => $c->account_id,
                    'consumer_name'   => $c->consumer_name,
                    'landmark'        => $c->landmark,
                    'sitio'           => $c->sitio,
                    'barangay_id'     => $c->barangay_id,
                    'town_id'         => $c->town_id,
                    'sketch_lat_long' => optional(optional($c->account)->application)->sketch_lat_long,

                    'barangay' => $barangay ? [
                        'id'   => $barangay->id,
                        'name' => $barangay->name,
                    ] : null,

                    'town' => $barangay?->town ? [
                        'id'   => $barangay->town->id,
                        'name' => $barangay->town->name,
                    ] : null,

                    'district' => $barangay?->town?->district ? (
                        (self::$districtCache[$barangay->town->district] ??= District::find($barangay->town->district))
                            ? [
                                'id'   => $barangay->town->district,
                                'name' => self::$districtCache[$barangay->town->district]->name,
                            ]
                            : null
                    ) : null,
                ];
            }),

            'assigned_users' => $this->whenLoaded('assigned_users', function () {
                return $this->assigned_users->map(function ($tu) {
                    return [
                        'id'      => $tu->id,
                        'user_id' => $tu->user_id,
                        'user'    => $tu->relationLoaded('user')
                            ? [
                                'id'    => $tu->user->id,
                                'name'  => $tu->user->name,
                                'email' => $tu->user->email,
                            ]
                            : null,
                    ];
                });
            }),

            'assigned_department' => $this->whenLoaded('assigned_department', function () {
                return [
                    'id'   => $this->assigned_department->id,
                    'name' => $this->assigned_department->name,
                ];
            }),

            'materials' => $this->whenLoaded('materials', function () {
                return $this->materials->map(function ($m) {
                    return [
                        'id' => $m->id,
                        'material_item_id'  => $m->material_item_id,
                        'material_item'     => $m->material_item ? [
                            'id'        => $m->material_item->id,
                            'material'  => $m->material_item->material,
                            'cost'      => $m->material_item->cost,
                        ] : null
                    ];
                });
            }),

        ];
    }
}
