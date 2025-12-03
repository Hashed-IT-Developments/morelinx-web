<?php

namespace App\Models;

use App\Enums\AccountStatusEnum;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class ReadingSchedule extends Model
{
    protected $fillable = [
        'route_id',
        'reading_date',
        'active_accounts',
        'disconnected_accounts',
        'total_accounts',
        'meter_reader_id',
        'billing_month',
    ];

    protected $casts = [
        'reading_date'          => 'integer',
        'active_accounts'       => 'integer',
        'disconnected_accounts' => 'integer',
        'total_accounts'        => 'integer',
    ];

    public function route()
    {
        return $this->belongsTo(Route::class);
    }

    public function meterReader()
    {
        return $this->belongsTo(User::class, 'meter_reader_id');
    }

    public function scopeForBillingMonth(Builder $query, int $year, int $month): Builder
    {
        return $query->where('billing_month', sprintf('%04d-%02d', $year, $month));
    }

    public function calculateAccountCounts(): void
    {
        if (!$this->route) {
            return;
        }

        $accounts = $this->route->customerAccounts();

        $this->active_accounts = (clone $accounts)->where('account_status', AccountStatusEnum::ACTIVE)->count();
        $this->disconnected_accounts = (clone $accounts)->where('account_status', AccountStatusEnum::DISCONNECTED)->count();
        $this->total_accounts = $accounts->count();
    }

    protected static function boot(): void
    {
        parent::boot();

        static::saving(function (self $model) {
            $model->calculateAccountCounts();
        });
    }

    public static function generateForMonth(int $year, int $month, ?array $routeIds = null, ?int $limit = null): \Illuminate\Support\Collection
    {
        $billingMonth = sprintf('%04d-%02d', $year, $month);

        $query = Route::with(['customerAccounts', 'meterReader']);

        if ($routeIds) {
            $query->whereIn('id', $routeIds);
        }

        // Apply limit if provided
        if ($limit) {
            $query->limit($limit);
        }

        return $query->get()->map(function ($route) use ($billingMonth) {
            return static::updateOrCreate(
                [
                    'route_id' => $route->id,
                    'billing_month' => $billingMonth
                ],
                [
                    'reading_date' => $route->reading_day_of_month,
                    'meter_reader_id' => $route->meter_reader_id,
                ]
            );
        });
    }
}
