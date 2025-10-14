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
        ];
    }
}
