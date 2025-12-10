<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReadingScheduleResource extends JsonResource
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
            'reading_date'      => $this->reading_date,
            'account_counts'    => [
                'active'        => $this->active_accounts,
                'disconnected'  => $this->disconnected_accounts,
                'total'         => $this->total_accounts,
            ],
            'route' => [
                'id'            => $this->route->id,
                'code'          => $this->route->name,
                'reading_day'   => $this->route->reading_day_of_month,
            ],
            'accounts' => $this->whenLoaded('route', function () {
                if ($this->route && $this->route->relationLoaded('customerAccounts')) {
                    return $this->route->customerAccounts->map(fn ($account) => [
                        'account_name'          => $account->account_name,
                        'email_address'         => $account->email_address,
                        'contact_number'        => $account->contact_number,
                        'account_status'        => $account->account_status,
                        'registration_date'     => $account->created_at?->toIso8601String(),
                        'last_activity_date'    => $account->updated_at?->toIso8601String(),
                    ]);
                }
                return [];
            }),
            'meter_reader' => $this->meterReader ? [
                'id'    => $this->meterReader->id,
                'name'  => $this->meterReader->name,
            ] : null,
            'billing_month'     => $this->billing_month,
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
