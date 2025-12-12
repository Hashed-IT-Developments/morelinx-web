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
        $base = [
            'id'            => $this->id,
            'reading_date'  => $this->reading_date,
            // 'billing_month' => $this->billing_month,
            'route' => [
                'id'            => $this->route->id,
                'name'          => $this->route->name,
                'reading_day'   => $this->route->reading_day_of_month,
            ],
            // 'meter_reader' => $this->meterReader ? [
            //     'id' => $this->meterReader->id,
            //     'name' => $this->meterReader->name,
            // ] : null,
        ];

        if (!$this->route?->relationLoaded('customerAccounts')) {
            return array_merge($base, [
                'status'            => 'not_initialized',
                'account_counts'    => ['total' => 0, 'read' => 0, 'unread' => 0],
                'accounts'          => [],
            ]);
        }

        $accounts = $this->route->customerAccounts;
        $readCount = 0;
        $unreadCount = 0;

        $accountsData = $accounts->map(function ($account) use (&$readCount, &$unreadCount) {
            $reading = $account->readings->first();
            $isRead = $reading && !is_null($reading->present_reading);

            if ($isRead) $readCount++; else $unreadCount++;

            $meterSerialNumber = $account->customerApplication?->meters?->first()?->meter_serial_number;

            return [
                'id'                    => $account->id,
                'account_number'        => $account->account_number,
                'account_name'          => $account->account_name,
                'email_address'         => $account->email_address,
                'contact_number'        => $account->contact_number,
                'account_status'        => $account->account_status,
                'meter_serial_number'   => $meterSerialNumber,
                'registration_date'     => $account->created_at?->toIso8601String(),
                'last_activity_date'    => $account->updated_at?->toIso8601String(),
            ];
        });

        // Determine overall schedule status
        $total = $accountsData->count();
        $status = match(true) {
            $total === 0        => 'not_initialized',
            $readCount === 0    => 'not_downloaded',
            $unreadCount === 0  => 'completed',
            default             => 'in_progress',
        };

        return array_merge($base, [
            'status' => $status,
            'account_counts' => [
                'total'         => $total,
                'read'          => $readCount,
                'unread'        => $unreadCount,
                'active'        => $accounts->where('account_status', 'active')->count(),
                'disconnected'  => $accounts->where('account_status', 'disconnected')->count(),
            ],
            'accounts' => $accountsData,
        ]);
    }
}
