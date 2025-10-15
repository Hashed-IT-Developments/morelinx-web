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
            'labor_cost'                => $this->labor_cost,
            'feeder'                    => $this->feeder,
            'meter_type'                => $this->meter_type,
            'service_drop_size'         => $this->service_drop_size,
            'protection'                => $this->protection,
            'meter_class'               => $this->meter_class,
            'connected_load'            => $this->connected_load,
            'transformer_size'          => $this->transformer_size,
            'signature'                 => $this->signature ? base64_encode($this->signature) : null,
            'remarks'                   => $this->remarks,
            'created_at'                => $this->created_at,
            'updated_at'                => $this->updated_at,

            'customer_application'      => $this->whenLoaded('customerApplication', function () {
                return [
                    'id'                => $this->customerApplication->id,
                    'account_number'    => $this->customerApplication->account_number,
                    'first_name'        => $this->customerApplication->first_name,
                    'last_name'         => $this->customerApplication->last_name,
                    'middle_name'       => $this->customerApplication->middle_name,
                    'suffix'            => $this->customerApplication->suffix,
                    'email_address'     => $this->customerApplication->email_address,
                    'mobile_1'          => $this->customerApplication->mobile_1,
                    'status'            => $this->customerApplication->status,
                    'created_at'        => $this->customerApplication->created_at,
                    'updated_at'        => $this->customerApplication->updated_at,
                ];
            }),
        ];
    }
}
