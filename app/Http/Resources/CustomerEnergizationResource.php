<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerEnergizationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'status'        => $this->status,
            'assigned_team' => $this->whenLoaded('teamAssigned', fn () => [
                'id'    => $this->teamAssigned->id,
                'name'  => $this->teamAssigned->name,
            ]),
            'executing_team' => $this->whenLoaded('teamExecuted', fn () => [
                'id'    => $this->teamExecuted->id,
                'name'  => $this->teamExecuted->name,
            ]),
            'service_connection'    => $this->service_connection,
            'action_taken'          => $this->action_taken,
            'remarks'               => $this->remarks,
            'time_of_arrival'       => $this->time_of_arrival,
            'date_installed'        => $this->date_installed,
            'transformer_owned'     => $this->transformer_owned,
            'transformer_rating'    => $this->transformer_rating,
            'ct_serial_number'      => $this->ct_serial_number,
            'ct_brand_name'         => $this->ct_brand_name,
            'ct_ratio'              => $this->ct_ratio,
            'pt_serial_number'      => $this->pt_serial_number,
            'pt_brand_name'         => $this->pt_brand_name,
            'pt_ratio'              => $this->pt_ratio,
            'archive'               => $this->archive,
            'attachments'           => $this->attachments,
            'created_at'            => $this->created_at,
            'updated_at'            => $this->updated_at,

            'customer_application' => CustomerApplicationResource::make(
                $this->whenLoaded('customerApplication')
            ),
        ];
    }
}
