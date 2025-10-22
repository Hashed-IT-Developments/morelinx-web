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
                    //Personal Info
                    'id'                => $this->customerApplication->id,
                    'account_number'    => $this->customerApplication->account_number,
                    'first_name'        => $this->customerApplication->first_name,
                    'last_name'         => $this->customerApplication->last_name,
                    'middle_name'       => $this->customerApplication->middle_name,
                    'suffix'            => $this->customerApplication->suffix,
                    'birth_date'        => $this->customerApplication->birth_date,
                    'nationality'       => $this->customerApplication->nationality,
                    'gender'            => $this->customerApplication->gender,
                    'marital_status'    => $this->customerApplication->marital_status,

                    //Address
                    'barangay_id'       => $this->customerApplication->barangay_id,
                    'landmark'          => $this->customerApplication->landmark,
                    'sitio'             => $this->customerApplication->sitio,
                    'unit_no'           => $this->customerApplication->unit_no,
                    'building'          => $this->customerApplication->building,
                    'street'            => $this->customerApplication->street,
                    'subdivision'       => $this->customerApplication->subdivision,
                    'district_id'       => $this->customerApplication->district_id,
                    'block'             => $this->customerApplication->block,
                    'route'             => $this->customerApplication->route,

                    //Application Details
                    'customer_type_id'  => $this->customerApplication->customer_type_id,
                    'connected_load'    => $this->customerApplication->connected_load,

                    //Identification
                    'id_type_1'         => $this->customerApplication->id_type_1,
                    'id_type_2'         => $this->customerApplication->id_type_2,
                    'id_number_1'       => $this->customerApplication->id_number_1,
                    'id_number_2'       => $this->customerApplication->id_number_2,

                    //Senior Citizen Info
                    'is_sc'             => $this->customerApplication->is_sc,
                    'sc_from'           => $this->customerApplication->sc_from,
                    'sc_number'         => $this->customerApplication->sc_number,

                    //Property and Contact Person
                    'property_ownership'=> $this->customerApplication->property_ownership,
                    'cp_last_name'      => $this->customerApplication->cp_last_name,
                    'cp_first_name'     => $this->customerApplication->cp_first_name,
                    'cp_middle_name'    => $this->customerApplication->cp_middle_name,
                    'cp_relation'       => $this->customerApplication->cp_relation,

                    //Contact Information
                    'email_address'     => $this->customerApplication->email_address,
                    'tel_no_1'          => $this->customerApplication->tel_no_1,
                    'tel_no_2'          => $this->customerApplication->tel_no_2,
                    'mobile_1'          => $this->customerApplication->mobile_1,
                    'mobile_2'          => $this->customerApplication->mobile_2,

                    //Location & Status
                    'sketch_lat_long'   => $this->customerApplication->sketch_lat_long,
                    'status'            => $this->customerApplication->status,

                    //Business Information
                    'account_name'                  => $this->customerApplication->account_name,
                    'trade_name'                    => $this->customerApplication->trade_name,
                    'c_peza_registered_activity'    => $this->customerApplication->c_peza_registered_activity,
                    'cor_number'                    => $this->customerApplication->cor_number,
                    'tin_number'                    => $this->customerApplication->tin_number,
                    'cg_vat_zero_tag'               => $this->customerApplication->cg_vat_zero_tag,

                    // Timestamps
                    'created_at'        => $this->customerApplication->created_at,
                    'updated_at'        => $this->customerApplication->updated_at,
                ];
            }),
        ];
    }
}
