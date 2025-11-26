<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerApplicationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            // Personal Info
            'id'                => $this->id,
            'account_number'    => $this->account_number,
            'first_name'        => $this->first_name,
            'last_name'         => $this->last_name,
            'middle_name'       => $this->middle_name,
            'suffix'            => $this->suffix,
            'birth_date'        => $this->birth_date,
            'nationality'       => $this->nationality,
            'gender'            => $this->gender,
            'marital_status'    => $this->marital_status,

            // Address
            'barangay' => $this->whenLoaded('barangay', fn() => [
                'id'   => $this->barangay->id,
                'name' => $this->barangay->name,
            ]),
            'town' => $this->when(
                $this->barangay?->relationLoaded('town'),
                fn() => [
                    'id'   => $this->barangay->town->id,
                    'name' => $this->barangay->town->name,
                ]
            ),
            'district' => $this->whenLoaded('district', fn() => [
                'id'   => $this->district->id,
                'name' => $this->district->name,
            ]),
            'landmark'      => $this->landmark,
            'sitio'         => $this->sitio,
            'unit_no'       => $this->unit_no,
            'building'      => $this->building,
            'street'        => $this->street,
            'subdivision'   => $this->subdivision,
            'block'         => $this->block,
            'route'         => $this->route,

            // Application Details
            'customer_type_id' => $this->customer_type_id,
            'customer_type' => $this->whenLoaded('customerType', fn () => CustomerTypeResource::make($this->customerType)),
            'connected_load' => $this->connected_load,

            // Identification
            'id_type_1' => $this->id_type_1,
            'id_type_2' => $this->id_type_2,
            'id_number_1' => $this->id_number_1,
            'id_number_2' => $this->id_number_2,

            // Senior Citizen Info
            'is_sc' => $this->is_sc,
            'sc_from' => $this->sc_from,
            'sc_number' => $this->sc_number,

            // Property and Contact Person
            'property_ownership' => $this->property_ownership,
            'cp_last_name' => $this->cp_last_name,
            'cp_first_name' => $this->cp_first_name,
            'cp_middle_name' => $this->cp_middle_name,
            'cp_relation' => $this->cp_relation,

            // Contact Information
            'email_address' => $this->email_address,
            'tel_no_1' => $this->tel_no_1,
            'tel_no_2' => $this->tel_no_2,
            'mobile_1' => $this->mobile_1,
            'mobile_2' => $this->mobile_2,

            // Location & Status
            'sketch_lat_long' => $this->sketch_lat_long,
            'status' => $this->status,

            // Business Information
            'account_name' => $this->account_name,
            'trade_name' => $this->trade_name,
            'c_peza_registered_activity' => $this->c_peza_registered_activity,
            'cor_number' => $this->cor_number,
            'tin_number' => $this->tin_number,
            'cg_vat_zero_tag' => $this->cg_vat_zero_tag,

            // Timestamps
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
