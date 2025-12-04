<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerApplicationInspectionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'                        => $this->id,
            'customer_application_id'   => $this->customer_application_id,
            'inspector_id'              => $this->inspector_id,
            'status'                    => $this->status,
            'house_loc'                 => $this->house_loc,
            'meter_loc'                 => $this->meter_loc,
            'schedule_date'             => $this->schedule_date,
            'sketch_loc'                => $this->sketch_loc,
            'near_meter_serial_1'       => $this->near_meter_serial_1,
            'near_meter_serial_2'       => $this->near_meter_serial_2,
            'user_id'                   => $this->user_id,
            'inspection_time'           => $this->inspection_time,
            'bill_deposit'              => $this->bill_deposit,
            'material_deposit'          => $this->material_deposit,
            'total_labor_costs'         => $this->total_labor_costs,
            'labor_cost'                => $this->labor_cost,
            'feeder'                    => $this->feeder,
            'meter_type'                => $this->meter_type,
            'service_drop_size'         => $this->service_drop_size,
            'protection'                => $this->protection,
            'meter_class'               => $this->meter_class,
            'connected_load'            => $this->connected_load,
            'transformer_size'          => $this->transformer_size,
            'signature'                 => $this->signature ? asset('storage/' . $this->signature) : null,
            'remarks'                   => $this->remarks,
            'created_at'                => $this->created_at,
            'updated_at'                => $this->updated_at,

            'customer_application'      => CustomerApplicationResource::make(
                $this->whenLoaded('customerApplication')
            ),

            'inspector' => $this->whenLoaded('inspector', fn () => [
                'id'    => $this->inspector->id,
                'name'  => $this->inspector->name,
                'email' => $this->inspector->email,
            ]),

            'materials_used' => $this->whenLoaded('materialsUsed', function () {
                return $this->materialsUsed->map(function ($mat) {
                    return [
                        'id'                => $mat->id,
                        'material_item_id'  => $mat->material_item_id,
                        'material_name'     => $mat->material_name,
                        'unit'              => $mat->unit,
                        'quantity'          => $mat->quantity,
                        'amount'            => $mat->amount,
                        'total_amount'      => $mat->total_amount,
                    ];
                });
            }),

        ];
    }
}
