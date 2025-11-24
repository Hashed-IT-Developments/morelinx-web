<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MeterResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'account_number' => $this->whenLoaded('customerApplication', fn () => $this->customerApplication->account_number),
            'meter_serial_number' => $this->meter_serial_number,
            'meter_brand' => $this->meter_brand,
            'seal_number' => $this->seal_number,
            'erc_seal' => $this->erc_seal,
            'more_seal' => $this->more_seal,
            'multiplier' => $this->multiplier,
            'voltage' => $this->voltage,
            'initial_reading' => $this->initial_reading,
            'type' => $this->type,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

            'customer_application' => CustomerApplicationResource::make(
                $this->whenLoaded('customerApplication')
            ),
        ];
    }
}
