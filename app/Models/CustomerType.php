<?php

namespace App\Models;

use App\RateClass;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class CustomerType extends Model
{
    protected $fillable = ['rate_class','customer_type'];

    protected $appends = ['full_text'];

    public $timestamps = false;

    public function getFullTextAttribute() {
        return $this->rate_class . " - " . $this->customer_type;
    }

    public static function hierarchicalData() {
        $data = [];

        foreach(static::orderBy('rate_class')->get() as $row) {
            $data[$row->rate_class][] = [
                'id' => $row->id,
                'customer_type' => $row->customer_type
            ];
        }

        return $data;
    }

    public static function getRateClasses() {
        return DB::table('customer_types')
            ->select('rate_class')
            ->distinct()
            ->orderBy('rate_class', 'asc')
            ->pluck('rate_class');
    }
}
